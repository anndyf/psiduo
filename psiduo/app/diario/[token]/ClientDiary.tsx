"use client";

import { useState } from "react";
import { salvarRegistro } from "../actions";
import { marcarMeta, buscarMetasPeloToken } from "@/app/metas/actions";
import { toast } from "sonner";
import { Frown, Meh, Smile, Moon, AlertTriangle, ShieldCheck, CheckSquare, Square, ArrowRight } from "lucide-react";

interface Paciente {
  id: string;
  nome: string;
  psicologo: { nome: string };
}

interface ClientDiaryProps {
  paciente: Paciente;
  token: string;
  historicoInicial: any[];
  dataInicio?: Date;
  metas?: any[];
}

const SCALE_LABELS = [
  { valor: 1, label: "Muito Baixo" },
  { valor: 2, label: "Baixo" },
  { valor: 3, label: "Regular" },
  { valor: 4, label: "Bom" },
  { valor: 5, label: "Muito Bom" },
];

const SONO_LABELS = ["Muito Ruim", "Ruim", "Regular", "Bom", "Muito Bom"];

const TAGS_SUGERIDAS = [
  "Ansiedade", "Estresse", "Tristeza", "Cansaço", 
  "Trabalho", "Estudos", "Família", "Amigos", 
  "Relacionamento", "Saúde", "Exercício", "Alimentação",
  "Terapia", "Lazer", "Sono"
];

