"use client";

import { useState, useMemo } from "react";
import {
  ComposedChart, Line, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Area
} from 'recharts';
import { Frown, Meh, Smile, Moon, TrendingUp } from 'lucide-react';

interface Registro {
  data: string | Date;
  humor: number;
  sono: number;
  notas?: string | null;
  tags?: string[];
}

type Periodo = '7d' | '15d' | '30d' | 'all';

const PERIODOS: { key: Periodo; label: string }[] = [
  { key: '7d',  label: '7 dias'  },
  { key: '15d', label: '15 dias' },
  { key: '30d', label: '30 dias' },
  { key: 'all', label: 'Tudo'    },
];

const HUMOR_LABELS: Record<number, string> = {
  1: 'Péssimo', 2: 'Ruim', 3: 'Neutro', 4: 'Bom', 5: 'Ótimo'
};

// ─── Tooltip customizado ──────────────────────────────────────────────────
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload?.fullData;
  if (!d) return null;

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
        {new Date(d.data).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}
      </p>
      <div className="space-y-1.5">
        <div className="flex justify-between items-center gap-4">
          <span className="text-slate-400 font-medium">Humor</span>
          <span className="flex items-center gap-1.5 font-medium text-slate-700">
            {getIcon(d.humor)} {HUMOR_LABELS[d.humor] ?? d.humor}
          </span>
        </div>
        <div className="flex justify-between items-center gap-4">
          <span className="text-slate-400 font-medium">Sono</span>
          <span className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Moon key={i} size={9} className={i < d.sono ? "fill-deep text-deep" : "text-slate-200"} />
            ))}
            <span className="text-slate-500 ml-1">{d.sono}h</span>
          </span>
        </div>
        {d.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {d.tags.map((t: string) => (
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
      {v === 4 && <Smile size={18} className="text-slate-400"               />}
      {v === 5 && <Smile size={18} className="text-emerald-400" strokeWidth={2} />}
    </g>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────
const toUTCStr = (d: Date | string): string => {
  const dt = d instanceof Date ? d : new Date(d);
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;
};

const buildDaySlots = (count: number) =>
  Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (count - 1 - i));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

// ─── Componente principal ─────────────────────────────────────────────────
export default function MoodChart({ data }: { data: Registro[] }) {
  const [periodo, setPeriodo] = useState<Periodo>('7d');

  const chartData = useMemo(() => {
    if (periodo === 'all') {
      // Mostra todos os registros existentes
      return [...data]
        .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
        .map(d => {
          const dt = d.data instanceof Date ? d.data : new Date(d.data);
          return {
            dataShort: dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }),
            humor: d.humor,
            sono: d.sono,
            fullData: d,
          };
        });
    }

    const count = periodo === '7d' ? 7 : periodo === '15d' ? 15 : 30;
    const slots = buildDaySlots(count);

    return slots.map(slot => {
      const reg = data.find(d => toUTCStr(d.data) === slot);
      const [y, m, day] = slot.split('-').map(Number);
      const dt = new Date(y, m - 1, day);
      const diaSemana = dt.toLocaleDateString('pt-BR', { weekday: 'short' });
      const diaMes    = dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

      return {
        dataShort: count === 7 ? `${diaSemana} ${diaMes}` : diaMes,
        humor: reg?.humor ?? null,
        sono:  reg?.sono  ?? null,
        fullData: reg ?? null,
      };
    });
  }, [data, periodo]);

  const hasData = data.length > 0;
  const barSize = periodo === '7d' ? 28 : periodo === '15d' ? 16 : 10;
  const xInterval = periodo === '30d' ? 1 : 0;

  return (
    <div className="w-full">
      {/* Filtros de período */}
      <div className="flex items-center gap-1 mb-5">
        {PERIODOS.map(p => (
          <button
            key={p.key}
            onClick={() => setPeriodo(p.key)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-medium uppercase tracking-wide transition-all border ${
              periodo === p.key
                ? 'bg-deep text-white border-deep shadow-sm'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-deep'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Gráfico */}
      {!hasData ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
          <TrendingUp size={28} className="mb-2 opacity-40" strokeWidth={1.5} />
          <p className="text-xs font-medium text-slate-400">Sem registros ainda</p>
          <p className="text-[10px] text-slate-300 mt-1">Os dados aparecerão aqui conforme o paciente preencher o diário</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <div style={{ minWidth: periodo === 'all' && data.length > 15 ? data.length * 40 : 500 }} className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 16, bottom: 10, left: 10 }}>
                <defs>
                  <linearGradient id="humorGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%"   stopColor="#0B1E3B" stopOpacity={1} />
                    <stop offset="100%" stopColor="#64748b" stopOpacity={1} />
                  </linearGradient>
                  <linearGradient id="sonoFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#e2e8f0" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#f8fafc" stopOpacity={0.2} />
                  </linearGradient>
                </defs>

                <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" vertical={false} />

                <XAxis
                  dataKey="dataShort"
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  interval={xInterval}
                />

                {/* Eixo Y Humor (esquerda) — emojis */}
                <YAxis
                  yAxisId="left"
                  domain={[0, 6]}
                  ticks={[1, 2, 3, 4, 5]}
                  tick={<CustomYTick />}
                  axisLine={false}
                  tickLine={false}
                  width={38}
                />

                {/* Eixo Y Sono (direita) — oculto */}
                <YAxis yAxisId="right" orientation="right" domain={[0, 10]} hide />

                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', radius: 8 }} />

                {/* Barras de sono */}
                <Bar
                  yAxisId="right"
                  dataKey="sono"
                  name="Sono"
                  barSize={barSize}
                  fill="url(#sonoFill)"
                  stroke="#e2e8f0"
                  strokeWidth={1}
                  radius={[4, 4, 0, 0]}
                />

                {/* Área sob a linha de humor */}
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="humor"
                  stroke="none"
                  fill="#0B1E3B"
                  fillOpacity={0.04}
                  connectNulls
                />

                {/* Linha de humor */}
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="humor"
                  name="Humor"
                  stroke="url(#humorGrad)"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#fff', stroke: '#0B1E3B', strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#0B1E3B' }}
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Legenda */}
      {hasData && (
        <div className="flex items-center gap-5 mt-3 ml-10">
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
            <div className="w-5 h-0.5 bg-gradient-to-r from-deep to-slate-400 rounded-full" />
            Humor
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
            <div className="w-4 h-3 bg-slate-200 rounded-sm" />
            Sono
          </div>
        </div>
      )}
    </div>
  );
}
