---
trigger: always_on
---

# Padrões de Código — MyHonda SFS Frontend

## Nomenclatura

| Item | Convenção | Exemplo |
|------|-----------|---------|
| Componentes React | PascalCase | `LeadsDashboard.tsx` |
| Hooks | camelCase com prefixo `use` | `useAdvancedTable.tsx` |
| Serviços | camelCase com sufixo `Api` | `reportsApi.ts` |
| Tipos | PascalCase | `reportsTypes.ts` |
| Variáveis / funções | camelCase | `handleConsultar` |
| Constantes globais | UPPER_SNAKE_CASE | `API_BASE_URL` |

---

## Estrutura de imports (ordem obrigatória)

```tsx
// 1. React core
import { useState, useMemo, useCallback } from "react";

// 2. Bibliotecas externas
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";

// 3. Componentes internos
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";

// 4. Hooks e contextos
import { useAuth } from "@/contexts/AuthContext";
import { useAdvancedTable } from "@/hooks/useAdvancedTable";

// 5. Serviços e tipos
import { fetchLeads } from "@/services/reportsApi";
import { Lead, LeadsRequest } from "@/services/reportsTypes";
```

---

## React — Padrões obrigatórios

### `useQuery` — server state
```tsx
const { data = [], isFetching, isError, error } = useQuery({
  queryKey: ["leads", activeParams],
  queryFn: () => fetchLeads(activeParams!),
  enabled: !!activeParams,
  staleTime: 5 * 60 * 1000,
});
```

### `useMemo` — valores derivados
```tsx
// ✅ Colunas, filtros, listas derivadas, formatações
const columns = useMemo<ColumnDef<Lead>[]>(() => [
  { accessorKey: "NOME", header: "Nome", size: 200 },
  { accessorKey: "TIPO", header: "Tipo", size: 70 },
], []);

// ✅ CSV de codhda a partir do auth
const codhdaCsv = useMemo(
  () => getCodhdaList().join(","),
  [getCodhdaList]
);

// ❌ Valores literais não precisam de useMemo
const title = useMemo(() => "Leads", []);
```

### `useCallback` — handlers estáveis
```tsx
// ✅ Handlers passados via props ou com closures
const handleConsultar = useCallback(() => {
  setActiveParams({ dataInicio, dataFim, codhda: codhdaCsv });
}, [dataInicio, dataFim, codhdaCsv]);

// ✅ Handlers de ação em tabelas
const handleRowClick = useCallback((row: Lead) => {
  setSelectedRow(row);
}, []);
```

---

## TanStack Table

```tsx
import { useAdvancedTable } from "@/hooks/useAdvancedTable";
import {
  AdvancedTableHeader,
  AdvancedTableBody,
  AdvancedTablePagination,
  AdvancedTableToolbar,
} from "@/components/AdvancedTableComponents";
import { Table } from "@/components/ui/table";

// Colunas em useMemo — obrigatório
const columns = useMemo<ColumnDef<Lead>[]>(() => [
  {
    accessorKey: "data_criacao_lead",
    header: "Data Lead",
    size: 110,
  },
  {
    accessorKey: "CRM_INTEGRACAO",
    header: "CRM",
    cell: ({ getValue }) => {
      const v = getValue<string | null>();
      return v
        ? <Badge className="bg-primary text-primary-foreground">{v}</Badge>
        : <span className="text-muted-foreground text-xs">—</span>;
    },
  },
], []);

// Colunas ocultas por padrão
const HIDDEN: Record<string, boolean> = {
  ID: false,
  JSON_MYHONDA: false,
};

const {
  table,
  globalFilter, setGlobalFilter,
  filteredRowCount, totalRowCount,
  resetFilters, resetColumnOrder,
  handleColumnDrop,
} = useAdvancedTable({
  data,
  columns,
  tableId: "leads",            // persiste ordem das colunas (localStorage)
  initialPageSize: 50,
  initialColumnVisibility: HIDDEN,
});

// Renderização
<div className="rounded-md border">
  <div className="p-3 border-b">
    <AdvancedTableToolbar
      table={table}
      globalFilter={globalFilter}
      setGlobalFilter={setGlobalFilter}
      resetFilters={resetFilters}
      resetColumnOrder={resetColumnOrder}
      filteredRowCount={filteredRowCount}
      totalRowCount={totalRowCount}
    />
  </div>
  <div className="overflow-x-auto">
    <Table>
      <AdvancedTableHeader table={table} onColumnDrop={handleColumnDrop} />
      <AdvancedTableBody table={table} columnCount={columns.length} />
    </Table>
  </div>
  <div className="p-3 border-t">
    <AdvancedTablePagination table={table} />
  </div>
</div>
```

---

## TypeScript

```ts
// Preferir interfaces para shapes de objetos (extendíveis)
export interface Lead {
  ID: number;
  NOME: string;
  TIPO: string;
  CRM_INTEGRACAO: string | null;
}

// Type para unions e aliases
type TipoLead = "HDA" | "CNH" | "HSF" | "SHB" | "BHB" | "HAB" | "CS";

// Evitar any — usar unknown quando o tipo não é conhecido
const parse = (raw: unknown): Lead => { ... };

// Generics nos hooks
function useAdvancedTable<TData>({ data, columns }: Options<TData>) { ... }
```

---

## Estilo — Tailwind

```tsx
// ✅ Cor de marca via variável CSS
<div className="bg-primary text-primary-foreground" />

// ❌ Nunca hex hardcoded de marca
<div style={{ backgroundColor: "#CC0000" }} />

// Estados de loading / erro padrão
{isFetching && <Loader2 className="h-4 w-4 animate-spin" />}
{isError && (
  <div className="text-destructive text-sm p-3 border border-destructive/30 rounded bg-destructive/5">
    {(error as Error).message}
  </div>
)}
```

---

## Serviço de API

```ts
// src/services/[feature]Api.ts
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
  return json.data as Lead[];   // envelope { status, data } do backend
}
```
