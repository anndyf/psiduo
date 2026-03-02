"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MoodAnalytics from "../components/MoodAnalytics";
import { ArrowLeft, Clock, TrendingUp, Activity, LayoutDashboard, CheckSquare, StickyNote, BookOpen, ChevronRight, FileText, Link as LinkIcon, ShieldAlert, Smile, AlertCircle, Sparkles, Tag, Filter, Settings, Calendar as CalendarIcon, Zap, Info, Printer, Lock, Target } from "lucide-react";
import { updateDiarySettings } from "../actions_prontuario";
import GoalManager from "../components/GoalManager";
import ClinicalNotes from "../components/ClinicalNotes";
import ProntuarioManager from "../components/ProntuarioManager";
import InstrumentManager from "../components/InstrumentManager";
import { toast } from "sonner";

// --- Sub-components ---

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-sm p-6 md:p-8 ${className}`}>
    {children}
  </div>
);

const StatCard = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number, color: string }) => {
    const accents: Record<string, string> = {
        deep: "text-deep bg-slate-50 border-slate-100 group-hover:bg-deep group-hover:text-white",
        purple: "text-purple-600 bg-purple-50 border-purple-100 group-hover:bg-purple-600 group-hover:text-white",
        orange: "text-orange-600 bg-orange-50 border-orange-100 group-hover:bg-orange-600 group-hover:text-white",
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white",
    };
    
    const accentClass = accents[color] || accents.deep;

    return (
        <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/60 flex items-center gap-4 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/40 transition-all group">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 ${accentClass}`}>
                <Icon size={20} strokeWidth={2} />
            </div>
            <div>
                <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">{value}</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            </div>
        </div>
    )
}


type Tab = 'overview' | 'journal' | 'goals' | 'notes' | 'records' | 'instruments';

interface ClientDashboardProps {
    paciente: any;
    registrosIniciais: any[];
    registrosCompletos: any[];
    metas: any[];
    notasIniciais: any[];
    dadosCadastrais: any;
    anamneseInicial: any;
    prontuarioInicial: any;
    instrumentos: any[];
    solicitacoesPendente: any[];
    psicologoLogado: any;
}

