import { format } from "date-fns";
import { DateRange } from "react-day-picker";

export function getCurrentMonthDateRange(): DateRange {
  const today = new Date();
  const from = new Date(today.getFullYear(), today.getMonth(), 1);
  const to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return { from, to };
}

export function dateRangeToApiStrings(
  range: DateRange | undefined
): { dataInicio: string; dataFinal: string } | null {
  if (!range?.from || !range?.to) return null;
  return {
    dataInicio: format(range.from, "yyyy-MM-dd"),
    dataFinal: format(range.to, "yyyy-MM-dd"),
  };
}

export function formatPeriodLabel(range: DateRange | undefined): string {
  if (!range?.from || !range?.to) return "";
  return `${format(range.from, "dd/MM/yyyy")} a ${format(range.to, "dd/MM/yyyy")}`;
}
