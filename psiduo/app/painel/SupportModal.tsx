import { useState, useEffect } from "react";
import { X, Send, LifeBuoy, Clock, CheckCircle2, User, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { enviarPedidoSuporte, getMensagensSuporte } from "./actions";

interface SupportModalProps {
    onClose: () => void;
}

export default function SupportModal({ onClose }: SupportModalProps) {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    async function loadHistory() {
        setFetching(true);
        const msgs = await getMensagensSuporte();
        setHistory(msgs);
        setFetching(false);
    }

    const handleSend = async () => {
        if (!message.trim()) return;
        setLoading(true);
        const res = await enviarPedidoSuporte(message);
        if (res.success) {
            toast.success("Mensagem enviada!");
            setMessage("");
            loadHistory(); // Atualiza o histórico imediatamente
        } else {
            toast.error(res.error || "Erro ao enviar pedido de suporte.");
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl h-[80vh] rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in duration-300">
                
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center text-white">
                            <LifeBuoy size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase italic">Canal Direto</h3>
                            <div className="flex items-center gap-2">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Suporte & Comunicação</p>
                                <span className="text-[8px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-tighter animate-pulse">
                                    Resposta em até 24h
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    
                    {/* Histórico */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-white">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Histórico de Conversas</h4>
                        
                        {fetching ? (
                            <div className="space-y-4">
                                {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-50 rounded-2xl animate-pulse" />)}
                            </div>
                        ) : history.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-xs text-slate-400 font-medium italic">Nenhuma mensagem anterior encontrada.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {history.map((msg) => (
                                    <div 
                                        key={msg.id} 
                                        className={`p-4 rounded-2xl text-xs font-medium border ${
                                            msg.remetente === 'ADMIN' 
                                            ? 'bg-blue-50 border-blue-100 text-blue-900 ml-4' 
                                            : 'bg-slate-50 border-slate-100 text-slate-700 mr-4'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-tighter opacity-60">
                                                {msg.remetente === 'ADMIN' ? <ShieldCheck size={10} /> : <User size={10} />}
                                                {msg.remetente === 'ADMIN' ? 'Suporte' : 'Você'}
                                            </span>
                                            <span className="text-[8px] font-bold opacity-40">{new Date(msg.criadoEm).toLocaleDateString()}</span>
                                        </div>
                                        <p className="leading-relaxed">{msg.conteudo}</p>
                                        {msg.remetente === 'PSICOLOGO' && (
                                            <div className="mt-2 flex items-center gap-1 text-[8px] font-black uppercase tracking-tighter text-emerald-600">
                                                <CheckCircle2 size={10} />
                                                Entregue
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Novo Chamado */}
                    <div className="w-full md:w-80 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-100 p-6 md:p-8 flex flex-col">
                        <div className="space-y-4 flex-1">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nova Mensagem</label>
                                <textarea 
                                    className="w-full h-32 md:h-64 bg-white border border-slate-200 rounded-2xl p-4 text-xs font-medium text-slate-700 outline-none focus:border-amber-500 transition-all resize-none placeholder:text-slate-300 shadow-sm"
                                    placeholder="Dúvidas, problemas ou sugestões..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                ></textarea>
                            </div>

                            <button 
                                onClick={handleSend}
                                disabled={loading || !message.trim()}
                                className="w-full h-12 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-amber-500 transition-all disabled:opacity-50 shadow-lg shadow-slate-900/10 active:scale-95"
                            >
                                {loading ? "Sincronizando..." : (
                                    <>
                                        <Send size={14} />
                                        Enviar
                                    </>
                                )}
                            </button>
                        </div>
                        
                        <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-100/50">
                            <p className="text-[9px] font-black text-amber-700 leading-relaxed uppercase tracking-wider flex items-center gap-2">
                                <Clock size={12} strokeWidth={3} />
                                Resposta em até 24h úteis
                            </p>
                            <p className="text-[8px] font-bold text-amber-600/70 mt-1 leading-normal italic">
                                Nosso time analisa cada pedido individualmente para garantir a melhor solução.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
