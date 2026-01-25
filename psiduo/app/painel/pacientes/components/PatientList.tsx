"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { alternarStatusPaciente, renomearPaciente, excluirPaciente } from "../actions";
import { Copy, PauseCircle, PlayCircle, BarChart2, Pencil, MessageCircle, X, Check, Frown, Meh, Smile, AlertTriangle, Trash2 } from "lucide-react";

interface Paciente {
    id: string;
    nome: string;
    tokenAcesso: string;
    registros: { data: Date, humor: number }[];
    _count: { registros: number };
    ativo: boolean;
    criadoEm: Date;
}

export default function PatientList({ initialPacientes }: { initialPacientes: Paciente[] }) {
    const router = useRouter();
    const [pacientes, setPacientes] = useState(initialPacientes);

    // Sincroniza estado local quando o filtro muda no componente pai
    useEffect(() => {
        setPacientes(initialPacientes);
    }, [initialPacientes]);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [newName, setNewName] = useState("");

    const toggleStatus = async (paciente: Paciente) => {
        const novoStatus = !paciente.ativo;
        const action = novoStatus ? "reativar" : "pausar";
        const msg = novoStatus 
            ? "Reativar acesso do paciente ao diário?" 
            : "Pausar diário? O paciente não poderá acessar até você reativar.";

        if (!confirm(msg)) return;

        const res = await alternarStatusPaciente(paciente.id, novoStatus);
        
        if (res.success) {
            setPacientes(prev => prev.map(p => 
                p.id === paciente.id ? { ...p, ativo: novoStatus } : p
            ));
        } else {
            alert(`Erro ao ${action}.`);
        }
    };

    const handleExcluir = async (id: string) => {
        if (!confirm("⚠️ ATENÇÃO: Isso excluirá PERMANENTEMENTE o paciente e todos os seus registros.\n\nTem certeza absoluta?")) return;
        
        const res = await excluirPaciente(id);
        if (res.success) {
            setPacientes(prev => prev.filter(p => p.id !== id));
        } else {
            alert("Erro ao excluir.");
        }
    };

    const copyLink = (token: string) => {
        const link = `${window.location.origin}/diario/${token}`;
        navigator.clipboard.writeText(link);
        alert("Link copiado! Envie para o paciente.");
    };

    const shareWhatsapp = (nome: string, token: string) => {
        const link = `${window.location.origin}/diario/${token}`;
        const msg = `Olá ${nome.split(' ')[0]}! Aqui está o seu link para o Diário Emocional do PsiDuo: ${link}`;
        const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
    };

    const startEditing = (paciente: Paciente) => {
        setEditingId(paciente.id);
        setNewName(paciente.nome);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setNewName("");
    };

    const saveName = async (id: string) => {
        if (!newName.trim()) return;
        
        try {
            const res = await renomearPaciente(id, newName);
            if (res.success) {
                setPacientes(prev => prev.map(p => p.id === id ? { ...p, nome: newName } : p));
                setEditingId(null);
            } else {
                alert("Erro ao renomear.");
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar.");
        }
    };

    if (pacientes.length === 0) {
        return (
            <div className="text-center py-20 opacity-50">
                <p className="text-xl font-black uppercase text-slate-300">Nenhum paciente ativo</p>
                <p className="text-sm font-bold text-slate-300">Clique em "Novo Paciente" para começar.</p>
            </div>
        );
    }

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {pacientes.map(paciente => {
                    const ultimoRegistro = paciente.registros[0];
                    const totalRegistros = paciente._count.registros;
                    const isEditing = editingId === paciente.id;
                    const isPaused = !paciente.ativo;

                    // Definir classes do card com base no estado
                    let cardClasses = "bg-white p-8 rounded-3xl shadow-lg border border-slate-100 transition-all group relative";
                    if (isPaused) {
                        cardClasses += " opacity-60 grayscale-[0.8] hover:opacity-100 hover:grayscale-0";
                    } else {
                        cardClasses += " hover:shadow-xl";
                    }

                    return (
                        <div key={paciente.id} className={cardClasses}>
                            
                            {/* Indicador de Pausado */}
                            {isPaused && (
                                <div className="absolute top-4 right-4 bg-slate-100 px-2 py-1 rounded text-[9px] font-black uppercase text-slate-500 tracking-widest z-10">
                                    Pausado
                                </div>
                            )}

                            {/* Header com Edição de Nome */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex-1 mr-2">
                                {isEditing ? (
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="text" 
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            className="w-full text-lg font-black text-slate-900 uppercase tracking-wide border-b-2 border-slate-900 focus:outline-none bg-transparent"
                                            autoFocus
                                        />
                                        <button onClick={() => saveName(paciente.id)} className="p-1 hover:bg-green-50 text-green-600 rounded-full">
                                            <Check size={18} />
                                        </button>
                                        <button onClick={cancelEditing} className="p-1 hover:bg-red-50 text-red-500 rounded-full">
                                            <X size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="group/name flex items-center gap-2">
                                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide truncate">{paciente.nome}</h3>
                                        
                                        {/* Botão Renomear com Tooltip */}
                                        <button 
                                            onClick={() => startEditing(paciente)}
                                            className="opacity-0 group-hover/name:opacity-100 transition-opacity text-slate-300 hover:text-slate-500 group/tooltip relative"
                                        >
                                            <Pencil size={14} />
                                            <span className="hidden group-hover/tooltip:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-20">
                                                Renomear
                                            </span>
                                        </button>
                                    </div>
                                )}
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    {totalRegistros} {totalRegistros === 1 ? 'Registro' : 'Registros'}
                                    <span className="mx-1 text-slate-300">|</span>
                                    Gerado em: {new Date(paciente.criadoEm).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                </p>
                            </div>

                            <div className="flex gap-1 pt-1">
                                {/* Copy Link com Tooltip */}
                                <button 
                                    onClick={() => copyLink(paciente.tokenAcesso)}
                                    className="text-slate-300 hover:text-primary transition-colors p-2 rounded-full hover:bg-slate-50 group/tooltip relative"
                                >
                                    <Copy size={18} />
                                    <span className="hidden group-hover/tooltip:block absolute bottom-full right-0 mb-2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-20">
                                        Copiar Link
                                    </span>
                                </button>

                                {/* Whatsapp com Tooltip */}
                                <button 
                                    onClick={() => shareWhatsapp(paciente.nome, paciente.tokenAcesso)}
                                    className="text-slate-300 hover:text-green-500 transition-colors p-2 rounded-full hover:bg-green-50 group/tooltip relative"
                                >
                                    <MessageCircle size={18} />
                                    <span className="hidden group-hover/tooltip:block absolute bottom-full right-0 mb-2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-20">
                                        WhatsApp
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Status Card com Ícones */}
                        <div className="bg-slate-50 p-4 rounded-xl mb-6 flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${ultimoRegistro ? 'bg-white shadow-sm' : 'bg-slate-200'}`}>
                                {ultimoRegistro ? (
                                    <>
                                        {ultimoRegistro.humor <= 1 && <Frown size={20} className="text-red-500" />}
                                        {ultimoRegistro.humor === 2 && <Frown size={20} className="text-orange-500" />}
                                        {ultimoRegistro.humor === 3 && <Meh size={20} className="text-yellow-500" />}
                                        {ultimoRegistro.humor === 4 && <Smile size={20} className="text-blue-500" />}
                                        {ultimoRegistro.humor === 5 && <Smile size={20} className="text-green-500" />}
                                    </>
                                ) : (
                                    <span className="text-slate-400 font-bold">—</span>
                                )}
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Último Humor</p>
                                <p className="text-xs font-bold text-slate-600">
                                    {ultimoRegistro ? new Date(ultimoRegistro.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'Sem registros'}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => router.push(`/painel/pacientes/${paciente.id}`)}
                                disabled={isPaused}
                                className={`flex-1 py-3 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 group/tooltip relative
                                    ${isPaused ? 'bg-slate-300 cursor-not-allowed' : 'bg-slate-900 hover:bg-black'}`}
                            >
                                <BarChart2 size={16} />
                                Acessar Painel
                                {/* Tooltip não necessário aqui pois já tem texto, mas mantendo padrão se quiser */}
                            </button>
                            <button 
                                onClick={() => toggleStatus(paciente)}
                                className={`px-4 py-3 border text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center group/tooltip relative
                                    ${isPaused 
                                        ? 'border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300' 
                                        : 'border-slate-200 text-slate-400 hover:border-slate-300'}`} 
                            >
                                {isPaused ? <PlayCircle size={16} /> : <PauseCircle size={16} />}
                                <span className="hidden group-hover/tooltip:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-20">
                                    {isPaused ? "Reativar" : "Pausar"}
                                </span>
                            </button>
                            {/* Botão de Excluir Separado */}
                             <button 
                                onClick={() => handleExcluir(paciente.id)}
                                className="px-4 py-3 border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center group/tooltip relative"
                            >
                                <Trash2 size={16} />
                                <span className="hidden group-hover/tooltip:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-red-600 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-20">
                                    Excluir
                                </span>
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>

        {/* LEGENDA DE ÍCONES (No final, texto fixo) */}
        <div className="mb-20 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 shadow-sm w-full md:w-fit">
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 md:mr-2">Legenda:</span>
                
                <div className="flex items-center gap-2">
                    <Pencil size={14} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Renomear</span>
                </div>

                <div className="flex items-center gap-2">
                    <Copy size={14} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Link</span>
                </div>

                <div className="flex items-center gap-2">
                    <MessageCircle size={14} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">WhatsApp</span>
                </div>

                <div className="flex items-center gap-2">
                    <BarChart2 size={14} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Painel</span>
                </div>
                
                <div className="flex items-center gap-2">
                    <PauseCircle size={14} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Pausar</span>
                </div>

                <div className="flex items-center gap-2">
                    <Trash2 size={14} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Excluir</span>
                </div>
            </div>
        </div>
    </div>
    );
}
