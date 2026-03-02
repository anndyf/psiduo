"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft, Save, CheckCircle2 } from "lucide-react";
import { salvarAplicacaoInstrumento } from "../../actions";
import { toast } from "sonner";
import { 
    WHO5_QUESTIONS as QUESTIONS, 
    WHO5_OPTIONS as OPTIONS 
} from "./constants";

interface WHO5Props {
    pacienteId: string;
    onFinish: () => void;
    customSaveAction?: (answers: any, result: any) => Promise<{ success: boolean; error?: string }>;
}

export default function WHO5({ pacienteId, onFinish, customSaveAction }: WHO5Props) {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(false);

    const rawScore = Object.values(answers).reduce((acc, val) => acc + val, 0);
    const percentageScore = rawScore * 4;

    const getResult = (score: number) => {
        // According to WHO-5 guidelines:
        // A score below 50 indicates poor well-being and is a screen for depression.
        // A score of 28 or below indicates likely depression.
        if (score > 50) return { level: "Bem-estar Bom", cor: "#10b981", percentage: score };
        if (score >= 29) return { level: "Bem-estar Baixo (Rastreio para Depressão)", cor: "#f59e0b", percentage: score };
        return { level: "Provável Depressão", cor: "#ef4444", percentage: score };
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
        const result = getResult(percentageScore);
        
        let res;
        
        if (customSaveAction) {
            res = await customSaveAction(answers, { score: percentageScore, ...result, rawScore });
        } else {
            res = await salvarAplicacaoInstrumento(
                pacienteId,
                "WHO-5",
                answers,
                { score: percentageScore, ...result, rawScore }
            );
        }

        if (res.success) {
            toast.success("WHO-5 salvo com sucesso!");
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
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-lg">Índice de Bem-Estar</span>
                    <span className="text-xs font-medium text-slate-500">
                        Questão {step + 1} de {QUESTIONS.length}
                    </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">WHO-5</h3>
                <p className="text-sm text-slate-500 font-medium">Índice de Bem-Estar da Organização Mundial da Saúde</p>
                
                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-slate-200 rounded-full mt-6 overflow-hidden">
                    <div 
                        className="h-full bg-emerald-600 transition-all duration-500" 
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
                        Nas últimas 2 semanas, com que frequência você se sentiu assim?
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
                                ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm' 
                                : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50 text-slate-600'
                            }`}
                        >
                            <span className="font-semibold text-sm">{opt.label}</span>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${answers[step] === opt.value ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'}`}>
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
                        className="flex items-center gap-2 text-emerald-600 hover:text-emerald-800 font-bold transition-colors disabled:opacity-30"
                    >
                        Próxima <ChevronRight size={18} />
                    </button>
                )}
            </div>
            
            {/* Reference Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-100 text-center">
                <p className="text-[10px] text-slate-400 leading-tight max-w-xl mx-auto">
                    Fonte: Who-5 Well-being Index. Psychother Psychosom 1998;67:302-307. O Índice de Bem-Estar WHO-5 é um questionário curto e auto-administrado que mede o bem-estar psicológico subjetivo.
                </p>
            </div>
        </div>
    );
}
