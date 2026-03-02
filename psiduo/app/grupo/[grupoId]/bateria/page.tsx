"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Battery, ArrowLeft, Send, Zap, BatteryLow, BatteryMedium, BatteryCharging, Lock, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import LogoPsiDuo from "@/components/LogoPsiDuo";

interface CheckIn {
    id: string;
    titulo: string;
    descricao: string;
    respondido: boolean;
    dataExpira: string;
}

const EMOTIONS = [
    { value: "BATERIA_10", label: "10%", sub: "Só observo", icon: BatteryLow, color: "text-red-500", bg: "bg-red-50", border: "border-red-200" },
    { value: "BATERIA_50", label: "50%", sub: "Participo se chamarem", icon: BatteryMedium, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200" },
    { value: "BATERIA_100", label: "100%", sub: "Quero falar!", icon: Zap, color: "text-green-500", bg: "bg-green-50", border: "border-green-200" },
];

export default function BateriaSocialPage() {
    const params = useParams();
    // @ts-ignore
    const { grupoId } = params;
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams?.get("token");

    const [loading, setLoading] = useState(true);
    const [checkIn, setCheckIn] = useState<CheckIn | null>(null);
    const [selectedEmotion, setSelectedEmotion] = useState("");
    const [comentario, setComentario] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (grupoId && token) fetchCheckIns();
    }, [grupoId, token]);

    const fetchCheckIns = async () => {
        try {
            // GET aceita token? Ainda não editei GET checkin/route.ts.
            // Mas o GET verifica session ou pacienteId.
            // Preciso editar GET também se quiser que ele veja STATUS respondido.
            // Por enquanto, testando sem token no GET pode falhar se não tiver session.
            const res = await fetch(`/api/grupo/${grupoId}/checkin`, {
                headers: { "Authorization": `Bearer ${token}` },
                cache: "no-store",
            });
            const data = await res.json();
            
            if (data.checkIns && data.checkIns.length > 0) {
                const active = data.checkIns.find((c: any) => !c.respondido) || data.checkIns[0];
                setCheckIn(active);
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar bateria social.");
        } finally {
            setLoading(false);
        }
    };

    const handleEnviar = async () => {
        if (!checkIn || !selectedEmotion) return;

        setSubmitting(true);
        try {
            const res = await fetch(`/api/grupo/${grupoId}/checkin/${checkIn.id}/responder`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({
                    emocao: selectedEmotion,
                    comentario
                })
            });

            if (res.ok) {
                toast.success("Energia registrada!");
                router.push(`/grupo/${grupoId}/painel?token=${token}`);
            } else {
                toast.error("Erro ao enviar resposta.");
            }
        } catch (error) {
            toast.error("Erro ao conectar.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Carregando...</div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            {/* Header / Navbar style */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-deep"></div>
                <div className="w-full px-4 lg:px-8 py-3">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <LogoPsiDuo variant="dark" width={110} />
                            <div className="h-4 w-[1px] bg-slate-200 hidden md:block"></div>
                            <div className="hidden md:block">
                                <h1 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Ferramenta</h1>
                                <p className="text-sm font-bold text-slate-800 uppercase tracking-tighter">Bateria Social</p>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => router.push(`/grupo/${grupoId}/painel?token=${token}`)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all active:scale-95"
                        >
                            <ArrowLeft size={18} />
                            <span className="hidden sm:inline">Voltar ao Painel</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">
                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-5 shadow-xl shadow-emerald-500/10 border border-emerald-100">
                         <Battery size={32} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tighter leading-none">
                        Sua Bateria <span className="text-emerald-500">Social.</span>
                    </h2>
                    <p className="text-slate-500 font-medium text-base max-w-lg">
                        Dê um sinal ao grupo e ao coordenador sobre como está o seu nível de energia agora.
                    </p>
                </div>

                {!checkIn ? (
                    <div className="max-w-lg mx-auto bg-white rounded-[2rem] p-10 text-center shadow-xl shadow-slate-200/50 border border-slate-100">
                        <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Battery size={28} className="text-slate-400" />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 mb-1">Tudo tranquilo!</h2>
                        <p className="text-sm text-slate-500 font-medium">Não há check-ins ativos agora.</p>
                    </div>
                ) : checkIn.respondido ? (
                    <div className="max-w-lg mx-auto bg-white rounded-[2rem] p-10 text-center shadow-xl shadow-slate-200/50 border border-slate-100">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/10 border border-emerald-100">
                            <CheckCircle size={32} />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 mb-1">Energia Registrada!</h2>
                        <p className="text-sm text-slate-500 font-medium mb-6">Obrigado por compartilhar!</p>
                        <button 
                            onClick={() => router.push(`/grupo/${grupoId}/painel?token=${token}`)}
                            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-xs w-full uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-900/20"
                        >
                            Voltar ao Painel
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                        
                        {/* Seção de Seleção */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between mb-2 px-1">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selecione seu nível</h3>
                                {checkIn.dataExpira && (
                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                                        <Clock size={10} /> Expira às {new Date(checkIn.dataExpira).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                {EMOTIONS.map((option) => {
                                    const isSelected = selectedEmotion === option.value;
                                    const Icon = option.icon;
                                    return (
                                         <button
                                            key={option.value}
                                            onClick={() => setSelectedEmotion(option.value)}
                                            className={`w-full p-4 rounded-[1.5rem] border-2 transition-all flex items-center gap-4 text-left group relative overflow-hidden ${
                                                isSelected 
                                                ? `${option.border} ${option.bg} shadow-xl shadow-slate-200/50 scale-[1.01]` 
                                                : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-lg'
                                            }`}
                                        >
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${isSelected ? 'bg-white shadow-sm' : 'bg-slate-100 group-hover:bg-slate-50'} ${isSelected ? 'rotate-6' : 'rotate-0'}`}>
                                                <Icon size={24} className={option.color} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xl font-black ${option.color} tracking-tight`}>{option.label}</span>
                                                    {isSelected && <div className={`w-1.5 h-1.5 rounded-full ${option.color.replace('text', 'bg')} animate-ping`} />}
                                                </div>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 block">{option.sub}</span>
                                            </div>
                                            
                                            {isSelected && (
                                                <div className="absolute top-4 right-4 text-emerald-600">
                                                    <CheckCircle size={18} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Seção de Detalhes */}
                        <div className="space-y-4">
                            <div className="bg-white rounded-[1.8rem] p-6 md:p-8 border border-slate-100 shadow-xl shadow-slate-200/30">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                        <Lock size={16} />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">Privacidade Garantida</h3>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Visto apenas pelo coordenador</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">
                                        Quer detalhar algo? (Opcional)
                                    </label>
                                    <textarea
                                        value={comentario}
                                        onChange={(e) => setComentario(e.target.value)}
                                        placeholder="Ex: Tive um dia corrido hoje..."
                                        className="w-full bg-slate-50/50 rounded-2xl p-5 h-36 resize-none border-2 border-slate-100 focus:border-blue-400 focus:bg-white outline-none text-slate-700 font-medium placeholder:text-slate-400 text-sm transition-all"
                                    />
                                    
                                    <button
                                        onClick={handleEnviar}
                                        disabled={!selectedEmotion || submitting}
                                        className="w-full bg-slate-900 hover:bg-black text-white px-6 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all active:scale-[0.98] disabled:opacity-30 disabled:grayscale disabled:pointer-events-none shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-3"
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Enviando...
                                            </>
                                        ) : (
                                            <>
                                                Enviar Check-in <Send size={16} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/50 text-center">
                                <p className="text-[10px] text-emerald-800/70 font-bold uppercase tracking-widest leading-relaxed">
                                    Respeite o seu limite.
                                </p>
                            </div>
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
}
