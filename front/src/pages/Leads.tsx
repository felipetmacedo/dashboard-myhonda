import { useMemo, useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import * as XLSX from "xlsx";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import {
  AdvancedTableHeader,
  AdvancedTableBody,
  AdvancedTablePagination,
  AdvancedTableToolbar,
} from "@/components/AdvancedTableComponents";
import { useAdvancedTable } from "@/hooks/useAdvancedTable";
import { useReportQueryFilters } from "@/hooks/useReportQueryFilters";
import { ReportQueryFilters } from "@/components/ReportQueryFilters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import { Loader2, FileDown } from "lucide-react";
import { fetchLeads } from "@/services/reportsApi";
import { Lead } from "@/services/reportsTypes";

/** Formata ISO do backend para exibição em pt-BR. */
function formatLeadDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const d = parseISO(value);
  if (!isValid(d)) return value;
  return format(d, "dd/MM/yyyy HH:mm", { locale: ptBR });
}

const HIDDEN_COLUMNS: Record<string, boolean> = {
  ID: false,
  CODHDA: false,
  FONE: false,
  JSON_MYHONDA: false,
  RETORNO_ENCAMINHAMENTO: false,
  MSG_ENVIADA: false,
  MSG_ENCAMINHADA: false,
  tipo_original: false,
  lead: false,
  folga_orcamentaria: false,
  escolaridade: false,
  interesses: false,
  comportamento_digital: false,
  comportamento_financeiro: false,
  ano_modelo: false,
  tipo_servico: false,
};

