/**
 * Aplica o design AON Manancial (home) a todas as páginas internas.
 * Homepage: gerida por scripts/extract-home.mjs — não tocada aqui.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const FRONTEND = path.join(ROOT, 'frontend');

// Fontes + CSS Manancial (igual à home)
const FONTS =
  '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
  '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">\n' +
  '<link rel="stylesheet" href="/css/pages/home.css">\n' +
  '<link rel="icon" href="/assets/images/logo-manancial.png" type="image/png">';

// Header Manancial — igual à home, mas com class="solid" e âncoras /#...
const HEADER = `<!-- ===================== HEADER ===================== -->
<header id="hdr" class="solid">
  <div class="wrap nav">
    <a href="/" class="brand" aria-label="AON Manancial Consulting — início">
      <img class="logo-light" src="/assets/images/logo-manancial-light.png" alt="AON Manancial">
      <img class="logo-dark" src="/assets/images/logo-manancial-dark.png" alt="AON Manancial">
      <span class="bt"><b>AON Manancial</b><span>Consulting</span></span>
    </a>
    <nav>
      <ul>
        <li><a href="/quem-somos/">Quem Somos</a></li>
        <li class="has-dropdown">
          <a href="/formacoes/" aria-haspopup="true" aria-expanded="false">O que fazemos <svg class="care" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></a>
          <ul class="dropdown">
            <li>
              <a href="/formacoes/">
                <span class="dd-icon"><svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></span>
                <span class="dd-label"><b>Formações</b><small>Programas de desenvolvimento</small></span>
              </a>
            </li>
            <li class="dropdown-sep"></li>
            <li>
              <a href="/servicos/">
                <span class="dd-icon"><svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></span>
                <span class="dd-label"><b>Serviços</b><small>Auditoria, Fiscal, Advisory</small></span>
              </a>
            </li>
          </ul>
        </li>
        <li><a href="/servicos/">Serviços</a></li>
        <li><a href="/perspectivas/">Perspectivas</a></li>
        <li><a href="/contatos/">Contactos</a></li>
      </ul>
    </nav>
    <div class="nav-cta">
      <a href="/contatos/" class="btn nav-btn">Fale Connosco <span class="arw">→</span></a>
      <button class="burger" id="burger" aria-label="Abrir menu"><span></span><span></span><span></span></button>
    </div>
  </div>
  <div class="mobile-menu" id="mm">
    <a href="/quem-somos/">Quem Somos</a>
    <details class="mm-dropdown">
      <summary>O que fazemos <svg class="care" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></summary>
      <a href="/formacoes/">Formações</a>
    </details>
    <a href="/servicos/">Serviços</a>
    <a href="/perspectivas/">Perspectivas</a>
    <a href="/contatos/">Contactos</a>
    <a href="/contatos/" class="btn btn-gold">Fale Connosco →</a>
  </div>
</header>`;

// Footer Manancial — igual à home, âncoras como /#...
const FOOTER = `<!-- ===================== FOOTER ===================== -->
<footer>
  <div class="wrap">
    <div class="foot-top">
      <div class="foot-brand">
        <div class="fmark"><b>AON Manancial</b><span>Consulting</span></div>
        <p>Consultoria financeira e de gestão ao serviço das organizações angolanas. Rigor, proximidade e uma fonte contínua de valor.</p>
      </div>
      <div>
        <h4>Serviços</h4>
        <ul>
          <li><a href="/servicos/#auditoria">Auditoria &amp; Assurance</a></li>
          <li><a href="/servicos/#fiscalidade">Fiscalidade</a></li>
          <li><a href="/servicos/#gestao">Consultoria de Gestão</a></li>
          <li><a href="/servicos/#advisory">Advisory &amp; Transacções</a></li>
        </ul>
      </div>
      <div>
        <h4>Empresa</h4>
        <ul>
          <li><a href="/quem-somos/">Quem Somos</a></li>
          <li><a href="/perspectivas/">Perspectivas</a></li>
          <li><a href="#">Carreiras</a></li>
        </ul>
      </div>
      <div>
        <h4>Contactos</h4>
        <ul>
          <li>Luanda, Angola</li>
          <li><a href="mailto:geral@manancialconsulting.ao">geral@manancialconsulting.ao</a></li>
          <li><a href="tel:+244942643030">+244 942 643 030</a></li>
        </ul>
      </div>
    </div>
    <div class="foot-bottom">
      <span>© 2026 AON Manancial Consulting. Todos os direitos reservados.</span>
      <div class="foot-social">
        <a href="#" aria-label="LinkedIn"><svg viewBox="0 0 24 24"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4 0 4.75 2.65 4.75 6.1V21H20v-5.5c0-1.3-.02-3-1.85-3-1.85 0-2.13 1.44-2.13 2.9V21H12z"/></svg></a>
        <a href="#" aria-label="Email"><svg viewBox="0 0 24 24"><path d="M3 5h18v14H3zM3 5l9 7 9-7"/></svg></a>
      </div>
    </div>
  </div>
</footer>

<script src="/js/home.js" defer></script>`;

// CSS extra para páginas internas: esconder header/footer WordPress, formatar conteúdo
// Marcador único para idempotência — NÃO usar conteúdo que possa existir no HTML do WordPress
const INNER_CSS_MARKER = '/* mc-shell-v2 */';
const INNER_CSS = `${INNER_CSS_MARKER}
/* Páginas internas — esconder elementos WordPress */
.stm-header,.stm-footer,.stm-header__overlay,.pearl_arrow_top,#searchModal{display:none!important}
#wrapper{padding:0!important}
/* Neutralizar Bootstrap/Pearl: repor base tipográfica Manancial */
html{font-size:16px!important}
body{font-size:16px!important;font-family:'Inter',sans-serif!important;line-height:1.6!important;color:#142433!important;background:#fff!important}
/* Links — evitar azul Bootstrap dentro do rodapé */
footer a{color:rgba(255,255,255,.62)!important}
footer a:hover{color:#d9c398!important}
footer ul li{color:rgba(255,255,255,.62)!important}
/* Tipografia do conteúdo interno */
.site-content{font-family:"Inter",sans-serif;color:#1a2235;padding:48px 32px 80px;max-width:1240px;margin:0 auto}
.site-content h1,.site-content h2,.site-content h3,.site-content h4,
.site-content .stm_titlebox__title,.site-content .vc_custom_heading{
  font-family:"Cormorant Garamond",Georgia,serif!important;color:#1a2235!important}
`;

