"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft, Save, CheckCircle2, Moon } from "lucide-react";
import { salvarAplicacaoInstrumento } from "../../actions";
import { toast } from "sonner";
import { ISI_QUESTIONS as QUESTIONS } from "./constants";

interface ISIProps {
    pacienteId: string;
    onFinish: () => void;
    customSaveAction?: (answers: any, result: any) => Promise<{ success: boolean; error?: string }>;
}

export default function ISI({ pacienteId, onFinish, customSaveAction }: ISIProps) {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(false);

    const getOptionsForStep = (currentStep: number) => {
        if (currentStep <= 2) { // Questions 1, 2, 3
            return [
                { label: "Nenhuma", value: 0 },
                { label: "Leve", value: 1 },
                { label: "Moderada", value: 2 },
                { label: "Grave", value: 3 },
                { label: "Muito grave", value: 4 }
            ];
        }
        if (currentStep === 3) { // Question 4
            return [
                { label: "Muito satisfeito", value: 0 },
                { label: "Satisfeito", value: 1 },
                { label: "Nem satisfeito nem insatisfeito", value: 2 },
                { label: "Insatisfeito", value: 3 },
                { label: "Muito insatisfeito", value: 4 }
            ];
        }
        // Questions 5, 6, 7
        return [
            { label: "Nada", value: 0 },
            { label: "Um pouco", value: 1 },
            { label: "Moderadamente", value: 2 },
            { label: "Muito", value: 3 },
            { label: "Extremamente", value: 4 }
        ];
    };

    const calculateScore = () => {
        return Object.values(answers).reduce((acc, curr) => acc + curr, 0);
    };

    const getResult = (score: number) => {
        if (score <= 7) return { level: "Sem insônia clinicamente significativa", cor: "#10b981" };
        if (score <= 14) return { level: "Insônia abaixo do limiar", cor: "#f59e0b" };
        if (score <= 21) return { level: "Insônia clínica (gravidade moderada)", cor: "#f97316" };
        return { level: "Insônia clínica (grave)", cor: "#ef4444" };
    };

    const handleNext = () => {
        if (step < QUESTIONS.length - 1) {
            setStep(step + 1);
        } else {
            handleSave();
        }
    };

    const handleSave = async () => {
        if (Object.keys(answers).length < QUESTIONS.length) {
            toast.error("Por favor, responda todas as perguntas.");
            return;
        }

        setLoading(true);
        const totalScore = calculateScore();
        const result = getResult(totalScore);
        
        let res;
        
        if (customSaveAction) {
            res = await customSaveAction(answers, { score: totalScore, ...result });
        } else {
            res = await salvarAplicacaoInstrumento(
                pacienteId,
                "ISI",
                answers,
                { score: totalScore, ...result }
            );
        }

        if (res.success) {
            toast.success("ISI salvo com sucesso!");
            onFinish();
        } else {
            toast.error(res.error || "Erro ao salvar.");
        }
        setLoading(false);
    };

    const currentOptions = getOptionsForStep(step);
    const totalSteps = QUESTIONS.length;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="p-6 md:p-8 bg-slate-50 border-b border-slate-100">
                <div className="flex justify-between items-center mb-4">
                    <span className="bg-slate-100 text-deep text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <Moon size={12} /> Sono
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                        Questão {step + 1} de {QUESTIONS.length}
                    </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">ISI</h3>
                <p className="text-sm text-slate-500 font-medium">Índice de Gravidade de Insônia</p>
                
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
                        {QUESTIONS[step]}
                    </h4>
                    <p className="text-sm text-slate-400 mt-2 font-medium">
                        {step <= 2 ? "Nas últimas duas semanas, quão grave foi o problema?" : "Nas últimas duas semanas..."}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {currentOptions.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => {
                                setAnswers(prev => ({ ...prev, [step]: opt.value }));
                                if (step < QUESTIONS.length - 1) {
                                    setTimeout(() => setStep(step + 1), 200);
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

                {step === QUESTIONS.length - 1 && answers[step] !== undefined ? (
                    <button 
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50 text-sm"
                    >
                        {loading ? 'Salvando...' : <><Save size={18} /> Finalizar e Salvar</>}
                    </button>
                ) : (
                    <button 
                        onClick={handleNext}
                        disabled={answers[step] === undefined}
                        className="flex items-center gap-2 text-deep hover:text-slate-800 font-bold transition-colors disabled:opacity-30"
                    >
                        Próxima <ChevronRight size={18} />
                    </button>
                )}
            </div>
            
            {/* Reference Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-100 text-center">
                <p className="text-[10px] text-slate-400 leading-tight max-w-xl mx-auto">
                    Fonte: Bastien et al. (2001). ISI (Insomnia Severity Index). Tradução e validação: Castro (2011).
                </p>
            </div>
        </div>
    );
}
