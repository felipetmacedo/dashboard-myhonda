import { createContext, useContext, useState, useMemo, useCallback, useEffect, useRef, ReactNode } from "react";
import { DateRange } from "react-day-picker";
import { useAuth } from "@/contexts/AuthContext";
import { LeadsRequest } from "@/services/reportsTypes";
import { MultiSelectOption } from "@/components/ui/multi-select-combobox";
import {
  dateRangeToApiStrings,
  formatPeriodLabel,
  getCurrentMonthDateRange,
} from "@/utils/reportDateRange";

interface ReportFiltersState {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  selectedCodhdas: string[];
  setSelectedCodhdas: (codhdas: string[]) => void;
  activeParams: LeadsRequest | null;
  applyFilters: () => void;
  lojaOptions: MultiSelectOption[];
  hasStores: boolean;
  isAdministrador: boolean;
  periodLabel: string;
}

const ReportFiltersContext = createContext<ReportFiltersState | null>(null);

export function ReportFiltersProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const isAdministrador = user?.isAdmin === true;

  const [dateRange, setDateRange] = useState<DateRange>(getCurrentMonthDateRange);
  const [selectedCodhdas, setSelectedCodhdas] = useState<string[]>([]);
  const [activeParams, setActiveParams] = useState<LeadsRequest | null>(null);
  const didAutoApplyRef = useRef(false);

  const lojaOptions = useMemo<MultiSelectOption[]>(
    () =>
      user?.lojas?.map((loja) => ({
        value: loja.codhda,
        label: loja.empresa ? `${loja.empresa} (${loja.codhda})` : loja.codhda,
      })) ?? [],
    [user?.lojas]
  );

  useEffect(() => {
    if (!user?.lojas?.length) return;
    setSelectedCodhdas(user.lojas.map((l) => l.codhda));
  }, [user?.lojas]);

  const buildParams = useCallback((): LeadsRequest | null => {
    const codhda = selectedCodhdas.join(",");
    if (!codhda) return null;
    const dates = dateRangeToApiStrings(dateRange);
    if (!dates) return null;
    return { ...dates, codhda };
  }, [selectedCodhdas, dateRange]);

  const applyFilters = useCallback(() => {
    const params = buildParams();
    if (params) setActiveParams(params);
  }, [buildParams]);

  const buildParamsRef = useRef(buildParams);
  buildParamsRef.current = buildParams;

  useEffect(() => {
    if (didAutoApplyRef.current || !selectedCodhdas.length) return;
    const params = buildParamsRef.current();
    if (params) {
      setActiveParams(params);
      didAutoApplyRef.current = true;
    }
  }, [selectedCodhdas.length]);

  const hasStores = lojaOptions.length > 0;
  const periodLabel = useMemo(() => formatPeriodLabel(dateRange), [dateRange]);

  return (
    <ReportFiltersContext.Provider
      value={{
        dateRange,
        setDateRange,
        selectedCodhdas,
        setSelectedCodhdas,
        activeParams,
        applyFilters,
        lojaOptions,
        hasStores,
        isAdministrador,
        periodLabel,
      }}
    >
      {children}
    </ReportFiltersContext.Provider>
  );
}

export function useReportFilters(): ReportFiltersState {
  const ctx = useContext(ReportFiltersContext);
  if (!ctx) throw new Error("useReportFilters deve ser usado dentro de ReportFiltersProvider");
  return ctx;
}
