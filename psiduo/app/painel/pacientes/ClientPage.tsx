"use client";

import { useState, useEffect } from "react";
import NewPatientModal from "./components/NewPatientModal";
import BuyPatientsModal from "./components/BuyPatientsModal";
import PatientList from "./components/PatientList";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { 
    Users, User, Info, Search, Plus, 
    MoreHorizontal, Filter, Grid, List as ListIcon, 
    Link as LinkIcon, Settings, MessageSquare, Trash2, 
    ChevronRight, CreditCard
} from "lucide-react";
import GroupDetailsModal from "./components/GroupDetailsModal";
import GroupToolsManager from "../grupos/components/GroupToolsManager";

export default function ClientPage({ initialPacientes, initialGrupos = [] }: { initialPacientes: any[], initialGrupos?: any[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<any>(null);
    const [activeToolsGroup, setActiveToolsGroup] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'INDIVIDUAL' | 'GROUP'>('INDIVIDUAL');
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const searchParams = useSearchParams();

    useEffect(() => {
        const tab = searchParams?.get('tab');
        if (tab === 'GROUP') {
             setActiveTab('GROUP');
        }

        const openToolsId = searchParams?.get('openTools');
        if (openToolsId && initialGrupos.length > 0) {
             const targetGroup = initialGrupos.find(g => g.id === openToolsId);
             if (targetGroup) {
                 setActiveToolsGroup(targetGroup);
                 router.replace('/painel/pacientes', { scroll: false });
             }
        }
    }, [searchParams, initialGrupos, router]);

    const pacientesFiltrados = initialPacientes.filter(p => 
        p.nome?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCopyLink = (grupoId: string) => {
        const link = `${window.location.origin}/grupo/${grupoId}`;
        navigator.clipboard.writeText(link);
        toast.success("Link do grupo copiado!");
    };

    return (
        <main className="min-h-screen bg-slate-50/50 flex flex-col text-slate-900 animate-in fade-in duration-500 pb-20 md:pb-0">
            
            <div className="max-w-[1400px] mx-auto w-full py-6 px-4 md:py-8 md:px-8 flex-1">
                
                {/* HEADER - Mobile Optimized */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-slate-400 mb-1">
                            <span className="cursor-pointer hover:text-slate-800 transition-colors" onClick={() => router.push('/painel')}>Painel</span>
                            <ChevronRight size={12} strokeWidth={2} />
                            <span className="text-slate-800">Gestão Clínica</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-medium text-slate-900 tracking-tight">
                            Visão Geral
                        </h1>
                    </div>

                    <div className="grid grid-cols-2 md:flex items-center gap-3 w-full md:w-auto">
                        <button 
                            onClick={() => setShowBuyModal(true)}
                            className="h-10 md:h-11 px-3 md:px-5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-deep hover:border-slate-300 font-medium text-[10px] md:text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm w-full md:w-auto"
                        >
                            <CreditCard size={16} className="text-slate-400 group-hover:text-deep" strokeWidth={2} />
                            <span className="truncate">Cotas</span>
                        </button>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="h-10 md:h-11 px-3 md:px-6 bg-deep hover:bg-slate-800 text-white rounded-xl font-medium text-[10px] md:text-xs uppercase tracking-widest transition-all shadow-lg shadow-deep/20 hover:shadow-deep/30 flex items-center justify-center gap-2 group w-full md:w-auto"
                        >
                            <Plus size={18} className="text-slate-300 group-hover:text-white transition-colors" strokeWidth={2} />
                            <span className="truncate">Novo</span>
                        </button>
                    </div>
                </header>

                {/* CONTROLS BAR: Tabs & Search - Mobile Stacked */}
                <div className="bg-white p-2 rounded-[20px] border border-slate-200 shadow-sm mb-6 md:mb-8 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
                    
                    {/* Tabs Minimalistas - Full Width Mobile */}
                    <div className="grid grid-cols-2 md:flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto border border-slate-200 gap-1 md:gap-0">
                        <button 
                            onClick={() => setActiveTab('INDIVIDUAL')}
                            className={`px-4 md:px-8 py-2.5 rounded-xl text-[10px] md:text-xs font-medium uppercase tracking-widest transition-all duration-300 w-full md:w-auto text-center ${
                                activeTab === 'INDIVIDUAL' 
                                ? 'bg-deep text-white shadow-lg shadow-deep/20 scale-[1.02]' 
                                : 'text-slate-500 hover:text-deep hover:bg-slate-100'
                            }`}
                        >
                            Individual
                        </button>
                        <button 
                            onClick={() => setActiveTab('GROUP')}
                            className={`px-4 md:px-8 py-2.5 rounded-xl text-[10px] md:text-xs font-medium uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 w-full md:w-auto ${
                                activeTab === 'GROUP' 
                                ? 'bg-deep text-white shadow-lg shadow-deep/20 scale-[1.02]' 
                                : 'text-slate-500 hover:text-deep hover:bg-slate-100'
                            }`}
                        >
                            Grupos 
                            <span className={`text-[9px] px-1.5 md:px-2 py-0.5 rounded-md font-medium transition-colors ${
                                activeTab === 'GROUP' 
                                ? 'bg-white/20 text-white' 
                                : 'bg-slate-200 text-slate-500'
                            }`}>
                                {initialGrupos.length}
                            </span>
                        </button>
                    </div>

                    {/* Search & Filter - Full Width Mobile */}
                    <div className="flex items-center gap-2 w-full md:w-auto px-1 md:px-2">
                         <div className="relative flex-1 md:w-72">
                             <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={2} />
                             <input 
                                type="text" 
                                placeholder="Buscar..." 
                                className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-50 border border-transparent hover:bg-slate-100 focus:bg-white focus:border-slate-200 focus:ring-4 focus:ring-slate-100 text-sm font-medium text-slate-700 placeholder-slate-400 transition-all outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                             />
                         </div>
                         <button className="h-11 w-11 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-deep hover:bg-white hover:shadow-sm transition-all bg-slate-50 shrink-0">
                             <Filter size={18} strokeWidth={2} />
                         </button>
                    </div>
                </div>

                {/* CONTENT AREA */}
                {activeTab === 'INDIVIDUAL' && (
                    <PatientList initialPacientes={pacientesFiltrados} />
                )}

                {activeTab === 'GROUP' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {initialGrupos.length === 0 ? (
                            <div className="col-span-full py-12 md:py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
                                    <Users size={24} className="text-slate-300" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900 mb-2">Sem grupos ativos</h3>
                                <p className="text-slate-500 mb-6 font-normal text-sm px-4">Crie grupos terapêuticos para gerenciar múltiplos participantes.</p>
                                <button className="px-6 py-3 bg-deep text-white rounded-xl text-xs font-medium uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-deep/10" onClick={() => router.push('/painel/grupos')}>
                                    Criar Primeiro Grupo
                                </button>
                            </div>
                        ) : (
                            initialGrupos.map(grupo => (
                                <div key={grupo.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-900/5 hover:border-slate-300 transition-all group flex flex-col relative overflow-hidden active:scale-[0.99]">
                                    <div className="p-5 md:p-6">
                                        <div className="flex justify-between items-start mb-5">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-deep flex items-center justify-center shadow-sm border border-slate-100">
                                                <Users size={20} className="stroke-[2]" />
                                            </div>
                                            <div className="flex gap-2">
                                                 <button 
                                                    onClick={(e) => { e.stopPropagation(); handleCopyLink(grupo.id); }}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-deep hover:bg-slate-100 transition-colors"
                                                    title="Copiar Link"
                                                 >
                                                    <LinkIcon size={18} strokeWidth={2} />
                                                </button>
                                                <button 
                                                    onClick={() => setActiveToolsGroup(grupo)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-deep hover:bg-slate-100 transition-colors"
                                                    title="Configurações"
                                                >
                                                    <Settings size={18} strokeWidth={2} />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <h3 className="text-lg font-medium text-slate-900 mb-2 leading-snug truncate" title={grupo.titulo}>
                                            {grupo.titulo}
                                        </h3>
                                        <div className="flex items-center gap-2 mb-5">
                                            <span className={`inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded-md border ${grupo.ativo ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                                                {grupo.ativo ? 'Ativo' : 'Pausado'}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium px-2 py-1 bg-slate-50 rounded-md border border-slate-100">
                                                {grupo.participantes.length} Partic.
                                            </span>
                                        </div>

                                        <p className="text-xs text-slate-500 font-normal line-clamp-2 min-h-[40px] leading-relaxed">
                                            {grupo.descricao || "Sem descrição definida para este grupo."}
                                        </p>
                                    </div>

                                    <div className="mt-auto px-6 py-4 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center group-hover:bg-slate-100/30 transition-colors">
                                        <button 
                                            onClick={() => setSelectedGroup(grupo)}
                                            className="text-[10px] font-medium uppercase tracking-widest text-deep hover:text-slate-700 flex items-center gap-1 transition-colors"
                                        >
                                            Ver Detalhes <ChevronRight size={12} strokeWidth={2} />
                                        </button>
                                        <span className="text-[10px] font-medium text-slate-400">
                                            {grupo.vagasTotais ? `${grupo.vagasTotais} Vagas` : "Ilimitado"}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

            </div>

            {/* Modals mantidos */}
            {isModalOpen && <NewPatientModal onClose={() => setIsModalOpen(false)} />}
            {showBuyModal && <BuyPatientsModal onClose={() => setShowBuyModal(false)} />}
            {selectedGroup && <GroupDetailsModal grupo={selectedGroup} allPacientes={initialPacientes} onClose={() => setSelectedGroup(null)} />}
            {activeToolsGroup && <GroupToolsManager grupo={activeToolsGroup} onClose={() => setActiveToolsGroup(null)} />}
        </main>
    );
}
