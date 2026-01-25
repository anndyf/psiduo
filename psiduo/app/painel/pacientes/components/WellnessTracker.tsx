"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Frown, Meh, Smile, Moon } from "lucide-react";

interface WellnessTrackerProps {
  registros: any[];
}

export default function WellnessTracker({ registros = [] }: WellnessTrackerProps) {
  const [historyDate, setHistoryDate] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getMonthDays = (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const days = new Date(year, month + 1, 0).getDate();
      return Array.from({length: days}, (_, i) => i + 1);
  };

  if (!mounted) return null;

  const daysInMonth = getMonthDays(historyDate);

  return (
     <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mt-8">
         <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 px-2">
             <h5 className="text-xs font-black uppercase text-slate-800 tracking-widest flex items-center gap-2">
                 <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                 Bem-Estar (Humor e Sono)
             </h5>
             
             <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-100 self-end md:self-auto">
                 <button 
                    onClick={() => setHistoryDate(new Date(historyDate.getFullYear(), historyDate.getMonth() - 1, 1))}
                    className="p-1 hover:bg-white hover:shadow-sm rounded transition"
                 >
                    <ArrowLeft size={14} className="text-slate-500"/>
                 </button>
                 <span className="text-xs font-black text-slate-700 uppercase w-32 text-center">
                    {historyDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                 </span>
                 <button 
                    onClick={() => setHistoryDate(new Date(historyDate.getFullYear(), historyDate.getMonth() + 1, 1))}
                    className="p-1 hover:bg-white hover:shadow-sm rounded transition"
                 >
                    <ArrowRight size={14} className="text-slate-500"/>
                 </button>
             </div>
         </div>

     <div className="relative border border-slate-50 rounded-[2rem] overflow-hidden">
             <div className="overflow-x-auto pb-4 custom-scrollbar">
                 <div className="min-w-fit">
                     {/* CABEÇALHO DOS DIAS */}
                     <div className="flex mb-4">
                         {/* Indicador Fixo */}
                         <div className="sticky left-0 z-30 bg-white min-w-[140px] md:min-w-[200px] text-[10px] font-black text-slate-300 uppercase tracking-widest pb-3 px-6 flex items-end border-r border-slate-50 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                             Indicador
                         </div>
                         {/* Grade de Dias */}
                         <div className="grid flex-1 border-b border-slate-50" style={{ gridTemplateColumns: `repeat(${daysInMonth.length}, 45px)` }}>
                             {daysInMonth.map(d => {
                                 const date = new Date(historyDate.getFullYear(), historyDate.getMonth(), d);
                                 const weekDay = date.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3).replace('.', '');

                                 return (
                                     <div 
                                        key={d} 
                                        onMouseEnter={() => setHoveredDay(d)}
                                        onMouseLeave={() => setHoveredDay(null)}
                                        className={`flex flex-col items-center justify-center py-2 border-r border-slate-50 last:border-r-0 transition-colors cursor-pointer ${hoveredDay === d ? 'bg-blue-100' : ''}`}
                                     >
                                         <span className="text-[8px] font-bold text-slate-300 uppercase mb-0.5">{weekDay}</span>
                                         <span className="text-[10px] font-black text-slate-400">{d}</span>
                                     </div>
                                 );
                             })}
                         </div>
                     </div>
                     
                     <div className="space-y-4 pb-2">
                         {/* LINHA: HUMOR */}
                         <div className="flex group">
                             {/* Label Fixo */}
                             <div className="sticky left-0 z-30 bg-white min-w-[140px] md:min-w-[200px] flex items-center gap-2 px-4 border-r border-slate-50 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)] py-2">
                                 <div className="w-full flex items-center gap-2 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                                     <Smile size={14} className="text-deep"/>
                                     <span className="text-[9px] font-black text-slate-700 uppercase tracking-tight block truncate">Humor Geral</span>
                                 </div>
                             </div>
                             {/* Dados */}
                             <div className="grid flex-1 bg-slate-50/20" style={{ gridTemplateColumns: `repeat(${daysInMonth.length}, 45px)` }}>
                                 {daysInMonth.map(d => {
                                     const rec = registros.find(r => {
                                         const rd = new Date(r.data);
                                         return rd.getUTCDate() === d && rd.getUTCMonth() === historyDate.getMonth() && rd.getUTCFullYear() === historyDate.getFullYear();
                                     });

                                     let icon = null;
                                     if(rec) {
                                         if(rec.humor <= 1) icon = <Frown size={14} className="text-red-500"/>
                                         else if(rec.humor <= 2) icon = <Frown size={14} className="text-orange-500"/>
                                         else if(rec.humor <= 3) icon = <Meh size={14} className="text-yellow-500"/>
                                         else if(rec.humor <= 4) icon = <Smile size={14} className="text-blue-500"/>
                                         else icon = <Smile size={14} className="text-green-500"/>
                                     }

                                     return (
                                        <div 
                                            key={d} 
                                            onMouseEnter={() => setHoveredDay(d)}
                                            onMouseLeave={() => setHoveredDay(null)}
                                            className={`flex items-center justify-center h-14 border-r border-slate-50/50 last:border-r-0 transition-colors cursor-pointer ${hoveredDay === d ? 'bg-blue-100' : 'hover:bg-white'}`}
                                        >
                                            {icon || <div className="w-1 h-1 bg-slate-200 rounded-full"></div>}
                                        </div>
                                     )
                                 })}
                             </div>
                         </div>

                         {/* LINHA: SONO */}
                         <div className="flex group">
                             {/* Label Fixo */}
                             <div className="sticky left-0 z-30 bg-white min-w-[140px] md:min-w-[200px] flex items-center gap-2 px-4 border-r border-slate-50 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)] py-2">
                                 <div className="w-full flex items-center gap-2 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                                     <Moon size={14} className="text-blue-500"/>
                                     <span className="text-[9px] font-black text-slate-700 uppercase tracking-tight block truncate">Qualidade Sono</span>
                                 </div>
                             </div>
                             {/* Dados */}
                             <div className="grid flex-1 bg-slate-50/20" style={{ gridTemplateColumns: `repeat(${daysInMonth.length}, 45px)` }}>
                                 {daysInMonth.map(d => {
                                     const rec = registros.find(r => {
                                         const rd = new Date(r.data);
                                         return rd.getUTCDate() === d && rd.getUTCMonth() === historyDate.getMonth() && rd.getUTCFullYear() === historyDate.getFullYear();
                                     });

                                     return (
                                        <div 
                                            key={d} 
                                            onMouseEnter={() => setHoveredDay(d)}
                                            onMouseLeave={() => setHoveredDay(null)}
                                            className={`flex items-center justify-center h-14 border-r border-slate-50/50 last:border-r-0 transition-colors cursor-pointer ${hoveredDay === d ? 'bg-blue-100' : 'hover:bg-white'}`}
                                        >
                                            {rec ? (
                                                <span className={`text-[11px] font-black ${
                                                    rec.sono >= 4 ? 'text-green-500' : 
                                                    rec.sono === 3 ? 'text-yellow-500' : 'text-red-500'
                                                }`}>
                                                    {rec.sono}
                                                </span>
                                            ) : <div className="w-1 h-1 bg-slate-200 rounded-full"></div>}
                                        </div>
                                     )
                                 })}
                             </div>
                         </div>
                     </div>
                 </div>
             </div>
         </div>

         <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-50 pt-4">
            <p className="text-[10px] text-slate-400 font-medium italic">
                * O monitoramento contínuo auxilia na identificação de padrões de comportamento.
            </p>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Positivo</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Neutro</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Atenção</span>
                </div>
            </div>
         </div>
     </section>
  );
}
