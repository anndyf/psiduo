"use client";

import { useState } from "react";
import { Activity, History, ChevronRight, Plus, FileText, TrendingUp, Trash2, Calendar, Layout, ArrowLeft, MoreHorizontal, Clock, Info, Share2, CheckCircle2, Circle, BookOpen } from "lucide-react";
import PHQ9 from "./instruments/PHQ9";
import GAD7 from "./instruments/GAD7";
import WHO5 from "./instruments/WHO5";
import PSS10 from "./instruments/PSS10";
import ISI from "./instruments/ISI";
import { excluirAplicacaoInstrumento, solicitarInstrumentos, cancelarSolicitacao } from "../actions";
import { gerarPDFInstrumento } from '@/lib/gerarPDF';
import { toast } from "sonner";
import { 
    PHQ9_QUESTIONS, 
    GAD7_QUESTIONS, 
    WHO5_QUESTIONS,
    PSS10_QUESTIONS,
    ISI_QUESTIONS,
    INSTRUMENT_OPTIONS, 
    PHQ9_FUNCTIONAL_QUESTION, 
    FUNCTIONAL_OPTIONS 
} from "./instruments/constants";

interface InstrumentManagerProps {
    pacienteId: string;
    instrumentos: any[];
    solicitacoesPendente: any[];
    paciente?: any;
    dadosCadastrais?: any;
    psicologoLogado?: any;
}

type ViewState = 'list' | 'apply' | 'details';

