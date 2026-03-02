"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { alternarStatusPaciente, excluirPaciente } from "../actions";
import { toast } from "sonner";
import { 
    Copy, PauseCircle, PlayCircle, Pencil, MessageCircle, 
    Trash2, MoreHorizontal, Search, CheckCircle2, AlertCircle, Phone, 
    ChevronRight, Calendar, Activity
} from "lucide-react";
import EditPatientModal from "./EditPatientModal";

interface Paciente {
    id: string;
    nome: string;
    cpf?: string | null;
    email?: string | null;
    dataInicio: Date;
    tokenAcesso: string;
    registros: { data: Date, humor: number }[];
    _count: { registros: number };
    ativo: boolean;
    criadoEm: Date;
}

export default function PatientList({ initialPacientes }: { initialPacientes: Paciente[] }) {
    const router = useRouter();
    const [pacientes, setPacientes] = useState(initialPacientes);
    const [editingPatient, setEditingPatient] = useState<Paciente | null>(null);

    useEffect(() => {
        setPacientes(initialPacientes);
    }, [initialPacientes]);

    const toggleStatus = async (paciente: Paciente) => {
        const novoStatus = !paciente.ativo;
        const msg = novoStatus 
            ? "Reativar acesso do paciente?" 
            : "Pausar acesso do paciente?";
        
        if (!confirm(msg)) return;

        const res = await alternarStatusPaciente(paciente.id, novoStatus);
        
        if (res.success) {
            setPacientes(prev => prev.map(p => 
                p.id === paciente.id ? { ...p, ativo: novoStatus } : p
            ));
        } else {
            alert("Erro ao alterar status.");
        }
    };

    const handleExcluir = async (id: string, nome: string) => {
        if (!confirm(`Tem certeza que deseja excluir ${nome}? Esta ação é irreversível.`)) return;
        
        const res = await excluirPaciente(id);
        if (res.success) {
            setPacientes(prev => prev.filter(p => p.id !== id));
        } else {
            alert("Erro ao excluir.");
        }
    };

    const copyLink = () => {
        const link = `${window.location.origin}/diario`;
        navigator.clipboard.writeText(link);
        toast.success("Link do Portal copiado! Instrua o paciente a entrar com o CPF.");
    };

    const shareWhatsapp = (nome: string, cpf?: string | null) => {
        const loginLink = `${window.location.origin}/diario`;
        const primeiroNome = nome.split(' ')[0];
        let msg = `Olá ${primeiroNome}! Para acessar seu Diário PsiDuo, entre no link abaixo:\n\n🔗 ${loginLink}\n\n`;
        if (cpf) msg += `Use seu CPF para entrar: *${cpf}*`;
        else msg += `Use seu CPF para entrar.`;
        
        const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
    };

    const ActionButton = ({ icon: Icon, label, onClick, colorClass = "text-slate-400 hover:text-deep" }: any) => (
        <div className="relative group/tooltip">
            <button 
                onClick={(e) => { e.stopPropagation(); onClick(); }} 
                className={`p-2 rounded-lg transition-colors ${colorClass} hover:bg-slate-50`}
            >
                <Icon size={18} strokeWidth={2} />
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 hidden md:block font-medium">
                {label}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
            </div>
        </div>
    );

    if (pacientes.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <Search size={24} />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum paciente encontrado</h3>
                <p className="text-slate-500 mb-6 max-w-sm mx-auto font-normal">Adicione novos pacientes para começar a gerenciar.</p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500">
            {editingPatient && (
                <EditPatientModal 
                    paciente={editingPatient} 
                    onClose={() => setEditingPatient(null)} 
                    onSuccess={() => {
                        setEditingPatient(null);
                        router.refresh();
                    }} 
                />
            )}

            {/* Mobile View - Cards (App Style) */}
            <div className="block md:hidden space-y-4">
                {pacientes.map((paciente) => {
                    const ultimoRegistro = paciente.registros[0];
                    const iniciais = paciente.nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
                    
                    return (
                        <div key={paciente.id} className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-6 border border-slate-200/60 shadow-sm active:scale-[0.98] transition-all group" onClick={() => router.push(`/painel/pacientes/${paciente.id}`)}>
                            <div className="flex justify-between items-start mb-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-slate-900/10 shrink-0 group-hover:bg-deep transition-colors">
                                        {iniciais}
                                    </div>
                                    <div>
                                        <div className="font-black text-slate-900 text-lg tracking-tight group-hover:text-deep transition-colors">{paciente.nome}</div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">CPF: {paciente.cpf || "—"}</div>
                                    </div>
                                </div>
                                <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-colors ${paciente.ativo ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                    {paciente.ativo ? 'Ativo' : 'Pausado'}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-5">
                                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Atividade</span>
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-white text-deep shadow-sm">
                                            <Calendar size={14} strokeWidth={2.5} />
                                        </div>
                                        <span className="text-xs font-black text-slate-700">
                                            {ultimoRegistro ? new Date(ultimoRegistro.data).toLocaleDateString('pt-BR') : '—'}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Registros</span>
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-white text-deep shadow-sm">
                                            <Activity size={14} strokeWidth={2.5} />
                                        </div>
                                        <span className="text-xs font-black text-slate-700">{paciente._count.registros}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-100 pt-4 px-1">
                                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                    <button onClick={() => shareWhatsapp(paciente.nome, paciente.cpf)} className="p-2.5 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                                        <Phone size={18} strokeWidth={2.5} />
                                    </button>
                                    <button onClick={() => copyLink()} className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors">
                                        <Copy size={18} strokeWidth={2.5} />
                                    </button>
                                    <button onClick={() => setEditingPatient(paciente)} className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors">
                                        <Pencil size={18} strokeWidth={2.5} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-1 text-deep font-black text-[10px] uppercase tracking-widest">
                                    Prontuário <ChevronRight size={16} strokeWidth={3} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Desktop View - Table */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="py-6 px-6 text-xs font-medium uppercase tracking-wider text-slate-400 w-[35%]">Paciente</th>
                                <th className="py-6 px-6 text-xs font-medium uppercase tracking-wider text-slate-400">Status</th>
                                <th className="py-6 px-6 text-xs font-medium uppercase tracking-wider text-slate-400">Atividade</th>
                                <th className="py-6 px-6 text-xs font-medium uppercase tracking-wider text-slate-400">Diário</th>
                                <th className="py-6 px-6 text-xs font-medium uppercase tracking-wider text-slate-400 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {pacientes.map((paciente) => {
                                const ultimoRegistro = paciente.registros[0];
                                const iniciais = paciente.nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
                                
                                return (
                                    <tr key={paciente.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => router.push(`/painel/pacientes/${paciente.id}`)}>
                                        <td className="py-5 px-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-slate-50 text-deep flex items-center justify-center font-medium text-sm shadow-sm border border-slate-100 shrink-0">
                                                    {iniciais}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900 group-hover:text-deep transition-colors text-base">{paciente.nome}</div>
                                                    <div className="text-xs text-slate-400 font-normal mt-1">CPF: {paciente.cpf || "Não informado"}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-6">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider border ${paciente.ativo ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                                {paciente.ativo ? <CheckCircle2 size={12} strokeWidth={2} /> : <AlertCircle size={12} strokeWidth={2} />}
                                                {paciente.ativo ? 'Ativo' : 'Pausado'}
                                            </span>
                                        </td>
                                        <td className="py-5 px-6">
                                            {ultimoRegistro ? (
                                                <div className="text-sm text-slate-600 font-medium group-hover:text-deep transition-colors">
                                                    {new Date(ultimoRegistro.data).toLocaleDateString('pt-BR')}
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-slate-300 font-medium uppercase tracking-wide">Sem registros</span>
                                            )}
                                        </td>
                                        <td className="py-5 px-6">
                                            <div className="flex items-center gap-2">
                                                <div className="flex -space-x-1">
                                                    <div className={`w-2.5 h-2.5 rounded-full ${paciente._count.registros > 0 ? 'bg-deep' : 'bg-slate-200'}`}></div>
                                                    <div className={`w-2.5 h-2.5 rounded-full ${paciente._count.registros > 5 ? 'bg-deep' : 'bg-slate-200'}`}></div>
                                                    <div className={`w-2.5 h-2.5 rounded-full ${paciente._count.registros > 10 ? 'bg-deep' : 'bg-slate-200'}`}></div>
                                                </div>
                                                <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded ml-2 group-hover:bg-white group-hover:text-deep transition-colors">{paciente._count.registros}</span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                                            {/* Icons Always Visible now, with Tooltips */}
                                            <div className="flex items-center justify-end gap-1">
                                                <ActionButton icon={Phone} label="Enviar WhatsApp" onClick={() => shareWhatsapp(paciente.nome, paciente.cpf)} colorClass="text-slate-400 hover:text-green-600" />
                                                <ActionButton icon={Copy} label="Copiar Link" onClick={() => copyLink()} />
                                                <div className="h-4 w-px bg-slate-100 mx-1"></div>
                                                <ActionButton icon={Pencil} label="Editar Paciente" onClick={() => setEditingPatient(paciente)} />
                                                <ActionButton icon={Trash2} label="Excluir" onClick={() => handleExcluir(paciente.id, paciente.nome)} colorClass="text-slate-400 hover:text-red-600" />
                                                
                                                <div onClick={() => router.push(`/painel/pacientes/${paciente.id}`)} className="ml-2 pl-2 border-l border-slate-100 text-slate-300 hover:text-deep cursor-pointer" title="Ver Prontuário">
                                                     <ChevronRight size={18} strokeWidth={2} />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
