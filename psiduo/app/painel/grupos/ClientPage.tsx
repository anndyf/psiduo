"use client";

import { useState, useEffect } from "react";
import GroupModal from "./components/GroupModal";
import GroupToolsManager from "./components/GroupToolsManager";
import { excluirGrupo, toggleStatusGrupo } from "./actions";
import { useRouter } from "next/navigation";
import {
    Wrench, Plus, Users, Calendar, DollarSign,
    MoreHorizontal, Trash2, Edit2, PlayCircle, PauseCircle, MapPin, ChevronRight
} from "lucide-react";
import { useSession } from "next-auth/react";
import UpgradePlanModal from "./components/UpgradePlanModal";

export default function ClientPage({ initialGrupos, userPlan = "DUO_I" }: { initialGrupos: any[], userPlan?: string }) {
    const router = useRouter();
    const { data: session } = useSession();
    const [grupos, setGrupos] = useState(initialGrupos);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [editingGrupo, setEditingGrupo] = useState<any | null>(null);
    const [activeToolsGroup, setActiveToolsGroup] = useState<any | null>(null);

    useEffect(() => { setGrupos(initialGrupos); }, [initialGrupos]);

    const handleCreate = () => {
        if (userPlan !== "DUO_II" && grupos.length >= 1) { setShowUpgradeModal(true); return; }
        setEditingGrupo(null);
        setIsModalOpen(true);
    };

    const handleOpenTools = (group: any) => {
        if (userPlan !== "DUO_II") { setShowUpgradeModal(true); return; }
        router.push(`/painel/pacientes?tab=GROUP&openTools=${group.id}`);
    };

    const handleEdit = (grupo: any) => { setEditingGrupo(grupo); setIsModalOpen(true); };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este grupo?")) return;
        const res = await excluirGrupo(id);
        if (res.success) { setGrupos(prev => prev.filter(g => g.id !== id)); router.refresh(); }
        else alert(res.error);
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        const res = await toggleStatusGrupo(id, currentStatus);
        if (res.success) { setGrupos(prev => prev.map(g => g.id === id ? { ...g, ativo: !currentStatus } : g)); router.refresh(); }
        else alert(res.error);
    };

    return (
        <main className="min-h-screen bg-slate-50 pb-16 animate-in fade-in duration-300">
            <div className="w-full px-4 md:px-8 py-8 space-y-6">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-slate-400 mb-1">
                            <span className="cursor-pointer hover:text-slate-800 transition-colors" onClick={() => router.push('/painel')}>Painel</span>
                            <ChevronRight size={12} strokeWidth={2} />
                            <span className="text-slate-800">Grupos Terapêuticos</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-medium text-slate-900 tracking-tight">
                            Meus Grupos
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleCreate}
                            className="h-10 md:h-11 px-3 md:px-6 bg-deep hover:bg-slate-800 text-white rounded-xl font-medium text-[10px] md:text-xs uppercase tracking-widest transition-all shadow-lg shadow-deep/20 hover:shadow-deep/30 flex items-center justify-center gap-2 group"
                        >
                            <Plus size={18} className="text-slate-300 group-hover:text-white transition-colors" strokeWidth={2} />
                            Novo Grupo
                        </button>
                    </div>
                </div>

                {/* CONTENT */}
                {grupos.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center">
                        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Users size={24} className="text-slate-400" />
                        </div>
                        <h3 className="text-base font-semibold text-slate-800 mb-1.5">Nenhum grupo ativo</h3>
                        <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto leading-relaxed">
                            Crie grupos terapêuticos para gerenciar múltiplos participantes e expandir seus atendimentos.
                        </p>
                        <button
                            onClick={handleCreate}
                            className="inline-flex items-center gap-2 h-9 px-5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-sm shadow-primary/20"
                        >
                            <Plus size={14} />
                            Criar Primeiro Grupo
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {grupos.map(group => (
                            <div
                                key={group.id}
                                className="bg-white/80 backdrop-blur-sm rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-deep/5 transition-all flex flex-col relative overflow-hidden group/card"
                            >
                                <div className="p-6 flex flex-col flex-1">
                                    {/* Card header */}
                                    <div className="flex justify-between items-start mb-5">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <div className={`w-2 h-2 rounded-full animate-pulse ${group.ativo ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${group.ativo ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                    {group.ativo ? 'Ativo' : 'Pausado'}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-black text-slate-900 leading-tight truncate group-hover/card:text-deep transition-colors" title={group.titulo}>
                                                {group.titulo}
                                            </h3>
                                        </div>

                                        {/* Context menu */}
                                        <div className="relative group/menu shrink-0">
                                            <button className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-deep hover:bg-slate-100 transition shadow-sm">
                                                <MoreHorizontal size={18} />
                                            </button>
                                            <div className="absolute right-0 top-full mt-2 bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl border border-slate-200/60 py-2 w-48 z-20 hidden group-hover/menu:block animate-in fade-in zoom-in-95 duration-200">
                                                <button onClick={() => handleEdit(group)} className="w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                                                    <Edit2 size={14} className="text-slate-400"/> Editar Grupo
                                                </button>
                                                <button onClick={() => handleToggleStatus(group.id, group.ativo)} className="w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                                                    {group.ativo ? <PauseCircle size={14} className="text-amber-500"/> : <PlayCircle size={14} className="text-emerald-500"/>}
                                                    {group.ativo ? "Pausar Atividade" : "Ativar Grupo"}
                                                </button>
                                                <div className="h-px bg-slate-100 my-1 mx-2" />
                                                <button onClick={() => handleDelete(group.id)} className="w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 flex items-center gap-3">
                                                    <Trash2 size={14} /> Excluir permanentemente
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Infos Grid */}
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 flex flex-col gap-1">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Horário</span>
                                            <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                                                <Calendar size={13} className="text-deep" strokeWidth={2.5}/>
                                                <span className="truncate">{group.diaSemana} · {group.horario}</span>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 flex flex-col gap-1">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ocupação</span>
                                            <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                                                <Users size={13} className="text-deep" strokeWidth={2.5}/>
                                                <span>{group.vagasTotais ? `${group.vagasOcupadas}/${group.vagasTotais}` : "∞"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Action */}
                                    <button
                                        onClick={() => handleOpenTools(group)}
                                        className="w-full h-12 bg-deep hover:bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-deep/10 hover:shadow-deep/20 flex items-center justify-center gap-3 active:scale-95"
                                    >
                                        <Wrench size={16} strokeWidth={2.5} />
                                        Gerenciar Ferramentas
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <GroupModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); router.refresh(); }}
                grupo={editingGrupo}
            />

            {activeToolsGroup && (
                <GroupToolsManager
                    grupo={activeToolsGroup}
                    onClose={() => setActiveToolsGroup(null)}
                />
            )}

            <UpgradePlanModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
            />
        </main>
    );
}
