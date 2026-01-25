"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MoodChart from "../components/MoodChart";
import { Copy, ArrowLeft, Frown, Meh, Smile, Moon, TrendingUp, Activity, HelpCircle, LayoutDashboard, ScrollText, CheckSquare, StickyNote, BookOpen, ChevronRight } from "lucide-react";
import { filtrarRegistros } from "../actions";
import GoalManager from "../components/GoalManager";
import WellnessTracker from "../components/WellnessTracker";
import PsychologistNotes from "../components/PsychologistNotes";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface ClientDashboardProps {
  paciente: any;
  registrosIniciais: any[];
  registrosCompletos: any[];
  metas: any[];
  notasIniciais?: any[];
}

type Tab = 'overview' | 'journal' | 'goals' | 'notes' | 'guide';

export default function ClientDashboard({ paciente, registrosIniciais, registrosCompletos, metas = [], notasIniciais = [] }: ClientDashboardProps) {
  const router = useRouter();
  const [registros, setRegistros] = useState(registrosCompletos); 
  const [periodo, setPeriodo] = useState<'7d' | '30d' | '1y' | 'all'>('all'); 
  const [loadingFilter, setLoadingFilter] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(12);

  const [activeTab, setActiveTab] = useState<Tab>('overview');

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

  const handleCopyInfo = () => {
    // Tenta copiar o código de acesso se existir, senão o ID
    const infoToCopy = paciente.codigoAcesso || paciente.id;
    navigator.clipboard.writeText(infoToCopy);
    toast.success("Código do paciente copiado!", {
        description: "Use este código para acessar o diário ou identificar o paciente."
    });
  };

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'journal', label: 'Diário Detalhado', icon: ScrollText },
    { id: 'goals', label: 'Plano de Metas', icon: CheckSquare },
    { id: 'notes', label: 'Notas Clínicas', icon: StickyNote },
    { id: 'guide', label: 'Guia de Análise', icon: BookOpen },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <Navbar />
      <div className="flex-1 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Superior */}
        <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 md:gap-6">
                <button 
                    onClick={() => router.back()}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:shadow-lg transition-all shrink-0"
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight leading-tight">
                        {paciente.nome}
                    </h1>
                    <p className="hidden md:flex text-xs font-bold text-slate-400 uppercase tracking-widest items-center gap-2 mt-1">
                        Área de Análise Clínica e Evolução do Paciente
                    </p>
                    <p className="md:hidden text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        Análise Clínica
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
                 <span className="w-fit px-2 py-0.5 rounded-full bg-blue-50 text-blue-500 text-[10px] font-black uppercase tracking-widest md:hidden">Ativo</span>
                 
                 <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 px-6 md:block hidden">
                    <div className="flex items-center gap-4">
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-500 text-[10px] font-black uppercase tracking-widest">Ativo</span>
                        <div className="w-[1px] h-6 bg-slate-100"></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Registrado em</p>
                            <p className="text-xs font-black text-slate-700">{new Date(paciente.criadoEm).toLocaleDateString('pt-BR')}</p>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={handleCopyInfo}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-deep transition-all active:scale-95 hover:shadow-md shrink-0"
                    title="Copiar Código do Paciente"
                >
                    <Copy size={16} />
                </button>
            </div>
        </header>

        {/* Tab Navigation */}
        <div className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-sm pt-4 pb-2 -mx-4 md:mx-0 px-4 md:px-0 transition-all relative">
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-slate-100 via-slate-50/90 to-transparent md:hidden z-30 flex items-center justify-end pr-2">
                 <ChevronRight className="text-slate-900/20 animate-pulse" size={24} />
            </div>
            <div className="flex overflow-x-auto gap-2 md:gap-4 scrollbar-hide snap-x py-1 pr-12 md:pr-0">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as Tab)}
                        className={`
                            relative flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap snap-start shrink-0 rounded-3xl
                            ${activeTab === tab.id 
                                ? 'bg-white text-slate-900 shadow-[0_2px_10px_rgba(0,0,0,0.03)] scale-100' 
                                : 'text-slate-400 hover:text-slate-600 hover:bg-white/40 scale-95 opacity-80 hover:opacity-100 hover:scale-100'}
                        `}
                    >
                        <tab.icon size={16} className={activeTab === tab.id ? "text-slate-900" : "text-slate-400"} />
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>

        <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
                display: none;
            }
            .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }
        `}</style>

        {/* Conteúdo Principal */}
        <div className="animate-in fade-in duration-500 min-h-[500px]">
            
            {/* --- ABA VISÃO GERAL --- */}
            {activeTab === 'overview' && (
                <div className="space-y-8">
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
                </div>
            )}

            {/* --- ABA DIÁRIO DETALHADO --- */}
            {activeTab === 'journal' && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                    {/* Top Tags - Principais Impactos */}
                    {registros.length > 0 && (
                        <div className="mb-10">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
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
                            
                            <div className="flex overflow-x-auto -mr-4 pl-4 pr-4 py-4 gap-3 md:flex-wrap md:mr-0 md:p-0 scrollbar-hide snap-x">
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
                                                    shrink-0 snap-start px-4 py-3 rounded-2xl border shadow-sm flex items-center gap-3 transition-all relative
                                                    ${isSelected ? 'ring-2 ring-slate-900 ring-offset-2' : ''}
                                                    ${isDimmed ? 'opacity-30 grayscale' : 'opacity-100'}
                                                    ${intensity > 70 ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-100 hover:border-slate-300'}
                                                `}
                                            >
                                                {intensity <= 70 && (
                                                    <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                                                        <div 
                                                            className="absolute bottom-0 left-0 h-1 bg-slate-900/10" 
                                                            style={{ width: `${intensity}%` }}
                                                        />
                                                    </div>
                                                )}

                                                <div className="flex flex-col items-start relative z-10">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${intensity > 70 ? 'text-white' : 'text-slate-800'}`}>
                                                        {tag}
                                                    </span>
                                                    <span className={`text-[9px] font-bold ${intensity > 70 ? 'text-slate-400' : 'text-slate-400'}`}>
                                                        {percent}% do total
                                                    </span>
                                                </div>

                                                <div className={`
                                                    w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-black
                                                    ${intensity > 70 ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-400'}
                                                `}>
                                                    {count}x
                                                </div>
                                            </button>
                                        );
                                    });
                                })()}
                            </div>
                            <div className="mt-3 flex justify-start">
                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest border-t border-slate-100 pt-2">
                                    Total de <span className="text-slate-500">{new Set(registros.flatMap(r => r.tags)).size}</span> categorias identificadas
                                </p>
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
                </div>
            )}

            {/* --- ABA METAS --- */}
            {activeTab === 'goals' && (
                <div className="animate-in slide-in-from-right-4 duration-300">
                    <GoalManager pacienteId={paciente.id} />
                </div>
            )}

            {/* --- ABA NOTAS --- */}
            {activeTab === 'notes' && (
                <div className="animate-in slide-in-from-right-4 duration-300 max-w-4xl mx-auto">
                     <PsychologistNotes pacienteId={paciente.id} notasIniciais={notasIniciais} />
                </div>
            )}

            {/* --- ABA GUIA --- */}
            {activeTab === 'guide' && (
                <div className="animate-in slide-in-from-right-4 duration-300">
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
            )}
            
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}
