"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MoodChart from "../components/MoodChart";
import { Copy, ArrowLeft, Frown, Meh, Smile, Moon, Lightbulb, TrendingUp, TrendingDown, AlertCircle, CheckCircle, HelpCircle, Activity } from "lucide-react";
import { filtrarRegistros } from "../actions";
import GoalManager from "../components/GoalManager";
import WellnessTracker from "../components/WellnessTracker";

interface ClientDashboardProps {
  paciente: any;
  registrosIniciais: any[];
  registrosCompletos: any[];
  metas: any[];
}

export default function ClientDashboard({ paciente, registrosIniciais, registrosCompletos, metas = [] }: ClientDashboardProps) {
  const router = useRouter();
  const [registros, setRegistros] = useState(registrosCompletos); 
  const [periodo, setPeriodo] = useState<'7d' | '30d' | '1y' | 'all'>('all'); 
  const [loadingFilter, setLoadingFilter] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(12);

  const registrosDisplayed = selectedTag 
    ? registros.filter(r => r.tags.includes(selectedTag))
    : registros;

  const handleFilterChange = async (p: '7d' | '30d' | '1y' | 'all') => {
    setLoadingFilter(true);
    setPeriodo(p);
    const res = await filtrarRegistros(paciente.id, p);
    if (res.success) {
      setRegistros(res.registros || []);
    }
    setLoadingFilter(false);
    setSelectedTag(null); 
  };

  const toggleTag = (tag: string) => {
    if (selectedTag === tag) setSelectedTag(null);
    else setSelectedTag(tag);
    setVisibleCount(12); 
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Superior */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-6">
                <button 
                    onClick={() => router.back()}
                    className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:shadow-lg transition-all"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                        {paciente.nome}
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-500 text-[10px] font-black uppercase tracking-widest">Ativo</span>
                    </h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-1">
                        Área de Análise Clínica e Evolução do Paciente
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                 <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 px-6">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Membro desde</p>
                        <p className="text-xs font-black text-slate-700">{new Date(paciente.criadoEm).toLocaleDateString('pt-BR')}</p>
                    </div>
                </div>
                <button className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-deep transition-all">
                    <Copy size={18} />
                </button>
            </div>
        </header>

        {/* Conteúdo Principal */}
        <div className="space-y-12 animate-in fade-in duration-500 relative">
            
            {/* Gerenciamento de Metas */}
            <GoalManager pacienteId={paciente.id} />

            {/* Resumo Estatístico (Médias) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(() => {
                    const avgHumor = registros.length > 0 ? (registros.reduce((acc, r) => acc + r.humor, 0) / registros.length).toFixed(1) : "0";
                    const avgSono = registros.length > 0 ? (registros.reduce((acc, r) => acc + r.sono, 0) / registros.length).toFixed(1) : "0";
                    
                    return (
                        <>
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-lg transition-all">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Humor Médio</p>
                                    <h4 className="text-2xl font-black text-slate-800">{avgHumor}/5</h4>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-500">
                                    <TrendingUp size={20} />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-lg transition-all">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Qualidade do Sono</p>
                                    <h4 className="text-2xl font-black text-slate-800">{avgSono}/5</h4>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
                                    <Moon size={20} />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-lg transition-all">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total de Check-ins</p>
                                    <h4 className="text-2xl font-black text-slate-800">{registros.length} dias</h4>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500">
                                    <Activity size={20} />
                                </div>
                            </div>
                        </>
                    );
                })()}
            </div>

            {/* Gráfico com Filtros */}
            <section className="relative">
                {/* Texto de Aviso / Instrução (Mobile Only) */}
                <div className="mb-4 md:hidden">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {periodo === 'all' ? 'Exibindo todo o histórico' : 'Filtrado por período'}
                    </p>
                </div>

                {/* Filtros e Texto Desktop */}
                <div className="flex flex-col md:flex-row items-center gap-4 justify-end mb-4 md:mb-0 md:absolute md:top-4 md:right-4 z-10">
                    <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 overflow-x-auto max-w-full">
                        <p className="hidden md:block text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1">
                            {periodo === 'all' ? 'Exibindo todo o histórico' : 'Filtrado por período'}
                        </p>
                        {(['7d', '30d', '1y', 'all'] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => handleFilterChange(p)}
                                className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg transition-all whitespace-nowrap ${
                                    periodo === p 
                                    ? 'bg-white text-slate-900 shadow-sm' 
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                {p === '7d' ? '7 Dias' : p === '30d' ? '30 Dias' : p === '1y' ? '1 Ano' : 'Tudo'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={loadingFilter ? 'opacity-50 transition-opacity' : 'transition-opacity'}>
                    <MoodChart data={registrosDisplayed} periodo={periodo} />
                </div>
            </section>

            {/* Histórico de Bem-Estar */}
            <WellnessTracker registros={registrosCompletos} />

            {/* Histórico Detalhado */}
            <section>
                {/* Top Tags - Principais Impactos */}
                {registros.length > 0 && (
                    <div className="mb-10">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 ml-2">
                             <div>
                                 <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-1">Principais Impactos do Período</h3>
                                 <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Calculado com base no filtro selecionado</p>
                             </div>

                             <div className="flex items-center gap-3">
                                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto max-w-full">
                                    {(['7d', '30d', '1y', 'all'] as const).map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => handleFilterChange(p)}
                                            className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all whitespace-nowrap ${
                                                periodo === p 
                                                ? 'bg-slate-900 text-white shadow-sm' 
                                                : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                        >
                                            {p === '7d' ? '7 Dias' : p === '30d' ? '30 Dias' : p === '1y' ? '1 Ano' : 'Tudo'}
                                        </button>
                                    ))}
                                </div>
                                
                                {selectedTag && (
                                    <button onClick={() => setSelectedTag(null)} className="text-[10px] font-black text-deep uppercase hover:underline border-l border-slate-200 pl-3 h-6 flex items-center">
                                        Limpar Tag
                                    </button>
                                )}
                             </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                            {(() => {
                                const tagCounts = registros.flatMap(r => r.tags).reduce((acc: any, tag: string) => {
                                    acc[tag] = (acc[tag] || 0) + 1;
                                    return acc;
                                }, {});

                                const sortedTags = Object.entries(tagCounts)
                                    .sort(([,a]: any, [,b]: any) => b - a);

                                if (sortedTags.length === 0) {
                                    return <p className="text-xs text-slate-400 italic ml-2">Nenhum impacto registrado neste período.</p>;
                                }

                                const totalOcorrenciasTags = Object.values(tagCounts).reduce((a: any, b: any) => a + b, 0) as number;
                                const maxCount = Math.max(...Object.values(tagCounts) as number[]);

                                return sortedTags.map(([tag, count]: any) => {
                                    const isSelected = selectedTag === tag;
                                    const isDimmed = selectedTag && !isSelected;
                                    const percent = ((count / totalOcorrenciasTags) * 100).toFixed(0);
                                    const intensity = (count / maxCount) * 100;

                                    return (
                                        <button 
                                            key={tag} 
                                            onClick={() => toggleTag(tag)}
                                            className={`
                                                px-5 py-4 rounded-3xl border shadow-sm flex items-center gap-4 transition-all relative overflow-hidden
                                                ${isSelected ? 'ring-2 ring-slate-900 ring-offset-2' : ''}
                                                ${isDimmed ? 'opacity-30 grayscale' : 'opacity-100'}
                                                ${intensity > 70 ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-100 hover:border-slate-300'}
                                            `}
                                        >
                                            {intensity <= 70 && (
                                                <div 
                                                    className="absolute bottom-0 left-0 h-1 bg-slate-900/10" 
                                                    style={{ width: `${intensity}%` }}
                                                />
                                            )}

                                            <div className="flex flex-col items-start relative z-10">
                                                <span className={`text-[11px] font-black uppercase tracking-widest ${intensity > 70 ? 'text-white' : 'text-slate-800'}`}>
                                                    {tag}
                                                </span>
                                                <span className={`text-[9px] font-bold ${intensity > 70 ? 'text-slate-400' : 'text-slate-400'}`}>
                                                    {percent}% do total
                                                </span>
                                            </div>

                                            <div className={`
                                                w-8 h-8 rounded-2xl flex items-center justify-center text-[11px] font-black
                                                ${intensity > 70 ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-400'}
                                            `}>
                                                {count}x
                                            </div>
                                        </button>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                )}

                <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-6 ml-2">
                    Histórico Detalhado - {
                        periodo === '7d' ? 'Últimos 7 Dias' : 
                        periodo === '30d' ? 'Últimos 30 Dias' : 
                        periodo === '1y' ? 'Último Ano' : 'Tudo'
                    } {selectedTag ? `(Filtro: ${selectedTag})` : `(Total: ${registrosDisplayed.length})`}
                </h3>
                
                {registrosDisplayed.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {registrosDisplayed.slice(0, visibleCount).map((reg, idx) => (
                            <div key={reg.id || idx} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm bg-slate-50 group-hover:scale-110 transition-transform`}>
                                            {reg.humor <= 1 ? <Frown className="text-red-500" /> : 
                                             reg.humor <= 2 ? <Frown className="text-orange-500" /> : 
                                             reg.humor <= 3 ? <Meh className="text-yellow-500" /> : 
                                             reg.humor <= 4 ? <Smile className="text-blue-500" /> : 
                                             <Smile className="text-green-500" />}
                                        </div>
                                        <div>
                                            <h4 className="text-[11px] font-black uppercase text-slate-900 tracking-tight leading-none mb-1">
                                                {new Date(reg.data).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase">Sono:</span>
                                                <div className="flex gap-0.5">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Moon key={i} size={10} className={i < reg.sono ? "text-blue-500 fill-blue-500" : "text-slate-100"} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Impactos do dia</p>
                                    {reg.tags.length > 0 ? (
                                        <div className="flex flex-wrap gap-2 items-center">
                                            {reg.tags.map((t: string) => (
                                                <span key={t} className={`
                                                    px-2 py-1 text-[9px] rounded font-bold uppercase tracking-wider
                                                    ${selectedTag === t ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500'}
                                                `}>
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-300 italic">Nenhum impacto registrado.</p>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Notas Pessoais</p>
                                    <p className="text-xs text-slate-600 leading-relaxed italic line-clamp-4">
                                        {reg.notas ? `"${reg.notas}"` : "Sem notas."}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                         <p className="text-sm font-bold text-slate-400 uppercase italic">Nenhum registro encontrado para este filtro.</p>
                    </div>
                )}

                {visibleCount < registrosDisplayed.length && (
                    <div className="mt-12 text-center">
                        <button 
                            onClick={() => setVisibleCount(v => v + 12)}
                            className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-slate-900/10"
                        >
                            Carregar mais registros
                        </button>
                    </div>
                )}
            </section>

            {/* Guia de Análise Clínica */}
            <section className="bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl border border-white/5">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -ml-48 -mb-48"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 backdrop-blur-md border border-white/10 flex items-center justify-center">
                            <HelpCircle className="text-indigo-400" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-widest text-white">Guia de Análise Clínica</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Instrumentos para leitura técnica de evolução</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-12">
                        {/* Linha 1: Análise Clínica */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">01</span>
                                <h4 className="text-sm font-black uppercase tracking-widest text-white">Estabilidade</h4>
                            </div>
                            <p className="text-sm font-medium text-slate-300 leading-relaxed">
                                Procure por padrões de humor constantes. Oscilações bruscas no gráfico de linha podem indicar gatilhos semanais ou resistência ao processo terapêutico.
                            </p>
                        </div>
                        <div className="space-y-4 md:border-l md:border-white/5 md:pl-12">
                            <div className="flex items-center gap-3">
                                <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">02</span>
                                <h4 className="text-sm font-black uppercase tracking-widest text-white">Fatores Externos</h4>
                            </div>
                            <p className="text-sm font-medium text-slate-300 leading-relaxed">
                                Analise a proporção de impactos. Tags como "Ansiedade" ou "Trabalho" recorrentes ajudam a direcionar o foco da próxima sessão de forma objetiva.
                            </p>
                        </div>
                        <div className="space-y-4 lg:border-l lg:border-white/5 lg:pl-12">
                            <div className="flex items-center gap-3">
                                <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">03</span>
                                <h4 className="text-sm font-black uppercase tracking-widest text-white">Higiene do Sono</h4>
                            </div>
                            <p className="text-sm font-medium text-slate-300 leading-relaxed">
                                A barra de sono correlaciona diretamente com o humor. Notas baixas de sono costumam preceder quedas de humor nos dias seguintes.
                            </p>
                        </div>

                        {/* Linha 2: Funcionamento da Plataforma */}
                        <div className="space-y-4 pt-8 border-t border-white/5">
                            <div className="flex items-center gap-3">
                                <span className="text-[11px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">04</span>
                                <h4 className="text-sm font-black uppercase tracking-widest text-white">Filtros Temporais</h4>
                            </div>
                            <p className="text-sm font-medium text-slate-400 leading-relaxed">
                                Ao selecionar 7 dias, 30 dias ou Tudo, todos os gráficos, médias e frequências de impactos são recalculados para o período escolhido.
                            </p>
                        </div>
                        <div className="space-y-4 pt-8 border-t border-white/5 md:border-l md:border-white/5 md:pl-12">
                            <div className="flex items-center gap-3">
                                <span className="text-[11px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">05</span>
                                <h4 className="text-sm font-black uppercase tracking-widest text-white">Filtro por Tags</h4>
                            </div>
                            <p className="text-sm font-medium text-slate-400 leading-relaxed">
                                Clique em qualquer tag no resumo de "Impactos" para filtrar o Histórico Detalhado. Isso isola os relatos onde aquele tema específico foi citado.
                            </p>
                        </div>
                        <div className="space-y-4 pt-8 border-t border-white/5 lg:border-l lg:border-white/5 lg:pl-12">
                            <div className="flex items-center gap-3">
                                <span className="text-[11px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">06</span>
                                <h4 className="text-sm font-black uppercase tracking-widest text-white">Sistema de Metas</h4>
                            </div>
                            <p className="text-sm font-medium text-slate-400 leading-relaxed">
                                A aderência mensal considera a frequência (diário, semanal...). O azul indica o dia agendado e o verde confirma que o paciente cumpriu a meta.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
      </div>
    </div>
  );
}
