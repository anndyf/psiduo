"use client";

import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Frown, Meh, Smile, Moon } from 'lucide-react';

interface Registro {
  data: string | Date;
  humor: number;
  sono: number;
  notas: string | null;
  tags: string[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload.fullData;
    if (!data) return null; // Não mostra tooltip em dias vazios

    const getHumorIcon = (humor: number) => {
        if (humor <= 1) return <Frown size={16} className="text-red-500" strokeWidth={2.5} />;
        if (humor <= 2) return <Frown size={16} className="text-orange-500" />;
        if (humor <= 3) return <Meh size={16} className="text-yellow-500" />;
        if (humor <= 4) return <Smile size={16} className="text-blue-500" />;
        return <Smile size={16} className="text-green-500" strokeWidth={2.5} />;
    };

    return (
      <div className="bg-white p-4 border border-slate-200 shadow-xl rounded-xl max-w-[220px]">
        <p className="font-black text-slate-900 uppercase text-xs mb-3 border-b pb-2">{new Date(data.data).toLocaleDateString('pt-BR')}</p>
        
        <div className="space-y-2 mb-3">
            <div className="flex justify-between items-center text-xs">
                <span className="text-deep font-bold flex items-center gap-1">Humor:</span>
                <span className="flex items-center gap-2 font-bold text-slate-700">
                    {getHumorIcon(data.humor)}
                    Note: {data.humor}/5
                </span>
            </div>
            <div className="flex justify-between items-center text-xs">
                <span className="text-blue-500 font-bold flex items-center gap-1">Sono:</span>
                <span className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                         <Moon key={i} size={10} className={i < data.sono ? "fill-blue-400 text-blue-400" : "text-slate-200"} />
                    ))}
                </span>
            </div>
        </div>

        {data.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
                {data.tags.map((t: string) => (
                    <span key={t} className="px-1.5 py-0.5 bg-slate-100 text-[9px] rounded-md font-bold uppercase text-slate-500 border border-slate-200">{t}</span>
                ))}
            </div>
        )}

        {data.notas && (
            <p className="text-[10px] italic text-slate-500 bg-slate-50 p-2 rounded-lg mt-2 leading-relaxed">"{data.notas}"</p>
        )}
      </div>
    );
  }
  return null;
};

