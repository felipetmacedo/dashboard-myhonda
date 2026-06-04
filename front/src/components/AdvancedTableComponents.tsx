/**
 * AdvancedTableComponents — Componentes reutilizáveis para tabelas TanStack Table
 * 
 * USO:
 * 1. useAdvancedTable hook para criar a instância da tabela
 * 2. <AdvancedTableHeader> para renderizar cabeçalho com sorting + filtro facetado
 * 3. <AdvancedTableBody> para renderizar corpo
 * 4. <AdvancedTablePagination> para paginação
 * 5. <AdvancedTableToolbar> para busca global + controles
 * 6. <FacetedFilter> para filtros dropdown por coluna
 * 7. <ColumnOrderPanel> para reordenar colunas via drag-and-drop
 */

import { useCallback, useMemo, useState, useRef } from "react";
import {
  Column,
  Header,
  Table,
  flexRender,
} from "@tanstack/react-table";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  X,
  GripVertical,
  Columns3,
  Eye,
  EyeOff,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

// ─── Faceted Filter (dropdown com valores únicos) ───────────────────

/**
 * Normaliza valores para agrupamento e filtragem em colunas faceted.
 * Trim + colapsa whitespace interno + uppercase para evitar duplicatas
 * causadas por espaços extras / diferenças de caixa vindas da API.
 */
export const normalizeFilterValue = (v: unknown): string =>
  String(v ?? "").trim().replace(/\s+/g, " ").toUpperCase();

interface FacetedFilterProps<TData> {
  column: Column<TData, unknown>;
  title?: string;
}

