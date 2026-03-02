"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, UserPlus, Trash2, ExternalLink, ArrowUpRight, Link2, Share2, AlertTriangle, Users, ChevronRight } from "lucide-react";
import { adicionarPacienteAoGrupo, removerPacienteDoGrupo, cadastrarPacienteGrupo, promoverParaIndividual } from "../actions";
import { toast } from "sonner";

interface Paciente {
    id: string;
    nome: string;
    grupoId?: string | null;
    registros?: { data: Date, humor: number }[];
    _count?: { registros: number };
    tipo?: 'INDIVIDUAL' | 'GRUPO_EXCLUSIVO';
    cpf?: string | null;
    whatsapp?: string | null;
}

interface Grupo {
    id: string;
    titulo: string;
    participantes: Paciente[];
    vagasOcupadas: number;
    vagasTotais: number | null;
}

interface GroupDetailsModalProps {
    grupo: Grupo;
    allPacientes: Paciente[];
    onClose: () => void;
}

export default function GroupDetailsModal({ grupo, allPacientes, onClose }: GroupDetailsModalProps) {
    const router = useRouter();
    const [adding, setAdding] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState("");
    const [newPatientName, setNewPatientName] = useState("");
    const [newPatientWhatsapp, setNewPatientWhatsapp] = useState("");
    const [newPatientCpf, setNewPatientCpf] = useState("");
    const [addMode, setAddMode] = useState<'EXISTING' | 'NEW'>('NEW');
    const [participantes, setParticipantes] = useState<Paciente[]>(grupo.participantes);

    const formatCPF = (value: string) => {
        const n = value.replace(/\D/g, "");
        if (n.length <= 11) return n.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        return value;
    };

    const formatWhatsApp = (value: string) => {
        const n = value.replace(/\D/g, "");
        if (n.length <= 11) return n.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
        return value;
    };

    const availablePacientes = allPacientes.filter(p => !participantes.some(m => m.id === p.id));
    const grupoEstaCompleto = grupo.vagasTotais !== null && participantes.length >= grupo.vagasTotais;

    const handleAddMember = async () => {
        if (grupoEstaCompleto) { toast.error("Grupo completo!"); return; }
        setAdding(true);
        try {
            if (addMode === 'EXISTING') {
                if (!selectedPatientId) return;
                const res = await adicionarPacienteAoGrupo(selectedPatientId, grupo.id);
                if (res.success) {
                    toast.success("Paciente adicionado!");
                    const p = allPacientes.find(p => p.id === selectedPatientId);
                    if (p) setParticipantes(prev => [...prev, p]);
                    router.refresh();
                    setSelectedPatientId("");
                } else { toast.error(res.error || "Erro ao adicionar."); }
            } else {
                if (!newPatientName.trim() || !newPatientCpf.trim() || !newPatientWhatsapp.trim()) {
                    toast.error("Preencha todos os campos."); setAdding(false); return;
                }
                const res = await cadastrarPacienteGrupo(grupo.id, newPatientName, newPatientWhatsapp.replace(/\D/g, ""), newPatientCpf.replace(/\D/g, ""));
                if (res.success) {
                    toast.success("Integrante criado!");
                    setParticipantes(prev => [...prev, { id: res.pacienteId || `temp-${Date.now()}`, nome: newPatientName, cpf: newPatientCpf, whatsapp: newPatientWhatsapp, tipo: 'GRUPO_EXCLUSIVO', grupoId: grupo.id, registros: [], _count: { registros: 0 } }]);
                    router.refresh();
                    setNewPatientName(""); setNewPatientWhatsapp(""); setNewPatientCpf("");
                } else { toast.error(res.error || "Erro ao criar."); }
            }
        } catch { toast.error("Erro inesperado."); }
        finally { setAdding(false); }
    };

    const handlePromote = async (pacienteId: string) => {
        if (!confirm("Transformar em paciente individual?")) return;
        const res = await promoverParaIndividual(pacienteId);
        if (res.success) { toast.success("Promovido!"); router.refresh(); }
        else { toast.error("Erro ao promover."); }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/grupo/${grupo.id}`);
        toast.success("Link copiado!");
    };

    const handleSendWhatsApp = (member: Paciente) => {
        const link = `${window.location.origin}/grupo/${grupo.id}`;
        const msg = `Olá ${member.nome}! Você foi adicionado ao grupo "${grupo.titulo}".\n\nAcesse com seu CPF:\n${link}\n\nCPF: ${member.cpf || "(cadastre o CPF)"}`;
        window.open(`https://wa.me/${member.whatsapp?.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`, "_blank");
    };

    const handleRemoveMember = async (pacienteId: string) => {
        if (!confirm("Remover paciente do grupo?")) return;
        const res = await removerPacienteDoGrupo(pacienteId, grupo.id);
        if (res?.success) { toast.success("Removido."); setParticipantes(prev => prev.filter(p => p.id !== pacienteId)); router.refresh(); }
        else { toast.error("Erro ao remover."); }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

            {/* Slide-over */}
            <div className="relative w-full max-w-lg bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col border-l border-slate-100">

                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 text-deep flex items-center justify-center border border-slate-100">
                            <Users size={18} strokeWidth={2} />
                        </div>
                        <div>
                            <h2 className="text-xl font-medium text-slate-900 tracking-tight">{grupo.titulo}</h2>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                {participantes.length} / {grupo.vagasTotais || "∞"} Participantes
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleCopyLink} className="p-2 rounded-lg text-slate-400 hover:text-deep hover:bg-slate-50 transition-colors" title="Copiar Link">
                            <Link2 size={18} strokeWidth={2} />
                        </button>
                        <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                            <X size={18} strokeWidth={2} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">

                    {/* ADD MEMBER */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        {/* Mode Tabs */}
                        <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200 mb-4">
                            <button
                                onClick={() => setAddMode('NEW')}
                                className={`flex-1 py-2 text-[10px] font-medium uppercase tracking-widest rounded-lg transition-all ${addMode === 'NEW' ? 'bg-deep text-white shadow-sm' : 'text-slate-500 hover:text-deep'}`}
                            >
                                Criar Novo
                            </button>
                            <button
                                onClick={() => setAddMode('EXISTING')}
                                className={`flex-1 py-2 text-[10px] font-medium uppercase tracking-widest rounded-lg transition-all ${addMode === 'EXISTING' ? 'bg-deep text-white shadow-sm' : 'text-slate-500 hover:text-deep'}`}
                            >
                                Existente
                            </button>
                        </div>

                        {addMode === 'NEW' ? (
                            <div className="space-y-3">
                                <input
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-deep focus:ring-4 focus:ring-deep/10 transition-all placeholder:font-normal placeholder:text-slate-400"
                                    placeholder="Nome do integrante..."
                                    value={newPatientName}
                                    onChange={e => setNewPatientName(e.target.value)}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1.5 ml-1">CPF (Login)</label>
                                        <input
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-deep focus:ring-4 focus:ring-deep/10 transition-all placeholder:font-normal placeholder:text-slate-400"
                                            placeholder="000.000.000-00"
                                            value={newPatientCpf}
                                            onChange={e => setNewPatientCpf(formatCPF(e.target.value))}
                                            maxLength={14}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1.5 ml-1">WhatsApp</label>
                                        <input
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-deep focus:ring-4 focus:ring-deep/10 transition-all placeholder:font-normal placeholder:text-slate-400"
                                            placeholder="(11) 99999-9999"
                                            value={newPatientWhatsapp}
                                            onChange={e => setNewPatientWhatsapp(formatWhatsApp(e.target.value))}
                                            maxLength={15}
                                        />
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400 font-normal ml-1">Paciente criado exclusivamente para este grupo. Pode ser migrado para individual futuramente.</p>
                            </div>
                        ) : (
                            <select
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-deep focus:ring-4 focus:ring-deep/10 transition-all"
                                value={selectedPatientId}
                                onChange={e => setSelectedPatientId(e.target.value)}
                            >
                                <option value="">Selecione um paciente...</option>
                                {availablePacientes.map(p => (
                                    <option key={p.id} value={p.id}>{p.nome}</option>
                                ))}
                            </select>
                        )}

                        {grupoEstaCompleto && (
                            <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
                                <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" strokeWidth={2} />
                                <p className="text-xs font-medium text-amber-700">Grupo completo — limite de {grupo.vagasTotais} participantes atingido.</p>
                            </div>
                        )}

                        <button
                            onClick={handleAddMember}
                            disabled={grupoEstaCompleto || adding || (addMode === 'EXISTING' ? !selectedPatientId : (!newPatientName || !newPatientCpf || !newPatientWhatsapp))}
                            className="w-full mt-4 py-3 bg-deep text-white text-xs font-medium uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-deep/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {adding ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><UserPlus size={16} strokeWidth={2} /> Adicionar Integrante</>}
                        </button>
                    </div>

                    {/* MEMBER LIST */}
                    <div>
                        <h3 className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-4">Integrantes do Grupo</h3>

                        {participantes.length === 0 ? (
                            <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-2xl">
                                <Users size={24} className="mx-auto text-slate-200 mb-2" strokeWidth={1.5} />
                                <p className="text-sm font-medium text-slate-400">Nenhum integrante ainda.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {participantes.map(member => {
                                    const lastReg = member.registros?.[0];
                                    const iniciais = member.nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
                                    return (
                                        <div key={member.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-deep/20 hover:shadow-sm transition-all group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-50 text-deep rounded-full flex items-center justify-center font-medium text-xs border border-slate-100 shrink-0">
                                                    {iniciais}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900 text-sm">{member.nome}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${member.tipo === 'GRUPO_EXCLUSIVO' ? 'bg-slate-50 text-deep border-slate-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                                                            {member.tipo === 'GRUPO_EXCLUSIVO' ? 'Exclusivo' : 'Individual'}
                                                        </span>
                                                        {lastReg && (
                                                            <span className="text-[10px] font-medium text-slate-400">
                                                                {new Date(lastReg.data).toLocaleDateString('pt-BR')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                {member.tipo !== 'GRUPO_EXCLUSIVO' && (
                                                    <button onClick={() => router.push(`/painel/pacientes/${member.id}`)} className="p-2 text-slate-400 hover:text-deep hover:bg-slate-50 rounded-lg transition-colors" title="Ver Painel">
                                                        <ExternalLink size={16} strokeWidth={2} />
                                                    </button>
                                                )}
                                                {member.tipo === 'GRUPO_EXCLUSIVO' && (
                                                    <button onClick={() => handlePromote(member.id)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Tornar Individual">
                                                        <ArrowUpRight size={16} strokeWidth={2} />
                                                    </button>
                                                )}
                                                {member.whatsapp && (
                                                    <button onClick={() => handleSendWhatsApp(member)} className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Enviar WhatsApp">
                                                        <Share2 size={16} strokeWidth={2} />
                                                    </button>
                                                )}
                                                <button onClick={() => handleRemoveMember(member.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Remover">
                                                    <Trash2 size={16} strokeWidth={2} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
