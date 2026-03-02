"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft, Save, CheckCircle2 } from "lucide-react";
import { salvarAplicacaoInstrumento } from "../../actions";
import { toast } from "sonner";
import { 
    PSS10_QUESTIONS as QUESTIONS, 
    PSS10_OPTIONS as OPTIONS 
} from "./constants";

interface PSS10Props {
    pacienteId: string;
    onFinish: () => void;
    customSaveAction?: (answers: any, result: any) => Promise<{ success: boolean; error?: string }>;
}

export default function PSS10({ pacienteId, onFinish, customSaveAction }: PSS10Props) {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(false);

    const calculateScore = () => {
        let total = 0;
        const reverseItems = [3, 4, 6, 7]; // Items 4, 5, 7, 8 (0-indexed: 3, 4, 6, 7)
        
        Object.entries(answers).forEach(([key, val]) => {
            const index = parseInt(key);
            if (reverseItems.includes(index)) {
                total += (4 - val);
            } else {
                total += val;
            }
        });
        return total;
    };

    const getResult = (score: number) => {
        if (score <= 13) return { level: "Estresse Baixo", cor: "#10b981" };
        if (score <= 26) return { level: "Estresse Moderado", cor: "#f59e0b" };
        return { level: "Estresse Alto", cor: "#ef4444" };
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
                "PSS-10",
                answers,
                { score: totalScore, ...result }
            );
        }

        if (res.success) {
            toast.success("PSS-10 salvo com sucesso!");
            onFinish();
        } else {
            toast.error(res.error || "Erro ao salvar.");
        }
        setLoading(false);
    };

    const totalSteps = QUESTIONS.length;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="p-6 md:p-8 bg-slate-50 border-b border-slate-100">
                <div className="flex justify-between items-center mb-4">
                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-lg">Escala de Estresse</span>
                    <span className="text-xs font-medium text-slate-500">
                        Questão {step + 1} de {QUESTIONS.length}
                    </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">PSS-10</h3>
                <p className="text-sm text-slate-500 font-medium">Escala de Estresse Percebido</p>
                
                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-slate-200 rounded-full mt-6 overflow-hidden">
                    <div 
                        className="h-full bg-orange-600 transition-all duration-500" 
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
                        No último mês, com que frequência você se sentiu dessa forma?
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {OPTIONS.map((opt) => (
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
                                ? 'border-orange-600 bg-orange-50 text-orange-700 shadow-sm' 
                                : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-slate-50 text-slate-600'
                            }`}
                        >
                            <span className="font-semibold text-sm">{opt.label}</span>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${answers[step] === opt.value ? 'border-orange-600 bg-orange-600' : 'border-slate-300'}`}>
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
                        className="flex items-center gap-2 text-orange-600 hover:text-orange-800 font-bold transition-colors disabled:opacity-30"
                    >
                        Próxima <ChevronRight size={18} />
                    </button>
                )}
            </div>
            
            {/* Reference Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-100 text-center">
                <p className="text-[10px] text-slate-400 leading-tight max-w-xl mx-auto">
                    Fonte: Cohen, S., Kamarck, T., and Mermelstein, R. (1983). A global measure of perceived stress. Journal of Health and Social Behavior, 24, 385-396. Tradução e validação para o português: Luft et al. (2007).
                </p>
            </div>
        </div>
    );
}
