"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft, Save, CheckCircle2 } from "lucide-react";
import { salvarAplicacaoInstrumento } from "../../actions";
import { toast } from "sonner";

interface GAD7Props {
    pacienteId: string;
    onFinish: () => void;
    customSaveAction?: (answers: any, result: any) => Promise<{ success: boolean; error?: string }>;
}

import { GAD7_QUESTIONS as QUESTIONS, INSTRUMENT_OPTIONS as OPTIONS } from "./constants";

export default function GAD7({ pacienteId, onFinish, customSaveAction }: GAD7Props) {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(false);

    const totalScore = Object.values(answers).reduce((acc, val) => acc + val, 0);

    const getResult = (score: number) => {
        if (score <= 4) return { level: "Ansiedade Mínima", cor: "#10b981" };
        if (score <= 9) return { level: "Ansiedade Leve", cor: "#f59e0b" };
        if (score <= 14) return { level: "Ansiedade Moderada", cor: "#fbbf24" };
        return { level: "Ansiedade Grave", cor: "#ef4444" };
    };

    const handleSave = async () => {
        if (Object.keys(answers).length < QUESTIONS.length) {
            toast.error("Por favor, responda todas as perguntas.");
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
                "GAD-7",
                answers,
                { score: totalScore, ...result }
            );
        }

        if (res.success) {
            toast.success("GAD-7 salvo com sucesso!");
            onFinish();
        } else {
            toast.error(res.error || "Erro ao salvar.");
        }
        setLoading(false);
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="p-6 md:p-8 bg-slate-50 border-b border-slate-100">
                <div className="flex justify-between items-center mb-4">
                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-lg">Instrumento Clínico</span>
                    <span className="text-xs font-medium text-slate-500">Questão {step + 1} de {QUESTIONS.length}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">GAD-7</h3>
                <p className="text-sm text-slate-500 font-medium">Transtorno de Ansiedade Generalizada</p>
                
                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-slate-200 rounded-full mt-6 overflow-hidden">
                    <div 
                        className="h-full bg-orange-500 transition-all duration-500" 
                        style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8 min-h-[300px] flex flex-col justify-center">
                <div className="mb-8">
                    <h4 className="text-lg md:text-xl font-medium text-slate-800 leading-relaxed">
                        {QUESTIONS[step]}
                    </h4>
                    <p className="text-sm text-slate-400 mt-2 font-medium">Nas últimas 2 semanas, com que frequência você foi incomodado por este problema?</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => {
                                setAnswers(prev => ({ ...prev, [step]: opt.value }));
                                if (step < QUESTIONS.length - 1) setTimeout(() => setStep(step + 1), 200);
                            }}
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                                answers[step] === opt.value 
                                ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm' 
                                : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-slate-50 text-slate-600'
                            }`}
                        >
                            <span className="font-semibold text-sm">{opt.label}</span>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${answers[step] === opt.value ? 'border-orange-500 bg-orange-500' : 'border-slate-300'}`}>
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

                {step === QUESTIONS.length - 1 ? (
                    <button 
                        onClick={handleSave}
                        disabled={loading || answers[step] === undefined}
                        className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50 text-sm"
                    >
                        {loading ? 'Salvando...' : <><Save size={18} /> Finalizar e Salvar</>}
                    </button>
                ) : (
                    <button 
                        onClick={() => setStep(s => Math.min(QUESTIONS.length - 1, s + 1))}
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
                    Fonte: Spitzer RL, Kroenke K, Williams JBW, et al; A Brief Measure for Assessing Generalized Anxiety Disorder: The GAD-7. Arch Intern Med. 2006;166:1092-1097.
                </p>
            </div>
        </div>
    );
}