export default function MoodChart({ data, periodo = '7d' }: { data: Registro[], periodo?: '7d' | '30d' | '1y' | 'all' }) {
  
  // Definir título baseado no período
  const titulos = {
    '7d': 'Últimos 7 Dias',
    '30d': 'Termômetro Mensal (30 Dias)',
    '1y': 'Histórico Anual',
    'all': 'Histórico Completo'
  };

  // Lógica de Processamento de Dados
  let formattedData: any[] = [];

  if (periodo === '7d' || periodo === '30d') {
      const diasCount = periodo === '7d' ? 7 : 30;
      
      let dias: string[] = [];
      
      // Helper para tratar datas como UTC puro (evita shift de fuso horário)
      const formatDateUTC = (date: Date) => {
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      if (periodo === '7d') {
          // Ajuste para 7d: Rolling Window (Últimos 7 Dias Consecutivos até Hoje)
          dias = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i)); 
             // Ajuste crucial: Criar data UTC pura para string de comparação
            const utcDate = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
            return formatDateUTC(utcDate);
          });
      } else {
          // Ajuste para 30d: Rolling Window (Últimos 30 dias)
          dias = Array.from({ length: 30 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (29 - i)); 
            const utcDate = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
            return formatDateUTC(utcDate);
          });
      }

      formattedData = dias.map(dataStr => {
        const registro = data.find(d => {
            // Se d.data for Date (do Prisma), usamos UTC para comparar
            // Se for string (ISO), pegamos a parte da data
            let dStr = '';
            if (d.data instanceof Date) {
                 dStr = formatDateUTC(d.data);
            } else {
                 dStr = (d.data as string).split('T')[0];
            }
            return dStr === dataStr;
        });

        // Criar objeto Date tratando fuso horário explicitamente como UTC
        const [ano, mes, dia] = dataStr.split('-').map(Number);
        const dateObj = new Date(Date.UTC(ano, mes - 1, dia + 1)); // +1 pq Date.UTC considera 00:00, mas visualização pode variar. 
        // Correção: Para visualizar certo dia/mes em UTC, basta criar com UTC.
        
        const displayDate = new Date(ano, mes - 1, dia); // Data Local Pura para exibição correta sem shift de toLocaleString

        const diaSemana = displayDate.toLocaleDateString('pt-BR', { weekday: 'short' }); 
        const diaMes = displayDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

        return {
            dataShort: periodo === '7d' ? `${diaSemana} ${diaMes}` : diaMes, // 30d mostra só dia/mês para caber
            humor: registro?.humor || null,
            sono: registro?.sono || null,
            fullData: registro
        };
      });

  } else {
      // Para Ano e Tudo: Mostrar apenas dados existentes (ou todos os dias seria gráfico muito pesado)
      // Ajuste: User pediu "registros de todos os chekins devem ser exibidos"
      // Vamos mostrar os dados brutos ordenados, sem preencher dias vazios (connectNulls já ajuda)
      // Se tiver muitos dados, o scroll horizontal cuida.
      
      formattedData = data.map(d => {
           // Garantir Date object
           const dateObj = d.data instanceof Date ? d.data : new Date(d.data as string);
           
           return {
               dataShort: dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }),
               humor: d.humor,
               sono: d.sono,
               fullData: d
           };
      });
  }

  return (
    <div className="w-full h-[400px] bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
        <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-6 ml-6">{titulos[periodo]}</h3>
        
        {/* Container Scrollável para Mobile */}
        <div className="w-full h-full overflow-x-auto pb-4">
            <div className="min-w-[600px] h-full"> {/* Força largura mínima para não espremer */}
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={formattedData}
                        margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
                    >
                        <CartesianGrid stroke="#f1f5f9" vertical={false} />
                        <XAxis 
                            dataKey="dataShort" 
                            tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 700}} 
                            axisLine={false} 
                            tickLine={false}
                            interval={periodo === '30d' ? 1 : 0} // 30 dias pula 1 label para não encavalar
                        />
                        

                        {/* Eixo Y da Esquerda: Humor (Linha) */}
                        <YAxis 
                            yAxisId="left" 
                            domain={[0, 6]} 
                            ticks={[1,2,3,4,5]} 
                            tick={({ x, y, payload }) => {
                                const val = payload.value;
                                return (
                                    <g transform={`translate(${x - 25},${y - 12})`}>
                                        {val <= 1 && <Frown size={20} className="text-red-500" strokeWidth={2.5} />}
                                        {val === 2 && <Frown size={20} className="text-orange-500" />}
                                        {val === 3 && <Meh size={20} className="text-yellow-500" />}
                                        {val === 4 && <Smile size={20} className="text-blue-500" />}
                                        {val === 5 && <Smile size={20} className="text-green-500" strokeWidth={2.5} />}
                                    </g>
                                );
                            }}
                            axisLine={false}
                            tickLine={false}
                            width={40}
                        />

                        {/* Eixo Y da Direita: Sono (Barra) */}
                        <YAxis 
                            yAxisId="right" 
                            orientation="right" 
                            domain={[0, 6]} 
                            hide 
                        />

                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{fontSize: '10px', textTransform: 'uppercase', fontWeight: 900}} />

                        {/* Barras de Sono (Background) */}
                        <Bar 
                            yAxisId="right" 
                            dataKey="sono" 
                            name="Qualidade do Sono" 
                            barSize={periodo === '7d' ? 40 : 20} // Barras mais finas para períodos longos
                            fill="#bfdbfe" 
                            opacity={0.5} 
                            radius={[8, 8, 0, 0]}
                        />

                        {/* Linha de Humor */}
                        <Line 
                            yAxisId="left" 
                            type="monotone" 
                            dataKey="humor" 
                            name="Humor Geral" 
                            stroke="#0f172a" 
                            strokeWidth={3}
                            dot={{r: 4, fill: '#0f172a', strokeWidth: 0}}
                            activeDot={{r: 6}}
                            connectNulls // Conectar pontos mesmo se houver dias vazios no meio
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );
}
