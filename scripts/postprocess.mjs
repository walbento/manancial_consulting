import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..', 'site', 'www.ofconsultores.com');

const EXTRA_URLS = [
  'https://www.ofconsultores.com/proposta/',
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.endsWith('.woff2') || entry.name.endsWith('.woff') || entry.name.endsWith('.ttf') || entry.name.endsWith('.eot') || entry.name.endsWith('.svg')) {
        const bogus = path.join(full, 'index.html');
        if (fs.existsSync(bogus)) fs.unlinkSync(bogus);
        continue;
      }
      walk(full, files);
    } else if (entry.name.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

function normalizeAssetPaths(html) {
  return html
    .replace(/((?:href|src)=["'])(\.\.\/)+wp-content\//gi, '$1/wp-content/')
    .replace(/((?:href|src)=["'])wp-content\//gi, '$1/wp-content/')
    .replace(/((?:href|src)=["'])(\.\.\/)+wp-includes\//gi, '$1/wp-includes/');
}

function normalizeUrls(html) {
  html = normalizeAssetPaths(html);
  return html
    .replace(/https?:\/\/www\.ofconsultores\.com/gi, '')
    .replace(/https?:\/\/ofconsultores\.com/gi, '')
    .replace(/\/wp-admin\/admin-ajax\.php/gi, '#')
    .replace(/href="\/wp\//g, 'href="/')
    .replace(/action="\/wp\//g, 'action="/');
}

function fixLazyImages(html) {
  return html.replace(
    /(<img[^>]*class="[^"]*lazyload[^"]*"[^>]*data-src=")([^"]+)("[^>]*>)/gi,
    (match, pre, src, post) => {
      const fixed = src.startsWith('/') ? src : `/${src.replace(/^\//, '')}`;
      const out = `${pre}${fixed}${post}`;
      if (!out.includes('srcset') && fixed) {
        return out.replace(/src="[^"]*"/, `src="${fixed}"`);
      }
      return out.replace(/src="[^"]*"/, `src="${fixed}"`);
    }
  );
}

function convertContactForms(html) {
  return html.replace(
    /<form action="[^"]*wpcf7[^"]*" method="post" class="wpcf7-form[^"]*"[^>]*>[\s\S]*?<\/form>/gi,
    (form) => {
      if (!form.includes('wpcf7')) return form;
      return `<form name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" action="/obrigado/" class="wpcf7-form">
<input type="hidden" name="form-name" value="contact" />
<p class="hidden"><label>Não preencher: <input name="bot-field" /></label></p>
<div class="row"><p><input size="40" maxlength="400" class="wpcf7-form-control wpcf7-text wpcf7-validates-as-required" aria-required="true" placeholder="o seu nome" type="text" name="nome" required></p></div>
<div class="row"><p><input size="40" maxlength="400" class="wpcf7-form-control wpcf7-email wpcf7-validates-as-required wpcf7-text wpcf7-validates-as-email" aria-required="true" placeholder="o seu email" type="email" name="email" required></p></div>
<div class="row"><p><input size="40" maxlength="400" class="wpcf7-form-control wpcf7-text wpcf7-validates-as-required" aria-required="true" placeholder="assunto" type="text" name="assunto" required></p></div>
<div class="row"><p><textarea cols="40" rows="10" maxlength="2000" class="wpcf7-form-control wpcf7-textarea" placeholder="mensagem" name="mensagem"></textarea></p></div>
<div class="row"><p><label><input type="checkbox" name="aceite-termos" value="sim" required> Aceito os Termos &amp; Condições e Política de Privacidade</label></p></div>
<div class="row"><p><input class="wpcf7-form-control wpcf7-submit has-spinner" type="submit" value="Enviar"></p></div>
</form>`;
    }
  );
}

function fixSearchForm(html) {
  return html.replace(
    /<form method="get" id="searchform" action="[^"]*">/gi,
    '<form method="get" id="searchform" action="/pesquisa/" onsubmit="return window.siteSearch && window.siteSearch.handleSubmit(event)">'
  );
}

function processFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  html = normalizeUrls(html);
  html = fixLazyImages(html);
  html = convertContactForms(html);
  html = fixSearchForm(html);

  if (!html.includes('static-fixes.js')) {
    html = html.replace('</body>', '  <script src="/static-fixes.js" defer></script>\n</body>');
  }

  fs.writeFileSync(filePath, html, 'utf8');
}

function buildSearchIndex(htmlFiles) {
  const pages = [];
  for (const file of htmlFiles) {
    const rel = path.relative(SITE_ROOT, file).replace(/index\.html$/, '').replace(/\/$/, '');
    const url = rel ? `/${rel}/` : '/';
    const html = fs.readFileSync(file, 'utf8');
    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    const h1Match = html.match(/<h1[^>]*>([^<]*)</i);
    const text = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    pages.push({
      url,
      title: (titleMatch?.[1] || h1Match?.[1] || url).replace(/\s+/g, ' ').trim(),
      excerpt: text.slice(0, 400),
    });
  }
  fs.writeFileSync(path.join(SITE_ROOT, 'search-index.json'), JSON.stringify(pages, null, 2));
}

async function fetchMissingPages() {
  for (const url of EXTRA_URLS) {
    const u = new URL(url);
    const dest = path.join(SITE_ROOT, u.pathname, 'index.html');
    if (fs.existsSync(dest)) continue;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (res.ok) {
      fs.writeFileSync(dest, await res.text());
      console.log('Fetched', url);
    }
  }
}

await fetchMissingPages();

const htmlFiles = walk(SITE_ROOT);
for (const file of htmlFiles) {
  processFile(file);
}
buildSearchIndex(htmlFiles.filter((f) => !f.includes('/wp-content/')));

console.log(`Processed ${htmlFiles.length} HTML files.`);
