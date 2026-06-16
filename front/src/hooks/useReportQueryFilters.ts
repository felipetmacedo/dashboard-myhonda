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

function parseCodhdaCsv(text: string): string {
  return text
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean)
    .join(",");
}

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
  const [codhdaText, setCodhdaText] = useState("");
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
    const codhdas = user.lojas.map((l) => l.codhda);
    setSelectedCodhdas(codhdas);
    if (isAdministrador) {
      setCodhdaText(codhdas.join(", "));
    }
  }, [user?.lojas, isAdministrador]);

  const resolveCodhdaCsv = useCallback((): string => {
    if (isAdministrador) return parseCodhdaCsv(codhdaText);
    return selectedCodhdas.join(",");
  }, [isAdministrador, codhdaText, selectedCodhdas]);

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

  const canAutoApply = isAdministrador
    ? parseCodhdaCsv(codhdaText).length > 0
    : selectedCodhdas.length > 0;

  useEffect(() => {
    if (
      !autoApplyOnStoresReady ||
      didAutoApplyRef.current ||
      !canAutoApply
    ) {
      return;
    }
    const params = buildParams();
    if (params) {
      setActiveParams(params);
      didAutoApplyRef.current = true;
    }
  }, [autoApplyOnStoresReady, canAutoApply, buildParams]);

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
    codhdaText,
    setCodhdaText,
    lojaOptions,
    hasStores,
    isAdministrador,
    periodLabel,
  };
}
