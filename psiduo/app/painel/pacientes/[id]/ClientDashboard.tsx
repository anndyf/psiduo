"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MoodChart from "../components/MoodChart";
import { Copy, ArrowLeft, Frown, Meh, Smile, Moon, Lightbulb, TrendingUp, TrendingDown, AlertCircle, CheckCircle, HelpCircle } from "lucide-react";
import { filtrarRegistros } from "../actions";

interface ClientDashboardProps {
  paciente: any;
  registrosIniciais: any[];
  registrosCompletos: any[];
}

export default function ClientDashboard({ paciente, registrosIniciais, registrosCompletos }: ClientDashboardProps) {
  const router = useRouter();
  const [registros, setRegistros] = useState(registrosCompletos); // Inicia com TODOS
  const [periodo, setPeriodo] = useState<'7d' | '30d' | '1y' | 'all'>('all'); // Default 'all'
  const [loadingFilter, setLoadingFilter] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(12);

  // Filtrar por tag se houver seleção
  const registrosDisplayed = selectedTag 
    ? registros.filter(r => r.tags.includes(selectedTag))
    : registros;

  // Resetar paginação ao mudar filtros
  useEffect(() => {
      setVisibleCount(12);
  }, [selectedTag, periodo, registros]);

  // Calcular métricas (Baseadas no filtro de PERÍODO, não da tag)
  // Isso mantém os KPIs globais do período visíveis mesmo ao filtrar por tag
  const totalCheckins = paciente._count?.registros || 0;
  const totalFiltrado = registros.length; // Uses 'registros' for period-filtered total
  const mediaHumor = totalFiltrado > 0 
    ? (registros.reduce((acc: any, curr: any) => acc + curr.humor, 0) / totalFiltrado).toFixed(1) 
    : '-';
    
  const mediaSono = totalFiltrado > 0 
    ? (registros.reduce((acc: any, curr: any) => acc + curr.sono, 0) / totalFiltrado).toFixed(1) 
    : '-';

  const handleFilterChange = async (novoPeriodo: '7d' | '30d' | '1y' | 'all') => {
      setPeriodo(novoPeriodo);
      setLoadingFilter(true);
      setSelectedTag(null); // Clear tag filter when period changes
      const res = await filtrarRegistros(paciente.id, novoPeriodo);
      if (res.success && res.registros) {
          setRegistros(res.registros);
      }
      setLoadingFilter(false);
  };

  const copyLink = () => {
    const link = `${window.location.origin}/diario/${paciente.tokenAcesso}`;
    navigator.clipboard.writeText(link);
    alert("Link copiado!");
  };

  // Helper para interpretar médias
  const interpretarMedia = (valor: string | number, tipo: 'humor' | 'sono') => {
    const v = Number(valor);
    if (isNaN(v) || v === 0) return { texto: '-', cor: 'text-slate-300' };

    if (v <= 1.5) return { texto: 'Muito Baixo', cor: 'text-red-500' };
    if (v <= 2.5) return { texto: 'Baixo', cor: 'text-orange-500' };
    if (v <= 3.5) return { texto: 'Regular', cor: 'text-yellow-500' };
    if (v <= 4.5) return { texto: 'Bom', cor: 'text-blue-500' };
    return { texto: 'Excelente', cor: 'text-green-500' };
  };

  const interpHumor = interpretarMedia(mediaHumor, 'humor');
  const interpSono = interpretarMedia(mediaSono, 'sono');

  const getHumorIcon = (humor: number) => {
    if (humor <= 1) return <Frown width={24} className="text-red-500" strokeWidth={2.5} />;
    if (humor <= 2) return <Frown width={24} className="text-orange-500" />;
    if (humor <= 3) return <Meh width={24} className="text-yellow-500" />;
    if (humor <= 4) return <Smile width={24} className="text-blue-500" />;
    return <Smile width={24} className="text-green-500" strokeWidth={2.5} />;
  };

  const toggleTag = (tag: string) => {
      if (selectedTag === tag) setSelectedTag(null);
      else setSelectedTag(tag);
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col text-slate-900 pb-20">
      <div className="container mx-auto max-w-[1400px] py-8 px-6 md:px-8">
        
        {/* Header Original */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
            <div>
                <button 
                    onClick={() => router.push("/painel/pacientes")}
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-deep mb-4 flex items-center gap-2 transition-colors"
                >
                    <ArrowLeft size={14} /> Voltar
                </button>
                <div className="flex items-center gap-4 mb-2">
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                        {paciente.nome}
                    </h1>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${paciente.ativo ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {paciente.ativo ? "Ativo" : "Arquivado"}
                    </span>
                </div>
                <div className="flex gap-4">
                    <button onClick={copyLink} className="text-xs font-bold text-deep underline decoration-2 underline-offset-4 hover:text-primary flex items-center gap-1">
                        <Copy size={12} /> Copiar Link do Diário
                    </button>
                    <span className="text-slate-300">|</span>
                    <span className="text-xs font-bold text-slate-400">Criado em {new Date(paciente.criadoEm).toLocaleDateString('pt-BR')}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 md:flex gap-4 w-full md:w-auto">
                <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100 text-center md:min-w-[120px]">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Média Humor</p>
                    <p className="text-3xl font-black text-deep leading-none mb-1">{mediaHumor}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-wide ${interpHumor.cor}`}>{interpHumor.texto}</p>
                </div>
                <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100 text-center md:min-w-[120px]">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Média Sono</p>
                    <p className="text-3xl font-black text-blue-500 leading-none mb-1">{mediaSono}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-wide ${interpSono.cor}`}>{interpSono.texto}</p>
                </div>
                <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100 text-center md:min-w-[120px] col-span-2 md:col-span-1">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Total Check-ins</p>
                    <p className="text-3xl font-black text-slate-900 leading-none mb-1">{totalCheckins}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Registros</p>
                </div>
            </div>
        </header>

        {/* Conteúdo Principal */}
        <div className="space-y-12 animate-in fade-in duration-500 relative">
            
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

            {/* Histórico Detalhado (Original Card Style) */}
            <section>
                {/* Top Tags - Principais Impactos */}
                {registros.length > 0 && (
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-4 ml-2">
                             <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Principais Impactos do Período</h3>
                             {selectedTag && (
                                <button onClick={() => setSelectedTag(null)} className="text-[10px] font-bold text-deep uppercase hover:underline">
                                    Limpar Filtro
                                </button>
                             )}
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                            {Object.entries(
                                registros.flatMap(r => r.tags).reduce((acc: any, tag: string) => {
                                    acc[tag] = (acc[tag] || 0) + 1;
                                    return acc;
                                }, {})
                            )
                            .sort(([,a]: any, [,b]: any) => b - a)
                            .slice(0, 5) // Top 5
                            .map(([tag, count]: any) => {
                                const isHighFreq = count >= 4;
                                const isSelected = selectedTag === tag;
                                const isDimmed = selectedTag && !isSelected;

                                // Cálculos de Correlação (Data Science Lite)
                                const registrosComTag = registros.filter(r => r.tags.includes(tag));
                                const tagAvgHumor = registrosComTag.reduce((acc: number, curr: any) => acc + curr.humor, 0) / count;
                                const tagAvgSono = registrosComTag.reduce((acc: number, curr: any) => acc + curr.sono, 0) / count;
                                
                                const globalAvgHumor = Number(mediaHumor) || 0;
                                const globalAvgSono = Number(mediaSono) || 0;

                                const diffHumor = tagAvgHumor - globalAvgHumor;
                                const diffSono = tagAvgSono - globalAvgSono;

                                const formatDiff = (val: number) => {
                                    if (Math.abs(val) < 0.1) return "Neutro";
                                    return `${val > 0 ? '▲' : '▼'} ${Math.abs(val).toFixed(1)}`;
                                };

                                return (
                                    <button 
                                        key={tag} 
                                        onClick={() => toggleTag(tag)}
                                        className={`
                                            group relative px-4 py-3 rounded-2xl border shadow-sm flex items-center gap-3 transition-all
                                            ${isSelected ? 'ring-2 ring-deep ring-offset-2' : ''}
                                            ${isDimmed ? 'opacity-40 grayscale' : 'opacity-100'}
                                            ${isHighFreq ? 'bg-red-50 border-red-100' : 'bg-white border-slate-100 hover:border-deep/50'}
                                        `}
                                    >
                                        <span className={`text-xs font-black uppercase tracking-wider ${isHighFreq ? 'text-red-700' : 'text-slate-600'}`}>
                                            {tag}
                                        </span>
                                        <span className={`
                                            text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1
                                            ${isHighFreq ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}
                                        `}>
                                            {count}x
                                        </span>

                                        {/* TOOLTIP DE INSIGHTS (Hover Only) */}
                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-slate-900/90 backdrop-blur text-white p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
                                            <div className="mb-2 border-b border-slate-700 pb-1">
                                                <p className="text-[9px] font-black uppercase text-slate-400">Impacto na Média</p>
                                                <p className="text-[8px] font-medium text-slate-500 leading-tight mt-0.5">Comparado à média do período</p>
                                            </div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-[10px] font-bold text-slate-300">Humor</span>
                                                <span className={`text-[10px] font-bold ${diffHumor < -0.1 ? 'text-red-400' : (diffHumor > 0.1 ? 'text-green-400' : 'text-slate-200')}`}>
                                                    {formatDiff(diffHumor)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[10px] font-bold text-slate-300">Sono</span>
                                                <span className={`text-[10px] font-bold ${diffSono < -0.1 ? 'text-red-400' : (diffSono > 0.1 ? 'text-green-400' : 'text-slate-200')}`}>
                                                    {formatDiff(diffSono)}
                                                </span>
                                            </div>
                                            {/* Seta do tooltip */}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900/90"></div>
                                        </div>
                                    </button>
                                );
                            })}
                            
                            {registros.flatMap(r => r.tags).length === 0 && (
                                <p className="text-xs text-slate-400 italic ml-2">Nenhum impacto registrado neste período.</p>
                            )}
                        </div>
                        
                        {/* Guide moved to bottom */}
                    </div>
                )}

                <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-6 ml-2">
                    Histórico Detalhado {selectedTag ? `(Filtro: ${selectedTag})` : `(Total: ${registrosDisplayed.length})`}
                </h3>
                
                {registrosDisplayed.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...registrosDisplayed].reverse().slice(0, visibleCount).map((reg: any) => (
                                <div key={reg.id} className="bg-white p-6 rounded-3xl border border-slate-100 hover:shadow-lg transition-all animate-in fade-in zoom-in duration-300">
                                    <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-50">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-50 rounded-full">
                                                {getHumorIcon(reg.humor)}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900 uppercase">
                                                    {new Date(reg.data).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mt-1">
                                                    Sono: 
                                                    <span className="flex">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Moon 
                                                                key={i} 
                                                                size={10} 
                                                                className={i < reg.sono ? "fill-blue-400 text-blue-400" : "text-slate-200"} 
                                                            />
                                                        ))}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Algo impactou seu dia?</p>
                                        {reg.tags.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
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

                                    <div className="mt-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Notas Pessoais</p>
                                        {reg.notas ? (
                                            <p className="text-sm text-slate-600 font-medium leading-relaxed italic bg-yellow-50/50 p-3 rounded-xl">
                                                "{reg.notas}"
                                            </p>
                                        ) : (
                                            <p className="text-xs text-slate-300 italic">Sem notas.</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Botão Carregar Mais */}
                        {visibleCount < registrosDisplayed.length && (
                            <div className="mt-10 flex justify-center">
                                <button 
                                    onClick={() => setVisibleCount(prev => prev + 12)}
                                    className="px-6 py-3 bg-white border border-slate-200 shadow-sm rounded-full text-xs font-black uppercase tracking-widest text-slate-500 hover:text-deep hover:border-deep transition-all"
                                >
                                    Carregar Mais
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                   <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                        <p className="text-xl font-black uppercase text-slate-300 mb-2">Sem Registros</p>
                        <p className="text-sm font-bold text-slate-400">
                            {selectedTag ? `Nenhum registro encontrado com a tag "${selectedTag}".` : "Nenhum dado encontrado para este período."}
                        </p>
                   </div> 
                )}
            </section>

             {/* Guia de Interpretação / Ajuda Clínica */}
             <section className="mt-12 mb-8 border-t border-slate-200 pt-8">
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                        <span className="bg-deep/10 text-deep p-2 rounded-lg"><Lightbulb size={20} /></span> Guia de Análise Clínica
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-3 border-b border-slate-100 pb-2">Escalas de Medição</h4>
                            <p className="text-xs text-slate-600 leading-relaxed mb-2">
                                Os registros seguem uma escala de 1 a 5:
                            </p>
                            <ul className="text-xs text-slate-500 space-y-2 ml-1">
                                <li className="flex items-center gap-2">
                                    <AlertCircle size={12} className="text-red-500" />
                                    <span><strong className="text-red-500">1-2:</strong> Pontuação Reduzida (Atenção)</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <HelpCircle size={12} className="text-yellow-500" />
                                    <span><strong className="text-yellow-500">3:</strong> Pontuação Média</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle size={12} className="text-green-500" />
                                    <span><strong className="text-green-500">4-5:</strong> Pontuação Elevada</span>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-3 border-b border-slate-100 pb-2">Impactos e Correlações</h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                A análise cruza dias específicos com a média do período.
                                <br/><br/>
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingDown size={14} className="text-red-500" />
                                    <span><strong className="text-red-500">Redução na Média:</strong> Correlação com diminuição dos índices no dia.</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <TrendingUp size={14} className="text-green-500" />
                                    <span><strong className="text-green-500">Aumento na Média:</strong> Correlação com elevação dos índices.</span>
                                </div>
                            </p>
                        </div>

                        <div>
                            <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-3 border-b border-slate-100 pb-2">Dicas de Uso</h4>
                            <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
                                <li className="flex items-start gap-2">
                                    <span className="mt-1 w-1 h-1 bg-deep rounded-full flex-shrink-0"></span>
                                    <span>Utilize o filtro de <strong>7 Dias</strong> para análise contextual recente.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1 w-1 h-1 bg-deep rounded-full flex-shrink-0"></span>
                                    <span>Explore as tags destacadas para acessar registros específicos.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1 w-1 h-1 bg-deep rounded-full flex-shrink-0"></span>
                                    <span>Observe a correlação entre Humor e Sono para identificar padrões.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </div>

      </div>
    </main>
  );
}
