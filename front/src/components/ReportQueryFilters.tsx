import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/DateRangePicker";
import { MultiSelectCombobox, MultiSelectOption } from "@/components/ui/multi-select-combobox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export interface ReportQueryFiltersProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  lojaOptions: MultiSelectOption[];
  selectedCodhdas: string[];
  onSelectedCodhdasChange: (values: string[]) => void;
  onConsultar: () => void;
  isLoading?: boolean;
}

/**
 * Filtros padrão de consulta (período + lojas CODHDA + Consultar).
 * Usar como children do PageHeader — renderiza 3 células do grid.
 */
export function ReportQueryFilters({
  dateRange,
  onDateRangeChange,
  lojaOptions,
  selectedCodhdas,
  onSelectedCodhdasChange,
  onConsultar,
  isLoading = false,
}: ReportQueryFiltersProps) {
  const hasCodhda = selectedCodhdas.length > 0;

  const periodReady = !!(dateRange?.from && dateRange?.to);

  return (
    <>
      <div className="space-y-1.5 min-w-0">
        <Label>Período</Label>
        <DateRangePicker
          value={dateRange}
          onChange={onDateRangeChange}
        />
      </div>

      <div className="space-y-1.5 min-w-0">
        <Label>Empresas (CODHDA)</Label>
        <MultiSelectCombobox
          options={lojaOptions}
          selected={selectedCodhdas}
          onChange={onSelectedCodhdasChange}
          placeholder="Selecione as empresas"
          searchPlaceholder="Buscar empresa..."
          emptyMessage="Nenhuma loja disponível."
        />
      </div>

      <Button
        type="button"
        onClick={onConsultar}
        disabled={isLoading || !periodReady || !hasCodhda}
        className="self-end"
      >
        {isLoading ? "Consultando..." : "Consultar"}
      </Button>
    </>
  );
}