export default function InstrumentManager({ pacienteId, instrumentos = [], solicitacoesPendente = [], paciente, dadosCadastrais, psicologoLogado }: InstrumentManagerProps) {
    const [view, setView] = useState<ViewState>('list');
    const [currentInstrument, setCurrentInstrument] = useState<string | null>(null);
    const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
    const [applicationQueue, setApplicationQueue] = useState<string[]>([]);

    const availableInstruments = [
        { 
            id: 'phq9', 
            name: 'PHQ-9', 
            fullName: 'Questionário de Saúde do Paciente',
            description: 'Rastreamento e severidade de depressão baseado nos critérios do DSM-IV.',
            color: 'deep'
        },
        { 
            id: 'gad7', 
            name: 'GAD-7', 
            fullName: 'Transtorno de Ansiedade Generalizada',
            description: 'Rastreamento e severidade de ansiedade generalizada.',
            category: 'Ansiedade',
            color: 'orange'
        },
        { 
            id: 'who5', 
            name: 'WHO-5', 
            fullName: 'Índice de Bem-Estar (OMS)',
            description: 'Medida curta de bem-estar psicológico subjetivo e qualidade de vida.',
            category: 'Bem-Estar',
            color: 'emerald'
        },
        { 
            id: 'pss10', 
            name: 'PSS-10', 
            fullName: 'Escala de Estresse Percebido',
            description: 'Mede o grau em que situações na vida de uma pessoa são avaliadas como estressantes.',
            category: 'Estresse',
            color: 'orange'
        },
        { 
            id: 'isi', 
            name: 'ISI', 
            fullName: 'Índice de Gravidade de Insônia',
            description: 'Avalia a gravidade da insônia e o impacto no funcionamento diurno.',
            color: 'deep'
        }
    ];

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta aplicação? Esta ação não pode ser desfeita.")) return;
        
        setIsDeleting(id);
        const res = await excluirAplicacaoInstrumento(id, pacienteId);
        if (res.success) {
            toast.success("Aplicação excluída.");
            if (selectedApplication?.id === id) setView('list');
        } else {
            toast.error(res.error || "Erro ao excluir.");
        }
        setIsDeleting(null);
    };

    const handleCancelSolicitacao = async (id: string) => {
        if (!confirm("Deseja cancelar esta solicitação pendente?")) return;
        const res = await cancelarSolicitacao(id, pacienteId);
        if (res.success) {
            toast.success("Solicitação cancelada.");
        } else {
            toast.error("Erro ao cancelar.");
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedInstruments(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleCopyRequestLink = async () => {
        const selectedNames = availableInstruments
            .filter(i => selectedInstruments.includes(i.id))
            .map(i => i.name)
            .join(", ");
            
        // Registrar solicitação no banco
        const res = await solicitarInstrumentos(pacienteId, selectedInstruments);
        
        if (!res.success) {
            toast.error("Erro ao registrar solicitação no banco.");
            return;
        }

        const link = `${window.location.origin}/avaliacoes`;
        const textToCopy = `Olá! Gostaria que você respondesse aos seguintes questionários no portal PsiDuo: ${selectedNames}.\n\nLink de acesso: ${link}`;
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            toast.success("Link de agendamento copiado com sucesso!");
            setSelectedInstruments([]);
        });
    };

    const handleStartBattery = () => {
        if (selectedInstruments.length === 0) return;
        setApplicationQueue(selectedInstruments);
        setCurrentInstrument(selectedInstruments[0]);
    };

    const handleNextInQueue = () => {
        setApplicationQueue(prev => {
            const nextQueue = prev.slice(1);
            if (nextQueue.length > 0) {
                setCurrentInstrument(nextQueue[0]);
            } else {
                setCurrentInstrument(null);
                setView('list');
                setSelectedInstruments([]);
            }
            return nextQueue;
        });
    };

    const renderApply = () => {
        const onFinish = applicationQueue.length > 1 ? handleNextInQueue : () => { setView('list'); setApplicationQueue([]); };

        if (currentInstrument === 'phq9') return <PHQ9 pacienteId={pacienteId} onFinish={onFinish} />;
        if (currentInstrument === 'gad7') return <GAD7 pacienteId={pacienteId} onFinish={onFinish} />;
        if (currentInstrument === 'who5') return <WHO5 pacienteId={pacienteId} onFinish={onFinish} />;
        if (currentInstrument === 'pss10') return <PSS10 pacienteId={pacienteId} onFinish={onFinish} />;
        if (currentInstrument === 'isi') return <ISI pacienteId={pacienteId} onFinish={onFinish} />;
        return null;
    };

    const renderDetails = () => {
        if (!selectedApplication) return null;
        const res = selectedApplication.resultado;

        const questions = selectedApplication.tipo === 'PHQ-9' 
            ? PHQ9_QUESTIONS 
            : selectedApplication.tipo === 'GAD-7' 
                ? GAD7_QUESTIONS 
                : selectedApplication.tipo === 'WHO-5'
                    ? WHO5_QUESTIONS
                    : selectedApplication.tipo === 'PSS-10'
                        ? PSS10_QUESTIONS
                        : ISI_QUESTIONS;
        const optionsMap = Object.fromEntries(INSTRUMENT_OPTIONS.map(opt => [opt.value, opt.label]));
        // WHO-5 uses different labels
        if (selectedApplication.tipo === 'WHO-5') {
             [0,1,2,3,4,5].forEach(v => {
                 const labels = ["Nunca", "Algumas vezes", "Menos da metade", "Mais da metade", "Maioria do tempo", "Todo o tempo"];
                 optionsMap[v] = labels[v];
             });
        }
        // PSS-10 uses different labels
        if (selectedApplication.tipo === 'PSS-10') {
            [0,1,2,3,4].forEach(v => {
                const labels = ["Nunca", "Quase nunca", "Às vezes", "Com certa frequência", "Muito frequentemente"];
                optionsMap[v] = labels[v];
            });
        }
        // ISI uses different labels depending on question
        if (selectedApplication.tipo === 'ISI') {
            // This is a bit tricky as ISI has different labels per question. 
            // We'll use a generic mapping for the details view or specific ones if we check the index.
            [0,1,2,3,4].forEach(v => {
                const labels = ["Nenhuma/Muito Satisfeito/Nada", "Leve/Satisfeito/Um pouco", "Moderada/Neutro/Moderadamente", "Grave/Insatisfeito/Muito", "Muito Grave/Muito Insatisfeito/Extremamente"];
                optionsMap[v] = labels[v];
            });
        }
        const functionalOptionsMap = Object.fromEntries(FUNCTIONAL_OPTIONS.map(opt => [opt.value, opt.label]));
        const functionalAnswer = selectedApplication.respostas['9'];

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between">
                    <button 
                        onClick={() => { setView('list'); setSelectedApplication(null); }}
                        className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold transition-all group"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
                        Voltar para Instrumentos
                    </button>
                    
                    <div className="flex gap-2">
                        <button 
                            onClick={async () => {
                                try {
                                    await gerarPDFInstrumento(paciente, dadosCadastrais, psicologoLogado, selectedApplication, instrumentos);
                                } catch (e) {
                                    toast.error('Erro ao gerar relatorio.');
                                    console.error(e);
                                }
                            }}
                            className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
                        >
                            <Layout size={16} /> Imprimir Relatório
                        </button>
                        <button 
                            onClick={() => handleDelete(selectedApplication.id)}
                            disabled={isDeleting === selectedApplication.id}
                            className="bg-white border border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-100 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
                        >
                            <Trash2 size={16} /> {isDeleting === selectedApplication.id ? 'Excluindo...' : 'Excluir'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                            <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-100">
                                <div>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-deep mb-2">
                                        Resultado da Avaliação
                                    </span>
                                    <h3 className="text-2xl font-bold text-slate-900">{selectedApplication.tipo}</h3>
                                    <p className="text-slate-500 flex items-center gap-2 mt-1 text-sm">
                                        <Calendar size={14} />
                                        {new Date(selectedApplication.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-slate-500">Score Total</p>
                                            <div className="text-3xl font-bold text-slate-900" style={{ color: res.cor }}>
                                                {res.score}
                                            </div>
                                        </div>
                                        <div 
                                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm"
                                            style={{ backgroundColor: res.cor || '#6366f1' }}
                                        >
                                            <Activity size={20} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-6 mb-8 border border-slate-100">
                                <h4 className="text-sm font-semibold text-slate-900 mb-2">Interpretação Clínica</h4>
                                <p className="text-lg font-medium" style={{ color: res.cor }}>{res.level}</p>
                                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                                    {selectedApplication.tipo === 'PHQ-9' 
                                        ? "O PHQ-9 avalia a presença e a gravidade de sintomas depressivos. O score é calculado somando a pontuação de cada um dos 9 itens (0 a 3), resultando em um total de 0 a 27."
                                        : selectedApplication.tipo === 'GAD-7'
                                            ? "O GAD-7 rastreia transtorno de ansiedade generalizada e avalia sua gravidade. O score é a soma simples dos 7 itens (0 a 3), variando de 0 a 21."
                                            : selectedApplication.tipo === 'WHO-5'
                                                ? "O WHO-5 mede o bem-estar subjetivo. O cálculo é feito somando os 5 itens (0 a 5 cada) e multiplicando o total por 4 para obter uma porcentagem de 0 a 100%."
                                                : selectedApplication.tipo === 'PSS-10'
                                                    ? "A PSS-10 mede o estresse percebido. O score varia de 0 a 40. Itens 4, 5, 7 e 8 são pontuados inversamente. Escores elevados indicam maior percepção de estresse."
                                                    : "O ISI avalia a gravidade da insônia. O score total de 0 a 28 é a soma dos 7 itens. Pontuações de 0-7 (ausência), 8-14 (sublimiar), 15-21 (moderada) e 22-28 (grave)."}
                                </p>
                                
                                <div className="mt-4 pt-4 border-t border-slate-200">
                                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                        <BookOpen size={12} /> Referência Bibliográfica
                                    </h5>
                                    <p className="text-xs text-slate-400 font-medium italic">
                                        {selectedApplication.tipo === 'PHQ-9' 
                                            ? "Kroenke, K., Spitzer, R. L., & Williams, J. B. (2001). The PHQ-9: validity of a brief depression severity measure. Journal of general internal medicine, 16(9), 606-613."
                                            : selectedApplication.tipo === 'GAD-7'
                                                ? "Spitzer, R. L., Kroenke, K., Williams, J. B., & Löwe, B. (2006). A brief measure for assessing generalized anxiety disorder: the GAD-7. Archives of internal medicine, 166(10), 1092-1097."
                                                : selectedApplication.tipo === 'WHO-5'
                                                    ? "Topp, C. W., Østergaard, S. D., Søndergaard, S., & Bech, P. (2015). The WHO-5 Well-Being Index: a systematic review of the literature. Psychotherapy and psychosomatics, 84(3), 167-176."
                                                    : selectedApplication.tipo === 'PSS-10'
                                                        ? "Reis, R. S., Hino, A. A. F., & Añez, C. R. R. (2010). Perceived stress scale: reliability and validity study in Brazil. Journal of health psychology, 15(1), 107-114."
                                                        : "Bastien, C. H., Vallières, A., & Morin, C. M. (2001). Validation of the Insomnia Severity Index as an outcome measure for insomnia research. Sleep medicine, 2(4), 297-307."}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <FileText size={18} className="text-deep" /> Respostas Detalhadas
                                </h4>
                                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                                    {Object.entries(selectedApplication.respostas)
                                        .filter(([key]) => parseInt(key) < 9) // Only show main questions here
                                        .map(([key, value]) => {
                                        const index = parseInt(key);
                                        const answerValue = value as number;
                                        return (
                                            <div key={key} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row justify-between gap-4">
                                                <div className="flex gap-3">
                                                    <span className="text-xs font-bold text-slate-400 w-6 pt-1">#{index + 1}</span>
                                                    <p className="text-sm font-medium text-slate-700">
                                                        {questions[index] || `Questão ${index + 1}`}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0 sm:text-right">
                                                    <span className="text-sm font-bold text-slate-900">
                                                        {optionsMap[answerValue]}
                                                    </span>
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                                        answerValue >= 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                        ({answerValue} pts)
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <p className="text-xs text-slate-400 mt-4 text-center italic mb-8">
                                    * Pontuação individual de 0 a {
                                        selectedApplication.tipo === 'WHO-5' ? '5' : 
                                        ['PSS-10', 'ISI'].includes(selectedApplication.tipo) ? '4' : '3'
                                    } para cada item.
                                </p>

                                {functionalAnswer !== undefined && (
                                    <div className="bg-orange-50 rounded-xl p-6 border border-orange-100 animate-in slide-in-from-bottom-2">
                                        <h4 className="text-sm font-bold text-orange-800 mb-2 flex items-center gap-2">
                                            <Activity size={16} className="text-orange-600" /> Impacto Funcional
                                        </h4>
                                        <p className="text-xs text-orange-700/80 mb-4 font-medium leading-relaxed">
                                            {PHQ9_FUNCTIONAL_QUESTION}
                                        </p>
                                        <div className="bg-white p-4 rounded-xl border border-orange-200 shadow-sm flex items-center justify-between">
                                            <span className="text-sm font-bold text-slate-900">
                                                {functionalOptionsMap[functionalAnswer as number]}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-full">
                        <div className="bg-slate-50 border border-slate-100 w-10 h-10 rounded-xl flex items-center justify-center text-deep mb-4">
                                <TrendingUp size={20} />
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 mb-2">Análise Evolutiva</h4>
                            <p className="text-sm text-slate-500 leading-relaxed mb-6">
                                Monitoramento automático baseado no último instrumento aplicado.
                            </p>
                            
                            {(() => {
                                // Default logic to determine evolution
                                const sorted = instrumentos
                                    .filter(i => i.tipo === selectedApplication.tipo)
                                    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
                                    
                                if (sorted.length < 2) {
                                    return (
                                        <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                            <p className="text-sm font-bold text-slate-700 mb-1">Dados insuficientes</p>
                                            <p className="text-xs text-slate-500">
                                                São necessárias pelo menos <strong className="text-slate-700">2 avaliações</strong> deste mesmo instrumento para gerar a análise evolutiva em formato de gráfico.
                                            </p>
                                        </div>
                                    );
                                }

                                const current = sorted[0];
                                const previous = sorted[1];
                                
                                const diff = current.resultado.score - previous.resultado.score;
                                let status = "Estável";
                                let colorClass = "bg-slate-400";
                                let textClass = "text-deep";
                                
                                const isWho5 = current.tipo === 'WHO-5';
                                let isBetter = false;
                                if (diff !== 0) {
                                   isBetter = isWho5 ? diff > 0 : diff < 0;
                                }
                                
                                if (Math.abs(diff) >= 2) {
                                    if (isBetter) {
                                        status = "Melhora Clínica";
                                        colorClass = "bg-emerald-500";
                                        textClass = "text-emerald-700";
                                    } else {
                                        status = "Atenção Necessária";
                                        colorClass = "bg-orange-500";
                                        textClass = "text-orange-700";
                                    }
                                }

                                return (
                                    <div className="space-y-4">
                                        <div className="space-y-3">
                                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tendência Recente</div>
                                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                <div className={`w-2 h-2 rounded-full ${colorClass}`} />
                                                <div>
                                                    <p className={`text-xs font-bold ${textClass}`}>{status}</p>
                                                    <p className="text-[10px] text-slate-400">Vs. avaliação anterior</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="pt-2 border-t border-slate-100">
                                            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3 block">Histórico de Pontuações</div>
                                            <div className="space-y-2">
                                                {sorted.map((item, idx) => (
                                                    <div key={item.id} className="flex justify-between items-center text-xs">
                                                        <div className="text-slate-500 font-medium flex items-center gap-2">
                                                            {new Date(item.data).toLocaleDateString('pt-BR')}
                                                            {idx === 0 && <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase font-bold tracking-widest hidden sm:inline-block">Atual</span>}
                                                        </div>
                                                        <div className="font-bold text-slate-700 text-right whitespace-nowrap">
                                                            {item.resultado.score} pts
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Helper to calculate summary stats
    const getSummaryStats = () => {
        const phq9List = instrumentos.filter(i => i.tipo === 'PHQ-9');
        const gad7List = instrumentos.filter(i => i.tipo === 'GAD-7');

        const getLastScore = (list: any[]) => {
            if (list.length === 0) return null;
            return list.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0].resultado.score;
        };

        const phq9Score = getLastScore(phq9List);
        const gad7Score = getLastScore(gad7List);

        const getLabel = (score: number, type: 'PHQ-9' | 'GAD-7') => {
            if (type === 'PHQ-9') {
                if (score <= 4) return { label: 'Mínima', color: 'text-emerald-600', barInfo: 'bg-emerald-500' };
                if (score <= 9) return { label: 'Leve', color: 'text-yellow-600', barInfo: 'bg-yellow-500' };
                if (score <= 14) return { label: 'Moderada', color: 'text-orange-500', barInfo: 'bg-orange-500' };
                if (score <= 19) return { label: 'Mod. Grave', color: 'text-orange-600', barInfo: 'bg-orange-600' };
                return { label: 'Grave', color: 'text-red-600', barInfo: 'bg-red-600' };
            } else {
                if (score <= 4) return { label: 'Mínima', color: 'text-emerald-600', barInfo: 'bg-emerald-500' };
                if (score <= 9) return { label: 'Leve', color: 'text-yellow-600', barInfo: 'bg-yellow-500' };
                if (score <= 14) return { label: 'Moderada', color: 'text-orange-500', barInfo: 'bg-orange-500' };
                return { label: 'Grave', color: 'text-red-600', barInfo: 'bg-red-600' };
            }
        };

        return {
            phq9: phq9Score !== null ? { score: phq9Score, ...getLabel(phq9Score, 'PHQ-9') } : null,
            gad7: gad7Score !== null ? { score: gad7Score, ...getLabel(gad7Score, 'GAD-7') } : null
        };
    };

    const stats = getSummaryStats();

    return (
        <div className="space-y-6 pb-20 font-sans">
            {view === 'list' && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Instrumentos Clínicos</h3>
                        <p className="text-sm text-slate-500">Gerencie as avaliações e escalas psicométricas.</p>
                    </div>
                    <button 
                        onClick={() => setView('apply')}
                        className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-black transition-all shadow-lg active:scale-95 shadow-slate-200"
                    >
                        <Plus size={18} strokeWidth={2.5} /> Novo Instrumento
                    </button>
                </div>
            )}

            {view === 'list' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-slate-900 animate-pulse" />
                                    Histórico de Aplicações
                                </h4>
                                <span className="bg-slate-50 border border-slate-200 text-slate-500 px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                                    {instrumentos.length} registros
                                </span>
                            </div>
                            
                            {instrumentos.length > 0 ? (
                                <div className="divide-y divide-slate-100">
                                    {instrumentos.map((item) => (
                                        <div 
                                            key={item.id} 
                                            onClick={() => { setSelectedApplication(item); setView('details'); }}
                                            className="group flex items-center justify-between p-5 hover:bg-slate-50/80 transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-slate-900"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-slate-900 transition-all shadow-sm group-hover:shadow-md border border-transparent group-hover:border-slate-100">
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h5 className="text-base font-bold text-slate-800 group-hover:text-deep transition-colors">{item.tipo}</h5>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                            item.tipo === 'PHQ-9' ? 'bg-slate-100 text-deep' : 
                                                            item.tipo === 'GAD-7' ? 'bg-orange-50 text-orange-600' : 
                                                            item.tipo === 'WHO-5' ? 'bg-emerald-50 text-emerald-600' : 
                                                            item.tipo === 'PSS-10' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-deep'
                                                        }`}>
                                                            {item.tipo === 'PHQ-9' ? 'Depressão' : 
                                                             item.tipo === 'GAD-7' ? 'Ansiedade' : 
                                                             item.tipo === 'WHO-5' ? 'Bem-Estar' : 
                                                             item.tipo === 'PSS-10' ? 'Estresse' : 'Sono'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1.5">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar size={12} className="text-slate-400" />
                                                            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-tight">
                                                                {new Date(item.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                            </p>
                                                        </div>
                                                        <span className="text-slate-200 text-[10px]">/</span>
                                                        <p className="text-[11px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 shadow-sm">SCORE {item.resultado.score}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right hidden sm:block">
                                                    <span 
                                                        className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border"
                                                        style={{ 
                                                            backgroundColor: `${item.resultado.cor}10`, 
                                                            color: item.resultado.cor,
                                                            borderColor: `${item.resultado.cor}30`
                                                        }}
                                                    >
                                                        {item.resultado.level}
                                                    </span>
                                                </div>
                                                <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all shadow-sm group-hover:shadow-lg group-hover:scale-110">
                                                    <ChevronRight size={18} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center bg-slate-50/50">
                                    <div className="w-20 h-20 bg-white border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200 shadow-sm">
                                        <History size={36} />
                                    </div>
                                    <p className="text-base font-bold text-slate-700">Nenhum instrumento aplicado</p>
                                    <p className="text-sm text-slate-500 mt-2 max-w-[280px] mx-auto leading-relaxed">
                                        O histórico de avaliações do paciente aparecerá aqui. Comece uma nova aplicação agora.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Solicitações Pendentes */}
                        {solicitacoesPendente.length > 0 && (
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden bg-gradient-to-br from-white to-slate-50/50">
                                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-deep flex items-center justify-center text-white shadow-lg shadow-deep/10">
                                            <Activity size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800">Solicitações Ativas</h4>
                                            <p className="text-[10px] font-bold text-deep uppercase tracking-widest">Aguardando Paciente</p>
                                        </div>
                                    </div>
                                    <span className="bg-deep text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-sm">
                                        {solicitacoesPendente.length}
                                    </span>
                                </div>
                                <div className="p-4 space-y-2">
                                    {solicitacoesPendente.map((sol) => (
                                        <div key={sol.id} className="bg-white/80 backdrop-blur-sm border border-slate-100 p-3 rounded-2xl flex items-center justify-between group hover:border-deep/20 transition-all shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-deep border border-slate-100">
                                                    <FileText size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{sol.tipo}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium">Solicitado em {new Date(sol.data).toLocaleDateString('pt-BR')}</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleCancelSolicitacao(sol.id)}
                                                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                                title="Cancelar solicitação"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3 bg-white">
                                <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-200">
                                    <TrendingUp size={20} />
                                </div>
                                <h4 className="text-sm font-bold text-slate-800">Resumo Clínico</h4>
                            </div>
                            
                            <div className="p-6 space-y-6">
                                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                    Indicadores baseados nas últimas avaliações aplicadas ao paciente.
                                </p>
                                                                {stats.phq9 ? (
                                    <div className="pt-2">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Depressão (PHQ-9)</span>
                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${stats.phq9.barInfo.replace('bg-', 'bg-').replace('500', '50').replace('600', '50')} ${stats.phq9.color} border border-current/10`}>
                                                {stats.phq9.label}
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${stats.phq9.barInfo} transition-all duration-1000 shadow-[0_0_10px_rgba(0,0,0,0.1)]`} 
                                                style={{ width: `${Math.min((stats.phq9.score / 27) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                        <p className="text-xs text-slate-400 italic">Sem dados de PHQ-9 registrados</p>
                                    </div>
                                )}

                                 {stats.gad7 ? (
                                    <div className="pt-4 border-t border-slate-50">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ansiedade (GAD-7)</span>
                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${stats.gad7.barInfo.replace('bg-', 'bg-').replace('500', '50').replace('600', '50')} ${stats.gad7.color} border border-current/10`}>
                                                {stats.gad7.label}
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${stats.gad7.barInfo} transition-all duration-1000 shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
                                                style={{ width: `${Math.min((stats.gad7.score / 21) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                        <p className="text-xs text-slate-400 italic">Sem dados de GAD-7 registrados</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xl shadow-slate-200/40 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-slate-900/10" />
                            <h4 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Info size={18} className="text-slate-900" /> Referências de Pontuação
                            </h4>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="w-1.5 h-1.5 rounded-full bg-deep"></span>
                                        <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">PHQ-9 (Depressão)</h5>
                                    </div>
                                    <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">0 - 4</span>
                                            <span className="text-slate-600 font-medium">Nenhuma / Mínima</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-yellow-700 bg-yellow-50 border border-yellow-100 px-2 py-0.5 rounded">5 - 9</span>
                                            <span className="text-slate-600 font-medium">Leve</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-orange-700 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded">10 - 14</span>
                                            <span className="text-slate-600 font-medium">Moderada</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-orange-800 bg-orange-100 border border-orange-200 px-2 py-0.5 rounded">15 - 19</span>
                                            <span className="text-slate-600 font-medium">Mod. Grave</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-red-700 bg-red-50 border border-red-100 px-2 py-0.5 rounded">20 - 27</span>
                                            <span className="text-slate-600 font-medium">Grave</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                                        <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">GAD-7 (Ansiedade)</h5>
                                    </div>
                                    <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">0 - 4</span>
                                            <span className="text-slate-600 font-medium">Mínima</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-yellow-700 bg-yellow-50 border border-yellow-100 px-2 py-0.5 rounded">5 - 9</span>
                                            <span className="text-slate-600 font-medium">Leve</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-orange-700 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded">10 - 14</span>
                                            <span className="text-slate-600 font-medium">Moderada</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-red-700 bg-red-50 border border-red-100 px-2 py-0.5 rounded">15 - 21</span>
                                            <span className="text-slate-600 font-medium">Grave</span>
                                        </div>
                                    </div>
                                </div>

                                 <div className="pt-2">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                        <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">WHO-5 (Bem-Estar)</h5>
                                    </div>
                                    <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">&gt; 50</span>
                                            <span className="text-slate-600 font-medium">Bom Bem-Estar</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-yellow-700 bg-yellow-50 border border-yellow-100 px-2 py-0.5 rounded">29 - 50</span>
                                            <span className="text-slate-600 font-medium">Bem-Estar Baixo</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-red-700 bg-red-50 border border-red-100 px-2 py-0.5 rounded">0 - 28</span>
                                            <span className="text-slate-600 font-medium">Provável Depressão</span>
                                        </div>
                                    </div>
                                </div>
                                 <div className="pt-2">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                        <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">PSS-10 (Estresse)</h5>
                                    </div>
                                    <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">0 - 13</span>
                                            <span className="text-slate-600 font-medium">Estresse Baixo</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-yellow-700 bg-yellow-50 border border-yellow-100 px-2 py-0.5 rounded">14 - 26</span>
                                            <span className="text-slate-600 font-medium">Estresse Moderado</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-red-700 bg-red-50 border border-red-100 px-2 py-0.5 rounded">27 - 40</span>
                                            <span className="text-slate-600 font-medium">Estresse Alto</span>
                                        </div>
                                    </div>
                                </div>
                                 <div className="pt-2">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="w-1.5 h-1.5 rounded-full bg-deep"></span>
                                        <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">ISI (Gravidade de Insônia)</h5>
                                    </div>
                                    <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">0 - 7</span>
                                            <span className="text-slate-600 font-medium">Ausência de Insônia</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-yellow-700 bg-yellow-50 border border-yellow-100 px-2 py-0.5 rounded">8 - 14</span>
                                            <span className="text-slate-600 font-medium">Insônia Sublimiar</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-orange-700 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded">15 - 21</span>
                                            <span className="text-slate-600 font-medium">Insônia Moderada</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-red-700 bg-red-50 border border-red-100 px-2 py-0.5 rounded">22 - 28</span>
                                            <span className="text-slate-600 font-medium">Insônia Grave</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : view === 'apply' ? (
                <div className="space-y-6">
                    <button 
                        onClick={() => { setView('list'); setCurrentInstrument(null); }}
                        className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold transition-all group"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
                        Voltar para Lista
                    </button>

                    {!currentInstrument ? (
                        <>
                            <div className="bg-white border border-slate-200 rounded-[1.5rem] p-6 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-5 animate-in fade-in slide-in-from-bottom-4 duration-300 shadow-sm">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 border border-slate-200">
                                    <Info size={24} />
                                </div>
                                <div className="text-center sm:text-left mt-0.5">
                                    <h4 className="text-base font-black text-slate-800 mb-2 tracking-tight">Qual a diferença entre Aplicar e Agendar?</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium max-w-3xl">
                                        Use <strong className="text-slate-900">Aplicar</strong> para preencher você mesmo as respostas na hora da sessão (presencial ou online). Use <strong className="text-slate-900">Agendar</strong> para copiar e enviar um link para o próprio paciente responder o teste de forma autônoma.
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in slide-in-from-bottom-6 duration-500 pb-24">
                                {availableInstruments.map(instrument => (
                                <div 
                                    key={instrument.id} 
                                    className="bg-white p-6 rounded-[1.5rem] border border-slate-200 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/40 transition-all group flex flex-col items-start text-left relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-bl-full -mr-8 -mt-8 group-hover:bg-slate-100 transition-colors" />
                                     <div className="flex justify-between items-start w-full mb-4 relative z-10 pl-8">
                                         <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-md ${
                                             instrument.id === 'phq9' ? 'bg-deep shadow-slate-100' : 
                                             instrument.id === 'gad7' ? 'bg-orange-500 shadow-orange-100' : 
                                             instrument.id === 'who5' ? 'bg-emerald-500 shadow-emerald-100' : 
                                             instrument.id === 'pss10' ? 'bg-amber-500 shadow-amber-100' : 'bg-slate-900 shadow-slate-200'
                                         }`}>
                                            <Activity size={20} />
                                        </div>
                                        <span className="bg-slate-50 border border-slate-100 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-widest">
                                            {instrument.category}
                                        </span>
                                    </div>
                                    
                                    <h4 className="text-lg font-black text-slate-900 mb-0.5 group-hover:text-slate-800 transition-colors uppercase tracking-tight">{instrument.name}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{instrument.fullName}</p>
                                    
                                    <p className="text-sm text-slate-500 mb-6 leading-relaxed flex-grow font-medium line-clamp-2">
                                        {instrument.description}
                                    </p>
                                    
                                    <div className="w-full pt-4 border-t border-slate-50 mt-auto grid grid-cols-2 gap-3">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setCurrentInstrument(instrument.id); }}
                                            className="text-xs font-bold text-white bg-slate-900 hover:bg-black py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 group/btn shadow-md shadow-slate-100 active:scale-95"
                                        >
                                            Aplicar <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" strokeWidth={3} />
                                        </button>
                                        
                                        <button 
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                const res = await solicitarInstrumentos(pacienteId, [instrument.id]);
                                                if (!res.success) {
                                                    toast.error("Erro ao registrar agendamento.");
                                                    return;
                                                }
                                                const link = `${window.location.origin}/avaliacoes`;
                                                const textToCopy = `Olá! Gostaria que você respondesse ao seguinte questionário no portal PsiDuo: ${instrument.name}.\n\nLink de acesso: ${link}`;
                                                navigator.clipboard.writeText(textToCopy).then(() => {
                                                    toast.success("Agendamento realizado! Link copiado.");
                                                });
                                            }}
                                            className="text-xs font-bold text-slate-400 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
                                            title="Agendar para o paciente"
                                        >
                                            <Share2 size={14} /> Agendar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        </>
                    ) : (
                        renderApply()
                    )}


                </div>
            ) : (
                renderDetails()
            )}
        </div>
    );
}
