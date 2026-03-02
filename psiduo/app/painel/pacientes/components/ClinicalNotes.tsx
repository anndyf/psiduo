"use client";

import { useState } from "react";
import { criarNotaClinica, excluirNotaClinica } from "../actions";
import { StickyNote, Plus, Trash2, Calendar, Clock, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ClinicalNotesProps {
    pacienteId: string;
    initialNotes: any[];
}

export default function ClinicalNotes({ pacienteId, initialNotes }: ClinicalNotesProps) {
    const [notas, setNotas] = useState(initialNotes);
    const [novoConteudo, setNovoConteudo] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!novoConteudo.trim()) return;

        setIsSaving(true);
        // @ts-ignore
        const res = await criarNotaClinica(pacienteId, novoConteudo);
        
        if (res.success && res.nota) {
            setNotas([res.nota, ...notas]);
            setNovoConteudo("");
            toast.success("Nota adicionada!");
        } else {
            toast.error(res.error || "Erro ao salvar nota.");
        }
        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta nota?")) return;
        
        // Optimistic update
        const previousNotes = [...notas];
        setNotas(notas.filter(n => n.id !== id));

        const res = await excluirNotaClinica(id, pacienteId);
        
        if (res.success) {
            toast.success("Nota excluída.");
        } else {
            setNotas(previousNotes);
            toast.error("Erro ao excluir nota.");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Input Area - Clean & Blue-900 Accent */}
            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 focus-within:ring-2 focus-within:ring-deep/10 focus-within:bg-white transition-all shadow-inner">
                <textarea
                    value={novoConteudo}
                    onChange={(e) => setNovoConteudo(e.target.value)}
                    placeholder="Escreva uma nova observação clínica..."
                    className="w-full h-24 bg-transparent text-sm font-normal text-slate-700 placeholder:text-slate-400 focus:outline-none resize-none mb-3"
                />
                <div className="flex justify-between items-center px-1">
                    <p className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                        <StickyNote size={14} /> Notas Privadas
                    </p>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving || !novoConteudo.trim()}
                        className="bg-deep text-white px-5 py-2 rounded-xl text-xs font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-deep/20 hover:shadow-deep/30 active:scale-95"
                    >
                        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={16} strokeWidth={2} />}
                        {isSaving ? "Salvando..." : "Adicionar Nota"}
                    </button>
                </div>
            </div>

            {/* Notes List */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 py-2">
                {notas.map((nota) => (
                    <div key={nota.id} className="relative group bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-lg hover:shadow-slate-900/5 transition-all">
                         <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <span className="bg-slate-50 text-deep px-3 py-1 rounded-lg text-[10px] font-medium flex items-center gap-1.5 border border-slate-100">
                                    <Calendar size={12} strokeWidth={2} />
                                    {new Date(nota.criadoEm).toLocaleDateString('pt-BR')}
                                </span>
                                <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                                    <Clock size={12} strokeWidth={2} />
                                    {new Date(nota.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            
                            <button 
                                onClick={() => handleDelete(nota.id)}
                                className="text-slate-300 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all md:opacity-0 md:group-hover:opacity-100 opacity-100"
                                title="Excluir nota"
                            >
                                <Trash2 size={16} strokeWidth={2} />
                            </button>
                        </div>
                        <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed font-normal pl-3 border-l-2 border-slate-100 group-hover:border-deep/20 transition-colors">
                            {nota.conteudo}
                        </p>
                    </div>
                ))}

                {notas.length === 0 && (
                    <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/30">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 text-slate-300 shadow-sm border border-slate-50">
                             <StickyNote size={24} strokeWidth={1.5} />
                        </div>
                        <p className="text-sm font-medium text-slate-900 mb-1">Nenhuma nota registrada</p>
                        <p className="text-xs text-slate-500 font-normal">Suas anotações privadas aparecerão aqui.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