const Leads = () => {
  const {
    activeParams,
    applyFilters,
    dateRange,
    setDateRange,
    selectedCodhdas,
    setSelectedCodhdas,
    lojaOptions,
    hasStores,
    isAdministrador,
  } = useReportQueryFilters();

  const [slaFilter, setSlaFilter] = useState<null | "0-5" | "6-30" | ">30">(null);
  const [crmFilter, setCrmFilter] = useState<null | "enviado" | "nao-enviado">(null);

  const { data = [], isFetching, isError, error } = useQuery({
    queryKey: ["leads", activeParams],
    queryFn: () => fetchLeads(activeParams!),
    enabled: !!activeParams,
  });

  const slaCounts = useMemo(() => {
    const counts = { "0-5": 0, "6-30": 0, ">30": 0 };
    data.forEach(l => {
      const m = l.sla_minutos;
      if (m === null || m === undefined || m < 0) return;
      if (m <= 5) counts["0-5"]++;
      else if (m <= 30) counts["6-30"]++;
      else counts[">30"]++;
    });
    return counts;
  }, [data]);

  const crmCounts = useMemo(() => {
    const counts = { enviado: 0, "nao-enviado": 0 };
    data.forEach(l => {
      if (l.RETORNO_ENCAMINHAMENTO) counts.enviado++;
      else counts["nao-enviado"]++;
    });
    return counts;
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(l => {
      if (slaFilter) {
        const m = l.sla_minutos;
        if (m === null || m === undefined || m < 0) return false;
        if (slaFilter === "0-5"  && !(m <= 5)) return false;
        if (slaFilter === "6-30" && !(m >= 6 && m <= 30)) return false;
        if (slaFilter === ">30"  && !(m > 30)) return false;
      }
      if (crmFilter === "enviado" && !l.RETORNO_ENCAMINHAMENTO) return false;
      if (crmFilter === "nao-enviado" && l.RETORNO_ENCAMINHAMENTO) return false;
      return true;
    });
  }, [data, slaFilter, crmFilter]);

  const columns = useMemo<ColumnDef<Lead>[]>(() => [
    // — visíveis por padrão (mais relevantes primeiro) —
    {
      accessorKey: "data_criacao_lead",
      header: "Data do Lead",
      size: 140,
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap text-sm tabular-nums">
          {formatLeadDateTime(getValue<string>())}
        </span>
      ),
    },
    { accessorKey: "NOME", header: "Nome", size: 200 },
    { accessorKey: "CELULAR", header: "Celular", size: 130 },
    { accessorKey: "EMAIL", header: "E-mail", size: 200 },
    { accessorKey: "PRODUTO", header: "Produto / Interesse", size: 220 },
    {
      accessorKey: "versao",
      header: "Versão",
      size: 120,
    },
    {
      accessorKey: "TIPO",
      header: "Tipo",
      size: 70,
      cell: ({ getValue }) => {
        const v = getValue<string>();
        return v ? <Badge variant="outline">{v.trim()}</Badge> : null;
      },
    },
    { accessorKey: "ORIGEM", header: "Origem", size: 140 },
    { accessorKey: "SUB_ORIGEM", header: "Sub-origem", size: 120 },
    { accessorKey: "perfil", header: "Perfil", size: 70 },
    { accessorKey: "idade", header: "Idade", size: 110 },
    { accessorKey: "CPF", header: "CPF", size: 120 },
    {
      accessorKey: "CRM_INTEGRACAO",
      header: "CRM",
      size: 90,
      cell: ({ getValue }) => {
        const v = getValue<string | null>();
        return v ? (
          <Badge className="bg-primary text-primary-foreground">{v}</Badge>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        );
      },
    },
    { accessorKey: "QTD_TENTATIVAS", header: "Tentativas", size: 90 },
    {
      accessorKey: "DATA_CADASTRO",
      header: "Cadastro no sistema",
      size: 150,
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap text-sm tabular-nums">
          {formatLeadDateTime(getValue<string>())}
        </span>
      ),
    },
    {
      id: "sla",
      header: "SLA",
      size: 100,
      accessorFn: (row) => row.sla_minutos,
      cell: ({ getValue }) => {
        const mins = getValue<number | null>();
        if (mins === null || mins === undefined || mins < 0) {
          return <span className="text-muted-foreground text-xs">—</span>;
        }
        if (mins < 60) {
          return <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">{mins}min</Badge>;
        }
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        const label = m > 0 ? `${h}h ${m}min` : `${h}h`;
        if (h < 6) {
          return <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">{label}</Badge>;
        }
        return <Badge variant="outline" className="text-red-700 border-red-300 bg-red-50">{label}</Badge>;
      },
    },
    // — ocultas por padrão (detalhes / integração) —
    { accessorKey: "ID", header: "ID" },
    { accessorKey: "CODHDA", header: "CODHDA" },
    { accessorKey: "FONE", header: "Telefone fixo" },
    { accessorKey: "tipo_original", header: "Tipo original" },
    { accessorKey: "lead", header: "Lead (texto)" },
    { accessorKey: "folga_orcamentaria", header: "Folga orçamentária" },
    { accessorKey: "escolaridade", header: "Escolaridade" },
    { accessorKey: "interesses", header: "Interesses" },
    { accessorKey: "comportamento_digital", header: "Comport. digital" },
    { accessorKey: "comportamento_financeiro", header: "Comport. financeiro" },
    { accessorKey: "ano_modelo", header: "Ano modelo" },
    { accessorKey: "tipo_servico", header: "Tipo serviço" },
    { accessorKey: "JSON_MYHONDA", header: "JSON MyHonda" },
    { accessorKey: "RETORNO_ENCAMINHAMENTO", header: "Retorno encaminhamento" },
    { accessorKey: "MSG_ENVIADA", header: "Msg enviada" },
    { accessorKey: "MSG_ENCAMINHADA", header: "Msg encaminhada" },
  ], []);

  const {
    table,
    globalFilter,
    setGlobalFilter,
    filteredRowCount,
    totalRowCount,
    resetFilters,
    resetColumnOrder,
    handleColumnDrop,
  } = useAdvancedTable({
    data: filteredData,
    columns,
    tableId: "leads",
    initialPageSize: 50,
    initialColumnVisibility: HIDDEN_COLUMNS,
  });

  const exportToExcel = useCallback(() => {
    if (!data.length) return;

    const rows = table.getFilteredRowModel().rows.map(row => {
      const d = row.original;
      return {
        "Data do Lead":      d.data_criacao_lead ? format(parseISO(d.data_criacao_lead), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "",
        "Cadastro Sistema":  d.DATA_CADASTRO     ? format(parseISO(d.DATA_CADASTRO),     "dd/MM/yyyy HH:mm", { locale: ptBR }) : "",
        "SLA (min)":         d.sla_minutos ?? "",
        "Nome":              d.NOME ?? "",
        "CPF":               d.CPF ?? "",
        "Celular":           d.CELULAR ?? "",
        "E-mail":            d.EMAIL ?? "",
        "Tipo":              d.TIPO?.trim() ?? "",
        "Tipo Original":     d.tipo_original ?? "",
        "Produto":           d.PRODUTO ?? "",
        "Versão":            d.versao ?? "",
        "Origem":            d.ORIGEM ?? "",
        "Sub-Origem":        d.SUB_ORIGEM ?? "",
        "CRM Integração":    d.CRM_INTEGRACAO ?? "",
        "Tentativas":        d.QTD_TENTATIVAS ?? 0,
        "Perfil":            d.perfil ?? "",
        "Idade":             d.idade ?? "",
        "Folga Orçamentária": d.folga_orcamentaria ?? "",
        "Escolaridade":      d.escolaridade ?? "",
        "Interesses":        d.interesses ?? "",
        "Comport. Digital":  d.comportamento_digital ?? "",
        "Comport. Financeiro": d.comportamento_financeiro ?? "",
        "Ano Modelo":        d.ano_modelo ?? "",
        "Tipo Serviço":      d.tipo_servico ?? "",
        "CODHDA":            d.CODHDA ?? "",
        "ID":                d.ID ?? "",
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");

    const now = format(new Date(), "yyyy-MM-dd_HH-mm");
    XLSX.writeFile(wb, `leads_myhonda_${now}.xlsx`);
  }, [data, table]);

  return (
    <Layout>
      <div className="p-6 space-y-4">
        <PageHeader title="Leads MyHonda">
          <ReportQueryFilters
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            lojaOptions={lojaOptions}
            selectedCodhdas={selectedCodhdas}
            onSelectedCodhdasChange={setSelectedCodhdas}
            onConsultar={applyFilters}
            isLoading={isFetching}
          />
        </PageHeader>

        {!hasStores && !isAdministrador && !isFetching && (
          <div className="text-amber-600 text-sm p-3 border border-amber-200 rounded bg-amber-50">
            Nenhuma loja associada ao usuário. Verifique as configurações de acesso.
          </div>
        )}

        {isError && (
          <div className="text-destructive text-sm p-3 border border-destructive/30 rounded bg-destructive/5">
            Erro ao carregar dados: {(error as Error).message}
          </div>
        )}

        {isFetching && !data.length && (
          <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-5 w-5 animate-spin" />
            Carregando leads...
          </div>
        )}

        {data.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground font-medium">Filtrar por SLA:</span>
            {([
              { key: "0-5",  label: "0–5 min",  count: slaCounts["0-5"],  cls: "border-green-300 text-green-700 bg-green-50 hover:bg-green-100" },
              { key: "6-30", label: "6–30 min", count: slaCounts["6-30"], cls: "border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100" },
              { key: ">30",  label: ">30 min",  count: slaCounts[">30"],  cls: "border-red-300 text-red-700 bg-red-50 hover:bg-red-100"       },
            ] as const).map(({ key, label, count, cls }) => (
              <button
                key={key}
                onClick={() => setSlaFilter(slaFilter === key ? null : key)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all cursor-pointer ${cls} ${slaFilter === key ? "ring-2 ring-offset-1 ring-current" : "opacity-80"}`}
              >
                {label}
                <span className="font-bold">{count}</span>
              </button>
            ))}
            {slaFilter && (
              <button
                onClick={() => setSlaFilter(null)}
                className="text-xs text-muted-foreground underline hover:text-foreground"
              >
                limpar
              </button>
            )}
          </div>
        )}

        {data.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground font-medium">Filtrar por CRM:</span>
            {([
              { key: "enviado",     label: "Enviado ao CRM",     count: crmCounts.enviado,       cls: "border-green-300 text-green-700 bg-green-50 hover:bg-green-100" },
              { key: "nao-enviado", label: "Não enviado ao CRM", count: crmCounts["nao-enviado"], cls: "border-red-300 text-red-700 bg-red-50 hover:bg-red-100"         },
            ] as const).map(({ key, label, count, cls }) => (
              <button
                key={key}
                onClick={() => setCrmFilter(crmFilter === key ? null : key)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all cursor-pointer ${cls} ${crmFilter === key ? "ring-2 ring-offset-1 ring-current" : "opacity-80"}`}
              >
                {label}
                <span className="font-bold">{count}</span>
              </button>
            ))}
            {crmFilter && (
              <button
                onClick={() => setCrmFilter(null)}
                className="text-xs text-muted-foreground underline hover:text-foreground"
              >
                limpar
              </button>
            )}
          </div>
        )}

        {(activeParams && !isFetching) || data.length > 0 ? (
          <div className="rounded-md border">
            <div className="p-3 border-b">
              <AdvancedTableToolbar
                table={table}
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                resetFilters={resetFilters}
                resetColumnOrder={resetColumnOrder}
                filteredRowCount={filteredRowCount}
                totalRowCount={totalRowCount}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={exportToExcel}
                  disabled={!data.length}
                >
                  <FileDown className="h-3.5 w-3.5" />
                  Exportar Excel
                </Button>
              </AdvancedTableToolbar>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <AdvancedTableHeader
                  table={table}
                  onColumnDrop={handleColumnDrop}
                  enableFacetedFilter={false}
                />
                <AdvancedTableBody
                  table={table}
                  columnCount={columns.length}
                  emptyMessage="Nenhum lead encontrado para o período selecionado."
                />
              </Table>
            </div>
            <div className="p-3 border-t">
              <AdvancedTablePagination table={table} />
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
};

export default Leads;
