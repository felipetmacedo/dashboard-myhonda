---
trigger: always_on
---

# Arquitetura — SAGzap myHonda Frontend

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | React 18 + TypeScript 5 |
| Build | Vite 5 |
| UI | shadcn/ui (Radix UI + Tailwind CSS 3) |
| Server state | TanStack Query 5 (`@tanstack/react-query`) |
| Tabelas | TanStack Table 8 (`@tanstack/react-table`) |
| Roteamento | React Router DOM 6 |
| Ícones | Lucide React |
| Notificações | Sonner |

---

## Camadas

```
┌──────────────────────────────────┐
│  Pages (src/pages/)              │  uma página por rota
│  Componentes de Layout           │  Layout, AppSidebar, PageHeader
├──────────────────────────────────┤
│  Componentes (src/components/)   │  reutilizáveis; ui/ = shadcn
│  Hooks (src/hooks/)              │  useAdvancedTable, useAutoRefresh
├──────────────────────────────────┤
│  Contexts (src/contexts/)        │  AuthContext (auth global)
│  TanStack Query                  │  cache, refetch, estado de server
├──────────────────────────────────┤
│  Services (src/services/)        │  [feature]Api.ts + [feature]Types.ts
│  Utils (src/utils/)              │  apiConfig, puras
├──────────────────────────────────┤
│  API Express (api/)              │  SAGzap myHonda API em localhost:3000
└──────────────────────────────────┘
```

---

## Estrutura de pastas real

```
front/src/
├── assets/
│   └── logo-myhonda.png            ← substituir pelo logo oficial Honda
├── components/
│   ├── ui/                         ← shadcn/ui (49 primitivos — não editar)
│   ├── AdvancedTableComponents.tsx ← Header, Body, Pagination, Toolbar
│   ├── ApiParametersControl.tsx    ← filtro genérico de parâmetros
│   ├── AppSidebar.tsx              ← navegação lateral
│   ├── AutoRefreshControl.tsx      ← botão de auto-refresh
│   ├── ColumnConfiguration.tsx     ← visibilidade de colunas
│   ├── CompactAutoRefresh.tsx      ← versão compacta do auto-refresh
│   ├── DateRangePicker.tsx         ← seletor de período
│   ├── Layout.tsx                  ← wrapper com SidebarProvider
│   ├── LoginForm.tsx               ← formulário de login
│   ├── Logo.tsx                    ← exibe logo-myhonda.png
│   ├── PageHeader.tsx              ← cabeçalho de página com filtros inline
│   └── ProtectedRoute.tsx          ← redirecionamento para login
├── contexts/
│   └── AuthContext.tsx             ← user, login(), logout(), getCodhdaList()
├── hooks/
│   ├── use-mobile.tsx
│   ├── use-toast.ts
│   ├── useAdvancedTable.tsx        ← wrapper TanStack Table com localStorage
│   └── useAutoRefresh.tsx
├── pages/
│   ├── Index.tsx                   ← dashboard principal (placeholder)
│   ├── Leads.tsx                   ← leads ihs_myhonda_integracao
│   └── NotFound.tsx
├── services/
│   ├── authApi.ts + authTypes.ts   ← login via webhook n8n
│   └── reportsApi.ts + reportsTypes.ts ← GET /reports/leads
├── utils/
│   └── apiConfig.ts                ← resolve API_BASE_URL por hostname
├── App.tsx                         ← rotas
├── index.css                       ← variáveis CSS (--primary = vermelho Honda)
└── main.tsx
```

---

## Auth

`AuthContext` armazena `{ user, login, logout, getCodhdaList }`.

- `user.lojas[].codhda` = lista de concessionárias autorizadas.
- `getCodhdaList()` → `string[]` usado para filtrar queries.
- Login via webhook n8n (TODO: migrar para `POST /auth/login` da API).

---

## Fluxo de uma página de dashboard

```
1. Usuário abre a página → componente monta
2. useState para parâmetros (dataInicio, dataFim, codhda)
3. useQuery com enabled: false até usuário clicar "Consultar"
4. Ao clicar → setActiveParams → useQuery dispara fetchLeads(params)
5. Dados chegam → useAdvancedTable popula a tabela
6. Filtros/busca/ordenação/paginação no lado do cliente (TanStack Table)
```

---

## Rota → Página → Componente

```tsx
// App.tsx
<Route path="/reports/leads" element={
  <ProtectedRoute><Leads /></ProtectedRoute>
} />

// AppSidebar.tsx menuItems
{ title: "Leads MyHonda", url: "/reports/leads", icon: BarChart2, description: "..." }

// Leads.tsx
<Layout>
  <PageHeader title="Leads MyHonda">
    {/* filtros de data + botão Consultar */}
  </PageHeader>
  {/* tabela TanStack */}
</Layout>
```

---

## Configuração da API

`src/utils/apiConfig.ts`:
- `localhost` / `127.0.0.1` → usa `VITE_API_URL` do `.env`
- qualquer outro domínio → `https://express-myhonda.sagzap.com.br`