export default function ClientDiary({ paciente, token, historicoInicial, dataInicio, metas = [] }: ClientDiaryProps) {
  const [step, setStep] = useState<'CALENDAR' | 'GOALS' | 'MOOD' | 'SLEEP' | 'CONTEXT' | 'SUCCESS'>('CALENDAR');
  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date());
  
  // Local state for goals to allow immediate interaction
  const [metasLocais, setMetasLocais] = useState(metas);

  // Form State
  const [humor, setHumor] = useState<number | null>(null);
  const [sono, setSono] = useState<number | null>(null);
  const [notas, setNotas] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // State for Overwrite Modal
  const [overwriteModalOpen, setOverwriteModalOpen] = useState(false);
  const [registroAnterior, setRegistroAnterior] = useState<any>(null);

  const getIcon = (valor: number) => {
    if (valor === 1) return <Frown width={40} height={40} className="text-red-500" strokeWidth={2} />;
    if (valor === 2) return <Frown width={40} height={40} className="text-orange-500" />;
    if (valor === 3) return <Meh width={40} height={40} className="text-yellow-500" />;
    if (valor === 4) return <Smile width={40} height={40} className="text-blue-500" />;
    return <Smile width={40} height={40} className="text-green-500" strokeWidth={2} />;
 };

  const isBeforeStart = (date: Date) => {
      if (!dataInicio) return false;
      const start = new Date(dataInicio);
      start.setHours(0,0,0,0);
      const target = new Date(date);
      target.setHours(0,0,0,0);
      return target < start;
  };

  const isHoje = (date: Date) => {
      const hoje = new Date();
      return date.getDate() === hoje.getDate() &&
             date.getMonth() === hoje.getMonth() &&
             date.getFullYear() === hoje.getFullYear();
  };

  // Calendar Logic
  const diasNoMes = new Date(dataSelecionada.getFullYear(), dataSelecionada.getMonth() + 1, 0).getDate();
  const diaSemanaReal = new Date(dataSelecionada.getFullYear(), dataSelecionada.getMonth(), 1).getDay(); // 0(Dom) a 6(Sab)
  
  // Ajuste para semana começar na Segunda (1): Segunda=0 ... Domingo=6
  const primeiroDiaSemana = diaSemanaReal === 0 ? 6 : diaSemanaReal - 1;

  const handleDayClick = async (dia: number) => {
    const data = new Date(dataSelecionada.getFullYear(), dataSelecionada.getMonth(), dia);
    // Verificar se é futuro (bloquear)
    if (data > new Date() || isBeforeStart(data)) return;

    setDataSelecionada(data);

    // Fetch Metas for selected date
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const compDia = String(data.getDate()).padStart(2, '0');
    const dataString = `${ano}-${mes}-${compDia}`;

    let currentMetas = [];
    try {
        const res = await buscarMetasPeloToken(token, dataString);
        if(res.success && res.metas) {
            currentMetas = res.metas;
            setMetasLocais(currentMetas);
        }
    } catch(e) { console.error(e); }

    // Verificar se já existe registro
    const registroExistente = isDiaPreenchido(dia);

    if (registroExistente) {
        setRegistroAnterior(registroExistente);
        setOverwriteModalOpen(true);
    } else {
        resetForm();
        if (currentMetas.length > 0) {
            setStep('GOALS');
        } else {
            setStep('MOOD');
        }
    }
  };

  const handleConfirmOverwrite = () => {
    setOverwriteModalOpen(false);
    resetForm();
    if (metasLocais.length > 0) {
        setStep('GOALS');
    } else {
        setStep('MOOD');
    }
  };

  const toggleMeta = async (id: string, currentStatus: boolean) => {
     // Optimistic
     setMetasLocais(prev => prev.map(m => m.id === id ? { ...m, feitoHoje: !currentStatus } : m));
     
     // Server Call (Background)
     const ano = dataSelecionada.getFullYear();
     const mes = String(dataSelecionada.getMonth() + 1).padStart(2, '0');
     const dia = String(dataSelecionada.getDate()).padStart(2, '0');
     const dataString = `${ano}-${mes}-${dia}`;
     
     await marcarMeta(id, !currentStatus, dataString);
  };

  const resetForm = () => {
    setHumor(null);
    setSono(null);
    setNotas("");
    setTags([]);
  };

  const handleSave = async () => {
    if (!humor || !sono) return;

    // Validação: Se "OUTRO" estiver selecionado, a nota é obrigatória
    if (tags.includes('OUTRO') && !notas.trim()) {
        toast.error('Por favor, descreva o fator "Outro" nas notas.');
        return;
    }

    setLoading(true);
    
    // Normalizar data para string YYYY-MM-DD usando componentes LOCAL
    // Evita problema de UTC (toISOString pode mudar o dia se for feito a noite)
    const ano = dataSelecionada.getFullYear();
    const mes = String(dataSelecionada.getMonth() + 1).padStart(2, '0');
    const dia = String(dataSelecionada.getDate()).padStart(2, '0');
    const dataString = `${ano}-${mes}-${dia}`;
    
    const res = await salvarRegistro(token, dataString, {
        humor,
        sono,
        tags,
        notas
    });

    if (res.success) {
        setStep('SUCCESS');
    } else {
        toast.error("Erro ao salvar. Tente novamente.");
    }
    setLoading(false);
  };

  const isDiaPreenchido = (dia: number) => {
    return historicoInicial.find(h => h.dia === dia);
  };

  const renderGoals = () => {
    const isDateToday = isHoje(dataSelecionada);
    const dateLabel = isDateToday ? "Hoje" : dataSelecionada.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' });

    return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-full">
        <div className="text-center mb-4">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-2">PLANO DE AÇÃO</p>
            <h2 className="text-2xl font-black text-slate-900 uppercase">Metas de {dateLabel}</h2>
        </div>

        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-2 opacity-80 text-center">
             * Marque as atividades que você realizou:
        </p>

        <div className="space-y-4 flex-1 overflow-y-auto py-2">
            {metasLocais.map(meta => (
                <div 
                  key={meta.id}
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col gap-4"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                            <CheckSquare size={20} />
                        </div>
                        <span className="font-black text-sm text-slate-700 uppercase tracking-tight line-clamp-2">
                            {meta.titulo}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => {
                                // Explicitly mark as skipped (false)
                                toggleMeta(meta.id, true); 
                            }}
                            className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all
                                ${meta.feitoHoje === false 
                                    ? 'bg-red-500 text-white shadow-lg shadow-red-200 scale-[1.02]' 
                                    : (!meta.feitoHoje 
                                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-200 scale-[1.02]'
                                        : 'bg-white border text-slate-300 hover:bg-slate-50')
                                }
                            `}
                        >
                            <span className="w-2 h-2 rounded-full bg-current"></span>
                            Não Fiz
                        </button>


                        <button
                            onClick={() => {
                                if (!meta.feitoHoje) toggleMeta(meta.id, false); // Se nao estava feito, faz (seta true)
                            }}
                            className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all
                                ${meta.feitoHoje 
                                    ? 'bg-green-500 text-white shadow-lg shadow-green-200 scale-[1.02]' 
                                    : 'bg-white border text-slate-300 hover:bg-slate-50'
                                }
                            `}
                        >
                            <CheckSquare size={14} />
                            Fiz
                        </button>
                    </div>
                </div>
            ))}
        </div>

        <div className="mt-auto space-y-6 pt-4">
            <button 
                onClick={() => setStep('MOOD')}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition shadow-xl shadow-slate-900/10 active:scale-95"
            >
                Continuar para Diário <ArrowRight size={16} />
            </button>
             <button 
                onClick={() => setStep('CALENDAR')} 
                className="w-full py-2 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] hover:text-slate-500 transition-colors"
            >
                Voltar
            </button>
        </div>
    </div>
    );
  };

  const renderCalendar = () => (
    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="text-center">

            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-2">PACIENTE DE {paciente.psicologo.nome.toUpperCase()}</p>
            <h1 className="text-3xl font-black text-slate-900 uppercase mb-2">Olá, {paciente.nome.split(" ")[0]}</h1>
            <p className="text-sm text-slate-500 font-medium max-w-[280px] mx-auto leading-relaxed">
                Este é seu espaço seguro. Clique em <span className="text-deep font-bold">Registrar Hoje</span> ou selecione uma data no calendário para manter seu histórico em dia.
            </p>
        </header>

        <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
            <div className="flex justify-between items-center mb-6 px-2">
                <h2 className="text-lg font-black uppercase tracking-widest text-slate-900">
                    {dataSelecionada.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                </h2>
                {/* Navegação de mês poderia entrar aqui futuramente */}
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2 text-center">
                {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => (
                    <span key={i} className="text-[10px] font-bold text-slate-400">{d}</span>
                ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: primeiroDiaSemana }).map((_, i) => <div key={`empty-${i}`} />)}
                
                {Array.from({ length: diasNoMes }).map((_, i) => {
                    const dia = i + 1;
                    const data = new Date(dataSelecionada.getFullYear(), dataSelecionada.getMonth(), dia);
                    const isFuture = data > new Date();
                    const isBefore = isBeforeStart(data);
                    const isDisabled = isFuture || isBefore;
                    const isToday = data.toDateString() === new Date().toDateString();
                    const registro = isDiaPreenchido(dia);

                    return (
                        <button
                            key={dia}
                            disabled={isDisabled}
                            onClick={() => handleDayClick(dia)}
                            className={`
                                aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all relative
                                ${isDisabled ? 'text-slate-200 cursor-not-allowed bg-slate-50/50' : 'hover:scale-110 active:scale-90'}
                                ${isToday ? 'border-2 border-deep text-deep' : ''}
                                ${registro ? 'bg-green-50 text-green-700' : (!isDisabled ? 'bg-slate-50 text-slate-600' : '')}
                            `}
                        >
                            {dia}
                            {registro && <span className="absolute bottom-1 w-1 h-1 bg-green-500 rounded-full"></span>}
                        </button>
                    )
                })}
            </div>

            <div className="mt-8 text-center">
                <button 
                    onClick={() => handleDayClick(new Date().getDate())}
                    className="w-full py-4 bg-deep text-white font-black text-xs uppercase tracking-[0.3em] rounded-xl shadow-lg hover:bg-slate-900 transition-all mb-6"
                >
                    Registrar Hoje
                </button>
                
                <div className="flex justify-center gap-6 text-[10px] font-bold uppercase text-slate-400">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>Registrado</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 border-2 border-deep rounded-full"></span>
                        <span>Hoje</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );



  const renderStepMood = () => {
     return (
        <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
            <h2 className="text-2xl text-center font-black text-slate-900 uppercase leading-tight mb-2">
                Como estava seu<br/>
                <span className="text-deep">HUMOR?</span>
            </h2>
            <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Referente a {dataSelecionada.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })}
            </p>
            
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-6 opacity-80 text-center">
                 * Como você classificaria seu nível de bem-estar?
            </p>
    
            <div className="grid gap-3 flex-1 overflow-y-auto content-start">
                {SCALE_LABELS.map((item) => (
                    <button
                        key={item.valor}
                        onClick={() => { setHumor(item.valor); setStep('SLEEP'); }}
                        className="flex items-center gap-6 p-5 bg-white border-2 border-slate-100 rounded-2xl hover:border-deep shadow-sm hover:shadow-xl transition-all group text-left"
                    >
                        <span className="group-hover:scale-125 transition-transform duration-300">
                            {getIcon(item.valor)}
                        </span>
                        <span className="text-sm font-black text-slate-700 uppercase tracking-wider group-hover:text-deep">{item.label}</span>
                    </button>
                ))}
            </div>

            <div className="mt-4">
                 <div className="bg-white p-4 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 mb-6 mx-2">
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide text-center leading-relaxed">
                         * Dica: Considere o saldo geral. Ex: Se teve momentos difíceis mas terminou bem, 
                         <span className="text-deep"> "Regular"</span> ou <span className="text-deep">"Baixo"</span> são opções indicadas.
                    </p>
                 </div>
                <button 
                    onClick={() => metasLocais.length > 0 ? setStep('GOALS') : setStep('CALENDAR')} 
                    className="w-full py-3 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-all"
                >
                    Voltar
                </button>
            </div>
        </div>
     );
  };

  const renderStepSleep = () => (
    <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
        <h2 className="text-2xl text-center font-black text-slate-900 uppercase leading-tight mb-2">
          Como foi sua noite<br/>
          <span className="text-blue-600">de sono anterior?</span>
        </h2>
        <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Referente a {dataSelecionada.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })}
        </p>
        
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-6 opacity-80 text-center">
            * Como você avalia a qualidade do seu sono?
        </p>

        <div className="flex flex-col gap-3 flex-1 overflow-y-auto content-start">
            {[1, 2, 3, 4, 5].map((s) => (
                <button
                    key={s}
                    onClick={() => { setSono(s); setStep('CONTEXT'); }}
                    className="flex items-center justify-between p-5 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all group border border-transparent hover:border-blue-100"
                >
                     <div className="flex gap-1">
                        {Array.from({length: s}).map((_, i) => (
                            <Moon key={i} size={24} className="fill-blue-400 text-blue-400" />
                        ))}
                     </div>
                     <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-500 transition-colors">{SONO_LABELS[s-1]}</span>
                </button>
            ))}
        </div>
        
        <div className="mt-4">
             <div className="bg-white p-4 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 mb-6 mx-2">
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide text-center leading-relaxed">
                     * Dica: Avalie se o sono foi reparador. Ex: Se houve interrupções mas acordou disposto, 
                     <span className="text-blue-600"> "Regular"</span> ou <span className="text-blue-600">"Bom"</span> são opções indicadas.
                </p>
             </div>
            <button 
                onClick={() => setStep('MOOD')} 
                className="w-full py-2 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] hover:text-slate-500 transition-colors"
            >
                Voltar
            </button>
        </div>
    </div>
  );

  const renderStepContext = () => (
    <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
        <h2 className="text-2xl text-center font-black text-slate-900 uppercase leading-tight mb-2">
          Algo impactou <span className="text-deep">seu dia?</span>
        </h2>
        <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Referente a {dataSelecionada.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })}
        </p>

        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-6 opacity-80 text-center">
            * Marque o que aconteceu:
        </p>

        <div className="flex-1 overflow-y-auto pb-24 custom-scrollbar">
            <div className="mb-6">
                <label className="text-[10px] font-black uppercase text-slate-400 mb-4 block tracking-widest">Tags Rápidas</label>
                <div className="flex flex-wrap gap-2">
                    {[...TAGS_SUGERIDAS, 'OUTRO'].map(tag => (
                        <button
                            key={tag}
                            onClick={() => tags.includes(tag) ? setTags(tags.filter(t => t !== tag)) : setTags([...tags, tag])}
                            className={`px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                                tags.includes(tag) 
                                ? 'bg-slate-500 border-slate-500 text-white shadow-md' 
                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-4 block tracking-widest">
                    Notas Pessoais {tags.includes('OUTRO') ? <span className="text-red-400">(Obrigatório)</span> : '(Opcional)'}
                </label>
                <textarea
                    value={notas}
                    onChange={e => setNotas(e.target.value)}
                    placeholder={tags.includes('OUTRO') ? "Descreva o que impactou seu dia..." : "Escreva aqui se quiser detalhar algo..."}
                    className={`w-full h-32 bg-white border-2 rounded-2xl p-4 text-base font-bold text-slate-700 outline-none resize-none transition-colors
                        ${tags.includes('OUTRO') && !notas.trim() ? 'border-red-200 focus:border-red-400' : 'border-slate-200 focus:border-deep'}
                    `}
                />
            </div>
            
            <div className="bg-white p-4 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 mt-6 mx-2">
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide text-center leading-relaxed">
                     * Dica: Registrar o contexto ajuda você e seu psicólogo a entenderem o que afeta seu bem-estar.
                </p>
             </div>
        </div>

        <div className="fixed bottom-0 left-0 w-full p-6 bg-white/80 backdrop-blur-md border-t border-slate-100 flex gap-4 z-50">
            <button 
                onClick={() => setStep('SLEEP')} 
                className="px-8 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-500 uppercase text-xs tracking-widest hover:bg-slate-50 transition shadow-sm"
            >
                Voltar
            </button>
            <button 
                onClick={handleSave}
                disabled={loading}
                className="flex-1 py-4 bg-green-500 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-green-200 hover:bg-green-600 transition-all disabled:opacity-70 disabled:animate-pulse hover:translate-y-[-2px]"
            >
                {loading ? "Salvando..." : "Finalizar"}
            </button>
        </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-in zoom-in duration-500 h-full">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-500">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2">Registrado!</h2>
        <p className="text-sm font-bold text-slate-500 mb-12">Seu psicólogo já recebeu as informações.</p>
        
        <button 
            onClick={() => { window.location.reload(); }} // Reload para atualizar o calendário com dados novos
            className="px-10 py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.3em] rounded-xl hover:bg-black transition-all shadow-xl"
        >
            Voltar ao Início
        </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-mist flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Texture/Gradient Overlay if needed (optional based on interpretation, but bg-mist is the base) */}
        
        <div className="w-full max-w-md min-h-[600px] bg-white/50 backdrop-blur-md rounded-[2rem] shadow-none md:shadow-2xl border border-white/60 p-6 relative z-10 transition-all">
            {/* Global Logo - Visible in all steps */}
            <div className="text-center mb-4">
                <span className="text-4xl font-black tracking-tighter text-deep">
                  Psi<span className="text-blue-500">Duo</span>
                </span>
                <div className="w-12 h-1 bg-slate-200/50 mx-auto mt-3 rounded-full"></div>
            </div>

            {step === 'CALENDAR' && renderCalendar()}
            {step === 'GOALS' && renderGoals()}
            {step === 'MOOD' && renderStepMood()}
            {step === 'SLEEP' && renderStepSleep()}
            {step === 'CONTEXT' && renderStepContext()}
            {step === 'SUCCESS' && renderSuccess()}

            {overwriteModalOpen && registroAnterior && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-white/90 backdrop-blur-md rounded-[2rem] animate-in fade-in duration-200">
                    <div className="w-full max-w-sm text-center">
                        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-600">
                            <AlertTriangle size={40} />
                        </div>
                        
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">
                            Atenção!
                        </h3>
                        <p className="text-sm font-bold text-slate-500 mb-8">
                            Já existe um registro neste dia. Se continuar, os dados abaixo serão substituídos.
                        </p>

                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8 text-left">
                            <div className="flex items-center gap-4 mb-4">
                                <span className="scale-75 origin-left">
                                    {getIcon(registroAnterior.humor)}
                                </span>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Humor</p>
                                    <p className="text-sm font-bold text-slate-700">
                                        {SCALE_LABELS.find(h => h.valor === registroAnterior.humor)?.label}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 flex items-center justify-center bg-blue-50 rounded-full text-blue-500">
                                    <Moon size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Sono</p>
                                    <p className="text-sm font-bold text-slate-700">
                                        {SONO_LABELS[registroAnterior.sono - 1]}
                                    </p>
                                </div>
                            </div>

                            {registroAnterior.tags && registroAnterior.tags.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Impactos</p>
                                    <div className="flex flex-wrap gap-1">
                                        {registroAnterior.tags.slice(0, 3).map((t: string) => (
                                            <span key={t} className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-600 uppercase">{t}</span>
                                        ))}
                                        {registroAnterior.tags.length > 3 && <span className="text-[10px] text-slate-400 font-bold self-center">+{registroAnterior.tags.length - 3}</span>}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setOverwriteModalOpen(false)}
                                className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleConfirmOverwrite}
                                className="flex-1 py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg hover:bg-black transition-all"
                            >
                                Substituir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}
