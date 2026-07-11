import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SOURCE = path.join(ROOT, 'site', 'www.ofconsultores.com');
const FRONTEND = path.join(ROOT, 'frontend');
const DATA = path.join(FRONTEND, 'data');

const PRESERVE_TOP_LEVEL = new Set(['css', 'js', 'partials', 'data', 'assets']);

/** Only skip frontend-owned top-level folders — never wp-content/.../css or .../js */
function copyDir(src, dest, isFrontendRoot = false) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (isFrontendRoot && PRESERVE_TOP_LEVEL.has(entry.name)) continue;
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d, false);
    else fs.copyFileSync(s, d);
  }
}

function normalizeLegacyAssetRefs(html) {
  return html
    .replace(/ver%3D/gi, 'ver=')
    .replace(/((?:href|src)=["'])(?!\/|https?:)(wp-content\/)/gi, '$1/$2')
    .replace(/((?:href|src)=["'])(?!\/|https?:)(wp-includes\/)/gi, '$1/$2');
}

function walkHtml(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['css', 'js', 'partials', 'data', 'assets'].includes(entry.name) && dir === FRONTEND) continue;
      walkHtml(full, files);
    } else if (entry.name.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractPageData(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const rel = path.relative(FRONTEND, filePath).replace(/index\.html$/, '').replace(/\\/g, '/');
  const url = rel ? `/${rel}` : '/';
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  const h1Match = html.match(/<h1[^>]*class="[^"]*stm_titlebox__title[^"]*"[^>]*>([^<]*)</i)
    || html.match(/<h1[^>]*>([^<]*)</i);
  const siteContent = html.match(/<div class="site-content">([\s\S]*?)<div class="stm-footer/i)
    || html.match(/<div class="site-content">([\s\S]*?)<footer/i);
  const bodyHtml = siteContent ? siteContent[1].trim() : '';
  return {
    url: url.endsWith('/') ? url : `${url}/`,
    slug: path.basename(path.dirname(filePath)) === 'frontend' ? 'home' : path.basename(path.dirname(filePath)),
    title: (titleMatch?.[1] || '').replace(/\s*[–-]\s*OFCONSULTORES\s*$/i, '').trim(),
    h1: (h1Match?.[1] || '').trim(),
    excerpt: stripHtml(bodyHtml).slice(0, 400),
    body_html: bodyHtml.slice(0, 12000),
  };
}

function sectionFromPath(relPath) {
  const parts = relPath.split('/').filter(Boolean);
  if (!parts.length || parts[0] === 'index.html') return 'pages';
  if (parts[0] === 'ofconsultores') return 'ofconsultores';
  if (parts[0] === 'consultoria') return 'consultoria';
  if (parts[0] === 'formacao') return 'formacao';
  if (parts[0] === 'cursos') return 'cursos';
  return 'pages';
}

function injectFrontendAssets(html) {
  html = normalizeLegacyAssetRefs(html);

  const fonts = '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">';
  const customCss = `${fonts}\n<link rel="stylesheet" href="/css/tokens.css">\n<link rel="stylesheet" href="/css/variables.css">\n<link rel="stylesheet" href="/css/base.css">\n<link rel="stylesheet" href="/css/layout.css">\n<link rel="stylesheet" href="/css/components.css">\n<link rel="stylesheet" href="/css/legacy-bridge.css">\n<link rel="stylesheet" href="/css/custom.css">`;
  const customJs = '<script src="/js/api.js" defer></script>\n<script src="/js/includes.js" defer></script>\n<script src="/js/menu.js" defer></script>\n<script src="/js/search.js" defer></script>\n<script src="/js/forms.js" defer></script>\n<script src="/js/main.js" defer></script>';

  if (!html.includes('/css/custom.css')) {
    html = html.replace('</head>', `${customCss}\n</head>`);
  }
  if (!html.includes('/js/main.js')) {
    html = html.replace('</body>', `${customJs}\n</body>`);
  }
  if (!html.includes('/js/static-fixes.js') && fs.existsSync(path.join(FRONTEND, 'js', 'static-fixes.js'))) {
    html = html.replace('</body>', '<script src="/js/static-fixes.js" defer></script>\n</body>');
  }
  return html;
}

console.log('Copying mirrored site to frontend/...');
if (fs.existsSync(FRONTEND)) {
  for (const entry of fs.readdirSync(FRONTEND)) {
    if (['css', 'js', 'partials', 'data', 'assets'].includes(entry)) continue;
    const full = path.join(FRONTEND, entry);
    fs.rmSync(full, { recursive: true, force: true });
  }
} else {
  fs.mkdirSync(FRONTEND, { recursive: true });
}

copyDir(SOURCE, FRONTEND, true);

const staticFixesSrc = path.join(SOURCE, 'static-fixes.js');
if (fs.existsSync(staticFixesSrc)) {
  fs.copyFileSync(staticFixesSrc, path.join(FRONTEND, 'js', 'static-fixes.js'));
}

const htmlFiles = walkHtml(FRONTEND).filter((f) => !f.includes('/wp-content/'));
const menu = [];
const allPages = [];

for (const file of htmlFiles) {
  let html = fs.readFileSync(file, 'utf8');
  html = injectFrontendAssets(html);
  fs.writeFileSync(file, html, 'utf8');

  const page = extractPageData(file);
  allPages.push(page);
  menu.push({ title: page.title || page.h1 || page.url, url: page.url });

  const rel = path.relative(FRONTEND, file);
  const section = sectionFromPath(rel);
  const outDir = path.join(DATA, section);
  fs.mkdirSync(outDir, { recursive: true });
  const filename = page.slug === 'home' ? 'home.json' : `${page.slug}.json`;
  fs.writeFileSync(path.join(outDir, filename), JSON.stringify(page, null, 2));
}

const settings = {
  site_name: 'OFCONSULTORES',
  tagline: 'Formação e Consultoria',
  email: 'geral@ofconsultores.com',
  phone_primary: '(+351) 217 540 451',
  phone_secondary: '(+351) 963 009 977',
  address: 'Rua Fernando Lopes Graça 15A, 1600-067 LISBOA',
  facebook: 'https://www.facebook.com/ofconsultores/',
  instagram: 'https://www.instagram.com/ofconsultores/',
  linkedin: 'https://www.linkedin.com/company/ofconsultores',
  logo: '/wp-content/uploads/2025/05/logo-cor-editado-3.png',
  api_base: '/api',
};

fs.writeFileSync(path.join(DATA, 'settings.json'), JSON.stringify(settings, null, 2));
fs.writeFileSync(path.join(DATA, 'menu.json'), JSON.stringify(menu, null, 2));
fs.writeFileSync(
  path.join(FRONTEND, 'search-index.json'),
  JSON.stringify(allPages.map(({ url, title, excerpt }) => ({ url, title, excerpt })), null, 2)
);

console.log(`Frontend ready: ${htmlFiles.length} pages, ${allPages.length} JSON content files.`);

const cssCount = fs.existsSync(path.join(FRONTEND, 'wp-content', 'cache', 'autoptimize', 'css'))
  ? fs.readdirSync(path.join(FRONTEND, 'wp-content', 'cache', 'autoptimize', 'css')).length
  : 0;
const jsCount = fs.existsSync(path.join(FRONTEND, 'wp-content', 'cache', 'autoptimize', 'js'))
  ? fs.readdirSync(path.join(FRONTEND, 'wp-content', 'cache', 'autoptimize', 'js')).length
  : 0;
console.log(`Assets: ${cssCount} autoptimize CSS, ${jsCount} autoptimize JS copied.`);
