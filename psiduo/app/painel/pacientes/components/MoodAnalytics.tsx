"use client";

import { useState, useMemo } from "react";
import {
  ComposedChart, Line, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Area, ReferenceLine
} from "recharts";
import {
  Frown, Meh, Smile, Moon, TrendingUp, TrendingDown,
  Minus, BarChart2, CalendarDays, Sparkles,
  ArrowLeft, ArrowRight, Brain, AlertTriangle, CheckCircle2
} from "lucide-react";

interface Registro {
  data: string | Date;
  humor: number;
  sono: number;
  notas?: string | null;
  tags?: string[];
}

type Aba = "grafico" | "calendario" | "ia";
type Periodo = "7d" | "15d" | "30d" | "all";

const PERIODOS: { key: Periodo; label: string }[] = [
  { key: "7d",  label: "7 dias"  },
  { key: "15d", label: "15 dias" },
  { key: "30d", label: "30 dias" },
  { key: "all", label: "Tudo"    },
];

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const HUMOR_LABELS: Record<number, string> = {
  1: "Péssimo", 2: "Ruim", 3: "Neutro", 4: "Bom", 5: "Ótimo",
};

// ─── Helpers ──────────────────────────────────────────────────────────────
const toLocalISO = (d: Date | string) => {
  let dt: Date;
  if (typeof d === 'string' && d.includes('T')) {
    // Se vier como ISO (do DB), pegamos apenas a parte da data para evitar deslocamento de fuso
    const [datePart] = d.split('T');
    const [y, m, day] = datePart.split('-').map(Number);
    dt = new Date(y, m - 1, day);
  } else {
    dt = d instanceof Date ? d : new Date(d);
  }
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
};

const buildDaySlots = (count: number) =>
  Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (count - 1 - i));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });

// ─── Regressão linear simples ─────────────────────────────────────────────
function linearRegression(points: { x: number; y: number }[]) {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: points[0]?.y ?? 3, r2: 0 };
  const sumX  = points.reduce((s, p) => s + p.x, 0);
  const sumY  = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const meanY = sumY / n;
  const ssTot = points.reduce((s, p) => s + (p.y - meanY) ** 2, 0);
  const ssRes = points.reduce((s, p) => s + (p.y - (slope * p.x + intercept)) ** 2, 0);
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
  return { slope, intercept, r2 };
}

