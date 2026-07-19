# Manancial Consulting — Site Institucional

Site estático da **Manancial Consulting** (assessoria financeira, auditoria e contabilidade), baseado em HTML, CSS e JavaScript, com deploy na **Netlify**.

> **Front end:** Html, CSS, JS  
> **Back end:** Netlify Functions (Node.js) + PostgreSQL (`netlify/functions/`)

---

## Estrutura do repositório

```
manancial_consulting/
├── frontend/                 # Site público (deploy Netlify)
│   ├── index.html            # Homepage
│   ├── css/                  # Estilos Manancial (variables, custom, etc.)
│   ├── js/                   # Scripts (menu, forms, API stub)
│   ├── partials/             # Header, footer, formulário (referência)
│   ├── data/                 # Conteúdo em JSON (settings, páginas)
│   ├── assets/images/        # Logo e imagens próprias
│   ├── wp-content/           # CSS/JS legacy do tema (não editar à mão)
│   ├── sobre/                # Página Sobre
│   ├── servicos/             # Página Serviços
│   └── contatos/             # Contacto
│
├── netlify/functions/         # API serverless (Node.js + PostgreSQL) — ex.: contact.js
├── site/                     # Espelho original (referência técnica)
├── scripts/                  # Scripts de build e migração
├── netlify.toml              # Configuração de deploy
└── package.json
```

---

## Pré-requisitos

- **Node.js** 20+
- **npm** 9+
- Conta **Netlify** (para deploy)
- (Opcional) Repositório Git remoto para CI/CD

---

## Instalação

```bash
git clone <url-do-repositorio>
cd manancial_consulting
npm install
```

---

## Comandos principais

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Build + servidor local em `http://localhost:3000` |
| `npm run build` | Gera/atualiza o `frontend/` a partir do espelho em `site/` |
| `npm run migrate` | Igual ao build (migra `site/` → `frontend/`) |
| `npm run assets` | Descarrega imagens em falta para o frontend |
| `npm run mirror` | Re-espelha o site original (uso raro) |

### Desenvolvimento local

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) no browser.

Se não vires alterações, faz hard refresh: `Cmd+Shift+R` (Mac) ou `Ctrl+Shift+R` (Windows).

---

## Onde editar o quê

### Conteúdo e contactos (recomendado)

| Ficheiro | O quê editar |
|----------|--------------|
| `frontend/data/settings.json` | Nome, email, telefone, morada, horário, logo |
| `frontend/data/menu.json` | Estrutura do menu de navegação |
| `frontend/data/pages/home.json` | Conteúdo estruturado da homepage |
| `frontend/data/consultoria/*.json` | Textos das páginas de serviços |

### Visual / branding

| Ficheiro | O quê editar |
|----------|--------------|
| `frontend/css/variables.css` | Cores e tipografia Manancial |
| `frontend/css/custom.css` | Overrides do tema legacy |
| `frontend/assets/images/logo-manancial.svg` | Logo |

### Páginas HTML

- Editar em `frontend/*.html` ou `frontend/<secção>/index.html`
- **Atenção:** `npm run build` **sobrescreve** o HTML copiando de `site/`, excepto as pastas preservadas: `css/`, `js/`, `partials/`, `data/`, `assets/`

### Formulário de contacto

- Envio via `fetch` para `/api/contact`, que a Netlify redireciona para a function `netlify/functions/contact.js`
- A function valida os campos e grava na tabela `contactos` (PostgreSQL) via driver `pg`
- Credenciais da base de dados: definir como variáveis de ambiente no Netlify (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`) em **Site settings → Environment variables**
- Teste local: `npx netlify dev` (expõe a function em `/api/contact` sem imprimir credenciais no terminal)

---

## Fluxo de trabalho da equipa

### Alterar textos ou contactos

1. Editar `frontend/data/settings.json` (ou JSON da página)
2. Testar: `npm run dev`
3. Commit + push → deploy automático

### Alterar cores ou layout

1. Editar `frontend/css/variables.css` e `custom.css`
2. Testar: `npm run dev`
3. Commit + push

### Adicionar página nova

1. Criar `frontend/nova-pagina/index.html` (copiar estrutura de uma página existente)
2. Adicionar entrada em `frontend/data/menu.json` e `frontend/search-index.json`
3. Adicionar redirect em `frontend/_redirects` se necessário

---


## Resolução de problemas

### Site sem estilos (CSS em falta)

```bash
npm run build
```

Confirma que existem ficheiros em `frontend/wp-content/cache/autoptimize/css/`.

No browser: DevTools → Network → filtrar CSS → deve ser **200**, não **404**.

### Imagens não aparecem

```bash
npm run assets
```

### Alterações no HTML desaparecem após build

O build copia de `site/`. Prefere editar `frontend/data/` ou pastas preservadas (`css/`, `js/`, `assets/`). Para mudanças permanentes no HTML, ajusta `scripts/migrate-to-frontend.mjs` ou o espelho em `site/`.

### Porta 3000 ocupada

```bash
npx serve frontend -p 8080
```

---

## Páginas activas vs legacy

| URL | Estado |
|-----|--------|
| `/` | Homepage Manancial |
| `/servicos/` | Serviços |
| `/sobre/` | Sobre |
| `/contatos/` | Contacto |
| `/consultoria/`, `/formacao/`, `/cursos/` | Legacy (redireccionadas ou ocultas no menu) |

---

## Contactos do projecto

- **Email:** geral@manancialconsulting.ao
- **Telefone:** +244 923 456 789
- **Morada:** Edifício Kilamba, Av. Pedro de Castro Van-Dúnem, Talatona, Luanda

---

## Licença

Código interno Manancial Consulting. Não distribuir sem autorização.
