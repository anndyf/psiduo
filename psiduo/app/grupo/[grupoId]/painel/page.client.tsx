"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, LogOut, Calendar, TrendingUp, Smile, Meh, Frown, Battery, Target, CheckCircle, Clock, MapPin, Video, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import ComunidadeFeed from "@/app/painel/grupos/components/ComunidadeFeed";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LogoPsiDuo from "@/components/LogoPsiDuo";

interface GrupoPainelClientProps {
    paciente: {
        id: string;
        nome: string;
        tokenAcesso: string;
        grupo: {
            id: string;
            titulo: string;
            descricao: string;
            diaSemana: string;
            horario: string;
            modalidade: string;
            cidade?: string | null;
            estado?: string | null;
            psicologo: {
                nome: string;
                foto: string | null;
            };
            participantes: Array<{
                id: string;
                nome: string;
            }>;
        };
        registros: Array<{
            id: string;
            data: Date;
            humor: number;
            sono: number;
            notas: string | null;
            tags: string[];
        }>;
    };
    temCheckInAtivo?: boolean;
    jaRespondeu?: boolean;
}

export default function GrupoPainelClient({ paciente, temCheckInAtivo, jaRespondeu }: GrupoPainelClientProps) {
    const router = useRouter();

    const handleLogout = () => {
        router.push(`/grupo/${paciente.grupo.id}`);
    };

    const handleNewEntry = () => {
        // Redirecionar para formulário de diário individual
        router.push(`/diario/${paciente.tokenAcesso}`);
    };

    const getHumorIcon = (humor: number) => {
        if (humor <= 2) return <Frown className="text-red-500" size={20} />;
        if (humor === 3) return <Meh className="text-yellow-500" size={20} />;
        return <Smile className="text-green-500" size={20} />;
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            <Navbar />
            
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-deep"></div>
                <div className="w-full px-4 lg:px-8 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <LogoPsiDuo variant="dark" width={120} />
                            <div className="h-4 w-[1px] bg-slate-200 hidden md:block"></div>
                            <div className="hidden md:block">
                                <h1 className="text-sm font-black text-slate-800 uppercase tracking-tighter">
                                    {paciente.grupo.titulo}
                                </h1>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Paciente</p>
                                <p className="text-sm font-bold text-slate-700">{paciente.nome.split(' ')[0]}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 p-2 sm:px-4 sm:py-2 text-sm font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-95"
                            >
                                <LogOut size={18} />
                                <span className="hidden sm:inline">Encerrar</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1">
                {/* Main Content */}
                <main className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8">
                    
                    {/* Info do Grupo */}
                    <div className="bg-slate-900 rounded-[2rem] p-6 md:p-10 text-white mb-6 relative overflow-hidden shadow-2xl shadow-deep/20">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full -ml-24 -mb-24 blur-3xl"></div>
                        
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex-1">
                                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-blue-200 text-[9px] font-black uppercase tracking-widest mb-4 border border-white/5">
                                    <Users size={10} /> Espaço do Grupo
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tighter leading-none">
                                    Jornada <span className="text-blue-400">Coletiva.</span>
                                </h2>
                                <p className="text-blue-100/70 font-medium text-sm md:text-base leading-relaxed max-w-xl">
                                    {paciente.grupo.descricao}
                                </p>
                                
                                <div className="flex flex-wrap items-center gap-5 mt-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                                             <Users size={12} className="text-blue-300" />
                                        </div>
                                        <span className="text-xs font-bold">{paciente.grupo.participantes.length} Participantes</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                                             <Calendar size={12} className="text-blue-300" />
                                        </div>
                                        <span className="text-xs font-bold capitalize">{paciente.grupo.diaSemana} - {paciente.grupo.horario}</span>
                                    </div>
                                </div>
                            </div>

                            {paciente.grupo.psicologo.foto && (
                                <div className="relative shrink-0">
                                    <div className="absolute inset-0 bg-blue-400 rounded-2xl rotate-6 opacity-20"></div>
                                    <img 
                                        src={paciente.grupo.psicologo.foto}
                                        alt={paciente.grupo.psicologo.nome}
                                        className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover relative z-10 border-4 border-white/10"
                                    />
                                    <div className="absolute -bottom-1.5 -left-1.5 bg-white text-slate-900 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest z-20 shadow-xl border border-slate-100">
                                        Coordenador
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Coluna Principal - Ferramentas e Comunidade */}
                        <div className="lg:col-span-2 space-y-10">
                            
                            {/* FERRAMENTAS DO GRUPO */}
                            <div>
                                <div className="flex items-center justify-between mb-6 px-1">
                                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                        Ferramentas de Interação
                                    </h2>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {temCheckInAtivo && (
                                        <button 
                                            onClick={() => router.push(`/grupo/${paciente.grupo.id}/bateria?token=${paciente.tokenAcesso}`)}
                                            className={`group relative p-6 rounded-[1.8rem] border-2 transition-all active:scale-[0.98] text-left overflow-hidden ${
                                                jaRespondeu 
                                                ? 'bg-emerald-50 border-emerald-100 hover:border-emerald-200' 
                                                : 'bg-white border-slate-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5'
                                            }`}
                                        >
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 group-hover:rotate-6 ${
                                                jaRespondeu ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600'
                                            }`}>
                                                {jaRespondeu ? <CheckCircle size={24} /> : <Battery size={24} />}
                                            </div>
                                            <h3 className="font-black text-slate-800 text-xl tracking-tight leading-none mb-1.5">
                                                {jaRespondeu ? "Energia Ok" : "Bateria Social"}
                                            </h3>
                                            <p className="text-xs text-slate-500 font-medium opacity-80">
                                                {jaRespondeu ? "Seu check-in foi enviado com sucesso." : "Diga ao grupo como está sua disposição agora."}
                                            </p>
                                            <div className="absolute bottom-4 right-4 text-emerald-600 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all">
                                                <ArrowRight size={18} />
                                            </div>
                                        </button>
                                    )}

                                    <button 
                                        onClick={() => router.push(`/grupo/${paciente.grupo.id}/missoes?token=${paciente.tokenAcesso}`)}
                                        className="group relative bg-white p-6 rounded-[1.8rem] border-2 border-slate-100 hover:border-purple-200 transition-all active:scale-[0.98] text-left hover:shadow-xl hover:shadow-purple-500/5 overflow-hidden"
                                    >
                                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 group-hover:-rotate-6">
                                            <Target size={24} />
                                        </div>
                                        <h3 className="font-black text-slate-800 text-xl tracking-tight leading-none mb-1.5">Missões</h3>
                                        <p className="text-xs text-slate-500 font-medium opacity-80">
                                            Complete as atividades e desafios para seu progresso.
                                        </p>
                                        <div className="absolute bottom-4 right-4 text-purple-600 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all">
                                            <ArrowRight size={18} />
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* COMUNIDADE DO GRUPO */}
                            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 bg-deep rounded-lg flex items-center justify-center text-white shadow-lg shadow-deep/20">
                                            <Users size={16} />
                                        </div>
                                        <h2 className="text-base font-black text-slate-800 tracking-tight uppercase">
                                            Mural da Comunidade
                                        </h2>
                                    </div>
                                </div>
                                <div className="p-2 flex-1">
                                    <ComunidadeFeed grupoId={paciente.grupo.id} token={paciente.tokenAcesso} currentUserId={paciente.id} />
                                </div>
                            </div>
                        </div>

                        {/* Sidebar - Info do Grupo */}
                        <div className="space-y-6">
                                                       {/* Encontros */}
                            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm bg-gradient-to-b from-white to-slate-50/50">
                                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">
                                    Detalhes dos Encontros
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
                                            <Calendar size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider mb-0.5">Frequência</p>
                                            <p className="text-sm font-bold text-slate-800 capitalize">
                                                {paciente.grupo.diaSemana || "A definir"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
                                            <Clock size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider mb-0.5">Horário Local</p>
                                            <p className="text-sm font-bold text-slate-800">
                                                {paciente.grupo.horario || "A definir"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
                                            {paciente.grupo.modalidade === 'PRESENCIAL' ? <MapPin size={18} /> : <Video size={18} />}
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider mb-0.5">Modalidade</p>
                                            <p className="text-sm font-bold text-slate-800 capitalize">
                                                {paciente.grupo.modalidade?.toLowerCase() || "Online"}
                                            </p>
                                            {paciente.grupo.modalidade === 'PRESENCIAL' && paciente.grupo.cidade && (
                                                <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                                                    {paciente.grupo.cidade}/{paciente.grupo.estado}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Participantes */}
                            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">
                                    Membros do Grupo ({paciente.grupo.participantes.length})
                                </h3>
                                <div className="space-y-2">
                                    {paciente.grupo.participantes.map((p) => (
                                        <div 
                                            key={p.id}
                                            className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                                                p.id === paciente.id 
                                                ? 'bg-blue-50/50 border border-blue-100 shadow-sm shadow-blue-500/5' 
                                                : 'bg-slate-50 border border-transparent'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-slate-100 shadow-sm">
                                                    <span className="text-[10px] font-black text-slate-500">
                                                        {p.nome.substring(0, 2).toUpperCase()}
                                                    </span>
                                                </div>
                                                <p className="text-xs font-bold text-slate-700">
                                                    {p.nome.split(' ')[0]}
                                                    {p.id === paciente.id && (
                                                        <span className="ml-2 text-[8px] text-blue-600 uppercase font-black px-1.5 py-0.5 bg-blue-100 rounded-full">Você</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Privacidade */}
                            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl overflow-hidden relative">
                                 <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-xl"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                            <Clock size={12} />
                                        </div>
                                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Compromisso Ético</p>
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                        Lembramos que as interações e registros neste painel são <span className="text-white font-bold">estritamente confidenciais.</span> O que acontece no grupo, fica no grupo.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
}
