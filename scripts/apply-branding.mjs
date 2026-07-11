/**
 * Branding AON Manancial — aplica design system sobre o site espelhado (sem substituir HTML).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const FRONTEND = path.join(ROOT, 'frontend');
const DATA = path.join(FRONTEND, 'data');
const LOGO = '/assets/images/logo-manancial.svg';

const LOGO_PATTERNS = [
  /\/wp-content\/uploads\/2025\/05\/logo-cor-editado-3\.png/gi,
  /\/assets\/images\/logo-manancial\.png/gi,
];

const REPLACEMENTS = [
  [/OFCONSULTORES\s*[–-]\s*Formação e Consultoria/gi, 'AON Manancial Consulting'],
  [/Logótipo do Site/gi, 'AON Manancial Consulting'],
  [/alt="OFCONSULTORES"/gi, 'alt="AON Manancial Consulting"'],
  [/geral@ofconsultores\.com/gi, 'geral@manancialconsulting.ao'],
];

const FONTS_LINK =
  '<link rel="preconnect" href="https://fonts.googleapis.com">' +
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
  '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">';

const DESIGN_CSS = [
  '/css/tokens.css',
  '/css/variables.css',
  '/css/base.css',
  '/css/layout.css',
  '/css/components.css',
  '/css/legacy-bridge.css',
  '/css/custom.css',
];

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

function copyDesignAssets() {
  const outDir = path.join(FRONTEND, 'assets', 'images');
  fs.mkdirSync(outDir, { recursive: true });

  const logoSrc = path.join(FRONTEND, 'assets', 'images', 'logo-manancial.svg');
  if (!fs.existsSync(logoSrc)) {
    const fallback = path.join(ROOT, 'frontend', 'assets', 'images', 'logo-manancial.svg');
    if (!fs.existsSync(logoSrc) && fs.existsSync(fallback)) {
      fs.copyFileSync(fallback, logoSrc);
    }
  }

  const heroCandidates = [
    path.join(ROOT, 'site', 'www.ofconsultores.com', 'wp-content', 'uploads', '2020', '05', 'GoogleDrive_5360-scaled-e1590609833319.jpg'),
    path.join(FRONTEND, 'wp-content', 'uploads', '2020', '05', 'GoogleDrive_5360-scaled-e1590609833319.jpg'),
  ];
  for (const src of heroCandidates) {
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(outDir, 'hero-bg.jpg'));
      break;
    }
  }
}

function applyLogo(html) {
  let out = html;
  for (const pattern of LOGO_PATTERNS) {
    out = out.replace(pattern, LOGO);
  }
  return out;
}

function injectFonts(html) {
  if (html.includes('Cormorant+Garamond') || html.includes('EB+Garamond')) return html;
  if (html.includes('</head>')) {
    return html.replace('</head>', `${FONTS_LINK}\n</head>`);
  }
  return html;
}

function injectDesignCss(html) {
  const missing = DESIGN_CSS.filter((href) => !html.includes(href));
  let links = '';
  if (missing.length) {
    links = missing.map((href) => `<link rel="stylesheet" href="${href}">`).join('\n');
  }
  if (!links) return html;
  if (html.includes('</head>')) {
    return html.replace('</head>', `${links}\n</head>`);
  }
  return html;
}

function ensureFavicon(html) {
  if (html.includes('rel="icon"') && html.includes('logo-manancial')) return html;
  if (!html.includes('/assets/images/logo-manancial.svg')) {
    html = html.replace(
      /<meta charset="UTF-8">/i,
      '<meta charset="UTF-8"><link rel="icon" href="/assets/images/logo-manancial.svg" type="image/svg+xml">',
    );
  }
  return html;
}

function applyReplacements(html) {
  let out = applyLogo(html);
  for (const [pattern, replacement] of REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }
  out = injectFonts(out);
  out = injectDesignCss(out);
  out = ensureFavicon(out);
  return out;
}

copyDesignAssets();

const settings = {
  site_name: 'AON Manancial Consulting',
  tagline: 'Formação e Consultoria',
  email: 'geral@manancialconsulting.ao',
  phone_primary: '(+351) 217 540 451',
  phone_secondary: '(+351) 963 009 977',
  address: 'Rua Fernando Lopes Graça 15A, 1600-067 LISBOA',
  facebook: 'https://www.facebook.com/ofconsultores/',
  instagram: 'https://www.instagram.com/ofconsultores/',
  linkedin: 'https://www.linkedin.com/company/ofconsultores',
  logo: LOGO,
  api_base: '/api',
  colors: {
    navy: '#182a4d',
    gold: '#b8935a',
    gold_dark: '#a07c44',
    blue_logo: '#1a5aa0',
    cyan: '#00b6ec',
  },
};

const menu = [
  { title: 'OFCONSULTORES', url: '/ofconsultores/' },
  { title: 'CONSULTORIA', url: '/consultoria/' },
  { title: 'FORMAÇÃO', url: '/formacao/' },
  { title: 'CLIENTES', url: '/clientes/' },
  { title: 'PUBLICAÇÕES', url: '/publicacoes/' },
];

fs.writeFileSync(path.join(DATA, 'settings.json'), JSON.stringify(settings, null, 2));
fs.writeFileSync(path.join(DATA, 'menu.json'), JSON.stringify(menu, null, 2));

const htmlFiles = walkHtml(FRONTEND).filter((f) => !f.includes('/wp-content/'));
let updated = 0;

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const next = applyReplacements(html);
  if (next !== html) {
    fs.writeFileSync(file, next, 'utf8');
    updated++;
  }
}

console.log(`Design system aplicado ao site espelhado: ${updated} páginas, logo em ${LOGO}`);
