import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { DateRange } from "react-day-picker";
import { useAuth } from "@/contexts/AuthContext";
import { LeadsRequest } from "@/services/reportsTypes";
import { MultiSelectOption } from "@/components/ui/multi-select-combobox";
import {
  dateRangeToApiStrings,
  formatPeriodLabel,
  getCurrentMonthDateRange,
} from "@/utils/reportDateRange";

interface UseReportQueryFiltersOptions {
  /** Dispara a primeira consulta quando as lojas do usuário estiverem disponíveis. */
  autoApplyOnStoresReady?: boolean;
}

export function useReportQueryFilters(options: UseReportQueryFiltersOptions = {}) {
  const { user } = useAuth();
  const { autoApplyOnStoresReady = true } = options;

  const isAdministrador = user?.isAdmin === true;

  const [dateRange, setDateRange] = useState<DateRange>(getCurrentMonthDateRange);
  const [selectedCodhdas, setSelectedCodhdas] = useState<string[]>([]);
  const [activeParams, setActiveParams] = useState<LeadsRequest | null>(null);
  const didAutoApplyRef = useRef(false);

  const lojaOptions = useMemo<MultiSelectOption[]>(
    () =>
      user?.lojas?.map((loja) => ({
        value: loja.codhda,
        label: loja.empresa
          ? `${loja.empresa} (${loja.codhda})`
          : loja.codhda,
      })) ?? [],
    [user?.lojas]
  );

  useEffect(() => {
    if (!user?.lojas?.length) return;
    setSelectedCodhdas(user.lojas.map((l) => l.codhda));
  }, [user?.lojas]);

  const resolveCodhdaCsv = useCallback((): string => {
    return selectedCodhdas.join(",");
  }, [selectedCodhdas]);

  const buildParams = useCallback((): LeadsRequest | null => {
    const codhda = resolveCodhdaCsv();
    if (!codhda) return null;

    const dates = dateRangeToApiStrings(dateRange);
    if (!dates) return null;
    return { ...dates, codhda };
  }, [resolveCodhdaCsv, dateRange]);

  const applyFilters = useCallback(() => {
    const params = buildParams();
    if (params) setActiveParams(params);
  }, [buildParams]);

  const hasStores = lojaOptions.length > 0;

  const canAutoApply = selectedCodhdas.length > 0;

  const buildParamsRef = useRef(buildParams);
  buildParamsRef.current = buildParams;

  useEffect(() => {
    if (!autoApplyOnStoresReady || didAutoApplyRef.current || !canAutoApply) return;
    const params = buildParamsRef.current();
    if (params) {
      setActiveParams(params);
      didAutoApplyRef.current = true;
    }
  }, [autoApplyOnStoresReady, canAutoApply]);

  const periodLabel = useMemo(
    () => formatPeriodLabel(dateRange),
    [dateRange]
  );

  return {
    activeParams,
    applyFilters,
    dateRange,
    setDateRange,
    selectedCodhdas,
    setSelectedCodhdas,
    lojaOptions,
    hasStores,
    isAdministrador,
    periodLabel,
  };
}
