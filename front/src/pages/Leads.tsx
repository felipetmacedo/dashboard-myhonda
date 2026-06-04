import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { format, isValid, parseISO, differenceInMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
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
import { Table } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
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
    codhdaText,
    setCodhdaText,
    lojaOptions,
    hasStores,
    isAdministrador,
  } = useReportQueryFilters();

  const { data = [], isFetching, isError, error } = useQuery({
    queryKey: ["leads", activeParams],
    queryFn: () => fetchLeads(activeParams!),
    enabled: !!activeParams,
  });

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
    data,
    columns,
    tableId: "leads",
    initialPageSize: 50,
    initialColumnVisibility: HIDDEN_COLUMNS,
  });

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
            codhdaText={codhdaText}
            onCodhdaTextChange={setCodhdaText}
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
              />
            </div>
            <div className="overflow-x-auto">
              <Table>
                <AdvancedTableHeader
                  table={table}
                  onColumnDrop={handleColumnDrop}
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
