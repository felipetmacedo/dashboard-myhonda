# MyHonda SFS — Guia de Desenvolvimento

Monorepo do produto **MyHonda SFS** (dashboards da concessionária Honda). Derivado do dashboard
Sagzap, com as páginas/queries antigas removidas — restou só o esqueleto reutilizável.

## Estrutura

| Parte | Pasta | Stack |
|-------|-------|-------|
| API   | `api/`   | Express, Sequelize (MySQL), JWT, CASL |
| Front | `front/` | React 18, Vite, TypeScript, shadcn/ui, Tailwind, React Query |

Deploy: push em `main` → GitHub Actions builda API+front (GHCR) e dispara um webhook do stack Portainer (`PORTAINER_WEBHOOK`).
Servidor roda Traefik (rede externa `sagzap`, TLS Let's Encrypt).

- Frontend: `https://myhonda.sagzap.com.br`
- API: `https://express-myhonda.sagzap.com.br`

## Subir os servidores

```
front  →  porta 8080
api    →  porta 3000 (fixa)
```

**Ambos juntos (preferido):**
```bash
npm install           # raiz (instala concurrently)
npm run install:all   # instala deps da API (yarn) + front (npm)
npm run dev           # inicia os dois com output colorido
```

**Individualmente:**
```bash
npm run dev:api    # equivale a: cd api && yarn start:dev
npm run dev:front  # equivale a: cd front && npm run dev
```

**Build / lint:**
```bash
npm run build      # builda API (babel) + front (vite)
npm run lint       # ESLint API + front
```

`front/.env` (a partir de `.env.example`):
```
VITE_API_URL=http://localhost:3000
```

> Se a porta 3000 estiver ocupada: `lsof -i :3000 -sTCP:LISTEN` e `kill <PID>`.

## Estrutura da API

```
api/src/
├── routes/<recurso>.js       # registra rotas (BaseRoutes)
├── controllers/<recurso>.js  # recebe req/res, chama service
├── services/<recurso>.js     # queries SQL e regras
├── schemas/<recurso>.js      # validação (yup)
└── models/<recurso>.js       # models Sequelize (auto-load de models/*.js)
```

Adicionar rota: **Schema → Service → Controller → Route**, exportar nos `index.js` e montar em
`api/src/routes.js`. Recursos existentes: `auth`, `user`, `store`, `permission`, `permission-module`.

## Banco de dados

- MySQL, schema `sfsea`, host `54.39.16.104` (sobrescrevível por `SFSEA_DB_*`).
- `this.database.masterInstance.query(query, { replacements, type: QueryTypes.SELECT })`.
- Parâmetros `:nomeParam` + objeto `replacements`.

## Frontend

- Estado de servidor com **React Query**; `useMemo`/`useCallback` para derivados/handlers.
- UI via shadcn/ui (`components/ui/`); tabelas via `@tanstack/react-table` (ver `front/TABLES.md`).
- Cor primária = vermelho Honda (`--primary` em `src/index.css`); usar `bg-primary`/`text-primary`.
- API resolvida por hostname em `src/utils/apiConfig.ts`.
- Regras detalhadas: `front/AGENTS.md` e `front/.windsurf/rules/`.

## Commits e deploy

Repositório único `dashboard-myhonda`. Commitar normalmente; push em `main` sobe o deploy.
Antes de commitar, `git pull` (outros podem ter subido alterações).

## Pendências de infra

- Stack único no Portainer (`docker-compose.yml` raiz) + secret `PORTAINER_WEBHOOK`.
- Confirmar nome da rede externa do Traefik (default: `sagzap`).
- Logo Honda oficial em `front/src/assets/logo-myhonda.png` (hoje placeholder).
- Auth: hoje login via webhook n8n; migrar para `/auth` (JWT) da API
