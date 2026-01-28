"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getAdminMetrics, getPsicologosList, toggleStatusPsicologo, adminLogout, togglePlano, toggleVerificado } from "./actions";
import { toast } from "sonner";
import { Search, Users, FileText, TrendingUp, ShieldAlert, CheckCircle, XCircle, LogOut, BadgeCheck, DollarSign } from "lucide-react";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [psicologos, setPsicologos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [m, p] = await Promise.all([getAdminMetrics(), getPsicologosList()]);
      setMetrics(m);
      setPsicologos(p);
    } catch (error: any) {
        if (error.message === 'UNAUTHORIZED_ADMIN' || error.digest?.includes('UNAUTHORIZED_ADMIN')) {
            router.push('/admin/login');
            return;
        }
        toast.error("Erro ao carregar dados. Talvez você precise fazer login novamente.");
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
      await adminLogout();
  };

  const handleStatusChange = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ATIVO" ? "SUSPENSO" : "ATIVO";
    const confirmMsg = newStatus === "SUSPENSO" 
      ? "Tem certeza que deseja SUSPENDER este psicólogo? Ele perderá o acesso ao painel." 
      : "Deseja reativar este psicólogo?";
      
    if (!window.confirm(confirmMsg)) return;

    const res = await toggleStatusPsicologo(id, newStatus);
    if (res.success) {
      toast.success(`Status alterado para ${newStatus}`);
      loadData(); // Recarrega lista
    } else {
      toast.error("Erro ao alterar status.");
    }
  };

  const handlePlanoChange = async (id: string, currentPlano: string) => {
    const isUpgrading = currentPlano !== 'DUO_II';
    let diasNum: number | undefined = undefined;

    if (isUpgrading) {
        const dias = window.prompt("Ativar DUO II por quantos dias? (Digite o número, ex: 30. Deixe vazio para PERMANENTE)", "");
        
        if (dias === null) return; // Cancelou

        if (dias.trim() !== "") {
            diasNum = parseInt(dias);
            if (isNaN(diasNum)) {
                toast.error("Número de dias inválido.");
                return;
            }
        }
        
        const msgConfirm = diasNum 
            ? `Confirma ativar DUO II por ${diasNum} dias?` 
            : "Confirma ativar DUO II PERMANENTE?";

        if (!window.confirm(msgConfirm)) return;

    } else {
        if(!window.confirm("Downgrade para DUO I (Básico)? O psicólogo perderá recursos premium.")) return;
    }

    const res = await togglePlano(id, currentPlano, diasNum);
    if(res.success) {
        toast.success(`Plano alterado para ${res.novoPlano}`);
        loadData();
    } else {
        toast.error("Erro ao alterar plano.");
    }
  };

   const handleVerificadoChange = async (id: string, currentStatus: boolean) => {
    if(!window.confirm(currentStatus ? "Remover selo de verificado?" : "Marcar psicólogo como VERIFICADO (CRP Confiável)?")) return;

    const res = await toggleVerificado(id, currentStatus);
    if(res.success) {
        toast.success(currentStatus ? "Verificação removida." : "Psicólogo verificado!");
        loadData();
    } else {
        toast.error("Erro ao alterar verificação.");
    }
  };

  const filteredPsis = psicologos.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.crp.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-deep border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="container mx-auto max-w-7xl px-4 py-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Painel Admin</h1>
                <p className="text-sm font-bold text-slate-400">Visão geral do sistema PsiDuo.</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-black text-slate-600 uppercase tracking-wide">Sistema Online</span>
                </div>
                <button 
                    onClick={handleLogout}
                    className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors"
                    title="Sair do Admin"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </div>

        {/* METRICS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
            <MetricCard 
                title="Psicólogos" 
                value={metrics?.totalPsicologos || 0} 
                icon={<Users size={24} className="text-blue-500"/>} 
                color="blue"
            />
            <MetricCard 
                title="Pacientes" 
                value={metrics?.totalPacientes || 0} 
                icon={<TrendingUp size={24} className="text-green-500"/>} 
                color="green"
            />
            <MetricCard 
                title="Registros Diários" 
                value={metrics?.totalDiarios || 0} 
                icon={<FileText size={24} className="text-purple-500"/>} 
                color="purple"
            />
            <MetricCard 
                title="Assinantes Premium" 
                value={metrics?.totalPlanoII || 0} 
                icon={<ShieldAlert size={24} className="text-amber-500"/>} 
                color="amber"
                subtext="Plano Duo II"
            />
            <Link href="/admin/financeiro" className="contents group">
                <MetricCard 
                    title="Acesso Rápido" 
                    value="Financeiro" 
                    icon={<DollarSign size={24} className="text-emerald-600 group-hover:scale-110 transition-transform"/>} 
                    color="green"
                />
            </Link>
        </div>

        {/* LISTA DE PSICOLOGOS */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-xl font-black text-slate-900 uppercase">Psicólogos Cadastrados</h2>
                
                {/* SEARCH */}
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Buscar por nome, CRP..." 
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-deep transition"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Profissional</th>
                            <th className="px-6 py-4">Status / Plano</th>
                            <th className="px-6 py-4 text-center">Pacientes</th>
                            <th className="px-6 py-4">Contato</th>
                            <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredPsis.map(psi => (
                            <tr key={psi.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-black text-slate-900">{psi.nome}</p>
                                            <button 
                                                onClick={() => handleVerificadoChange(psi.id, psi.verificado)}
                                                title={psi.verificado ? "Verificado (Clique para remover)" : "Não verificado (Clique para verificar)"}
                                            >
                                                <BadgeCheck size={16} className={`${psi.verificado ? "text-blue-500 fill-blue-50" : "text-slate-300"} hover:scale-110 transition-transform`} />
                                            </button>
                                        </div>
                                        <p className="text-xs text-slate-500">{psi.email}</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">CRP: {psi.crp}</p>
                                        <p className="text-[9px] text-slate-300 mt-1 uppercase tracking-wide">
                                            Desde {new Date(psi.criadoEm).toLocaleDateString("pt-BR")}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-2 items-start">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wide ${
                                            psi.status === 'ATIVO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {psi.status || 'PENDENTE'}
                                        </span>
                                        <button 
                                            onClick={() => handlePlanoChange(psi.id, psi.plano)}
                                            className={`text-[10px] font-bold uppercase transition-transform hover:scale-105 ${
                                            psi.plano === 'DUO_II' ? 'text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100' : 'text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200'
                                        }`}>
                                            {psi.plano === 'DUO_II' ? '★ Premium (Duo II)' : 'Básico (Duo I)'}
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className={`text-lg font-black ${psi.plano === 'DUO_II' && psi.pacientes >= 15 ? "text-red-500" : "text-slate-700"}`}>
                                            {psi.pacientes}
                                            {psi.plano === 'DUO_II' && <span className="text-sm text-slate-400 font-bold ml-1">/ 15</span>}
                                        </span>
                                        {psi.plano !== 'DUO_II' && psi.pacientes > 0 && (
                                            <span className="text-[9px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 uppercase tracking-wide">
                                                Legado
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs font-bold text-slate-600 font-mono">{psi.whatsapp}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => handleStatusChange(psi.id, psi.status)}
                                        className={`p-2 rounded-xl transition-colors ${
                                            psi.status === 'ATIVO' 
                                            ? 'bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700' 
                                            : 'bg-green-50 text-green-500 hover:bg-green-100 hover:text-green-700'
                                        }`}
                                        title={psi.status === 'ATIVO' ? "Suspender Conta" : "Reativar Conta"}
                                    >
                                        {psi.status === 'ATIVO' ? <XCircle size={20} /> : <CheckCircle size={20} />}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {filteredPsis.length === 0 && (
                    <div className="p-12 text-center text-slate-400 font-bold">
                        Nenhum profissional encontrado.
                    </div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ title, value, icon, color, subtext }: any) {
    const colorClasses: any = {
        blue: "bg-blue-50 border-blue-100 text-blue-600",
        green: "bg-green-50 border-green-100 text-green-600",
        purple: "bg-purple-50 border-purple-100 text-purple-600",
        amber: "bg-amber-50 border-amber-100 text-amber-600",
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                <div className="flex items-end gap-2">
                    <h3 className="text-3xl font-black text-slate-900">{value}</h3>
                     {subtext && <span className="text-[10px] font-bold text-slate-400 mb-1.5">{subtext}</span>}
                </div>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colorClasses[color]}`}>
                {icon}
            </div>
        </div>
    );
}
