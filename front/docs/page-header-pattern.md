# Padrão de Header Compacto — PageHeader

## Visão Geral

Todas as páginas da plataforma usam o componente `PageHeader` para renderizar o título, ações e filtros de consulta de forma padronizada e compacta.

## Componentes

### `PageHeader` (`src/components/PageHeader.tsx`)

Header padronizado com:
- **Linha 1**: Título da página + ações (export, auto-refresh, etc.)
- **Card "Filtrar Consulta"**: Filtros inline dentro de um Card com padding reduzido

**Props:**
```typescript
interface PageHeaderProps {
  title: string;              // Título da página
  children?: React.ReactNode; // Filtros (DateRange, MultiSelect, Button)
  actions?: React.ReactNode;  // Botões de ação (export, etc.)
  onRefresh?: () => void;     // Callback do auto-refresh
  showAutoRefresh?: boolean;  // Exibir botão de atualização automática
}
```

**Uso (filtro padrão de relatórios):**
```tsx
import { ReportQueryFilters } from "@/components/ReportQueryFilters";
import { useReportQueryFilters } from "@/hooks/useReportQueryFilters";

const filters = useReportQueryFilters();

<PageHeader title="Leads MyHonda">
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
```

`ReportQueryFilters` renderiza três células: **Período** (DateRangePicker), **Empresas (CODHDA)** (MultiSelect ou Textarea para `ADMINISTRADOR`) e **Consultar**.

### `CompactAutoRefresh` (`src/components/CompactAutoRefresh.tsx`)

Botão com texto "Atualização Automática" + Popover com:
- Toggle on/off
- Seletor de intervalo (30s, 1m, 2m, 5m, 10m)
- Timer de próxima atualização
- Botão "Atualizar Agora"

Indicador verde quando ativo.

### ParametersControl (compactos)

Os componentes `PropostasParametersControl`, `LanceParametersControl`, etc. **não possuem mais Card wrapper**. Eles renderizam apenas os inputs (DateRange, MultiSelect, Button) como fragmentos (`<>...</>`), para serem usados como `children` do `PageHeader`.

## Regras

1. **Auto-refresh condicional**: Sempre visível no Dashboard Principal e Parcelas a Vencer. Nas demais páginas, apenas se `user?.user === 'ADMINISTRADOR'`.
2. **Filtros em grid**: Os children do PageHeader são renderizados em grid responsivo (`grid-cols-[minmax(280px,1.2fr)_1fr_auto]` em desktop). Preferir `ReportQueryFilters` como filho único padrão (3 células internas).
3. **Sem Card duplicado**: Os ParametersControl NÃO devem ter Card wrapper próprio — o PageHeader já fornece o Card.

## Páginas migradas

| Página | Auto-refresh | Export no header |
|--------|-------------|-----------------|
| Dashboard Principal (`/`) | Sempre | ScheduledEmail + ExportPDF |
| Parcelas a Vencer | Sempre | ExportButtons |
| Gestão de Propostas | Só ADMIN | — |
| Ranking Propostas | Só ADMIN | — |
| Análise de Lances | Só ADMIN | — |
| Adimplência | Só ADMIN | Gerar PDF |
| Resultado Assembleia | Só ADMIN | ExportButtons |
| Retenção | Só ADMIN | — |