// ─── Tooltip do gráfico ───────────────────────────────────────────────────
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d?.fullData && !d?.previsao) return null;

  if (d.previsao) {
    return (
      <div className="bg-deep text-white border border-slate-800 shadow-xl rounded-xl p-3 text-xs max-w-[180px]">
        <p className="font-medium mb-1 opacity-70">Previsão IA</p>
        <p className="font-medium">{d.dataShort}</p>
        <p className="text-slate-300 mt-1">Humor estimado: <span className="text-white font-medium">{d.humor?.toFixed(1)}</span></p>
      </div>
    );
  }

  const rec = d.fullData;
  const getIcon = (h: number) => {
    if (h <= 1) return <Frown size={14} className="text-red-400" strokeWidth={2} />;
    if (h <= 2) return <Frown size={14} className="text-orange-400" />;
    if (h <= 3) return <Meh  size={14} className="text-yellow-400" />;
    if (h <= 4) return <Smile size={14} className="text-deep" />;
    return <Smile size={14} className="text-emerald-500" strokeWidth={2} />;
  };

  return (
    <div className="bg-white border border-slate-100 shadow-xl rounded-xl p-3 text-xs max-w-[200px]">
      <p className="font-medium text-slate-700 mb-2 pb-1.5 border-b border-slate-50">
        {new Date(rec.data).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" })}
      </p>
      <div className="space-y-1.5">
        <div className="flex justify-between items-center gap-4">
          <span className="text-slate-400">Humor</span>
          <span className="flex items-center gap-1.5 font-medium text-slate-700">
            {getIcon(rec.humor)} {HUMOR_LABELS[rec.humor] ?? rec.humor}
          </span>
        </div>
        <div className="flex justify-between items-center gap-4">
          <span className="text-slate-400">Sono</span>
          <span className="flex items-center gap-1">
            <span className={`font-medium ${
                rec.sono >= 4 ? 'text-emerald-500' :
                rec.sono === 3 ? 'text-yellow-500' :
                'text-red-400'
            }`}>
                {rec.sono === 5 ? 'Ótimo' : rec.sono === 4 ? 'Bom' : rec.sono === 3 ? 'Regular' : rec.sono === 2 ? 'Ruim' : 'Péssimo'}
            </span>
          </span>
        </div>
        {rec.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {rec.tags.map((t: string) => (
              <span key={t} className="px-1.5 py-0.5 bg-slate-50 rounded text-[10px] text-slate-500 border border-slate-100">{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Eixo Y com emojis ────────────────────────────────────────────────────
const CustomYTick = ({ x, y, payload }: any) => {
  const v = payload.value;
  return (
    <g transform={`translate(${x - 26},${y - 10})`}>
      {v === 1 && <Frown size={18} className="text-red-300"     strokeWidth={2} />}
      {v === 2 && <Frown size={18} className="text-orange-300"              />}
      {v === 3 && <Meh   size={18} className="text-yellow-300"             />}
      {v === 4 && <Smile size={18} className="text-slate-300"               />}
      {v === 5 && <Smile size={18} className="text-emerald-400" strokeWidth={2} />}
    </g>
  );
};

// ─── Componente Principal ─────────────────────────────────────────────────
export default function MoodAnalytics({ data }: { data: Registro[] }) {
  const [aba, setAba] = useState<Aba>("grafico");
  const [periodo, setPeriodo] = useState<Periodo>("30d");
  const [mesCalendario, setMesCalendario] = useState(new Date());
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  // ── Dados ordenados por data ──────────────────────────────────────────
  const registrosOrdenados = useMemo(
    () => [...data].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()),
    [data]
  );

  // ── Análise de IA ─────────────────────────────────────────────────────
  const analiseIA = useMemo(() => {
    if (registrosOrdenados.length < 3) return null;

    const pontos = registrosOrdenados.map((r, i) => ({
      x: i,
      y: r.humor,
      data: r.data,
      sono: r.sono,
    }));

    const { slope, intercept, r2 } = linearRegression(pontos);

    // Tendência geral
    const tendencia =
      slope > 0.05 ? "melhora" :
      slope < -0.05 ? "piora" : "estavel";

    // Previsão próximos 7 dias
    const ultimoIdx = pontos.length - 1;
    const previsoes = Array.from({ length: 7 }, (_, i) => {
      const xFuturo = ultimoIdx + i + 1;
      const humorPrevisto = Math.min(5, Math.max(1, slope * xFuturo + intercept));
      const dataFutura = new Date();
      dataFutura.setDate(dataFutura.getDate() + i + 1);
      return {
        data: dataFutura,
        humor: parseFloat(humorPrevisto.toFixed(2)),
        previsao: true,
      };
    });

    // Padrão por dia da semana
    const porDiaSemana: Record<number, number[]> = {};
    registrosOrdenados.forEach(r => {
      const dia = new Date(r.data).getDay();
      if (!porDiaSemana[dia]) porDiaSemana[dia] = [];
      porDiaSemana[dia].push(r.humor);
    });
    const mediaPorDia = Object.entries(porDiaSemana).map(([dia, humores]) => ({
      dia: parseInt(dia),
      media: humores.reduce((s, h) => s + h, 0) / humores.length,
      count: humores.length,
    })).sort((a, b) => b.media - a.media);

    // Melhor e pior dia
    const melhorDia = mediaPorDia[0];
    const piorDia   = mediaPorDia[mediaPorDia.length - 1];

    // Correlação humor × sono
    const n = pontos.length;
    const mediaHumor = pontos.reduce((s, p) => s + p.y, 0) / n;
    const mediaSono  = pontos.reduce((s, p) => s + p.sono, 0) / n;
    const cov = pontos.reduce((s, p) => s + (p.y - mediaHumor) * (p.sono - mediaSono), 0) / n;
    const stdH = Math.sqrt(pontos.reduce((s, p) => s + (p.y - mediaHumor) ** 2, 0) / n);
    const stdS = Math.sqrt(pontos.reduce((s, p) => s + (p.sono - mediaSono) ** 2, 0) / n);
    const correlacaoSono = stdH * stdS === 0 ? 0 : cov / (stdH * stdS);

    // Variabilidade (desvio padrão do humor)
    const variabilidade = stdH;

    // Média últimos 7 vs anteriores
    const ultimos7 = registrosOrdenados.slice(-7).map(r => r.humor);
    const anteriores = registrosOrdenados.slice(-14, -7).map(r => r.humor);
    const mediaUlt7 = ultimos7.length ? ultimos7.reduce((s, h) => s + h, 0) / ultimos7.length : null;
    const mediaAnt  = anteriores.length ? anteriores.reduce((s, h) => s + h, 0) / anteriores.length : null;
    const variacaoSemana = mediaUlt7 && mediaAnt ? mediaUlt7 - mediaAnt : null;

    return {
      slope, r2, tendencia, previsoes,
      melhorDia, piorDia, mediaPorDia,
      correlacaoSono, variabilidade,
      mediaUlt7, mediaAnt, variacaoSemana,
      totalRegistros: registrosOrdenados.length,
    };
  }, [registrosOrdenados]);

  // ── Dados do gráfico ──────────────────────────────────────────────────
  const chartData = useMemo(() => {
    const historico = (() => {
      if (periodo === "all") {
        return registrosOrdenados.map(d => {
          const dt = new Date(toLocalISO(d.data) + 'T12:00:00');
          return {
            dataShort: dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
            humor: d.humor,
            sono: d.sono,
            fullData: d,
            previsao: false,
          };
        });
      }
      const count = periodo === "7d" ? 7 : periodo === "15d" ? 15 : 30;
      return buildDaySlots(count).map(slot => {
        const reg = data.find(d => toLocalISO(d.data) === slot);
        const [y, m, day] = slot.split("-").map(Number);
        const dt = new Date(Date.UTC(y, m - 1, day, 12, 0, 0));
        return {
          dataShort: count === 7
            ? `${dt.toLocaleDateString("pt-BR", { weekday: "short", timeZone: 'UTC' })} ${dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: 'UTC' })}`
            : dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: 'UTC' }),
          humor: reg?.humor ?? null,
          sono:  reg?.sono  ?? null,
          fullData: reg ?? null,
          previsao: false,
        };
      });
    })();

    // Adiciona previsão ao final (só quando "all" ou "30d")
    if (analiseIA && (periodo === "all" || periodo === "30d")) {
      const prev = analiseIA.previsoes.map(p => ({
        dataShort: new Date(p.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        humor: p.humor,
        sono: null,
        fullData: null,
        previsao: true,
      }));
      return [...historico, ...prev];
    }
    return historico;
  }, [data, periodo, analiseIA, registrosOrdenados]);

  // ── Calendário ────────────────────────────────────────────────────────
  const daysInMonth = useMemo(() => {
    const y = mesCalendario.getFullYear();
    const m = mesCalendario.getMonth();
    return Array.from({ length: new Date(y, m + 1, 0).getDate() }, (_, i) => i + 1);
  }, [mesCalendario]);

  const getRegistroDia = (day: number) =>
    data.find(r => {
      const rd = new Date(r.data);
      return rd.getDate() === day &&
             rd.getMonth() === mesCalendario.getMonth() &&
             rd.getFullYear() === mesCalendario.getFullYear();
    });

  const hasData = data.length > 0;
  const barSize = periodo === "7d" ? 28 : periodo === "15d" ? 16 : 10;

  return (
    <div className="bg-white rounded-[1.5rem] border border-slate-200 overflow-hidden shadow-sm">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="px-6 pt-5 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-medium text-slate-900 tracking-tight">Análise de Humor & Bem-Estar</h3>
            <p className="text-xs font-normal text-slate-400 mt-0.5">
              {hasData ? `${data.length} registro${data.length !== 1 ? "s" : ""} no total` : "Sem registros ainda"}
            </p>
          </div>
        </div>

        {/* Abas */}
        <div className="flex gap-1 border-b border-slate-100">
          {[
            { key: "grafico",    icon: BarChart2,   label: "Gráfico"    },
            { key: "calendario", icon: CalendarDays, label: "Calendário" },
            { key: "ia",         icon: Sparkles,     label: "IA & Tendências" },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setAba(key as Aba)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-all -mb-px ${
                aba === key
                  ? "border-deep text-deep"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* ── ABA: GRÁFICO ─────────────────────────────────────────── */}
        {aba === "grafico" && (
          <div>
            {/* Filtros de período */}
            <div className="flex items-center gap-1 mb-5">
              {PERIODOS.map(p => (
                <button
                  key={p.key}
                  onClick={() => setPeriodo(p.key)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-medium uppercase tracking-wide transition-all border ${
                    periodo === p.key
                      ? "bg-deep text-white border-deep shadow-sm"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-deep"
                  }`}
                >
                  {p.label}
                </button>
              ))}
              {analiseIA && (periodo === "all" || periodo === "30d") && (
                <span className="ml-2 flex items-center gap-1 text-[10px] text-deep font-medium">
                  <Sparkles size={10} /> previsão incluída
                </span>
              )}
            </div>

            {!hasData ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                <TrendingUp size={28} className="mb-2 opacity-40" strokeWidth={1.5} />
                <p className="text-xs font-medium text-slate-400">Sem registros ainda</p>
                <p className="text-[10px] text-slate-300 mt-1">Os dados aparecerão aqui conforme o paciente preencher o diário</p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <div style={{ minWidth: periodo === "all" && data.length > 15 ? data.length * 40 + 280 : 500 }} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 10, right: 16, bottom: 10, left: 10 }}>
                      <defs>
                        <linearGradient id="humorGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%"   stopColor="#0B1E3B" stopOpacity={1} />
                          <stop offset="100%" stopColor="#64748b" stopOpacity={1} />
                        </linearGradient>
                        <linearGradient id="previsaoGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%"   stopColor="#0B1E3B" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="#64748b" stopOpacity={0.5} />
                        </linearGradient>
                        <linearGradient id="sonoFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor="#e2e8f0" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#f8fafc" stopOpacity={0.2} />
                        </linearGradient>
                      </defs>

                      <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" vertical={false} />
                      <XAxis
                        dataKey="dataShort"
                        tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 500 }}
                        axisLine={false} tickLine={false}
                        interval={periodo === "30d" ? 1 : 0}
                      />
                      <YAxis yAxisId="left" domain={[0, 6]} ticks={[1,2,3,4,5]} tick={<CustomYTick />} axisLine={false} tickLine={false} width={38} />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 6]} hide />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc", radius: 8 }} />

                      {/* Linha divisória entre histórico e previsão */}
                      {analiseIA && (periodo === "all" || periodo === "30d") && (
                        <ReferenceLine
                          yAxisId="left"
                          x={chartData.findIndex(d => d.previsao) > 0
                            ? chartData[chartData.findIndex(d => d.previsao) - 1]?.dataShort
                            : undefined}
                          stroke="#0B1E3B"
                          strokeDasharray="4 4"
                          label={{ value: "hoje", position: "top", fontSize: 9, fill: "#0B1E3B" }}
                        />
                      )}

                      <Bar yAxisId="right" dataKey="sono" name="Qualidade do Sono" barSize={barSize}
                        fill="url(#sonoFill)" stroke="#e2e8f0" strokeWidth={1} radius={[4,4,0,0]} />

                      <Area yAxisId="left" type="monotone" dataKey="humor"
                        stroke="none" fill="#0B1E3B" fillOpacity={0.04} connectNulls />

                      {/* Linha histórico */}
                      <Line
                        yAxisId="left" type="monotone" dataKey="humor" name="Humor"
                        stroke="url(#humorGrad)" strokeWidth={2.5}
                        dot={(props: any) => {
                          if (props.payload?.previsao) return <g key={props.key} />;
                          if (props.payload?.humor == null) return <g key={props.key} />;
                          return <circle key={props.key} cx={props.cx} cy={props.cy} r={4} fill="#fff" stroke="#0B1E3B" strokeWidth={2} />;
                        }}
                        activeDot={{ r: 6, strokeWidth: 0, fill: "#0B1E3B" }}
                        connectNulls
                      />

                      {/* Linha de previsão (pontilhada) */}
                      {analiseIA && (periodo === "all" || periodo === "30d") && (
                        <Line
                          yAxisId="left" type="monotone" dataKey={(d: any) => d.previsao ? d.humor : null}
                          name="Previsão IA"
                          stroke="#0B1E3B" strokeWidth={2} strokeDasharray="5 4"
                          dot={{ r: 3, fill: "#0B1E3B", stroke: "#fff", strokeWidth: 1.5 }}
                          connectNulls
                        />
                      )}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {hasData && (
              <div className="flex items-center gap-5 mt-3 ml-10">
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                  <div className="w-5 h-0.5 bg-gradient-to-r from-deep to-slate-400 rounded-full" />
                  Humor
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                  <div className="w-4 h-3 bg-slate-200 rounded-sm" />
                  Qualidade do Sono
                </div>
                {analiseIA && (periodo === "all" || periodo === "30d") && (
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                    <div className="w-5 h-0.5 border-t-2 border-dashed border-slate-400" />
                    Previsão IA
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── ABA: CALENDÁRIO ──────────────────────────────────────── */}
        {aba === "calendario" && (
          <div>
            {/* Navegação de mês */}
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={() => setMesCalendario(new Date(mesCalendario.getFullYear(), mesCalendario.getMonth() - 1, 1))}
                className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <ArrowLeft size={16} />
              </button>
              <span className="text-sm font-medium text-slate-700 capitalize">
                {mesCalendario.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
              </span>
              <button
                onClick={() => setMesCalendario(new Date(mesCalendario.getFullYear(), mesCalendario.getMonth() + 1, 1))}
                className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="border border-slate-100 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <div className="min-w-fit">
                  {/* Cabeçalho */}
                  <div className="flex border-b border-slate-100">
                    <div className="sticky left-0 z-10 bg-slate-50 min-w-[160px] px-4 py-2 text-[10px] font-medium text-slate-400 uppercase tracking-widest border-r border-slate-100">
                      Indicador
                    </div>
                    <div className="grid flex-1" style={{ gridTemplateColumns: `repeat(${daysInMonth.length}, 44px)` }}>
                      {daysInMonth.map(d => {
                        const dt = new Date(mesCalendario.getFullYear(), mesCalendario.getMonth(), d);
                        return (
                          <div
                            key={d}
                            onMouseEnter={() => setHoveredDay(d)}
                            onMouseLeave={() => setHoveredDay(null)}
                            className={`flex flex-col items-center py-2 border-r border-slate-50 last:border-r-0 transition-colors ${hoveredDay === d ? "bg-slate-50" : ""}`}
                          >
                            <span className="text-[8px] font-medium text-slate-300 uppercase">
                              {dt.toLocaleDateString("pt-BR", { weekday: "short" }).slice(0, 3).replace(".", "")}
                            </span>
                            <span className="text-[10px] font-medium text-slate-500">{d}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Linha Humor */}
                  {[
                    { label: "Humor Geral", icon: <Smile size={13} className="text-deep" />, tipo: "humor" },
                    { label: "Qualidade Sono", icon: <Moon size={13} className="text-slate-500" />, tipo: "sono" },
                  ].map(({ label, icon, tipo }) => (
                    <div key={tipo} className="flex border-b border-slate-50 last:border-b-0 group">
                      <div className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 min-w-[160px] flex items-center gap-2 px-4 py-3 border-r border-slate-100 transition-colors">
                        <div className="flex items-center gap-2 bg-slate-50 group-hover:bg-white px-2.5 py-1.5 rounded-lg border border-slate-100 transition-colors">
                          {icon}
                          <span className="text-[9px] font-medium text-slate-600 uppercase tracking-tight">{label}</span>
                        </div>
                      </div>
                      <div className="grid flex-1" style={{ gridTemplateColumns: `repeat(${daysInMonth.length}, 44px)` }}>
                        {daysInMonth.map(d => {
                          const rec = getRegistroDia(d);
                          return (
                            <div
                              key={d}
                              onMouseEnter={() => setHoveredDay(d)}
                              onMouseLeave={() => setHoveredDay(null)}
                              className={`flex items-center justify-center h-12 border-r border-slate-50 last:border-r-0 transition-colors ${hoveredDay === d ? "bg-slate-100" : "hover:bg-slate-50"}`}
                            >
                              {rec ? (
                                tipo === "humor" ? (
                                  rec.humor <= 1 ? <Frown size={14} className="text-red-500" strokeWidth={2} /> :
                                  rec.humor <= 2 ? <Frown size={14} className="text-orange-500" /> :
                                  rec.humor <= 3 ? <Meh   size={14} className="text-yellow-500" /> :
                                  rec.humor <= 4 ? <Smile size={14} className="text-deep" /> :
                                                   <Smile size={14} className="text-emerald-500" strokeWidth={2} />
                                ) : (
                                  <span className={`text-[10px] font-medium ${
                                    rec.sono >= 4 ? "text-emerald-500" :
                                    rec.sono === 3 ? "text-yellow-500" : "text-red-400"
                                  }`}>
                                      {rec.sono === 5 ? 'Ótimo' : rec.sono === 4 ? 'Bom' : rec.sono === 3 ? 'Regular' : rec.sono === 2 ? 'Ruim' : 'Péssimo'}
                                  </span>
                                )
                              ) : (
                                <div className="w-1 h-1 bg-slate-200 rounded-full" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Legenda */}
            <div className="flex items-center gap-4 mt-4 flex-wrap">
              {[
                { color: "bg-emerald-500", label: "Positivo (4-5)" },
                { color: "bg-yellow-400",  label: "Neutro (3)"     },
                { color: "bg-red-400",     label: "Atenção (1-2)"  },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ABA: IA & TENDÊNCIAS ─────────────────────────────────── */}
        {aba === "ia" && (
          <div>
            {!analiseIA ? (
              <div className="py-12 text-center">
                <Brain size={32} className="mx-auto mb-3 text-slate-200" strokeWidth={1.5} />
                <p className="text-sm font-medium text-slate-400">Dados insuficientes</p>
                <p className="text-xs text-slate-300 mt-1">São necessários pelo menos 3 registros para gerar análises.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Tendência geral */}
                <div className={`p-4 rounded-2xl border flex items-start gap-4 ${
                  analiseIA.tendencia === "melhora" ? "bg-emerald-50 border-emerald-100" :
                  analiseIA.tendencia === "piora"   ? "bg-red-50 border-red-100" :
                                                      "bg-slate-50 border-slate-100"
                }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    analiseIA.tendencia === "melhora" ? "bg-emerald-100 text-emerald-600" :
                    analiseIA.tendencia === "piora"   ? "bg-red-100 text-red-500" :
                                                        "bg-slate-100 text-slate-500"
                  }`}>
                    {analiseIA.tendencia === "melhora" ? <TrendingUp size={18} /> :
                     analiseIA.tendencia === "piora"   ? <TrendingDown size={18} /> :
                                                         <Minus size={18} />}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">Tendência Geral</p>
                    <p className="text-sm font-medium text-slate-800">
                      {analiseIA.tendencia === "melhora" ? "Humor em melhora progressiva" :
                       analiseIA.tendencia === "piora"   ? "Humor em queda — atenção recomendada" :
                                                           "Humor estável ao longo do tempo"}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Variação média: {analiseIA.slope > 0 ? "+" : ""}{(analiseIA.slope * 10).toFixed(1)} pontos por 10 registros
                      {" · "}Confiança: {Math.round(analiseIA.r2 * 100)}%
                    </p>
                  </div>
                </div>

                {/* Grid de métricas */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {/* Variação semanal */}
                  {analiseIA.variacaoSemana !== null && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mb-1">Últimos 7 dias</p>
                      <p className={`text-xl font-medium ${
                        analiseIA.variacaoSemana > 0 ? "text-emerald-600" :
                        analiseIA.variacaoSemana < 0 ? "text-red-500" : "text-slate-600"
                      }`}>
                        {analiseIA.variacaoSemana > 0 ? "+" : ""}{analiseIA.variacaoSemana.toFixed(1)}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">vs semana anterior</p>
                    </div>
                  )}

                  {/* Correlação sono */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mb-1">Sono × Humor</p>
                    <p className={`text-xl font-medium ${
                      analiseIA.correlacaoSono > 0.3 ? "text-emerald-600" :
                      analiseIA.correlacaoSono < -0.3 ? "text-red-500" : "text-slate-600"
                    }`}>
                      {(analiseIA.correlacaoSono * 100).toFixed(0)}%
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {analiseIA.correlacaoSono > 0.3 ? "Qualidade do sono impacta humor" :
                       analiseIA.correlacaoSono < -0.3 ? "Correlação inversa" : "Correlação fraca"}
                    </p>
                  </div>

                  {/* Variabilidade */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mb-1">Variabilidade</p>
                    <p className={`text-xl font-medium ${
                      analiseIA.variabilidade < 0.8 ? "text-emerald-600" :
                      analiseIA.variabilidade > 1.5 ? "text-amber-500" : "text-slate-600"
                    }`}>
                      {analiseIA.variabilidade.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {analiseIA.variabilidade < 0.8 ? "Humor consistente" :
                       analiseIA.variabilidade > 1.5 ? "Alta oscilação emocional" : "Oscilação moderada"}
                    </p>
                  </div>
                </div>

                {/* Padrão por dia da semana */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mb-3">Humor por Dia da Semana</p>
                  <div className="grid grid-cols-7 gap-1.5">
                    {[0,1,2,3,4,5,6].map(dia => {
                      const info = analiseIA.mediaPorDia.find(d => d.dia === dia);
                      const media = info?.media ?? null;
                      const isMelhor = analiseIA.melhorDia?.dia === dia;
                      const isPior  = analiseIA.piorDia?.dia === dia;
                      return (
                        <div key={dia} className="flex flex-col items-center gap-1">
                          <span className="text-[9px] font-medium text-slate-400 uppercase">{DIAS_SEMANA[dia]}</span>
                          <div className={`w-full aspect-square rounded-xl flex items-center justify-center text-xs font-medium border transition-all ${
                            media === null ? "bg-white border-slate-100 text-slate-200" :
                            isMelhor ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                            isPior   ? "bg-red-50 border-red-200 text-red-500" :
                                       "bg-white border-slate-200 text-slate-600"
                          }`}>
                            {media !== null ? media.toFixed(1) : "–"}
                          </div>
                          {isMelhor && <span className="text-[8px] text-emerald-500 font-medium">melhor</span>}
                          {isPior   && <span className="text-[8px] text-red-400 font-medium">atenção</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Previsão próximos 7 dias */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={14} className="text-deep" />
                    <p className="text-[10px] font-medium text-deep uppercase tracking-wide">Previsão — Próximos 7 Dias</p>
                  </div>
                  <div className="grid grid-cols-7 gap-1.5">
                    {analiseIA.previsoes.map((p, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <span className="text-[9px] font-medium text-slate-400 uppercase">
                          {new Date(p.data).toLocaleDateString("pt-BR", { weekday: "short" }).slice(0,3).replace(".","")}
                        </span>
                        <div className={`w-full aspect-square rounded-xl flex items-center justify-center text-xs font-medium border ${
                          p.humor >= 4 ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                          p.humor <= 2 ? "bg-red-50 border-red-200 text-red-500" :
                                         "bg-white border-slate-100 text-slate-700"
                        }`}>
                          {p.humor.toFixed(1)}
                        </div>
                        <span className="text-[8px] text-slate-300">
                          {new Date(p.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-3 italic">
                    * Previsão baseada em regressão linear dos registros históricos. Confiança: {Math.round(analiseIA.r2 * 100)}%
                  </p>
                </div>

                {/* Insights */}
                <div className="space-y-2">
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Insights Clínicos</p>
                  {[
                    analiseIA.correlacaoSono > 0.4 && {
                      tipo: "positivo",
                      texto: `Qualidade do sono e humor têm forte correlação positiva (${(analiseIA.correlacaoSono * 100).toFixed(0)}%). Melhorar a qualidade do sono pode impactar diretamente o bem-estar.`,
                    },
                    analiseIA.variabilidade > 1.5 && {
                      tipo: "atencao",
                      texto: `Alta variabilidade emocional detectada (σ=${analiseIA.variabilidade.toFixed(2)}). Pode indicar instabilidade de humor que merece atenção clínica.`,
                    },
                    analiseIA.melhorDia && analiseIA.piorDia && {
                      tipo: "info",
                      texto: `Padrão semanal: ${DIAS_SEMANA[analiseIA.melhorDia.dia]} tende a ser o melhor dia (média ${analiseIA.melhorDia.media.toFixed(1)}), enquanto ${DIAS_SEMANA[analiseIA.piorDia.dia]} é o mais difícil (média ${analiseIA.piorDia.media.toFixed(1)}).`,
                    },
                    analiseIA.tendencia === "piora" && {
                      tipo: "atencao",
                      texto: "Tendência de queda no humor nas últimas semanas. Considere revisar o plano terapêutico.",
                    },
                  ].filter(Boolean).map((insight: any, i) => (
                    <div key={i} className={`flex items-start gap-3 p-3 rounded-xl text-xs ${
                      insight.tipo === "positivo" ? "bg-emerald-50 text-emerald-700" :
                      insight.tipo === "atencao"  ? "bg-amber-50 text-amber-700" :
                                                    "bg-slate-50 text-slate-600"
                    }`}>
                      {insight.tipo === "positivo" ? <CheckCircle2 size={14} className="shrink-0 mt-0.5" /> :
                       insight.tipo === "atencao"  ? <AlertTriangle size={14} className="shrink-0 mt-0.5" /> :
                                                     <Brain size={14} className="shrink-0 mt-0.5" />}
                      <p className="font-normal leading-relaxed">{insight.texto}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