export default function ClientDashboard({ 
    paciente, 
    registrosIniciais, 
    registrosCompletos, 
    metas, 
    notasIniciais, 
    dadosCadastrais,
    anamneseInicial,
    prontuarioInicial,
    instrumentos = [],
    solicitacoesPendente = [],
    psicologoLogado,
}: ClientDashboardProps) {
  
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  
  // Settings Modal State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [configDiario, setConfigDiario] = useState({
      ativo: paciente.ativo,
      dataInicio: paciente.dataInicio ? new Date(paciente.dataInicio).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  });
  const [showActivationTip, setShowActivationTip] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<0 | 1 | 2 | 3>(0);

  useEffect(() => {
      // 1. Se novos registros (paciente novo) -> Iniciar Onboarding COMPLETO
      if (registrosCompletos.length === 0 && metas.length === 0 && notasIniciais.length === 0) {
          const timer = setTimeout(() => setOnboardingStep(1), 1000);
          return () => clearTimeout(timer);
      }
      // 2. Se não é novo, mas diário está inativo -> Sugerir ativação
      else if (!paciente.ativo) {
          setShowActivationTip(true);
      } 
  }, [paciente.ativo, registrosCompletos.length, metas.length, notasIniciais.length]);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const router = useRouter();

  // Smart Analysis for Journal
  const allTags = registrosCompletos.flatMap(r => r.tags || []);
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const sortedTags = Object.entries(tagCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .map(([tag]) => tag);

  const filteredRecords = filterTag 
    ? registrosCompletos.filter(r => r.tags?.includes(filterTag))
    : registrosCompletos;

  const topMood = filteredRecords.length > 0 
    ? (() => {
        const moods = filteredRecords.map(r => r.humor);
        const moodCounts = moods.reduce((acc: Record<number, number>, m: number) => { 
            acc[m] = (acc[m] || 0) + 1; 
            return acc; 
        }, {});
        const top = Object.entries(moodCounts).sort(([,a], [,b]) => (b as number) - (a as number))[0];
        return top ? parseInt(top[0]) : 3;
      })()
    : 3; // Default neutral if no records

  const avgSleepQualityValue = filteredRecords.length > 0
    ? (filteredRecords.reduce((acc, r) => acc + (r.sono || 0), 0) / filteredRecords.length)
    : 0;

  const getSleepLabel = (val: number) => {
      if (val >= 4.5) return 'Ótima';
      if (val >= 3.5) return 'Boa';
      if (val >= 2.5) return 'Regular';
      if (val >= 1.5) return 'Ruim';
      return 'Péssima';
  }

  const avgSleepLabel = getSleepLabel(avgSleepQualityValue);

  const aiInsightText = filteredRecords.length === 0 
    ? "Sem dados suficientes para análise com este filtro." 
    : filterTag 
        ? `Nos registros de "${filterTag}", o humor predominante é ${topMood >= 5 ? '"Radiante"' : topMood === 4 ? '"Feliz"' : topMood === 3 ? '"Neutro"' : topMood === 2 ? '"Triste"' : '"Deprimido"'}, com qualidade de sono ${avgSleepLabel.toLowerCase()}.`
        : `O paciente apresenta humor predominante ${topMood >= 5 ? '"Radiante"' : topMood === 4 ? '"Feliz"' : topMood === 3 ? '"Neutro"' : topMood === 2 ? '"Triste"' : '"Deprimido"'} e qualidade de sono ${avgSleepLabel.toLowerCase()}. Principais contextos: ${sortedTags.slice(0, 3).join(', ')}.`;

  const handleCopyInfo = () => {
    const link = `${window.location.origin}/diario`;
    navigator.clipboard.writeText(link);
    toast.success("Link do Portal copiado! Instrua o paciente a entrar com o CPF.");
  };

  const handleSaveConfig = async () => {
      setLoadingConfig(true);
      const res = await updateDiarySettings(paciente.id, configDiario.ativo, configDiario.dataInicio);
      setLoadingConfig(false);
      
      if (res.success) {
          toast.success("Configurações atualizadas!");
          setShowSettingsModal(false);
          setShowActivationTip(false); // Hide tip if activated
          // O revalidatePath atualiza os dados, mas para feedback imediato na UI (se necessário) poderíamos atualizar estado local, 
          // mas como 'paciente' vem de prop e é atualizado pelo Next, deve bastar.
      } else {
          toast.error("Erro ao atualizar configurações.");
      }
  };

  const tabs = [
      { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
      { id: 'instruments', label: 'Instrumentos', icon: Activity },
      { id: 'records', label: 'Prontuário', icon: FileText },
      { id: 'journal', label: 'Diário', icon: BookOpen },
      { id: 'goals', label: 'Metas', icon: CheckSquare },
      { id: 'notes', label: 'Notas', icon: StickyNote },
  ];

  // Cálculo de Média de Humor
  const avgHumor = registrosCompletos.length > 0 
      ? (registrosCompletos.reduce((a, b) => a + b.humor, 0) / registrosCompletos.length).toFixed(1) 
      : "0.0";

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 md:pb-8">
      
      {/* Header Fixo - Clean Mobile Optimized */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-30 px-4 md:px-8 py-3 md:py-4 transition-all">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3 md:gap-4">
                <button 
                    onClick={() => router.back()} 
                    className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                >
                    <ArrowLeft size={18} strokeWidth={2} />
                </button>
                <div>
                   <h1 className="text-lg md:text-2xl font-medium text-slate-900 tracking-tight leading-none">{paciente.nome}</h1>
                   <div className="flex items-center gap-2 text-[10px] md:text-xs font-medium text-slate-400 mt-1 uppercase tracking-wide">
                      <span className="bg-slate-50 text-deep border border-slate-100 px-2 py-0.5 rounded-md">Paciente</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span>Desde {new Date(paciente.criadoEm).toLocaleDateString('pt-BR')}</span>
                   </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button 
                    onClick={handleCopyInfo}
                    className="h-9 md:h-10 px-3 md:px-5 rounded-xl border flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0 text-xs font-bold uppercase tracking-wide shadow-lg bg-deep border-deep text-white hover:bg-slate-800 shadow-slate-200"
                    title="Copiar Link de Acesso"
                >
                    <LinkIcon size={16} strokeWidth={2.5} />
                    <span className="hidden md:inline">Acesso Diário</span>
                </button>
                <button 
                    onClick={() => setShowSettingsModal(true)}
                    className="h-9 md:h-10 w-9 md:w-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm active:scale-95 hover:border-slate-300"
                    title="Configurar Diário"
                >
                    <Settings size={18} strokeWidth={2} />
                </button>
            </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-500">
        
        {/* Navegação de Abas - Estilo Flat Horizontal */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-sm px-4 md:px-8 py-4 md:py-5 mb-6 md:mb-8 flex items-center gap-6 md:gap-12 overflow-x-auto scrollbar-hide sticky top-20 md:top-24 z-20">
            {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as Tab)}
                        className={`
                            text-xs font-black uppercase tracking-widest flex flex-col md:flex-row items-center gap-2 md:gap-2.5 transition-all whitespace-nowrap shrink-0 group
                            ${isActive 
                                ? 'text-deep' 
                                : 'text-slate-400 hover:text-slate-600'}
                        `}
                    >
                        <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-deep text-white shadow-lg shadow-deep/20 scale-110' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span className="text-[10px] md:text-xs">{tab.label}</span>
                        {isActive && <div className="md:hidden w-1 h-1 bg-deep rounded-full mt-1"></div>}
                    </button>
                )
            })}
        </div>

        {/* Conteúdo das Abas */}
        <div className="min-h-[500px]">
            
            {activeTab === 'overview' && (
                <div className="space-y-6 md:space-y-8">
                    {/* Top Stats Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                        <StatCard 
                            icon={Activity} 
                            label="Registros" 
                            value={registrosCompletos.length} 
                            color="deep" 
                        />
                        <StatCard 
                            icon={TrendingUp} 
                            label="Média Humor" 
                            value={avgHumor} 
                            color="purple" 
                        />
                        <StatCard 
                            icon={CheckSquare} 
                            label="Metas Ativas" 
                            value={metas.filter(m => !m.concluida).length} 
                            color="orange" 
                        />
                        <StatCard 
                            icon={Clock} 
                            label="Sessões" 
                            value={paciente.evolucoes ? paciente.evolucoes.length : "-"} 
                            color="emerald" 
                        />
                    </div>

                    {/* Análise de Humor & Bem-Estar Unificado */}
                    <MoodAnalytics data={registrosCompletos} />

                    {/* Plano de Ação (Metas) - Somente Visualização */}
                    <div>
                         {/* @ts-ignore */}
                        <GoalManager pacienteId={paciente.id} readOnly onManage={() => setActiveTab('goals')} />
                    </div>

                </div>
            )}

            {activeTab === 'instruments' && (
                <div className="w-full">
                    <InstrumentManager 
                        pacienteId={paciente.id} 
                        instrumentos={instrumentos} 
                        solicitacoesPendente={solicitacoesPendente}
                        paciente={paciente}
                        dadosCadastrais={dadosCadastrais}
                        psicologoLogado={psicologoLogado}
                    />
                </div>
            )}


            {activeTab === 'records' && (
                <div className="w-full">
                    <ProntuarioManager 
                        pacienteId={paciente.id} 
                        paciente={paciente}
                        dadosCadastrais={dadosCadastrais ?? paciente} 
                        anamneseInicial={anamneseInicial}
                        prontuarioInicial={prontuarioInicial}
                        psicologoLogado={psicologoLogado}
                    />
                </div>
            )}

            {activeTab === 'journal' && (
                <div className="space-y-6 md:space-y-8 w-full">
                    {/* AI Insight & Stats */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                        {/* Análise Automática - Narrower (2/5) */}
                        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[1.5rem] p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden group h-full">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Sparkles size={80} />
                            </div>
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-violet-200">
                                    <Sparkles size={18} />
                                </div>
                                <h4 className="text-xs font-bold text-violet-600 uppercase tracking-widest font-logo">
                                    Análise Automática
                                </h4>
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed font-medium relative z-10">
                                "{aiInsightText}"
                            </p>
                        </div>

                        {/* Nuvem de Contextos - Wider (3/5) */}
                        <Card className="lg:col-span-3 flex flex-col justify-center gap-4 h-full">
                             <div className="flex items-center gap-2 text-slate-400">
                                <Tag size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest font-logo">Nuvem de Contextos</span>
                             </div>
                             <div className="flex flex-wrap gap-2 items-center content-start">
                                <button
                                    onClick={() => setFilterTag(null)}
                                    className={`text-xs px-3 py-1.5 rounded-full transition-all border ${!filterTag ? 'bg-slate-800 text-white border-slate-800 shadow-md transform scale-105' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                                >
                                    Todos
                                </button>
                                {sortedTags.map((tag, i) => (
                                    <button
                                        key={tag}
                                        onClick={() => setFilterTag(tag === filterTag ? null : tag)}
                                        className={`text-xs px-3 py-1.5 rounded-full transition-all border flex items-center gap-1 ${filterTag === tag ? 'bg-deep text-white border-deep shadow-md transform scale-105' : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-sm'}`}
                                    >
                                        <span className="opacity-50">#</span>{tag}
                                    </button>
                                ))}
                             </div>
                        </Card>
                    </div>

                    <Card>
                         <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-medium text-slate-900 tracking-tight font-logo">Diário Completo</h3>
                                <p className="text-sm font-normal text-slate-500 mt-1">Histórico completo de registros</p>
                            </div>
                            {filterTag && (
                                <button onClick={() => setFilterTag(null)} className="text-xs text-red-500 hover:underline">
                                    Limpar filtro: <b>{filterTag}</b>
                                </button>
                            )}
                         </div>
                         <div className="mb-8 p-1">
                             <MoodAnalytics data={filteredRecords} />
                         </div>
                         
                         {/* Grid Layout 3 Colunas */}
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredRecords.slice().reverse().map(reg => (
                                <div 
                                    key={reg.id} 
                                    onClick={() => setSelectedRecord(reg)}
                                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col gap-2 group cursor-pointer hover:border-deep/20 relative"
                                >
                                    <div className="absolute top-4 right-4">
                                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 font-logo">
                                            {new Date(reg.data).toLocaleDateString('pt-BR', {day: 'numeric', month: 'short'})}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm shrink-0 border transition-colors
                                            ${reg.humor >= 4 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                              reg.humor === 3 ? 'bg-slate-50 text-slate-600 border-slate-200' :
                                              'bg-rose-50 text-rose-600 border-rose-100'}
                                        `}>
                                             {reg.humor >= 4 ? <Smile size={20} strokeWidth={2} /> : <div className="w-2 h-2 bg-current rounded-full"/>}
                                        </div>
                                        <div className="flex flex-col">
                                            <h4 className="text-sm font-bold text-slate-900 capitalize leading-tight font-logo">
                                                {new Date(reg.data).toLocaleDateString('pt-BR', {weekday: 'long'})}
                                            </h4>
                                            {reg.tags && reg.tags.length > 0 && (
                                                <div className="flex gap-1 flex-wrap mt-1">
                                                    {reg.tags.slice(0, 2).map((tag: string) => (
                                                        <span key={tag} className="bg-slate-50 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-slate-500 border border-slate-200 font-logo">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {reg.tags.length > 2 && <span className="text-[9px] font-medium text-slate-400">+{reg.tags.length - 2}</span>}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="mt-2 text-left">
                                        {reg.notas ? (
                                            <p className="text-xs text-slate-600 italic leading-snug line-clamp-2">"{reg.notas}"</p>
                                        ) : (
                                            <p className="text-[10px] text-slate-300 italic">Sem anotações.</p>
                                        )}
                                    </div>

                                    <div className="pt-2 mt-2 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400">
                                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date(reg.data).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                                        <span className={`font-medium ${
                                            reg.sono >= 4 ? 'text-emerald-600' :
                                            reg.sono === 3 ? 'text-deep' :
                                            'text-rose-600'
                                        }`}>
                                            Sono {reg.sono === 5 ? 'Ótimo' : reg.sono === 4 ? 'Bom' : reg.sono === 3 ? 'Regular' : reg.sono === 2 ? 'Ruim' : 'Péssimo'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                         </div>
                         {filteredRecords.length === 0 && (
                             <div className="py-12 text-center text-slate-400 text-sm">Nenhum registro encontrado com estes filtros.</div>
                         )}
                    </Card>
                </div>
            )}

            {activeTab === 'goals' && (
                <div className="w-full">
                    {/* @ts-ignore */}
                    <GoalManager pacienteId={paciente.id} />
                </div>
            )}

            {activeTab === 'notes' && (
                <div className="w-full">
                    <Card>
                        <h3 className="text-lg font-medium text-slate-900 mb-1">Notas Clínicas Privadas</h3>
                        <p className="text-xs font-normal text-slate-500 mb-6">Anotações rápidas que não vão para o prontuário oficial.</p>
                        <ClinicalNotes pacienteId={paciente.id} initialNotes={notasIniciais} />
                    </Card>
                </div>
            )}
            
        </div>
            
        {/* Modal de Detalhes do Registro */}
        {selectedRecord && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 relative">
                    <div className="absolute top-4 right-4 z-10">
                        <button onClick={() => setSelectedRecord(null)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all">
                            <ChevronRight size={24} className="rotate-90" />
                        </button>
                    </div>
                    
                    <div className="p-6 space-y-5 max-h-[85vh] overflow-y-auto">
                        
                        {/* Header do Modal */}
                        <div className="flex flex-col items-center text-center">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm border mb-3
                                ${selectedRecord.humor >= 4 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                    selectedRecord.humor === 3 ? 'bg-slate-50 text-slate-600 border-slate-200' :
                                    'bg-rose-50 text-rose-600 border-rose-100'}
                            `}>
                                    {selectedRecord.humor >= 4 ? <Smile size={28} strokeWidth={2} /> : <div className="w-3 h-3 bg-current rounded-full"/>}
                            </div>
                            
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 font-logo">
                                {new Date(selectedRecord.data).toLocaleDateString('pt-BR', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}
                            </p>
                            <h2 className="text-2xl font-bold text-slate-900 font-logo">
                                {selectedRecord.humor === 5 ? 'Radiante' : selectedRecord.humor === 4 ? 'Feliz' : selectedRecord.humor === 3 ? 'Neutro' : selectedRecord.humor === 2 ? 'Triste' : 'Deprimido'}
                            </h2>
                        </div>

                        {/* Tags */}
                        {selectedRecord.tags && selectedRecord.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 justify-center">
                                {selectedRecord.tags.map((tag: string) => (
                                    <span key={tag} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border border-slate-200 font-logo">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="w-full h-px bg-slate-100 my-1"></div>

                        {/* Texto Completo */}
                        {selectedRecord.notas ? (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 overflow-hidden">
                                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap break-words text-sm">
                                    "{selectedRecord.notas}"
                                </p>
                            </div>
                        ) : (
                            <div className="text-center py-4 text-slate-400 italic text-sm">Sem anotações detalhadas.</div>
                        )}

                        {/* Footer Info */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white border border-slate-200 p-3 rounded-xl flex flex-col items-center gap-1.5 shadow-sm text-center">
                                <Clock size={18} className="text-deep mb-0.5" />
                                <div>
                                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider font-logo">Horário</p>
                                    <p className="text-sm font-bold text-slate-900">{new Date(selectedRecord.data).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</p>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200 p-3 rounded-xl flex flex-col items-center gap-1.5 shadow-sm text-center">
                                <div className={`${
                                    selectedRecord.sono >= 4 ? 'text-emerald-500' :
                                    selectedRecord.sono === 3 ? 'text-deep' :
                                    'text-rose-500'
                                } mb-0.5`}>
                                    <Activity size={18} />
                                </div>
                                <div>
                                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider font-logo">Sono</p>
                                    <p className="text-sm font-bold text-slate-900">
                                        {selectedRecord.sono === 5 ? 'Ótimo' : selectedRecord.sono === 4 ? 'Bom' : selectedRecord.sono === 3 ? 'Regular' : selectedRecord.sono === 2 ? 'Ruim' : 'Péssimo'}
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        )}
        {/* Modal de Configurações do Diário */}
        {showSettingsModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 relative">
                     <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 font-logo">Configurar Diário</h3>
                            <p className="text-xs text-slate-500">Gerenciar acesso e datas do paciente</p>
                        </div>
                        <button onClick={() => setShowSettingsModal(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-500 p-2 rounded-full transition-colors">
                            <ChevronRight size={20} className="rotate-90" />
                        </button>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        {/* Toggle Ativo */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${configDiario.ativo ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                                    <BookOpen size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">Acesso ao Diário</p>
                                    <p className="text-xs text-slate-500">{configDiario.ativo ? 'Paciente pode acessar' : 'Acesso pausado pelo psico'}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setConfigDiario(prev => ({ ...prev, ativo: !prev.ativo }))}
                                className={`relative w-12 h-7 rounded-full transition-colors duration-300 focus:outline-none ${configDiario.ativo ? 'bg-emerald-500' : 'bg-slate-300'}`}
                            >
                                <span className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-sm transition-transform duration-300 ${configDiario.ativo ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        {/* Data de Início */}
                        <div className="space-y-2">
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Data de Início dos Registros</label>
                             <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input 
                                    type="date" 
                                    value={configDiario.dataInicio}
                                    onChange={(e) => setConfigDiario(prev => ({ ...prev, dataInicio: e.target.value }))}
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-deep/5 focus:border-deep/20 transition-all"
                                />
                             </div>
                             <p className="text-[10px] text-slate-400 leading-relaxed">
                                Define a partir de quando o paciente pode ver datas passadas e iniciar o preenchimento retroativo (opcional).
                             </p>
                        </div>

                        {/* Botão Salvar */}
                        <button 
                            onClick={handleSaveConfig}
                            disabled={loadingConfig}
                            className="w-full bg-deep text-white font-medium py-3.5 rounded-xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-deep/10"
                        >
                            {loadingConfig ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </div>
            </div>
        )}


        {/* Dica de Ativação - Estilo Toast Persistente/Popup - Só aparece se não estiver no tour */}
        {showActivationTip && !showSettingsModal && onboardingStep === 0 && (
            <div className="fixed bottom-6 right-6 z-[90] animate-in slide-in-from-bottom-10 duration-500 max-w-sm w-full">
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xl shadow-slate-900/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-deep" />
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 text-deep">
                             <Zap size={20} fill="currentColor" className="opacity-20" />
                             <Zap size={20} className="absolute" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm mb-1">Ativar Diário do Paciente?</h4>
                            <p className="text-xs text-slate-500 leading-relaxed mb-3">
                                O diário começa desativado. Configure a data de início e libere o acesso para que o paciente comece a registrar.
                            </p>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => { setShowSettingsModal(true); }}
                                    className="px-3 py-1.5 bg-deep text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-sm shadow-deep/20"
                                >
                                    Configurar Agora
                                </button>
                                <button 
                                    onClick={() => setShowActivationTip(false)}
                                    className="px-3 py-1.5 text-slate-400 text-xs font-medium hover:text-slate-600 transition-colors"
                                >
                                    Depois
                                </button>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setShowActivationTip(false)} className="absolute top-2 right-2 text-slate-300 hover:text-slate-500 p-1">
                        <ChevronRight size={14} className="rotate-90" />
                    </button>
                </div>
            </div>
        )}

        {/* Dica de Funcionalidades (Onboarding) - Passo 1: Prontuário & Relatórios */}
        {onboardingStep === 1 && !showSettingsModal && (
            <div className="fixed bottom-6 right-6 z-[90] animate-in slide-in-from-bottom-10 duration-500 max-w-sm w-full">
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xl shadow-slate-200/50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-deep" />
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 text-deep">
                             <FileText size={20} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-slate-100 text-deep text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">Passo 1 de 3</span>
                                <h4 className="font-bold text-slate-800 text-sm">Prontuário & Relatórios</h4>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed mb-3">
                                Aqui você registra a <strong>Anamnese</strong>, faz as <strong>Evoluções</strong> e pode <strong>Imprimir o Prontuário</strong> completo em PDF.
                            </p>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => { setActiveTab('records'); setOnboardingStep(2); }}
                                    className="px-3 py-1.5 bg-deep text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-sm shadow-deep/20"
                                >
                                    Ver Prontuário & Próximo
                                </button>
                                <button 
                                    onClick={() => setOnboardingStep(0)}
                                    className="px-3 py-1.5 text-slate-400 text-xs font-medium hover:text-slate-600 transition-colors"
                                >
                                    Pular
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Dica de Funcionalidades (Onboarding) - Passo 2: Notas Clínicas Pessoais */}
        {onboardingStep === 2 && !showSettingsModal && (
            <div className="fixed bottom-6 right-6 z-[90] animate-in slide-in-from-bottom-10 duration-500 max-w-sm w-full">
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xl shadow-slate-200/50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0 text-amber-600">
                             <Lock size={20} />
                        </div>
                        <div>
                           <div className="flex items-center gap-2 mb-1">
                                <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">Passo 2 de 3</span>
                                <h4 className="font-bold text-slate-800 text-sm">Notas Pessoais</h4>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed mb-3">
                                Um espaço seguro para suas anotações pessoais. O que você escreve aqui é <strong>privado</strong> e o paciente nunca terá acesso.
                            </p>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => { setActiveTab('notes'); setOnboardingStep(3); }}
                                    className="px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
                                >
                                    Ver Notas & Próximo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Dica de Funcionalidades (Onboarding) - Passo 3: Metas e Diário */}
        {onboardingStep === 3 && !showSettingsModal && (
            <div className="fixed bottom-6 right-6 z-[90] animate-in slide-in-from-bottom-10 duration-500 max-w-sm w-full">
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xl shadow-slate-200/50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 text-emerald-600">
                             <Target size={20} />
                        </div>
                        <div>
                           <div className="flex items-center gap-2 mb-1">
                                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">Passo 3 de 3</span>
                                <h4 className="font-bold text-slate-800 text-sm">Metas e Diário</h4>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed mb-3">
                                Defina <strong>Metas</strong> interativas e acompanhe o <strong>Diário</strong> de humor e sono preenchido pelo paciente.
                            </p>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => { setActiveTab('goals'); setOnboardingStep(0); }}
                                    className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                                >
                                    Ver Metas & Concluir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}
