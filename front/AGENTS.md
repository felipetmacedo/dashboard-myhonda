# Regras para Agentes de IA — SAGzap myHonda Frontend

Instruções obrigatórias para qualquer agente que gerar ou editar código neste repositório.

---

## 1. Server State — React Query (`@tanstack/react-query`)

**Toda leitura/escrita de dados remotos usa `useQuery` / `useMutation`. Nunca `fetch` direto dentro de componentes.**

```tsx
// ✅ Correto
import { useQuery } from "@tanstack/react-query";
import { fetchLeads } from "@/services/reportsApi";

const { data = [], isFetching, isError, error } = useQuery({
  queryKey: ["leads", params],       // chave estável com todos os parâmetros
  queryFn: () => fetchLeads(params!),
  enabled: !!params,                 // não dispara sem parâmetros
});

// ❌ Errado
const [data, setData] = useState([]);
useEffect(() => {
  fetch("/reports/leads").then(r => r.json()).then(setData);
}, []);
```

**Regras:**
- `queryKey` inclui todos os parâmetros que afetam o resultado.
- Sempre tratar `isFetching`, `isError`, estado vazio na UI.
- Chamadas HTTP ficam em `src/services/*Api.ts`; componentes só consomem via `useQuery`.
- `useMutation` para POST/PUT/DELETE; `queryClient.invalidateQueries` após sucesso.

---

## 2. `useMemo` — Valores derivados

```tsx
// ✅ Use para colunas, filtros, agregações, mapeamentos derivados de dados
const columns = useMemo<ColumnDef<Lead>[]>(() => [
  { accessorKey: "NOME", header: "Nome" },
  { accessorKey: "TIPO", header: "Tipo" },
], []);

const codhdaCsv = useMemo(() => getCodhdaList().join(","), [getCodhdaList]);

// ❌ Não use para valores simples ou constantes fixas
const title = useMemo(() => "Leads", []); // desnecessário
```

---

## 3. `useCallback` — Handlers estáveis

**Use para qualquer handler passado via props ou que fecha sobre variáveis de estado.**

```tsx
// ✅ Correto
const handleConsultar = useCallback(() => {
  setActiveParams({ dataInicio, dataFim, codhda });
}, [dataInicio, dataFim, codhda]);

const handleRowClick = useCallback((row: Lead) => {
  setSelectedRow(row);
}, []);

// ❌ Errado — recria a função a cada render, causa re-render desnecessário de filhos
<Button onClick={() => setActiveParams({ ... })} />
```

---

## 4. TanStack Table (`@tanstack/react-table`)

**Usar o wrapper `useAdvancedTable` (`src/hooks/useAdvancedTable.tsx`).**

```tsx
import { useAdvancedTable } from "@/hooks/useAdvancedTable";
import {
  AdvancedTableHeader,
  AdvancedTableBody,
  AdvancedTablePagination,
  AdvancedTableToolbar,
} from "@/components/AdvancedTableComponents";

// Colunas em useMemo — obrigatório
const columns = useMemo<ColumnDef<Lead>[]>(() => [
  { accessorKey: "data_criacao_lead", header: "Data Lead" },
  { accessorKey: "NOME", header: "Nome" },
  {
    accessorKey: "TIPO",
    header: "Tipo",
    cell: ({ getValue }) => <Badge variant="outline">{getValue<string>()?.trim()}</Badge>,
  },
], []);

const {
  table,
  globalFilter, setGlobalFilter,
  filteredRowCount, totalRowCount,
  resetFilters, resetColumnOrder,
  handleColumnDrop,
} = useAdvancedTable({
  data,
  columns,
  tableId: "leads",              // persiste ordem das colunas no localStorage
  initialPageSize: 50,
  initialColumnVisibility: {
    ID: false,
    CODHDA: false,
    JSON_MYHONDA: false,
  },
});

// Renderização
<AdvancedTableToolbar
  table={table}
  globalFilter={globalFilter}
  setGlobalFilter={setGlobalFilter}
  resetFilters={resetFilters}
  resetColumnOrder={resetColumnOrder}
  filteredRowCount={filteredRowCount}
  totalRowCount={totalRowCount}
/>
<Table>
  <AdvancedTableHeader table={table} onColumnDrop={handleColumnDrop} />
  <AdvancedTableBody table={table} columnCount={columns.length} />
</Table>
<AdvancedTablePagination table={table} />
```

---

## 5. Componentes UI

- Toda UI vem de `src/components/ui/` (shadcn/ui — Radix + Tailwind).
- Cor de marca: `bg-primary` / `text-primary` — nunca hex hardcoded (`#CC0000`).
- Ícones: `lucide-react` exclusivamente.
- Loading: `<Loader2 className="h-4 w-4 animate-spin" />`.
- Notificações: `sonner` via `toast()` — não usar `alert()`.

---

## 6. Estrutura de arquivos

```
src/pages/           →  uma página por rota; envolve com <Layout> + <ProtectedRoute>
src/components/      →  componentes reutilizáveis; ui/ = shadcn primitives
src/services/        →  [feature]Api.ts (fetch) + [feature]Types.ts (interfaces)
src/hooks/           →  custom hooks (prefixo "use")
src/contexts/        →  Context API (AuthContext)
src/utils/           →  funções puras sem side effects
```

---

## 7. Padrão de página nova

```tsx
// src/pages/MinhaFuncionalidade.tsx
import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";

const MinhaFuncionalidade = () => {
  const filters = useReportQueryFilters();
  const [params, setParams] = useState<MinhaRequest | null>(null);

  const { data = [], isFetching, isError } = useQuery({
    queryKey: ["minha-feature", params],
    queryFn: () => fetchMinhaFeature(params!),
    enabled: !!params,
  });

  const columns = useMemo<ColumnDef<MinhaEntidade>[]>(() => [...], []);
  const { table, ... } = useAdvancedTable({ data, columns, tableId: "minha-feature" });

  const handleConsultar = useCallback(() => {
    setParams({ ... });
  }, [/* deps */]);

  return (
    <Layout>
      <div className="p-6 space-y-4">
        <PageHeader title="Minha Funcionalidade">
          <ReportQueryFilters
            dateRange={filters.dateRange}
            onDateRangeChange={filters.setDateRange}
            lojaOptions={filters.lojaOptions}
            selectedCodhdas={filters.selectedCodhdas}
            onSelectedCodhdasChange={filters.setSelectedCodhdas}
            codhdaText={filters.codhdaText}
            onCodhdaTextChange={filters.setCodhdaText}
            onConsultar={filters.applyFilters}
            isLoading={isFetching}
          />
        </PageHeader>
        {/* tabela */}
      </div>
    </Layout>
  );
};
```

---

## 8. Qualidade mínima obrigatória

- `npm run build` passa sem erros TS.
- Textos em PT-BR.
- Estados tratados: carregando (`isFetching`), erro (`isError`), vazio.
- Nenhum `console.log` em produção (remover antes de commitar).
