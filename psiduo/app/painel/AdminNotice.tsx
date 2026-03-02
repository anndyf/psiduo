"use client";

import { useState, useEffect } from "react";
import { Bell, X, Info, Check } from "lucide-react";
import { buscarMensagensAdmin, marcarMensagemComoLida } from "./actions";

export default function AdminNotice() {
    const [messages, setMessages] = useState<any[]>([]);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        loadMessages();
    }, []);

    async function loadMessages() {
        const res = await buscarMensagensAdmin();
        const unread = res.filter((m: any) => !m.lida);
        setMessages(unread);
        if (unread.length > 0) setVisible(true);
    }

    const handleRead = async (id: string) => {
        await marcarMensagemComoLida(id);
        setMessages(prev => prev.filter(m => m.id !== id));
        if (messages.length <= 1) setVisible(false);
    };

    if (!visible || messages.length === 0) return null;

    const currentMessage = messages[0];

    return (
        <div className="mb-8 animate-in slide-in-from-top duration-500">
            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                
                <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-600/20">
                        <Bell size={24} className="animate-bounce" />
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Comunicado Administrativo</span>
                            <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Enviado em {new Date(currentMessage.criadoEm).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <p className="text-white text-sm font-medium leading-relaxed">
                            {currentMessage.conteudo}
                        </p>
                    </div>

                    <button 
                        onClick={() => handleRead(currentMessage.id)}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white text-white hover:text-slate-900 px-6 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-xl"
                    >
                        <Check size={14} strokeWidth={3} />
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
}
