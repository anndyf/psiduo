"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Target, ArrowLeft, CheckCircle, Loader2, Trophy } from "lucide-react";
import { toast } from "sonner";
import LogoPsiDuo from "@/components/LogoPsiDuo";

interface Conclusao {
    pacienteId: string;
    concluido: boolean;
}

interface Missao {
    id: string;
    titulo: string;
    descricao: string;
    dataFim: string;
    ativo: boolean;
    conclusoes: Conclusao[];
    status: 'FEITO' | 'PARCIAL' | 'NAO_FEITO';
}

export default function MissoesPage() {
    const params = useParams();
    // @ts-ignore
    const { grupoId } = params;
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams?.get("token");

    const [loading, setLoading] = useState(true);
    const [missoes, setMissoes] = useState<Missao[]>([]);
    const [toggling, setToggling] = useState<string | null>(null);

    useEffect(() => {
        if (grupoId && token) fetchMissoes();
    }, [grupoId, token]);

    const fetchMissoes = async () => {
        try {
            const res = await fetch(`/api/grupo/${grupoId}/missoes?ativas=true`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (data.missoes) {
                setMissoes(data.missoes);
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar missões.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (missao: Missao, novoStatus: string) => {
        if (toggling) return;
        setToggling(missao.id);

        try {
            const res = await fetch(`/api/grupo/${grupoId}/missoes/${missao.id}/conclusao`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({
                    status: novoStatus
                })
            });

            if (res.ok) {
                toast.success("Status atualizado!");
                fetchMissoes(); 
            } else {
                toast.error("Erro ao atualizar missão.");
            }
        } catch (error) {
            toast.error("Erro de conexão.");
        } finally {
            setToggling(null);
        }
    };

    const getDiasRestantes = (dataFim: string) => {
        const diff = new Date(dataFim).getTime() - new Date().getTime();
        const dias = Math.ceil(diff / (1000 * 3600 * 24));
        if (dias < 0) return "Expirada";
        if (dias === 0) return "Hoje";
        return `${dias} dias`;
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
            <Loader2 className="animate-spin text-purple-500 mb-4" size={40} />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Preparando sua jornada...</p>
        </div>
    );

    const missõesPendentes = missoes.filter(m => m.status !== 'FEITO');
    const missõesConcluidas = missoes.filter(m => m.status === 'FEITO');

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-deep"></div>
                <div className="w-full px-4 lg:px-8 py-3">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <LogoPsiDuo variant="dark" width={110} />
                            <div className="h-4 w-[1px] bg-slate-200 hidden md:block"></div>
                            <div className="hidden md:block">
                                <h1 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Atividades</h1>
                                <p className="text-sm font-bold text-slate-800 uppercase tracking-tighter">Missões do Grupo</p>
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

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 lg:py-10 space-y-8">
                
                {/* STATUS GERAL - Premium Dashboard */}
                <div className="bg-slate-900 rounded-[2rem] p-6 md:p-10 text-white relative overflow-hidden shadow-2xl shadow-purple-900/20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full -ml-24 -mb-24 blur-3xl"></div>
                    
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                        <div className="flex items-center gap-6">
                            <div className="relative shrink-0">
                                <svg className="transform -rotate-90 w-24 h-24">
                                    <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                                    <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-purple-400" 
                                        strokeDasharray={42 * 2 * Math.PI} 
                                        strokeDashoffset={42 * 2 * Math.PI - (( (missoes.filter(m => m.status === 'FEITO').length + (missoes.filter(m => m.status === 'PARCIAL').length * 0.5)) / (missoes.length || 1) ) * 100) / 100 * (42 * 2 * Math.PI)} 
                                        strokeLinecap="round" 
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-black">
                                        {missoes.length > 0 ? Math.round(((missoes.filter(m => m.status === 'FEITO').length + (missoes.filter(m => m.status === 'PARCIAL').length * 0.5)) / missoes.length) * 100) : 0}%
                                    </span>
                                </div>
                            </div>
                            <div>
                                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[9px] font-black uppercase tracking-widest mb-2 border border-purple-500/20">
                                    <Trophy size={10} /> Progresso Atual
                                </div>
                                <h2 className="text-3xl font-black tracking-tighter mb-1.5">Sua Jornada.</h2>
                                <p className="text-purple-100/60 text-sm font-medium max-w-xs">Continue avançando nas atividades para seu desenvolvimento.</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center backdrop-blur-md">
                                <p className="text-2xl font-black text-white">{missoes.filter(m => m.status === 'FEITO').length}</p>
                                <p className="text-[9px] uppercase font-black text-purple-400 tracking-widest mt-0.5">Concluídas</p>
                            </div>
                            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center backdrop-blur-md">
                                <p className="text-2xl font-black text-white">{missoes.filter(m => m.status === 'PARCIAL').length}</p>
                                <p className="text-[9px] uppercase font-black text-orange-400 tracking-widest mt-0.5">Em foco</p>
                            </div>
                            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center backdrop-blur-md">
                                <p className="text-2xl font-black text-white">{missoes.filter(m => m.status === 'NAO_FEITO').length}</p>
                                <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest mt-0.5">Restantes</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LISTA DE MISSÕES */}
                <div>
                    <div className="flex items-center justify-between mb-6 px-1">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Atividades em Aberto</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {missoes.length === 0 ? (
                            <div className="col-span-full bg-white rounded-[2rem] py-16 text-center border-2 border-dashed border-slate-200">
                                <div className="w-14 h-14 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Target size={28} />
                                </div>
                                <h4 className="text-lg font-bold text-slate-800">Nenhuma missão no momento</h4>
                                <p className="text-sm text-slate-400 font-medium">O coordenador ainda não lançou novos desafios.</p>
                            </div>
                        ) : (
                            <>
                                {/* PENDENTES */}
                                {missõesPendentes.map(missao => (
                                    <div key={missao.id} className="group bg-white rounded-[2rem] p-6 border-2 border-slate-100 shadow-sm hover:border-purple-200 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 relative overflow-hidden flex flex-col h-full">
                                         <div className="flex justify-between items-start mb-5">
                                            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-all">
                                                <Target size={20} />
                                            </div>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                                                new Date(missao.dataFim) < new Date() 
                                                ? 'bg-red-50 text-red-600 border-red-100' 
                                                : 'bg-slate-50 text-slate-500 border-slate-100'
                                            }`}>
                                                {getDiasRestantes(missao.dataFim)}
                                            </span>
                                        </div>

                                        <h3 className="font-black text-slate-800 text-lg mb-1 tracking-tight leading-tight">{missao.titulo}</h3>
                                        <p className="text-slate-500 font-medium text-xs leading-relaxed mb-6 flex-1">{missao.descricao}</p>
                                        
                                        <div className="grid grid-cols-3 gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                                            <button
                                                onClick={() => handleUpdateStatus(missao, "NAO_FEITO")}
                                                className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                                    missao.status === 'NAO_FEITO' 
                                                    ? 'bg-white text-slate-900 shadow-sm' 
                                                    : 'text-slate-400 hover:text-slate-600'
                                                }`}
                                            >
                                                Off
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(missao, "PARCIAL")}
                                                className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                                    missao.status === 'PARCIAL' 
                                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                                                    : 'text-slate-400 hover:text-orange-500'
                                                }`}
                                            >
                                                Focar
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(missao, "FEITO")}
                                                className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                                    missao.status === 'FEITO' 
                                                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
                                                    : 'text-slate-400 hover:text-green-500'
                                                }`}
                                            >
                                                Pronto
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* CONCLUÍDAS */}
                                {missõesConcluidas.length > 0 && (
                                    <div className="col-span-full pt-12">
                                        <div className="flex items-center gap-2.5 mb-6 px-1">
                                            <div className="w-5 h-1 bg-green-500 rounded-full"></div>
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Missões Concluídas</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                            {missõesConcluidas.map(missao => (
                                                <div key={missao.id} className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 p-3">
                                                        <div className="bg-emerald-500 text-white p-0.5 rounded-full shadow-lg shadow-emerald-500/20">
                                                            <CheckCircle size={14} />
                                                        </div>
                                                    </div>
                                                    <h3 className="font-bold text-emerald-800 text-xs mb-0.5 pr-6">{missao.titulo}</h3>
                                                    <p className="text-[9px] text-emerald-600/70 font-bold mb-3 uppercase tracking-widest">Missão Cumprida</p>
                                                    <button
                                                         onClick={() => handleUpdateStatus(missao, "NAO_FEITO")}
                                                         className="text-[9px] font-black text-emerald-700/50 hover:text-red-500 uppercase tracking-widest transition-colors"
                                                    >
                                                        Refazer Atividade
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
