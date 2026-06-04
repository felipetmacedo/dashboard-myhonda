# Tabelas Avançadas — Padrão com TanStack Table

## Arquitetura

```
src/hooks/useAdvancedTable.tsx         → Hook reutilizável (state + instância)
src/components/AdvancedTableComponents.tsx → Componentes UI (Header, Body, Pagination, Toolbar, Filtros)
```

## Uso Rápido

```tsx
import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useAdvancedTable } from "@/hooks/useAdvancedTable";
import {
  AdvancedTableHeader,
  AdvancedTableBody,
  AdvancedTablePagination,
  AdvancedTableToolbar,
} from "@/components/AdvancedTableComponents";
import { Table } from "@/components/ui/table";

// NÃO é necessário adicionar filterFn nas colunas — o hook já aplica
// filterFn: "arrIncludesSome" como defaultColumn para TODAS as colunas.
const columns: ColumnDef<MyData, any>[] = [
  { accessorKey: "nome", header: "Nome" },
  { accessorKey: "status", header: "Status" },
];

function MyTable({ data }: { data: MyData[] }) {
  const cols = useMemo(() => columns, []);

  const {
    table, globalFilter, setGlobalFilter, resetFilters,
    resetColumnOrder, filteredRowCount, totalRowCount, handleColumnDrop,
  } = useAdvancedTable({
    data,
    columns: cols,
    initialPageSize: 10,
    tableId: "minha-tabela", // Identificador único para persistência
  });

  return (
    <>
      <AdvancedTableToolbar table={table} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter}
        resetFilters={resetFilters} resetColumnOrder={resetColumnOrder}
        filteredRowCount={filteredRowCount} totalRowCount={totalRowCount} />
      <Table>
        <AdvancedTableHeader table={table} onColumnDrop={handleColumnDrop} />
        <AdvancedTableBody table={table} columnCount={table.getVisibleLeafColumns().length} />
      </Table>
      <AdvancedTablePagination table={table} />
    </>
  );
}
```

## Features

| Feature | Como ativar |
|---------|------------|
| **Sorting** | Automático — clique no header |
| **Filtro Facetado** | **Automático em TODAS as colunas** — `defaultColumn.filterFn` é `"arrIncludesSome"` |
| **Busca Global** | Incluído no `AdvancedTableToolbar` |
| **Visibilidade** | Botão "Ordenar Colunas" no Toolbar (Sheet lateral) |
| **Reordenação (drag header)** | **Habilitado por padrão** — arrastar colunas pelo header |
| **Reordenação (sheet)** | Botão "Ordenar Colunas" no Toolbar — drag-and-drop na lista |
| **Persistência de ordem** | Automática via `localStorage` quando `tableId` é informado |
| **Paginação** | `AdvancedTablePagination` com seletor de tamanho (padrão: 10) |

## Filtro Facetado

**REGRA: TODAS as colunas SEMPRE têm filtro facetado.** Não é necessário configurar `filterFn` individualmente nem usar `facetedColumns`.

O `useAdvancedTable` define `defaultColumn.filterFn = "arrIncludesSome"` automaticamente, então cada coluna já nasce filtrável.

O componente `FacetedFilter` exibe um popover com:
- Busca dentro das opções
- Checkbox para multi-seleção
- Contagem de ocorrências
- Botão limpar

### Importante
- **NÃO** use a prop `facetedColumns` no `AdvancedTableHeader` — ela foi removida.
- **NÃO** adicione `filterFn: "arrIncludesSome"` nas colunas — já vem do `defaultColumn`.
- Se uma coluna específica NÃO deve ter filtro, use `enableColumnFilter: false` na `ColumnDef`.

## Reordenação de Colunas e Persistência

### Drag no Header
- **Habilitado por padrão** (`enableColumnDrag = true` no `AdvancedTableHeader`).
- O usuário arrasta colunas diretamente pelo header (ícone de grip visível).
- Passe `onColumnDrop={handleColumnDrop}` do hook para o header.

### Persistência via localStorage
- Ao informar `tableId` no `useAdvancedTable`, a ordem de colunas é **automaticamente salva** no `localStorage` com a chave `table-order-{tableId}`.
- A ordem é restaurada ao recarregar a página.
- Se o usuário **não alterou** a ordem, nada é salvo (economia de storage).
- O botão "Restaurar Ordem" no sheet de colunas limpa a ordem salva.

### TableIDs registrados

| Tabela | tableId |
|--------|---------|
| RetencaoTable | `retencao-mestre` |
| RetencaoDetalheTable | `retencao-detalhe` |
| ResultadoAssembleiaDetailTable | `resultado-assembleia` |
| LanceDetailTable | `lance-detalhe` |
| LanceSummaryTable | `lance-resumo` |
| LanceContempladosPorModelo | `lance-contemplados` |
| PropostasTable | `propostas-detalhe` |
| ParcelasAnaliseTable | `parcelas-analise` |
| AdimplenciaTable | `adimplencia` |
| GestaoPropostasTable | `gestao-propostas` |
| RankingPropostasDashboard (Vendedores) | `ranking-vendedores` |
| RankingPropostasDashboard (Modelos) | `ranking-modelos` |
| RankingPropostasDashboard (Planos) | `ranking-planos` |
| RankingPropostasDashboard (Empresas) | `ranking-empresas` |

## Hook: `useAdvancedTable`

### Opções

| Opção | Tipo | Default |
|-------|------|---------|
| `data` | `TData[]` | obrigatório |
| `columns` | `ColumnDef[]` | obrigatório |
| `initialPageSize` | `number` | `10` |
| `initialSorting` | `SortingState` | `[]` |
| `initialColumnVisibility` | `VisibilityState` | `{}` |
| `initialColumnOrder` | `string[]` | auto |
| `enableRowSelection` | `boolean` | `false` |
| `tableId` | `string` | `undefined` — se informado, persiste ordem no localStorage |

### Retorno

| Propriedade | Descrição |
|-------------|-----------|
| `table` | Instância TanStack Table |
| `globalFilter` / `setGlobalFilter` | Busca global |
| `resetFilters()` | Limpa todos os filtros |
| `resetColumnOrder()` | Reseta ordem das colunas + limpa localStorage |
| `filteredRowCount` / `totalRowCount` | Contagens |
| `handleColumnDrop(dragId, targetId)` | Handler genérico para reordenação via drag |
| `rowSelection` / `setRowSelection` | Estado de seleção de linhas |

## Padrão Visual

- **Header**: `bg-muted`, texto uppercase semibold, fonte `text-xs`, ícone de grip para drag
- **Rows**: Zebra striping com `bg-background` / `bg-muted/30`
- **Status badges**: Cores contextuais via design tokens
- **Paginação**: 10 itens por página por padrão

## Referência

- Exemplo real: `src/components/ResultadoAssembleiaDetailTable.tsx`
- [TanStack Table Docs](https://tanstack.com/table/v8/docs)
- [Faceted Filter Example](https://tanstack.com/table/v8/docs/framework/react/examples/filters-faceted)
- [Column Ordering Example](https://tanstack.com/table/v8/docs/framework/react/examples/column-ordering)
