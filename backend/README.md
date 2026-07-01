# Backend (PHP + PostgreSQL) — Fase 2

Estrutura reservada. Nenhum código PHP criado ainda.

```
backend/
├── public/          → Document root (index.php, /api/*)
├── src/
│   ├── Controllers/ → PageController, ContactController, AuthController
│   ├── Models/      → Page, Curso, Publicacao, User
│   ├── Services/    → ContentService, MailService
│   └── Middleware/  → Auth, CORS
├── config/          → database.php, app.php, .env
├── admin/           → UI do backoffice
└── tests/
```

## API planeada (contrato com frontend/js/api.js)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/settings` | Configurações globais |
| GET | `/api/menu` | Navegação |
| GET | `/api/pages/{section}/{slug}` | Conteúdo de página |
| GET | `/api/publicacoes` | Listagem de artigos |
| POST | `/api/contact` | Formulário de contacto |
| POST | `/api/admin/login` | Autenticação backoffice |

## Base de dados

Ver `database/migrations/` e `database/seeds/`.
