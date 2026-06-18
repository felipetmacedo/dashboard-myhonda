import { useReportFilters } from "@/contexts/ReportFiltersContext";

/**
 * Alias do contexto global de filtros de relatório.
 * O estado (período, empresas, activeParams) é compartilhado entre todas as páginas do menu.
 */
export function useReportQueryFilters() {
  return useReportFilters();
}