export function FacetedFilter<TData>({ column, title }: FacetedFilterProps<TData>) {
  const facetedValues = column.getFacetedUniqueValues();
  const filterValue = (column.getFilterValue() as string[] | undefined) ?? [];
  const [search, setSearch] = useState("");

  // Agrupa variantes (ex: "NORMAL" e "NORMAL    ") sob a mesma chave normalizada,
  // somando suas contagens. Mantém o primeiro label "limpo" para exibição.
  const aggregatedOptions = useMemo(() => {
    const map = new Map<string, { label: string; count: number }>();
    for (const [rawValue, rawCount] of facetedValues.entries()) {
      if (rawValue === null || rawValue === undefined) continue;
      const key = normalizeFilterValue(rawValue);
      if (!key) continue;
      const existing = map.get(key);
      const count = (rawCount as number) ?? 0;
      if (existing) {
        existing.count += count;
      } else {
        // Label visível: trim do valor original (preserva caixa original da primeira variante)
        map.set(key, { label: String(rawValue).trim().replace(/\s+/g, " "), count });
      }
    }
    return Array.from(map.entries())
      .map(([key, { label, count }]) => ({ key, label, count }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [facetedValues]);

  const filteredOptions = useMemo(() => {
    if (!search) return aggregatedOptions;
    const term = search.toLowerCase();
    return aggregatedOptions.filter((o) => o.label.toLowerCase().includes(term));
  }, [aggregatedOptions, search]);

  const handleToggle = useCallback(
    (value: string) => {
      const newFilter = filterValue.includes(value)
        ? filterValue.filter((v) => v !== value)
        : [...filterValue, value];
      column.setFilterValue(newFilter.length ? newFilter : undefined);
    },
    [column, filterValue]
  );

  const clearFilter = useCallback(() => {
    column.setFilterValue(undefined);
    setSearch("");
  }, [column]);

  const isActive = filterValue.length > 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-7 px-2 text-xs gap-1 ${isActive ? "bg-primary/10 text-primary border border-primary/30" : ""}`}
        >
          <Filter className="h-3 w-3" />
          {isActive && (
            <Badge variant="secondary" className="h-4 px-1 text-[10px] rounded-sm">
              {filterValue.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0 max-h-[380px] overflow-hidden" align="start">
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{title ?? column.id}</p>
            {isActive && (
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={clearFilter}>
                <X className="h-3 w-3 mr-1" />
                Limpar
              </Button>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>
        <ScrollArea className="h-[220px]">
          <div className="px-3 pb-3 space-y-1">
            {filteredOptions.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2 text-center">Nenhuma opção</p>
            ) : (
              filteredOptions.map(({ key, label, count }) => {
                const isSelected = filterValue.includes(key);
                return (
                  <label
                    key={key}
                    className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-accent cursor-pointer text-xs"
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggle(key)}
                      className="h-3.5 w-3.5"
                    />
                    <span className="flex-1 truncate">{label}</span>
                    <span className="text-muted-foreground text-[10px]">({count})</span>
                  </label>
                );
              })
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

// ─── Sort Button ────────────────────────────────────────────────────

function SortButton<TData>({ header }: { header: Header<TData, unknown> }) {
  if (!header.column.getCanSort()) return null;

  const sorted = header.column.getIsSorted();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 px-1 hover:bg-transparent"
      onClick={header.column.getToggleSortingHandler()}
    >
      {sorted === false && <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />}
      {sorted === "asc" && <ArrowUp className="h-3.5 w-3.5 text-primary" />}
      {sorted === "desc" && <ArrowDown className="h-3.5 w-3.5 text-primary" />}
    </Button>
  );
}

// ─── Advanced Table Header ──────────────────────────────────────────

interface AdvancedTableHeaderProps<TData> {
  table: Table<TData>;
  enableFacetedFilter?: boolean;
  /** Labels personalizados para o filtro. Chave = column.id */
  filterLabels?: Record<string, string>;
  enableColumnDrag?: boolean;
  onColumnDragStart?: (columnId: string) => void;
  onColumnDrop?: (dragId: string, targetId: string) => void;
}

export function AdvancedTableHeader<TData>({
  table,
  enableFacetedFilter = true,
  filterLabels,
  enableColumnDrag = true,
  onColumnDragStart,
  onColumnDrop,
}: AdvancedTableHeaderProps<TData>) {
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, columnId: string) => {
    setDraggedColumn(columnId);
    e.dataTransfer.effectAllowed = "move";
    onColumnDragStart?.(columnId);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedColumn && draggedColumn !== targetId) {
      onColumnDrop?.(draggedColumn, targetId);
    }
    setDraggedColumn(null);
    setDragOverColumn(null);
  };

  return (
    <TableHeader className="bg-muted">
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id} className="border-b-2 border-border hover:bg-transparent">
          {headerGroup.headers.map((header) => {
            const showFaceted =
              enableFacetedFilter &&
              header.column.getCanFilter();

            return (
              <TableHead
                key={header.id}
                className={`relative py-3 ${enableColumnDrag ? "cursor-grab" : ""} ${
                  dragOverColumn === header.column.id ? "bg-primary/5 border-l-2 border-primary" : ""
                }`}
                draggable={enableColumnDrag}
                onDragStart={enableColumnDrag ? (e) => handleDragStart(e, header.column.id) : undefined}
                onDragOver={enableColumnDrag ? (e) => handleDragOver(e, header.column.id) : undefined}
                onDragLeave={enableColumnDrag ? () => setDragOverColumn(null) : undefined}
                onDrop={enableColumnDrag ? (e) => handleDrop(e, header.column.id) : undefined}
              >
                {header.isPlaceholder ? null : (
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-xs uppercase tracking-wide whitespace-nowrap text-foreground/80">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </span>
                      <SortButton header={header} />
                      {showFaceted && (
                        <FacetedFilter
                          column={header.column}
                          title={filterLabels?.[header.column.id] ?? String(header.column.columnDef.header)}
                        />
                      )}
                    </div>
                  </div>
                )}
              </TableHead>
            );
          })}
        </TableRow>
      ))}
    </TableHeader>
  );
}

// ─── Advanced Table Body ────────────────────────────────────────────

interface AdvancedTableBodyProps<TData> {
  table: Table<TData>;
  columnCount: number;
  emptyMessage?: string;
  onRowClick?: (row: TData) => void;
}

export function AdvancedTableBody<TData>({
  table,
  columnCount,
  emptyMessage = "Nenhum dado encontrado",
  onRowClick,
}: AdvancedTableBodyProps<TData>) {
  return (
    <TableBody>
      {table.getRowModel().rows.length === 0 ? (
        <TableRow>
          <TableCell colSpan={columnCount} className="text-center py-8 text-muted-foreground">
            {emptyMessage}
          </TableCell>
        </TableRow>
      ) : (
        table.getRowModel().rows.map((row, idx) => (
          <TableRow
            key={row.id}
            className={`${onRowClick ? "cursor-pointer" : ""} ${idx % 2 === 0 ? "bg-background" : "bg-muted/30"} hover:bg-accent/50 transition-colors`}
            onClick={onRowClick ? () => onRowClick(row.original) : undefined}
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id} className="text-[13px] py-1.5">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))
      )}
    </TableBody>
  );
}

// ─── Advanced Table Pagination ──────────────────────────────────────

interface AdvancedTablePaginationProps<TData> {
  table: Table<TData>;
  pageSizes?: number[];
}

export function AdvancedTablePagination<TData>({
  table,
  pageSizes = [10, 20, 30, 50, 100],
}: AdvancedTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;
  const from = pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4">
      <div className="text-sm text-muted-foreground">
        Mostrando {totalRows > 0 ? from : 0} a {to} de {totalRows} registros
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Por página:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => table.setPageSize(Number(v))}
          >
            <SelectTrigger className="w-16 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizes.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-sm text-muted-foreground px-2">
            {pageIndex + 1} / {table.getPageCount() || 1}
          </span>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Advanced Table Toolbar ─────────────────────────────────────────

interface AdvancedTableToolbarProps<TData> {
  table: Table<TData>;
  globalFilter: string;
  setGlobalFilter: (v: string) => void;
  resetFilters: () => void;
  resetColumnOrder: () => void;
  filteredRowCount: number;
  totalRowCount: number;
  searchPlaceholder?: string;
  children?: React.ReactNode;
}

export function AdvancedTableToolbar<TData>({
  table,
  globalFilter,
  setGlobalFilter,
  resetFilters,
  resetColumnOrder,
  filteredRowCount,
  totalRowCount,
  searchPlaceholder = "Buscar em todos os campos...",
  children,
}: AdvancedTableToolbarProps<TData>) {
  const hasFilters = table.getState().columnFilters.length > 0 || globalFilter !== "";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {hasFilters && (
          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={resetFilters}>
            <X className="h-3.5 w-3.5" />
            Limpar Filtros
          </Button>
        )}

        <ColumnOrderSheet table={table} resetColumnOrder={resetColumnOrder} />

        {children}
      </div>

      {filteredRowCount !== totalRowCount && (
        <Badge variant="secondary" className="text-xs">
          {filteredRowCount} de {totalRowCount}
        </Badge>
      )}
    </div>
  );
}

// ─── Column Visibility Panel ────────────────────────────────────────

function ColumnVisibilityPanel<TData>({ table }: { table: Table<TData> }) {
  const allColumns = table.getAllLeafColumns();
  const visibleCount = allColumns.filter((c) => c.getIsVisible()).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
          <Eye className="h-3.5 w-3.5" />
          Colunas
          <Badge variant="secondary" className="h-4 px-1 text-[10px] rounded-sm ml-1">
            {visibleCount}/{allColumns.length}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-0 max-h-[400px] overflow-hidden" align="end">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium whitespace-nowrap">Colunas Visíveis</p>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[10px]"
                onClick={() =>
                  table.toggleAllColumnsVisible(true)
                }
              >
                <Eye className="h-3 w-3 mr-1" />
                Todas
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[10px]"
                onClick={() =>
                  table.toggleAllColumnsVisible(false)
                }
              >
                <EyeOff className="h-3 w-3 mr-1" />
                Nenhuma
              </Button>
            </div>
          </div>
        </div>
        <ScrollArea className="h-[300px]">
          <div className="p-2 space-y-0.5">
            {allColumns.map((column) => (
              <label
                key={column.id}
                className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-accent cursor-pointer text-xs min-w-0"
              >
                <Checkbox
                  checked={column.getIsVisible()}
                  onCheckedChange={(v) => column.toggleVisibility(!!v)}
                  className="h-3.5 w-3.5 flex-shrink-0"
                />
                <span className="truncate min-w-0">
                  {typeof column.columnDef.header === "string"
                    ? column.columnDef.header
                    : column.id}
                </span>
              </label>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

// ─── Column Order Sheet (reordenar arrastando) ──────────────────────

function ColumnOrderSheet<TData>({
  table,
  resetColumnOrder,
}: {
  table: Table<TData>;
  resetColumnOrder: () => void;
}) {
  const columnOrder = table.getState().columnOrder;
  const allColumns = table.getAllLeafColumns();
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  // Ordered columns list
  const orderedColumns = useMemo(() => {
    if (!columnOrder.length) return allColumns;
    return columnOrder
      .map((id) => allColumns.find((c) => c.id === id))
      .filter(Boolean) as typeof allColumns;
  }, [columnOrder, allColumns]);

  const handleDrop = useCallback(
    (dropIndex: number) => {
      if (dragIdx === null || dragIdx === dropIndex) {
        setDragIdx(null);
        setOverIdx(null);
        return;
      }
      const newOrder = [...(columnOrder.length ? columnOrder : allColumns.map((c) => c.id))];
      const [moved] = newOrder.splice(dragIdx, 1);
      newOrder.splice(dropIndex, 0, moved);
      table.setColumnOrder(newOrder);
      setDragIdx(null);
      setOverIdx(null);
    },
    [dragIdx, columnOrder, allColumns, table]
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
          <Columns3 className="h-3.5 w-3.5" />
          Ordenar Colunas
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[380px] sm:w-[440px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Columns3 className="h-5 w-5" />
            Ordem das Colunas
          </SheetTitle>
          <SheetDescription>Arraste para reordenar as colunas da tabela</SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-3">
          <Button variant="outline" size="sm" onClick={resetColumnOrder} className="gap-1">
            <RotateCcw className="h-3.5 w-3.5" />
            Resetar Ordem
          </Button>

          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-1 pr-4">
              {orderedColumns.map((col, index) => (
                <div
                  key={col.id}
                  draggable
                  onDragStart={() => setDragIdx(index)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setOverIdx(index);
                  }}
                  onDragLeave={() => setOverIdx(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDrop(index);
                  }}
                  className={`
                    flex items-center gap-3 p-2.5 rounded-lg border transition-all cursor-grab
                    ${overIdx === index ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}
                    ${dragIdx === index ? "opacity-40" : ""}
                  `}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <Badge variant="outline" className="h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                    {index + 1}
                  </Badge>
                  <span className="text-sm flex-1 truncate">
                    {typeof col.columnDef.header === "string" ? col.columnDef.header : col.id}
                  </span>
                  <Checkbox
                    checked={col.getIsVisible()}
                    onCheckedChange={(v) => col.toggleVisibility(!!v)}
                    className="h-3.5 w-3.5"
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
