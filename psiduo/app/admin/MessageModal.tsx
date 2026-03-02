"use client";

import { useState } from "react";
import { X, Send, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { enviarMensagemAdmin } from "./actions";

interface MessageModalProps {
    psicologoId: string;
    psicologoNome: string;
    onClose: () => void;
}

export default function MessageModal({ psicologoId, psicologoNome, onClose }: MessageModalProps) {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!message.trim()) return;
        setLoading(true);
        const res = await enviarMensagemAdmin(psicologoId, message);
        if (res.success) {
            toast.success("Mensagem enviada para o painel do psicólogo!");
            onClose();
        } else {
            toast.error("Erro ao enviar mensagem.");
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in duration-300">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                            <MessageCircle size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase italic">Canal Interno</h3>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Enviar para {psicologoNome}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mensagem para o Profissional</label>
                        <textarea 
                            className="w-full h-40 bg-slate-50 border-none rounded-2xl p-6 text-xs font-medium text-slate-700 outline-none ring-2 ring-transparent focus:ring-blue-500/10 transition-all resize-none placeholder:text-slate-300"
                            placeholder="Descreva o motivo do contato ou instruções..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        ></textarea>
                    </div>

                    <button 
                        onClick={handleSend}
                        disabled={loading || !message.trim()}
                        className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-all disabled:opacity-50 shadow-xl shadow-slate-900/10 active:scale-95"
                    >
                        {loading ? "Enviando..." : (
                            <>
                                <Send size={16} />
                                Notificar no Painel
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
