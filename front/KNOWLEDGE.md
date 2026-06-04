# Knowledge Base — Dashboard MyHonda SFS

> Referência completa de padrões, arquitetura e melhores práticas deste repositório.  
> Leia este documento antes de criar ou editar qualquer componente.

---

## Sumário

1. [Arquitetura Geral](#1-arquitetura-geral)
2. [React Query — Server State](#2-react-query--server-state)
3. [useMemo — Valores Derivados](#3-usememo--valores-derivados)
4. [useCallback — Handlers Estáveis](#4-usecallback--handlers-estáveis)
5. [useRef — Estado sem Re-render](#5-useref--estado-sem-re-render)
6. [TanStack Table](#6-tanstack-table)
7. [Zustand (quando aplicável)](#7-zustand-quando-aplicável)
8. [Camada de Serviços](#8-camada-de-serviços)
9. [Context API — Autenticação](#9-context-api--autenticação)
10. [Padrões de Componente](#10-padrões-de-componente)
11. [Formatação de Dados](#11-formatação-de-dados)
12. [UX Obrigatória](#12-ux-obrigatória)
13. [Checklist de Entrega](#13-checklist-de-entrega)

---

## 1. Arquitetura Geral

```
src/
├── components/
│   ├── ui/                        # Primitivos shadcn/ui (não editar)
│   ├── *Dashboard.tsx             # Composição de cada módulo
│   ├── *ParametersControl.tsx     # Controles de entrada (datas, filtros)
│   ├── *StatsCards.tsx            # Cards de KPI
│   ├── *Table.tsx                 # TanStack Table
│   ├── *Charts*.tsx               # Gráficos (Recharts)
│   └── *ExportButtons.tsx         # Exportação CSV/PDF
├── services/
│   ├── *Api.ts                    # fetch + processamento
│   ├── *Types.ts                  # Interfaces TypeScript
│   └── apiConfig.ts               # URL base dinâmica
├── contexts/
│   └── AuthContext.tsx             # Auth global
├── hooks/
│   └── useAutoRefresh.tsx          # Auto-refresh com countdown
├── pages/                          # Rotas — só composição
└── utils/
    ├── apiConfig.ts
    └── pdfHelpers.ts
```

### Regra de ouro

| Camada | Responsabilidade |
|--------|-----------------|
| `pages/` | Rota; sem lógica |
| `*Dashboard.tsx` | Orquestração de queries, estado local, composição de UI |
| `*Table/Charts/Cards.tsx` | Apresentação; recebe dados via props |
| `services/*Api.ts` | Toda comunicação HTTP + transformação de dados |
| `contexts/` | Estado global cross-cutting (auth) |

---

## 2. React Query — Server State

> **Regra:** Todo `fetch` remoto vive dentro de `useQuery` ou `useMutation`. Nunca em `useEffect` com `setState`.

### 2.1 Configuração global (`App.tsx`)

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 min — evita refetch desnecessário
      retry: 1,
    },
  },
});

<QueryClientProvider client={queryClient}>
  {/* app */}
</QueryClientProvider>
```

### 2.2 Padrão de query

```tsx
const { data, isLoading, isFetching, error, refetch } = useQuery({
  queryKey: ['propostas', params?.dataInicial, params?.dataFinal, params?.codhda],
  queryFn: () => fetchPropostasData(params!),
  enabled: !!params,   // nunca dispara com params undefined
  retry: 1,
});
```

**Regras de `queryKey`:**
- Array com identificador fixo + dependências variáveis
- Inclua todos os parâmetros que mudam o resultado
- Nunca use objetos mutáveis direto; use valores primitivos ou JSON.stringify

### 2.3 `isLoading` vs `isFetching`

| Propriedade | Quando é `true` |
|-------------|----------------|
| `isLoading` | Primeira carga, sem cache |
| `isFetching` | Qualquer request em andamento (incluindo background) |

Use `isLoading` para mostrar skeleton. Use `isFetching` para spinner de atualização.

### 2.4 Múltiplas queries no mesmo componente

```tsx
const { data: dashboardData, isLoading: isLoadingDashboard } = useQuery({
  queryKey: ['dashboard', params],
  queryFn: () => fetchDashboardData(params!),
  enabled: !!params,
});

const { data: analyticsData, isLoading: isLoadingAnalytics } = useQuery({
  queryKey: ['analytics-24m', params],
  queryFn: () => fetchAnalytics24m(params!),
  enabled: !!params && activeTab === 'analytics', // só busca se a aba estiver ativa
});
```

### 2.5 Invalidação e refetch

```tsx
// Refetch manual (ex: botão "Atualizar")
const handleRefresh = useCallback(async () => {
  await refetch();
  toast({ title: "Dados atualizados" });
}, [refetch]);

// Invalidar cache de outra query
queryClient.invalidateQueries({ queryKey: ['propostas'] });
```

---

## 3. useMemo — Valores Derivados

> **Regra:** Aplique `useMemo` quando o cálculo é não-trivial (filtros, agregações, estatísticas, listas derivadas). Não aplique em simples acessos de propriedade.

### 3.1 Estatísticas a partir de dados brutos

```tsx
const dashboardData = useMemo<{
  stats: DashboardStats;
  statusDistribution: StatusDistribution[];
  paymentTrends: PaymentTrend[];
}>(() => {
  if (!rawData) return { stats: defaultStats, statusDistribution: [], paymentTrends: [] };

  return {
    stats: processParcelasStats(rawData),
    statusDistribution: generateStatusDistribution(rawData),
    paymentTrends: generatePaymentTrends(rawData),
  };
}, [rawData]);
```

### 3.2 Valores únicos para filtros

```tsx
const uniqueStatuses = useMemo(() => {
  return Array.from(new Set(data.map(item => item.STATUS?.trim())))
    .filter(Boolean)
    .sort();
}, [data]);
```

### 3.3 Dados filtrados e ordenados

```tsx
const filteredData = useMemo(() => {
  let result = data;

  if (searchTerm) {
    const lower = searchTerm.toLowerCase();
    result = result.filter(item =>
      item.nome?.toLowerCase().includes(lower) ||
      item.codhda?.toLowerCase().includes(lower)
    );
  }

  if (statusFilter !== 'all') {
    result = result.filter(item => item.STATUS === statusFilter);
  }

  if (sortDirection !== 'none') {
    result = [...result].sort((a, b) =>
      sortDirection === 'asc'
        ? a[sortField] - b[sortField]
        : b[sortField] - a[sortField]
    );
  }

  return result;
}, [data, searchTerm, statusFilter, sortField, sortDirection]);
```

### 3.4 Colunas do TanStack Table (obrigatório memorizar)

```tsx
const columns = useMemo(
  () => createColumns(onRowSelect, selectedRow, getRetencaoStatus),
  [onRowSelect, selectedRow, getRetencaoStatus]
);
```

### 3.5 Quando NÃO usar `useMemo`

```tsx
// ERRADO: cálculo trivial não justifica
const label = useMemo(() => `Total: ${count}`, [count]);

// CORRETO: string simples inline
const label = `Total: ${count}`;
```

---

## 4. useCallback — Handlers Estáveis

> **Regra:** Aplique `useCallback` em handlers passados por props ou usados como dependência de outros hooks. Não use em handlers puramente locais sem filho que re-renderize.

### 4.1 Handler de parâmetros

```tsx
const handleApplyParameters = useCallback(() => {
  if (!dateRange?.from || !dateRange?.to) return;

  const params: PropostasRequest = {
    dataInicial: dateRange.from.toISOString().split('T')[0],
    dataFinal: dateRange.to.toISOString().split('T')[0],
    codhda: selectedCodhdas,
  };

  onParametersChange(params);   // prop → deve ser estável
}, [dateRange, selectedCodhdas, onParametersChange]);
```

### 4.2 Handler de refresh com ref

```tsx
const handleRefresh = useCallback(async () => {
  if (!currentParamsRef.current) return;

  toast({ title: "Atualizando dados..." });
  await refetchDashboardData();

  if (activeTabRef.current === 'analytics') {
    await refetchAnaliseData();
  }

  toast({ title: "Dados atualizados" });
}, []);   // deps vazias pois usa refs
```

### 4.3 Handler de seleção de linha

```tsx
const handleRowSelect = useCallback((row: RetencaoMestreItem) => {
  setSelectedRow(prev => prev?.codhda === row.codhda ? null : row);
}, []);
```

---

## 5. useRef — Estado sem Re-render

> Use `useRef` para valores que precisam persistir entre renders mas cujas mudanças **não devem** disparar re-render.

### 5.1 Padrão params + activeTab

```tsx
const currentParamsRef = useRef<ParcelasRequest | null>(null);
const activeTabRef = useRef("overview");

// Sincronizar ref com state quando necessário
useEffect(() => {
  currentParamsRef.current = currentParams;
}, [currentParams]);

// Atualizar ref em handlers sem dep no handler
const handleTabChange = (tab: string) => {
  activeTabRef.current = tab;
  setActiveTab(tab);
};
```

### 5.2 Contador para forçar refetch

```tsx
const fetchCounterRef = useRef(0);
const [fetchCounter, setFetchCounter] = useState(0);

const handleParametersChange = useCallback((params: ParcelasRequest) => {
  fetchCounterRef.current += 1;
  setFetchCounter(fetchCounterRef.current);
  setCurrentParams(params);
}, []);

// Na query, inclua fetchCounter para forçar re-execução
const { data } = useQuery({
  queryKey: ['parcelas', currentParams, fetchCounter],
  queryFn: () => fetchParcelasData(currentParams!),
  enabled: !!currentParams,
});
```

---

## 6. TanStack Table

> **Obrigatório** para toda tabela do projeto. Referência completa: [RetencaoTable.tsx](src/components/RetencaoTable.tsx) e [TABLES.md](TABLES.md).

### 6.1 Imports

```tsx
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
} from "@tanstack/react-table";
```

### 6.2 Definição de colunas

```tsx
// Função separada — não inline no componente
const createColumns = (
  onRowSelect?: (row: DataItem) => void,
  selectedRow?: DataItem | null
): ColumnDef<DataItem>[] => [
  {
    accessorKey: "codhda",
    header: "CODHDA",
    cell: (info) => (
      <span className="font-medium">{String(info.getValue() ?? "")}</span>
    ),
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: (info) => (
      <span className="text-right font-medium">
        {new Intl.NumberFormat("pt-BR").format(Number(info.getValue()) || 0)}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Detalhe",
    cell: (info) => {
      const row = info.row.original;
      const isSelected = selectedRow?.codhda === row.codhda;
      return (
        <Button
          variant={isSelected ? "default" : "outline"}
          size="sm"
          onClick={() => onRowSelect?.(row)}
        >
          {isSelected ? "Fechar" : "Ver"}
        </Button>
      );
    },
  },
];
```

### 6.3 Estado e inicialização

```tsx
// Estado da tabela
const [sorting, setSorting] = useState<SortingState>([{ id: "total", desc: true }]);
const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
const [globalFilter, setGlobalFilter] = useState("");
const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

// Colunas memorizadas (obrigatório)
const columns = useMemo(
  () => createColumns(onRowSelect, selectedRow),
  [onRowSelect, selectedRow]
);

// Dados seguros (nunca passar undefined)
const safeData = useMemo(() => data ?? [], [data]);

// Inicialização
const table = useReactTable({
  data: safeData,
  columns,
  state: { sorting, columnFilters, globalFilter, columnVisibility },
  onSortingChange: setSorting,
  onColumnFiltersChange: setColumnFilters,
  onGlobalFilterChange: setGlobalFilter,
  onColumnVisibilityChange: setColumnVisibility,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  initialState: { pagination: { pageSize: 10 } },
});
```

### 6.4 Renderização

```tsx
{/* Busca global */}
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
  <Input
    placeholder="Buscar..."
    value={globalFilter}
    onChange={(e) => setGlobalFilter(e.target.value)}
    className="pl-10"
  />
</div>

<Table>
  <TableHeader>
    {table.getHeaderGroups().map((headerGroup) => (
      <TableRow key={headerGroup.id}>
        {headerGroup.headers.map((header) => (
          <TableHead key={header.id}>
            <Button
              variant="ghost"
              onClick={() =>
                header.column.toggleSorting(header.column.getIsSorted() === "asc")
              }
              className="h-auto p-0 font-semibold hover:bg-transparent"
            >
              <div className="flex items-center gap-2">
                {flexRender(header.column.columnDef.header, header.getContext())}
                {header.column.getCanSort() && (
                  <span className="ml-1">
                    {header.column.getIsSorted() === false
                      ? <ArrowUpDown className="h-4 w-4" />
                      : header.column.getIsSorted() === "asc"
                        ? <ArrowUp className="h-4 w-4" />
                        : <ArrowDown className="h-4 w-4" />}
                  </span>
                )}
              </div>
            </Button>
          </TableHead>
        ))}
      </TableRow>
    ))}
  </TableHeader>

  <TableBody>
    {table.getRowModel().rows.length === 0 ? (
      <TableRow>
        <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
          Nenhum dado encontrado
        </TableCell>
      </TableRow>
    ) : (
      table.getRowModel().rows.map((row) => (
        <TableRow key={row.id}>
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      ))
    )}
  </TableBody>
</Table>

{/* Paginação */}
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4">
  <div className="text-sm text-muted-foreground">
    Mostrando{" "}
    {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} a{" "}
    {Math.min(
      (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
      table.getFilteredRowModel().rows.length
    )}{" "}
    de {table.getFilteredRowModel().rows.length} registros
  </div>

  <div className="flex items-center gap-2">
    <Select
      value={String(table.getState().pagination.pageSize)}
      onValueChange={(v) => table.setPageSize(Number(v))}
    >
      <SelectTrigger className="w-16"><SelectValue /></SelectTrigger>
      <SelectContent>
        {[5, 10, 20, 30, 50].map((size) => (
          <SelectItem key={size} value={String(size)}>{size}</SelectItem>
        ))}
      </SelectContent>
    </Select>

    <Button variant="outline" size="sm" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>⟨⟨</Button>
    <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>⟨</Button>
    <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>⟩</Button>
    <Button variant="outline" size="sm" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>⟩⟩</Button>
  </div>
</div>
```

### 6.5 Boas práticas de tabela

| Prática | Motivo |
|---------|--------|
| Memorizar `columns` com `useMemo` | Evita re-criação desnecessária a cada render |
| `data ?? []` antes de passar à tabela | Nunca passar `undefined` como `data` |
| Definir `initialState.pagination.pageSize` | UX consistente |
| Usar `flexRender` sempre | Suporta JSX e texto nas células |
| `getCanPreviousPage()` / `getCanNextPage()` | Desabilitar botões corretamente |
| `accessorKey` para colunas simples | `id` + `accessorFn` para lógica customizada |

---

## 7. Zustand (quando aplicável)

> O projeto usa principalmente **React Query + useState local**. Zustand é reservado para estado UI global que não é server state (ex: preferências, tema, sidebar).

### 7.1 Estrutura de store

```tsx
import { create } from 'zustand';

interface UIStore {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  setSidebarOpen: (open: boolean) => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  theme: 'light',
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleTheme: () => set((state) => ({
    theme: state.theme === 'light' ? 'dark' : 'light'
  })),
}));
```

### 7.2 Seletores — evitar re-renders desnecessários

```tsx
// Subscrever só ao que precisa (selector granular)
const sidebarOpen = useUIStore((state) => state.sidebarOpen);
const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);

// ERRADO: subscreve ao store inteiro → re-render em qualquer mudança
const store = useUIStore();
```

### 7.3 Persistência com middleware

```tsx
import { persist } from 'zustand/middleware';

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      pageSize: 10,
      setPageSize: (size) => set({ pageSize: size }),
    }),
    { name: 'user-preferences' }   // key no localStorage
  )
);
```

### 7.4 Quando usar Zustand vs React Query

| Situação | Solução |
|----------|---------|
| Dados do servidor (API) | React Query |
| Estado de formulário | useState local |
| Estado UI cross-component (sidebar, modal) | Zustand |
| Auth / usuário logado | Context API (padrão atual) |
| Preferências persistidas | Zustand + persist middleware |

---

## 8. Camada de Serviços

### 8.1 Estrutura padrão de um service

```ts
// src/services/propostasApi.ts

// 1. URL base dinâmica
import { API_BASE_URL } from '@/utils/apiConfig';
const API_PATH = '/reports/propostas';

// 2. Tipos
export interface PropostasRequest {
  dataInicial: string;   // 'YYYY-MM-DD'
  dataFinal: string;
  codhda: string[];
}

// 3. Construção da URL
const buildApiUrl = (params: PropostasRequest): string => {
  const endpoint = API_BASE_URL ? `${API_BASE_URL}${API_PATH}` : API_PATH;
  const searchParams = new URLSearchParams({
    codhda: JSON.stringify(params.codhda),
    dataInicial: params.dataInicial,
    dataFinal: params.dataFinal,
  });
  return `${endpoint}?${searchParams.toString()}`;
};

// 4. Fetch com fallback para mock
export const fetchPropostasData = async (params: PropostasRequest): Promise<PropostaData[]> => {
  try {
    const response = await fetch(buildApiUrl(params), {
      method: 'GET',
      headers: { Accept: '*/*' },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const json = await response.json();
    return json.data ?? [];
  } catch (error) {
    console.error('fetchPropostasData:', error);
    return getMockPropostasData();   // fallback
  }
};

// 5. Processamento separado do fetch
export const processPropostasData = (data: PropostaData[]): PropostasDashboardStats => {
  // transformações puras sem side effects
  return { totalPropostas: data.length, /* ... */ };
};
```

### 8.2 URL base dinâmica

```ts
// src/utils/apiConfig.ts
export const getApiBaseUrl = (): string => {
  const hostname = window.location.hostname;

  if (hostname === 'myhonda.sagzap.com.br') {
    return 'https://express-myhonda.sagzap.com.br';
  }

  return import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? '';
};

export const API_BASE_URL = getApiBaseUrl();
```

### 8.3 Regras de service

- `fetch` só acontece dentro de `src/services/`
- Componentes **nunca** chamam `fetch` diretamente
- Processamento de dados fica em funções puras no mesmo arquivo
- Mock data como fallback em desenvolvimento/erro

---

## 9. Context API — Autenticação

```tsx
// Consumo em qualquer componente
const { user, login, logout, getCodhdaList } = useAuth();

// Proteção de rota
export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!user?.isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
};
```

**Regras:**
- Não use Context para server state — use React Query
- `useAuth()` lança erro se usado fora do `AuthProvider` (proteção em desenvolvimento)
- Sessão persiste em `localStorage` via JSON serializado

---

## 10. Padrões de Componente

### 10.1 Composição de Dashboard

```tsx
// Estrutura padrão de *Dashboard.tsx
export const PropostasDashboard = () => {
  const [params, setParams] = useState<PropostasRequest | null>(null);
  const activeTabRef = useRef("overview");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['propostas', params],
    queryFn: () => fetchPropostasData(params!),
    enabled: !!params,
  });

  const stats = useMemo(() => processPropostasData(data ?? []), [data]);

  const handleParametersChange = useCallback((p: PropostasRequest) => {
    setParams(p);
  }, []);

  return (
    <div className="space-y-6">
      <PropostasParametersControl onParametersChange={handleParametersChange} />
      <PropostasStatsCards stats={stats} isLoading={isLoading} />
      <Tabs onValueChange={(v) => { activeTabRef.current = v; }}>
        <TabsContent value="overview">
          <PropostasChartsGrid data={data} />
        </TabsContent>
        <TabsContent value="table">
          <PropostasTable data={data ?? []} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
```

### 10.2 Skeleton de Loading

```tsx
if (isLoading) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="h-4 bg-gray-200 rounded w-24" />
          </CardHeader>
          <CardContent>
            <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### 10.3 Estado de erro

```tsx
useEffect(() => {
  if (!error) return;

  toast({
    title: "Erro ao carregar dados",
    description: "Verifique sua conexão e tente novamente.",
    variant: "destructive",
  });
}, [error, toast]);
```

### 10.4 Estado vazio

```tsx
{data.length === 0 && (
  <div className="text-center py-12 text-muted-foreground">
    Nenhum resultado encontrado para os filtros selecionados.
  </div>
)}
```

### 10.5 Nomenclatura de componentes

| Tipo | Sufixo | Exemplo |
|------|--------|---------|
| Dashboard principal | `Dashboard` | `PropostasDashboard` |
| Tabela | `Table` | `RetencaoTable` |
| Cards de KPI | `StatsCards` ou `Cards` | `ParcelasVencimentoCards` |
| Gráficos | `ChartsGrid` ou `Charts` | `PropostasChartsGrid` |
| Controle de parâmetros | `ParametersControl` | `PropostasParametersControl` |
| Botões de exportação | `ExportButtons` | `LanceExportButtons` |

---

## 11. Formatação de Dados

### 11.1 Números

```tsx
// Inteiro
new Intl.NumberFormat('pt-BR').format(value)   // 1.234.567

// Moeda
new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)  // R$ 1.234,56

// Porcentagem
`${value.toFixed(1)}%`   // 98.5%
```

### 11.2 Datas

```tsx
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Para exibição
format(date, 'dd/MM/yyyy', { locale: ptBR })       // 15/06/2025
format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })  // 15 de junho de 2025

// Para API (ISO)
date.toISOString().split('T')[0]   // '2025-06-15'
```

### 11.3 Funções utilitárias padrão

```tsx
// Evite duplicar — centralize em src/utils/formatters.ts se precisar de reuso
const formatNumber = (n: number) => new Intl.NumberFormat('pt-BR').format(n);
const formatCurrency = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
const formatPercent = (n: number) => `${n.toFixed(1)}%`;
```

---

## 12. UX Obrigatória

### 12.1 Fluxo de dados do usuário

```
[ParametersControl] → usuário preenche datas + lojas → clica "Aplicar"
       ↓
[Dashboard] recebe params → dispara query
       ↓
[Skeleton] durante isLoading
       ↓
[StatsCards + Table + Charts] com dados
       ↓
[Toast de erro] se falhar
```

### 12.2 Auto-refresh (`useAutoRefresh`)

```tsx
const { timeRemaining } = useAutoRefresh({
  enabled: autoRefreshEnabled,
  interval: 300,   // segundos
  onRefresh: handleRefresh,
});

// Exibir countdown no UI
<span>{timeRemaining}s para próxima atualização</span>
```

### 12.3 Exportação

```tsx
// CSV — via Blob
const exportToCSV = (data: DataItem[], filename: string) => {
  const headers = ['Coluna A', 'Coluna B'];
  const rows = data.map(item => [item.colA, `"${item.colB}"`].join(','));
  const csv = [headers.join(','), ...rows].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// PDF — via jsPDF + autoTable
// Ver src/utils/pdfHelpers.ts para o padrão completo
```

### 12.4 Textos e idioma

- Todo texto visível em **PT-BR**
- Labels de campos: curtos e diretos
- Mensagens de erro: descrevem o problema + próximo passo
- Mensagens de sucesso: confirmam a ação executada

---

## 13. Checklist de Entrega

Antes de abrir PR ou considerar a tarefa concluída:

```
DADOS
[ ] Todo fetch remoto usa useQuery / useMutation (nunca fetch direto no componente)
[ ] queryKey inclui todos os parâmetros que afetam o resultado
[ ] enabled condicional quando parâmetros podem ser null/undefined
[ ] Fallback de dados mock implementado no service

PERFORMANCE
[ ] Valores derivados (filtros, stats, colunas) com useMemo
[ ] Handlers passados por props com useCallback
[ ] Colunas do TanStack Table memorizadas

TABELAS
[ ] Toda tabela usa TanStack Table
[ ] data nunca é undefined (usar ?? [])
[ ] Colunas definidas com createColumns fora do componente
[ ] Paginação, sorting e busca global configurados

UX
[ ] Estado de loading com skeleton
[ ] Estado de erro com toast
[ ] Estado vazio com mensagem
[ ] Textos em PT-BR
[ ] Layout responsivo (mobile-first com md: lg: breakpoints)
[ ] Exportação CSV e/ou PDF quando aplicável
```

---

**Última atualização:** 2026-04-08  
**Baseado em:** análise completa do repositório `dashboard-myhonda`
