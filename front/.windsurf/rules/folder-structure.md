---
trigger: always_on
---

# Estrutura de Pastas — SAGzap myHonda (monorepo)

## Raiz do monorepo

```
dashboard-myhonda/
├── .github/workflows/
│   └── deploy-portainer.yml   ← CI: build API + front → GHCR → webhooks Portainer
├── api/                       ← API Express (Node 20 + Babel)
├── front/                     ← Frontend React/Vite
├── docker-compose.yml         ← stack completa (API + front) com Traefik labels
├── package.json               ← raiz: scripts dev/build/lint de ambos (concurrently)
├── CLAUDE.md                  ← guia de desenvolvimento para agentes
└── README.md                  ← visão geral, como rodar, padrões
```

---

## API (`api/`)

```
api/
├── src/
│   ├── routes/          ← [recurso].js → define this.router.get/post/...
│   ├── controllers/     ← [recurso].js → recebe req/res, chama service
│   ├── services/        ← [recurso].js → regras de negócio + queries SQL
│   ├── schemas/         ← [recurso].js → validação yup de query/body/params
│   ├── models/          ← [recurso].js → Sequelize models (auto-carregados)
│   ├── middlewares/     ← auth.js (JWT), permission.js (CASL), admin.js
│   ├── abilities/       ← regras CASL
│   ├── utils/           ← logger, email, paginação, schema-validator
│   ├── docs/            ← openapi-builder.js
│   ├── constants/       ← error.messages, permission, log
│   ├── app.js           ← Express + CORS + Helmet + dayjs TZ
│   ├── database.js      ← Sequelize MySQL (sfsea) + auto-load models
│   └── routes.js        ← registro central de rotas + Swagger
├── Dockerfile           ← multi-stage: build (node:22) → prod (node:20)
├── docker-compose.yml   ← serviço API isolado (Traefik)
├── .dockerignore
└── package.json
```

**Fluxo de uma nova rota:** Schema → Service → Controller → Route → index.js → routes.js

---

## Frontend (`front/`)

```
front/src/
├── assets/
│   └── logo-myhonda.png       ← placeholder; substituir pelo logo Honda oficial
├── components/
│   ├── ui/                    ← shadcn/ui (49 primitivos — não editar manualmente)
│   ├── AdvancedTableComponents.tsx  ← Header, Body, Toolbar, Pagination, FacetedFilter
│   ├── AppSidebar.tsx         ← menu lateral + logout
│   ├── AutoRefreshControl.tsx
│   ├── ColumnConfiguration.tsx
│   ├── CompactAutoRefresh.tsx
│   ├── DateRangePicker.tsx
│   ├── Layout.tsx             ← SidebarProvider + AppSidebar
│   ├── LoginForm.tsx
│   ├── Logo.tsx
│   ├── PageHeader.tsx         ← título + filtros inline (grid 4 colunas)
│   └── ProtectedRoute.tsx
├── contexts/
│   └── AuthContext.tsx        ← user, login, logout, getCodhdaList, isLoading
├── hooks/
│   ├── use-mobile.tsx
│   ├── use-toast.ts
│   ├── useAdvancedTable.tsx   ← wrapper TanStack Table com localStorage
│   └── useAutoRefresh.tsx
├── pages/
│   ├── Index.tsx              ← home (placeholder — novos dashboards aqui)
│   ├── Leads.tsx              ← /reports/leads
│   └── NotFound.tsx
├── services/
│   ├── authApi.ts             ← loginUser() → webhook n8n
│   ├── authTypes.ts           ← LoginRequest, LoginResponse, AuthUser, Loja
│   ├── reportsApi.ts          ← fetchLeads()
│   └── reportsTypes.ts        ← Lead, LeadsRequest
├── utils/
│   └── apiConfig.ts           ← API_BASE_URL por hostname
├── App.tsx                    ← QueryClientProvider + AuthProvider + rotas
├── index.css                  ← variáveis CSS de tema (--primary: 0 100% 40%)
└── main.tsx
```

---

## Adicionando uma nova página

```
1. src/services/[feature]Api.ts + [feature]Types.ts
2. src/pages/[Feature].tsx
3. App.tsx → novo <Route>
4. AppSidebar.tsx → novo item em menuItems
```

---

## Configurações no `front/`

| Arquivo | Propósito |
|---------|-----------|
| `vite.config.ts` | porta 8080, alias `@/` → `src/` |
| `tailwind.config.ts` | cores via variáveis CSS |
| `components.json` | shadcn/ui (baseColor: slate, cssVariables: true) |
| `.env.example` | `VITE_API_URL=http://localhost:3000` |
| `Dockerfile` + `nginx.conf` | build Vite → nginx para produção |
