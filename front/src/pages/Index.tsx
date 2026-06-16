import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { ReportQueryFilters } from "@/components/ReportQueryFilters";
import { useReportQueryFilters } from "@/hooks/useReportQueryFilters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Users, Send, Sparkles, AlertTriangle,
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from "recharts";
import { fetchLeads } from "@/services/reportsApi";

const TIPO_COLORS: Record<string, string> = {
  HDA: "#CC0000",
  CNH: "#e84040",
  HSF: "#b30000",
  SHB: "#ff6666",
  BHB: "#ff9999",
  HAB: "#8b0000",
  "CS ": "#ffcccc",
  CS: "#ffcccc",
  default: "#d1d5db",
};

const tipoColor = (tipo: string) => TIPO_COLORS[tipo.trim()] ?? TIPO_COLORS.default;

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  sub?: string;
  highlight?: boolean;
  warn?: boolean;
}

const KpiCard = ({ title, value, icon, sub, highlight, warn }: KpiCardProps) => {
  const accent = highlight ? "border-primary/40 bg-primary/5" : warn ? "border-amber-300 bg-amber-50" : "";
  const valColor = highlight ? "text-primary" : warn ? "text-amber-700" : "text-foreground";
  const iconBg = highlight ? "bg-primary/10 text-primary" : warn ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground";
  return (
    <Card className={accent}>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{title}</p>
            <p className={`text-3xl font-bold ${valColor}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
          <div className={`p-2 rounded-lg ${iconBg}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const {
    activeParams,
    applyFilters,
    dateRange,
    setDateRange,
    selectedCodhdas,
    setSelectedCodhdas,
    lojaOptions,
    periodLabel,
  } = useReportQueryFilters();

  const { data = [], isFetching, isError, error } = useQuery({
    queryKey: ["dashboard-leads", activeParams],
    queryFn: () => fetchLeads(activeParams!),
    enabled: !!activeParams,
  });

  // ── KPIs ──────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const total = data.length;
    // RETORNO_ENCAMINHAMENTO preenchido = sistema enviou ao CRM (campo real de integração)
    const encaminhados = data.filter(l => l.RETORNO_ENCAMINHAMENTO).length;
    // QTD_TENTATIVAS = 0 = lead novo, sem tentativa ainda
    const novos = data.filter(l => Number(l.QTD_TENTATIVAS) === 0).length;
    // QTD_TENTATIVAS >= 9 = limite máximo de retentativas, precisa atenção
    const limite = data.filter(l => Number(l.QTD_TENTATIVAS) >= 9).length;
    return { total, encaminhados, novos, limite };
  }, [data]);

  // ── Leads por TIPO ─────────────────────────────────────────────────
  const byTipo = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach(l => {
      const t = l.TIPO?.trim() || "N/A";
      map.set(t, (map.get(t) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({ name, value }));
  }, [data]);

  // ── Leads por Dia ─────────────────────────────────────────────────
  const byDay = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach(l => {
      const day = l.data_criacao_lead?.slice(0, 10) || "";
      if (day) map.set(day, (map.get(day) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dia, total]) => ({ dia: dia.slice(5), total }));
  }, [data]);

  // ── Top Modelos (versao) ───────────────────────────────────────────
  // versao é mais limpo que PRODUTO (que vem com /voudeHonda/48/sem seguro etc.)
  const byModelo = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach(l => {
      const v = l.versao?.trim() || l.PRODUTO?.split("/")[0].trim() || "N/A";
      if (v) map.set(v, (map.get(v) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [data]);

  // ── Distribuição SLA ──────────────────────────────────────────────
  const bySla = useMemo(() => {
    const buckets = { "0–5 min": 0, "6–30 min": 0, ">30 min": 0 };
    data.forEach(l => {
      const m = l.sla_minutos;
      if (m === null || m === undefined || m < 0) return;
      if (m <= 5) buckets["0–5 min"]++;
      else if (m <= 30) buckets["6–30 min"]++;
      else buckets[">30 min"]++;
    });
    return [
      { faixa: "0–5 min",   total: buckets["0–5 min"],   fill: "#ff9999" },
      { faixa: "6–30 min",  total: buckets["6–30 min"],  fill: "#e84040" },
      { faixa: ">30 min",   total: buckets[">30 min"],   fill: "#8b0000" },
    ];
  }, [data]);

  // ── Sub-Origem (mais granular que ORIGEM, sempre "Website Honda") ──
  const bySubOrigem = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach(l => {
      const o = l.SUB_ORIGEM?.trim() || "N/A";
      map.set(o, (map.get(o) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [data]);

  const isLoading = isFetching && data.length === 0;

  return (
    <Layout>
      <div className="p-6 space-y-6">

        {/* Header + filtros */}
        <PageHeader title="Dashboard SAGzap myHonda">
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

        {isError && (
          <div className="text-destructive text-sm p-3 border border-destructive/30 rounded bg-destructive/5">
            Erro ao carregar dados: {(error as Error).message}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-5 w-5 animate-spin" />
            Carregando métricas...
          </div>
        )}

        {!isLoading && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <KpiCard
                title="Total de Leads"
                value={kpis.total.toLocaleString("pt-BR")}
                icon={<Users className="h-5 w-5" />}
                sub={periodLabel}
                highlight
              />
              <KpiCard
                title="Encaminhados ao CRM"
                value={kpis.encaminhados.toLocaleString("pt-BR")}
                icon={<Send className="h-5 w-5" />}
                sub="com retorno de encaminhamento"
              />
              <KpiCard
                title="Leads Novos"
                value={kpis.novos.toLocaleString("pt-BR")}
                icon={<Sparkles className="h-5 w-5" />}
                sub="sem tentativa (QTD = 0)"
              />
            </div>

            {/* Charts row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Donut — por Tipo */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Leads por Tipo</CardTitle>
                </CardHeader>
                <CardContent>
                  {byTipo.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8">Sem dados</p>
                  ) : (
                    <div className="flex items-center gap-4">
                      <ResponsiveContainer width="55%" height={220}>
                        <PieChart>
                          <Pie
                            data={byTipo}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {byTipo.map((entry) => (
                              <Cell key={entry.name} fill={tipoColor(entry.name)} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v: number) => [v, "Leads"]} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-col gap-2 flex-1">
                        {byTipo.map(entry => (
                          <div key={entry.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-sm flex-shrink-0"
                                style={{ backgroundColor: tipoColor(entry.name) }}
                              />
                              <span className="font-medium">{entry.name}</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">{entry.value}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Area — por Dia */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Leads por Dia</CardTitle>
                </CardHeader>
                <CardContent>
                  {byDay.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8">Sem dados</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={byDay} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gradLeads" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#CC0000" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#CC0000" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="dia" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                        <Tooltip formatter={(v: number) => [v, "Leads"]} labelFormatter={(l) => `Dia ${l}`} />
                        <Area
                          type="monotone"
                          dataKey="total"
                          stroke="#CC0000"
                          strokeWidth={2}
                          fill="url(#gradLeads)"
                          dot={false}
                          activeDot={{ r: 4, fill: "#CC0000" }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Charts row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Bar — Top Modelos (versao) */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Top Modelos de Interesse</CardTitle>
                </CardHeader>
                <CardContent>
                  {byModelo.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8">Sem dados</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart
                        data={byModelo}
                        layout="vertical"
                        margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                        <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={130} />
                        <Tooltip formatter={(v: number) => [v, "Leads"]} />
                        <Bar dataKey="value" fill="#CC0000" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Bar — Sub-Origem (mais granular que ORIGEM) */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Canal de Entrada (Sub-Origem)</CardTitle>
                </CardHeader>
                <CardContent>
                  {bySubOrigem.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8">Sem dados</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart
                        data={bySubOrigem}
                        layout="vertical"
                        margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                        <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={160} />
                        <Tooltip formatter={(v: number) => [v, "Leads"]} />
                        <Bar dataKey="value" fill="#b30000" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
            {/* SLA */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Distribuição por SLA (tempo de atendimento)</CardTitle>
              </CardHeader>
              <CardContent>
                {bySla.every(b => b.total === 0) ? (
                  <p className="text-muted-foreground text-sm text-center py-8">Sem dados</p>
                ) : (
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width="55%" height={220}>
                      <PieChart>
                        <Pie
                          data={bySla}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="total"
                          nameKey="faixa"
                        >
                          {bySla.map((entry) => (
                            <Cell key={entry.faixa} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => [v, "Leads"]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col gap-2 flex-1">
                      {bySla.map(entry => (
                        <div key={entry.faixa} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-sm flex-shrink-0"
                              style={{ backgroundColor: entry.fill }}
                            />
                            <span className="font-medium">{entry.faixa}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">{entry.total}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
