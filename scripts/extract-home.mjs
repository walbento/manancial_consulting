/**
 * Extract assets and CSS/JS from Desktop home reference HTML.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC = process.argv[2] || path.join(process.env.HOME, 'Desktop/index.html');
const ASSETS = path.join(ROOT, 'frontend/assets/images');

const html = fs.readFileSync(SRC, 'utf8');
fs.mkdirSync(ASSETS, { recursive: true });

function writeB64(name, b64, mime) {
  const ext = mime.includes('jpeg') ? 'jpg' : 'png';
  const rel = `/assets/images/${name}.${ext}`;
  fs.writeFileSync(path.join(ASSETS, `${name}.${ext}`), Buffer.from(b64, 'base64'));
  return rel;
}

const logoLight = html.match(/class="logo-light" src="data:image\/png;base64,([^"]+)"/);
const logoDark = html.match(/class="logo-dark" src="data:image\/png;base64,([^"]+)"/);
if (!logoLight || !logoDark) throw new Error('Logos not found');

const logoLightPath = writeB64('logo-manancial-light', logoLight[1], 'image/png');
const logoDarkPath = writeB64('logo-manancial-dark', logoDark[1], 'image/png');

const slideRe = /background-image:url\('data:image\/jpeg;base64,([^']+)'\)/g;
const slidePaths = [];
let m;
let idx = 1;
while ((m = slideRe.exec(html)) !== null) {
  slidePaths.push(writeB64(`hero-slide-${idx}`, m[1], 'image/jpeg'));
  idx++;
}
if (slidePaths.length !== 3) throw new Error(`Expected 3 hero slides, got ${slidePaths.length}`);

let css = html.match(/<style>([\s\S]*?)<\/style>/)[1];
let slideIndex = 0;
css = css.replace(/background-image:url\('data:image\/jpeg;base64,[^']+'\)/g, () => {
  return `background-image:url('${slidePaths[slideIndex++]}')`;
});

const cssDir = path.join(ROOT, 'frontend/css/pages');
fs.mkdirSync(cssDir, { recursive: true });
fs.writeFileSync(path.join(cssDir, 'home.css'), `/* AON Manancial Consulting — home */\n${css}`);

const js = html.match(/<script>([\s\S]*?)<\/script>/)[1];
fs.writeFileSync(path.join(ROOT, 'frontend/js/home.js'), `${js.trim()}\n`);

let body = html.match(/<body>([\s\S]*?)<\/body>/)[1];
body = body
  .replace(/href="#top" class="brand"/, 'href="/" class="brand"')
  .replace(/class="logo-light" src="data:image\/png;base64,[^"]+"/, `class="logo-light" src="${logoLightPath}"`)
  .replace(/class="logo-dark" src="data:image\/png;base64,[^"]+"/, `class="logo-dark" src="${logoDarkPath}"`)
  .replace(/href="#contacto"/g, (match, offset, str) => {
    const snippet = str.slice(Math.max(0, offset - 80), offset + 40);
    if (snippet.includes('>Carreiras<')) return match;
    return 'href="/contatos/"';
  });

const head = `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AON Manancial Consulting — A nascente do valor</title>
<meta name="description" content="AON Manancial Consulting — Consultoria financeira e de gestão em Angola. Auditoria, fiscalidade, consultoria estratégica e assessoria em transacções.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/pages/home.css">
<link rel="icon" href="/assets/images/logo-manancial.png" type="image/png">
</head>
<body>
`;

const tail = `
<script src="/js/home.js" defer></script>
</body>
</html>
`;

fs.writeFileSync(path.join(ROOT, 'frontend/index.html'), head + body.trim() + tail);

console.log('Done.');
console.log('Slides:', slidePaths.join(', '));
console.log('Logos:', logoLightPath, logoDarkPath);
