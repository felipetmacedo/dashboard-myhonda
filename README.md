# MyHonda SFS

Plataforma de dashboards do produto **MyHonda SFS** (concessionária Honda). Monorepo com
API Express e frontend React/Vite, conectados ao banco MySQL `sfsea`.

> Projeto derivado do dashboard Sagzap. As páginas e queries antigas foram removidas — esta base
> contém apenas o esqueleto reutilizável (autenticação, usuários, lojas, permissões, layout e UI).
> Novos dashboards e queries são adicionados sobre essa base.

## Estrutura do monorepo

```
dashboard-myhonda/
├── api/          # API Express (Node 20) — autenticação, usuários, lojas, permissões
│   ├── src/
│   │   ├── routes/        # define this.router.get/post/... (BaseRoutes)
│   │   ├── controllers/   # recebe req/res, chama service (BaseController)
│   │   ├── services/      # regras de negócio + queries SQL (Sequelize)
│   │   ├── schemas/        # validação de params (yup)
│   │   ├── models/         # models Sequelize (auto-carregados de models/*.js)
│   │   ├── middlewares/    # auth (JWT), permissões (CASL), admin
│   │   ├── abilities/      # regras CASL
│   │   ├── utils/          # logger, email, paginação, validador
│   │   ├── app.js          # configuração Express
│   │   ├── database.js     # conexão Sequelize (schema sfsea)
│   │   └── routes.js       # registro central de rotas + OpenAPI
│   ├── Dockerfile          # multi-stage (build → produção node)
│   └── docker-compose.yml  # serviço + labels Traefik
│
├── front/        # Frontend React 18 + Vite + TypeScript + shadcn/ui + Tailwind
│   ├── src/
│   │   ├── pages/          # uma página por rota (Index, NotFound)
│   │   ├── components/      # componentes; ui/ = shadcn primitives
│   │   ├── services/        # camada de API: [feature]Api.ts + [feature]Types.ts
│   │   ├── contexts/        # AuthContext (estado global de auth)
│   │   ├── hooks/           # hooks reutilizáveis
│   │   ├── utils/           # apiConfig (resolve URL da API por hostname)
│   │   ├── lib/             # utils do Tailwind (cn)
│   │   ├── App.tsx          # rotas
│   │   └── index.css        # variáveis CSS de tema (cor primária = vermelho Honda)
│   ├── Dockerfile          # build Vite → nginx
│   ├── nginx.conf          # SPA fallback
│   └── docker-compose.yml  # serviço + labels Traefik
│
└── .github/workflows/      # CI: build das imagens + trigger Portainer
```

## Rodar local

**API** (porta 3000 — fixa):
```bash
cd api
yarn install
yarn start:dev
```

**Frontend** (porta 8080):
```bash
cd front
npm install --legacy-peer-deps   # projeto tem conflito de peer-deps (date-fns) — flag necessária
cp .env.example .env             # ajuste VITE_API_URL se preciso
npm run dev
```

> O frontend resolve a URL da API por hostname (`src/utils/apiConfig.ts`): em `localhost` usa
> `VITE_API_URL`; em produção usa `https://express-myhonda.sagzap.com.br`.

## Banco de dados

- MySQL, schema `sfsea`, host padrão `54.39.16.104` (sobrescrevível por env `SFSEA_DB_*`).
- Queries via `this.database.masterInstance.query(query, { replacements, type: QueryTypes.SELECT })`.
- Parâmetros nomeados `:nomeParam` com objeto `replacements`.

## Adicionar uma nova rota na API

Seguir o fluxo em camadas (uma responsabilidade por arquivo):
1. **Schema** — validação dos params em `api/src/schemas/<recurso>.js`
2. **Service** — query/regra em `api/src/services/<recurso>.js`
3. **Controller** — método + bind no construtor em `api/src/controllers/<recurso>.js`
4. **Route** — registrar `this.router.get(...)` em `api/src/routes/<recurso>.js`
5. Exportar nos respectivos `index.js` e montar em `api/src/routes.js`

## Adicionar um dashboard no frontend

1. **Service** — `front/src/services/<feature>Api.ts` (fetch) + `<feature>Types.ts` (tipos)
2. **Página** — `front/src/pages/<Feature>.tsx`, envolvida por `<Layout>` e `<ProtectedRoute>`
3. **Rota** — adicionar `<Route>` em `App.tsx`
4. **Menu** — adicionar item em `menuItems` de `components/AppSidebar.tsx`

## Padrões de qualidade

**Geral**
- TypeScript no front; ESLint em ambos (`npm run lint` / `yarn lint`).
- Nomes: componentes `PascalCase`, funções/variáveis `camelCase`, constantes `UPPER_SNAKE_CASE`.
- Sem segredos no repositório. `.env` é ignorado; usar `.env.example`.

**Frontend** (ver `front/AGENTS.md` e `front/.windsurf/rules/`)
- **React Query** (`@tanstack/react-query`) para estado de servidor — nada de `fetch` solto em `useEffect`.
- `useMemo` para valores derivados; `useCallback` para handlers passados a filhos.
- Componentes de UI vêm do shadcn/ui (`components/ui/`); compor, não reinventar.
- Tabelas com `@tanstack/react-table` (ver `front/TABLES.md`).
- Cor primária via variável CSS `--primary` (vermelho Honda `#CC0000`) — usar classes
  `bg-primary`/`text-primary`, nunca hex hardcoded de marca.

**API**
- Camadas: route → controller → service. Controller não tem SQL; service não conhece req/res.
- Validar entrada com schema (yup) antes do controller.
- Erros via `BaseController.sendError`; sucesso via `sendSuccess`.

## Deploy

Push em `main` → GitHub Actions (`.github/workflows/deploy-portainer.yml`) builda as duas imagens
(`ghcr.io/felipetmacedo/dashboard-myhonda:api-latest` e `:front-latest`), envia ao GHCR e dispara **um** webhook do stack no Portainer
do Portainer. O servidor roda **Traefik** (rede externa `sagzap`, TLS Let's Encrypt).

Domínios de produção:
- Frontend: `https://myhonda.sagzap.com.br`
- API: `https://express-myhonda.sagzap.com.br`

### Pendências de infra (configurar uma vez)
- Criar **um** stack no Portainer com o `docker-compose.yml` da raiz (API + front) e cadastrar o secret `PORTAINER_WEBHOOK` com a URL do webhook desse stack.
- Confirmar o nome da rede externa do Traefik no servidor (default assumido: `sagzap`).
- Fornecer o logo Honda oficial em `front/src/assets/logo-myhonda.png` (hoje é placeholder).
- Decidir migração de auth: hoje o login usa webhook n8n; migrar para a rota `/auth` (JWT) da API.
