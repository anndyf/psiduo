"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft, Save, AlertTriangle, CheckCircle2 } from "lucide-react";
import { salvarAplicacaoInstrumento } from "../../actions";
import { toast } from "sonner";
import { 
    PHQ9_QUESTIONS as QUESTIONS, 
    INSTRUMENT_OPTIONS as OPTIONS, 
    PHQ9_FUNCTIONAL_QUESTION, 
    FUNCTIONAL_OPTIONS 
} from "./constants";

interface PHQ9Props {
    pacienteId: string;
    onFinish: () => void;
    customSaveAction?: (answers: any, result: any) => Promise<{ success: boolean; error?: string }>;
}

export default function PHQ9({ pacienteId, onFinish, customSaveAction }: PHQ9Props) {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(false);

    // Score only counts the main 9 questions (indices 0-8)
    const totalScore = Object.entries(answers)
        .filter(([key]) => parseInt(key) < 9)
        .reduce((acc, [, val]) => acc + val, 0);

    const getResult = (score: number) => {
        if (score <= 4) return { level: "Depressão Mínima", cor: "#10b981" };
        if (score <= 9) return { level: "Depressão Leve", cor: "#f59e0b" };
        if (score <= 14) return { level: "Depressão Moderada", cor: "#fbbf24" };
        if (score <= 19) return { level: "Depressão Moderadamente Grave", cor: "#f97316" };
        return { level: "Depressão Grave", cor: "#ef4444" };
    };

    const handleNext = () => {
        if (step < QUESTIONS.length - 1) {
            setStep(step + 1);
        } else if (step === QUESTIONS.length - 1) {
            // Check if any symptoms were reported before showing functional question
            const hasSymptoms = Object.values(answers).some(val => val > 0);
            if (hasSymptoms) {
                setStep(step + 1);
            } else {
                handleSave();
            }
        }
    };

    const handleSave = async () => {
        // Validation only for main questions
        if (Object.keys(answers).filter(k => parseInt(k) < 9).length < QUESTIONS.length) {
            toast.error("Por favor, responda todas as perguntas principais.");
            return;
        }

        setLoading(true);
        const result = getResult(totalScore);
        
        let res;
        
        if (customSaveAction) {
            res = await customSaveAction(answers, { score: totalScore, ...result });
        } else {
            res = await salvarAplicacaoInstrumento(
                pacienteId,
                "PHQ-9",
                answers,
                { score: totalScore, ...result }
            );
        }

        if (res.success) {
            toast.success("PHQ-9 salvo com sucesso!");
            onFinish();
        } else {
            toast.error(res.error || "Erro ao salvar.");
        }
        setLoading(false);
    };

    const isFunctionalStep = step === QUESTIONS.length;
    
    // Total steps logic for progress bar
    // If score > 0, we have QUESTIONS.length + 1 steps. Otherwise just QUESTIONS.length.
    // However, we don't know score > 0 until the end. 
    // We can assume +1 and adjust or just use simple math based on current state.
    const hasSymptomsSoFar = Object.values(answers).some(val => val > 0);
    const totalSteps = QUESTIONS.length + (hasSymptomsSoFar ? 1 : 0);

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="p-6 md:p-8 bg-slate-50 border-b border-slate-100">
                <div className="flex justify-between items-center mb-4">
                    <span className="bg-slate-100 text-deep text-xs font-bold px-2.5 py-1 rounded-lg">Instrumento Clínico</span>
                    <span className="text-xs font-medium text-slate-500">
                        {isFunctionalStep ? "Avaliação de Impacto" : `Questão ${step + 1} de ${QUESTIONS.length}`}
                    </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">PHQ-9</h3>
                <p className="text-sm text-slate-500 font-medium">Questionário de Saúde do Paciente</p>
                
                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-slate-200 rounded-full mt-6 overflow-hidden">
                    <div 
                        className="h-full bg-deep transition-all duration-500" 
                        style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8 min-h-[300px] flex flex-col justify-center">
                <div className="mb-8">
                    <h4 className="text-lg md:text-xl font-medium text-slate-800 leading-relaxed">
                        {isFunctionalStep ? PHQ9_FUNCTIONAL_QUESTION : QUESTIONS[step]}
                    </h4>
                    <p className="text-sm text-slate-400 mt-2 font-medium">
                        {isFunctionalStep 
                            ? "Assinale a opção que melhor descreve sua dificuldade."
                            : "Nas últimas 2 semanas, com que frequência você foi incomodado por este problema?"}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {(isFunctionalStep ? FUNCTIONAL_OPTIONS : OPTIONS).map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => {
                                setAnswers(prev => ({ ...prev, [step]: opt.value }));
                                
                                // Auto advance logic
                                if (!isFunctionalStep) {
                                    // If we are at the last main question (index 8)
                                    if (step === QUESTIONS.length - 1) {
                                        const newAnswers = { ...answers, [step]: opt.value };
                                        const hasSymp = Object.values(newAnswers).some(val => val > 0);
                                        
                                        if (hasSymp) {
                                            setTimeout(() => setStep(step + 1), 200);
                                        }
                                    } else {
                                        setTimeout(() => setStep(step + 1), 200);
                                    }
                                }
                            }}
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                                answers[step] === opt.value 
                                ? 'border-deep bg-slate-100 text-deep shadow-sm' 
                                : 'border-slate-200 bg-white hover:border-deep/30 hover:bg-slate-50 text-slate-600'
                            }`}
                        >
                            <span className="font-semibold text-sm">{opt.label}</span>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${answers[step] === opt.value ? 'border-deep bg-deep' : 'border-slate-300'}`}>
                                {answers[step] === opt.value && <CheckCircle2 size={14} className="text-white" />}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <button 
                    onClick={() => setStep(s => Math.max(0, s - 1))}
                    disabled={step === 0}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors disabled:opacity-0"
                >
                    <ChevronLeft size={18} /> Anterior
                </button>

                {/* Logic for Next/Finish Button */}
                {(() => {
                    const isLastMainQuestion = step === QUESTIONS.length - 1;
                    const hasSymptoms = Object.entries(answers)
                        .filter(([k]) => parseInt(k) < 9)
                        .some(([, v]) => v > 0);
                    
                    // If functional step, we finish.
                    if (isFunctionalStep) {
                        return (
                            <button 
                                onClick={handleSave}
                                disabled={loading || answers[step] === undefined}
                                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50 text-sm"
                            >
                                {loading ? 'Salvando...' : <><Save size={18} /> Finalizar e Salvar</>}
                            </button>
                        );
                    }

                    // If last main question and NO symptoms, we finish.
                    if (isLastMainQuestion && !hasSymptoms && answers[step] !== undefined) {
                         return (
                            <button 
                                onClick={handleSave}
                                disabled={loading}
                                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50 text-sm"
                            >
                                {loading ? 'Salvando...' : <><Save size={18} /> Finalizar e Salvar</>}
                            </button>
                        );
                    }

                    // Otherwise regular next button
                    return (
                        <button 
                            onClick={handleNext}
                            disabled={answers[step] === undefined}
                            className="flex items-center gap-2 text-deep hover:text-slate-800 font-bold transition-colors disabled:opacity-30"
                        >
                            Próxima <ChevronRight size={18} />
                        </button>
                    );
                })()}
            </div>

            {/* Alerta de Risco (Questão 9 - índice 8) */}
            {!isFunctionalStep && answers[8] > 0 && (
                <div className="m-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertTriangle className="text-red-500 shrink-0" size={20} />
                    <div>
                        <p className="text-xs font-bold text-red-700">Atenção Crítica</p>
                        <p className="text-[10px] text-red-600 leading-tight">O paciente indicou pensamentos de auto-extermínio. Avalie imediatamente o risco e siga o protocolo de segurança.</p>
                    </div>
                </div>
            )}
            
            {/* Reference Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-100 text-center">
                <p className="text-[10px] text-slate-400 leading-tight max-w-xl mx-auto">
                    Fonte: Desenvolvido pelos Drs. Robert L. Spitzer, Janet B.W. Williams, Kurt Kroenke e colegas, com subsídio educacional da Pfizer Inc.
                </p>
            </div>
        </div>
    );
}
