"use client";

import { useState } from "react";
import { criarNotaClinica, excluirNotaClinica } from "../actions";
import { StickyNote, Plus, Trash2, Calendar, Clock } from "lucide-react";

interface Nota {
    id: string;
    conteudo: string;
    criadoEm: Date;
}

interface PsychologistNotesProps {
    pacienteId: string;
    notasIniciais: Nota[];
}

export default function PsychologistNotes({ pacienteId, notasIniciais }: PsychologistNotesProps) {
    const [notas, setNotas] = useState<Nota[]>(notasIniciais);
    const [novoConteudo, setNovoConteudo] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!novoConteudo.trim()) return;

        setIsSaving(true);
        const res = await criarNotaClinica(pacienteId, novoConteudo);
        
        if (res.success && res.nota) {
            setNotas([res.nota, ...notas]);
            setNovoConteudo("");
        } else {
            alert(res.error || "Erro ao salvar nota.");
        }
        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta nota?")) return;

        const res = await excluirNotaClinica(id, pacienteId);
        if (res.success) {
            setNotas(notas.filter(n => n.id !== id));
        } else {
            alert("Erro ao excluir nota.");
        }
    };

    return (
        <div className="mt-12">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                    <StickyNote size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">Notas Clínicas</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Privado (Paciente não vê)</p>
                </div>
            </div>

            {/* Input Area */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-8 transition-all focus-within:shadow-lg focus-within:border-orange-200">
                <textarea
                    value={novoConteudo}
                    onChange={(e) => setNovoConteudo(e.target.value)}
                    placeholder="Escreva uma nova observação..."
                    className="w-full h-24 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none resize-none mb-2"
                />
                <div className="flex justify-end">
                    <button 
                        onClick={handleSave}
                        disabled={isSaving || !novoConteudo.trim()}
                        className="bg-slate-900 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                        {isSaving ? "Salvando..." : <><Plus size={14} /> Adicionar Nota</>}
                    </button>
                </div>
            </div>

            {/* Notes List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notas.map((nota) => (
                    <div key={nota.id} className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100 group relative hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3 text-[10px] font-bold text-orange-400 uppercase tracking-wide">
                                <span className="flex items-center gap-1">
                                    <Calendar size={12} />
                                    {new Date(nota.criadoEm).toLocaleDateString('pt-BR')}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock size={12} />
                                    {new Date(nota.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            
                            <button 
                                onClick={() => handleDelete(nota.id)}
                                className="text-orange-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                title="Excluir nota"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                        
                        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                            {nota.conteudo}
                        </p>
                    </div>
                ))}

                {notas.length === 0 && (
                    <div className="col-span-full text-center py-10 opacity-50">
                        <p className="text-xs font-bold text-slate-400 uppercase italic">Nenhuma nota registrada ainda.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