function walkHtml(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['css', 'js', 'partials', 'data', 'assets', 'wp-content', 'wp-includes'].includes(entry.name)) continue;
      walkHtml(full, files);
    } else if (entry.name.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

function shellInnerPage(html) {
  // Remove quaisquer CSS antigos que conflituem
  html = html.replace(/<link rel="stylesheet" href="\/css\/(tokens|variables|base|layout|components|legacy-bridge|custom|reference)\.css">\n?/g, '');
  html = html.replace(/<link[^>]*fonts\.googleapis\.com[^>]*>\n?/g, '');
  html = html.replace(/<link[^>]*fonts\.gstatic\.com[^>]*>\n?/g, '');
  html = html.replace(/<script src="\/js\/reference\.js"[^>]*><\/script>\n?/g, '');

  // Remover TODAS as ocorrências prévias de api.js/home.js (em qualquer posição) para
  // garantir idempotência — evita duplicados quando o build corre sobre uma página
  // já "shelled" numa execução anterior. Guarda se a página já usava api.js (páginas
  // com formulário) para não o injectar em páginas que nunca precisaram dele.
  const hadApiJs = html.includes('/js/api.js');
  html = html.replace(/<script src="\/js\/api\.js"[^>]*><\/script>\n?/g, '');
  html = html.replace(/<script src="\/js\/home\.js"[^>]*><\/script>\n?/g, '');

  // Remover versão anterior do bloco de CSS (para forçar actualização)
  html = html.replace(/<style>\/\* mc-shell-v\d+ \*\/[\s\S]*?<\/style>\n?/g, '');

  // Injectar home.css se ainda não presente
  if (!html.includes('/css/pages/home.css')) {
    html = html.replace('</head>', `${FONTS}\n</head>`);
  }

  // Injectar CSS extra inline para páginas internas (idempotente via marcador único)
  if (!html.includes(INNER_CSS_MARKER)) {
    html = html.replace('</head>', `<style>${INNER_CSS}</style>\n</head>`);
  }

  // Substituir header existente (novo design) ou injectar
  if (html.includes('id="hdr"')) {
    html = html.replace(/<!-- ={3,} HEADER ={3,} -->\s*<header[\s\S]*?<\/header>/, HEADER);
  } else if (html.includes('id="mainNav"')) {
    // header antigo do ofconsultores
    html = html.replace(/<!-- ={3,} HEADER ={3,} -->\s*<header[\s\S]*?<\/header>/, HEADER);
    if (html.includes('id="mainNav"')) {
      html = html.replace(/<header[\s\S]*?<\/header>/, HEADER);
    }
  } else if (html.includes('<div id="wrapper">')) {
    html = html.replace('<div id="wrapper">', `${HEADER}\n<div id="wrapper">`);
  } else {
    html = html.replace(/(<body[^>]*>)/i, `$1\n${HEADER}`);
  }

  // FOOTER sem o script final — os scripts são geridos separadamente abaixo (idempotente)
  const footerOnly = FOOTER.replace(/\n\n<script[^>]*><\/script>$/, '');

  // Substituir footer existente (com ou sem marcador de comentário) ou injectar
  if (html.includes('class="foot-top"') || html.includes('class="foot-quote"')) {
    html = html.replace(/(<!-- ={3,} FOOTER ={3,} -->\s*)?<footer[\s\S]*?<\/footer>/, footerOnly);
  } else {
    html = html.replace('</body>', `${footerOnly}\n</body>`);
  }

  // Garantir api.js (só se já era usado antes) e home.js, uma única vez cada, no final do body
  if (hadApiJs && !html.includes('/js/api.js')) {
    html = html.replace('</body>', `<script src="/js/api.js" defer></script>\n</body>`);
  }
  if (!html.includes('/js/home.js')) {
    html = html.replace('</body>', `<script src="/js/home.js" defer></script>\n</body>`);
  }

  return html;
}

// Garantir que os logos light/dark existem (gerados pelo extract-home.mjs)
const imagesDir = path.join(FRONTEND, 'assets', 'images');
fs.mkdirSync(imagesDir, { recursive: true });

function ensureLogo(destName, sources) {
  const dest = path.join(imagesDir, destName);
  if (fs.existsSync(dest)) return;
  for (const src of sources) {
    if (src !== dest && fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      return;
    }
  }
}

ensureLogo('logo-manancial.png', [
  path.join(ROOT, 'assets', 'logo-manancial.png'),
]);
ensureLogo('logo-manancial-light.png', [
  path.join(ROOT, 'assets', 'logo-manancial-light.png'),
  path.join(imagesDir, 'logo-manancial.png'),
]);
ensureLogo('logo-manancial-dark.png', [
  path.join(ROOT, 'assets', 'logo-manancial-dark.png'),
  path.join(imagesDir, 'logo-manancial.png'),
]);

// Homepage: scripts/extract-home.mjs (AON Manancial design) — não sobrescrever aqui.

const inner = walkHtml(FRONTEND).filter((f) => f !== path.join(FRONTEND, 'index.html'));
let n = 0;
for (const file of inner) {
  const html = fs.readFileSync(file, 'utf8');
  const next = shellInnerPage(html);
  if (next !== html) {
    fs.writeFileSync(file, next, 'utf8');
    n++;
  }
}

console.log(`Manancial shell aplicado: ${n} páginas internas actualizadas (homepage preservada).`);
