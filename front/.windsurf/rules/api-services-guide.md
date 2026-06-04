---
trigger: always_on
---

# Guia de Serviços de API — MyHonda SFS Frontend

## Arquitetura

```
Componente (page)
    ↓  useQuery / useMutation
TanStack Query (cache + estado)
    ↓  queryFn
Service (src/services/*Api.ts)
    ↓  fetch
API Express localhost:3000 / express-myhonda.sagzap.com.br
    ↓  resposta { status: "success", data: [...] }
```

---

## Configuração de URL

`src/utils/apiConfig.ts`:
```ts
export const getApiBaseUrl = (): string => {
  const hostname = window.location.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  }
  return "https://express-myhonda.sagzap.com.br";
};

export const API_BASE_URL = getApiBaseUrl();
```

`.env.example`:
```
VITE_API_URL=http://localhost:3000
```

---

## Padrão de serviço

**Um par de arquivos por feature:**

```
src/services/
├── reportsApi.ts        ← funções de fetch
└── reportsTypes.ts      ← interfaces TypeScript
```

### reportsTypes.ts
```ts
export interface Lead {
  data_criacao_lead: string;
  ID: number;
  CODHDA: string;
  NOME: string;
  CRM_INTEGRACAO: string | null;
  TIPO: string;
  PRODUTO: string;
  CPF: string;
  CELULAR: string;
  // ... demais campos
}

export interface LeadsRequest {
  dataInicio: string;   // YYYY-MM-DD
  dataFinal: string;
  codhda: string;       // CSV: "1768565,1768566"
}
```

### reportsApi.ts
```ts
import { API_BASE_URL } from "@/utils/apiConfig";
import { Lead, LeadsRequest } from "./reportsTypes";

export async function fetchLeads(params: LeadsRequest): Promise<Lead[]> {
  const qs = new URLSearchParams({
    dataInicio: params.dataInicio,
    dataFinal: params.dataFinal,
    codhda: params.codhda,
  }).toString();

  const response = await fetch(`${API_BASE_URL}/reports/leads?${qs}`);

  if (!response.ok) {
    throw new Error(`Erro ${response.status}: ${response.statusText}`);
  }

  const json = await response.json();
  return json.data as Lead[];   // envelope { status: "success", data: [...] }
}
```

---

## Consumo via React Query

```tsx
import { useQuery } from "@tanstack/react-query";
import { fetchLeads } from "@/services/reportsApi";
import { LeadsRequest } from "@/services/reportsTypes";

// Na página / componente
const [activeParams, setActiveParams] = useState<LeadsRequest | null>(null);

const { data = [], isFetching, isError, error } = useQuery({
  queryKey: ["leads", activeParams],
  queryFn: () => fetchLeads(activeParams!),
  enabled: !!activeParams,              // só executa quando há parâmetros
  staleTime: 5 * 60 * 1000,            // 5 min em cache sem refetch
});
```

---

## Serviços existentes

| Arquivo | Endpoint | Descrição |
|---------|----------|-----------|
| `authApi.ts` | webhook n8n (TODO: migrar) | Login |
| `reportsApi.ts` | `GET /reports/leads` | Leads `ihs_myhonda_integracao` |

---

## Adicionar novo serviço

1. Criar `src/services/[feature]Types.ts` — interfaces dos dados.
2. Criar `src/services/[feature]Api.ts` — funções de fetch usando `API_BASE_URL`.
3. Criar `src/pages/[Feature].tsx` consumindo via `useQuery`.
4. Adicionar rota em `App.tsx` e item em `AppSidebar.tsx`.

---

## Autenticação

`getCodhdaList()` do `useAuth()` retorna as concessionárias autorizadas do usuário. Sempre passar como parâmetro nas queries de relatório:

```ts
const codhdaCsv = useMemo(
  () => getCodhdaList().join(","),
  [getCodhdaList]
);
```
