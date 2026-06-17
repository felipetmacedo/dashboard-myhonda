import { useState, useMemo, useCallback, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  ColumnOrderState,
  RowSelectionState,
  Table,
} from "@tanstack/react-table";
import { normalizeFilterValue } from "@/components/AdvancedTableComponents";

const DEFAULT_COLUMN_DEF = {
  filterFn: (row: any, columnId: string, filterValue: string[]) => {
    if (!filterValue?.length) return true;
    const cell = normalizeFilterValue(row.getValue(columnId));
    return filterValue.includes(cell);
  },
};

export interface UseAdvancedTableOptions<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  initialPageSize?: number;
  initialSorting?: SortingState;
  initialColumnVisibility?: VisibilityState;
  initialColumnOrder?: string[];
  enableRowSelection?: boolean;
  /** Unique ID for persisting column order in localStorage */
  tableId?: string;
  /** Enable faceted row models (getFacetedRowModel/UniqueValues/MinMaxValues). Default: false. */
  enableFacetedFilters?: boolean;
}

export interface UseAdvancedTableReturn<TData> {
  table: Table<TData>;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  columnOrder: ColumnOrderState;
  setColumnOrder: (order: ColumnOrderState) => void;
  resetColumnOrder: () => void;
  resetFilters: () => void;
  filteredRowCount: number;
  totalRowCount: number;
  rowSelection: RowSelectionState;
  setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>;
  /** Generic handler for drag-and-drop column reordering */
  handleColumnDrop: (dragId: string, targetId: string) => void;
}

export function useAdvancedTable<TData>({
  data,
  columns,
  initialPageSize = 10,
  initialSorting = [],
  initialColumnVisibility = {},
  initialColumnOrder,
  enableRowSelection = false,
  tableId,
  enableFacetedFilters = false,
}: UseAdvancedTableOptions<TData>): UseAdvancedTableReturn<TData> {
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialColumnVisibility);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const defaultOrder = useMemo(
    () => initialColumnOrder ?? columns.map((c) => (c as any).accessorKey ?? (c as any).id ?? ""),
    [columns, initialColumnOrder]
  );

  const storageKey = tableId ? `table-order-${tableId}` : null;

  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() => {
    if (storageKey) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch { /* ignore */ }
    }
    return defaultOrder;
  });

  // Persist column order to localStorage when it changes
  useEffect(() => {
    if (!storageKey) return;
    const isDefault = JSON.stringify(columnOrder) === JSON.stringify(defaultOrder);
    if (isDefault) {
      localStorage.removeItem(storageKey);
    } else {
      localStorage.setItem(storageKey, JSON.stringify(columnOrder));
    }
  }, [columnOrder, storageKey, defaultOrder]);

  const table = useReactTable({
    data,
    columns,
    defaultColumn: DEFAULT_COLUMN_DEF,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      columnOrder,
      ...(enableRowSelection ? { rowSelection } : {}),
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    ...(enableRowSelection ? { 
      enableRowSelection: true,
      onRowSelectionChange: setRowSelection,
    } : {}),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    ...(enableFacetedFilters ? {
      getFacetedRowModel: getFacetedRowModel(),
      getFacetedUniqueValues: getFacetedUniqueValues(),
      getFacetedMinMaxValues: getFacetedMinMaxValues(),
    } : {}),
    initialState: {
      pagination: { pageSize: initialPageSize },
    },
  });

  const resetColumnOrder = useCallback(() => {
    setColumnOrder(defaultOrder);
    if (storageKey) localStorage.removeItem(storageKey);
  }, [defaultOrder, storageKey]);

  const resetFilters = useCallback(() => {
    setColumnFilters([]);
    setGlobalFilter("");
  }, []);

  const handleColumnDrop = useCallback(
    (dragId: string, targetId: string) => {
      const current = columnOrder.length
        ? [...columnOrder]
        : columns.map((c) => (c as any).accessorKey ?? (c as any).id ?? "");
      const dragIdx = current.indexOf(dragId);
      const targetIdx = current.indexOf(targetId);
      if (dragIdx === -1 || targetIdx === -1) return;
      const [moved] = current.splice(dragIdx, 1);
      current.splice(targetIdx, 0, moved);
      setColumnOrder(current);
    },
    [columnOrder, columns]
  );

  return {
    table,
    globalFilter,
    setGlobalFilter,
    sorting,
    columnFilters,
    columnVisibility,
    columnOrder,
    setColumnOrder,
    resetColumnOrder,
    resetFilters,
    filteredRowCount: table.getFilteredRowModel().rows.length,
    totalRowCount: data.length,
    rowSelection,
    setRowSelection,
    handleColumnDrop,
  };
}
