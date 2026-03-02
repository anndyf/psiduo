"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Search, Users, FileText, TrendingUp, ShieldAlert, CheckCircle, XCircle, LogOut, BadgeCheck, DollarSign, MessageCircle, LifeBuoy, Clock, Check } from "lucide-react";
import MessageModal from "./MessageModal";
import { getAdminMetrics, getPsicologosList, toggleStatusPsicologo, adminLogout, togglePlano, toggleVerificado, getTodosPedidosSuporte, marcarLidaPorAdmin } from "./actions";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [psicologos, setPsicologos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [messagingPsi, setMessagingPsi] = useState<{id: string, nome: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'profissionais' | 'suporte'>('profissionais');
  const [suporteMessages, setSuporteMessages] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [m, p, s] = await Promise.all([
          getAdminMetrics(), 
          getPsicologosList(),
          getTodosPedidosSuporte()
      ]);
      setMetrics(m);
      setPsicologos(p);
      setSuporteMessages(s);
      console.log("CLIENTE_ADMIN: Sugestões/Suporte carregados:", s);
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
      loadData();
    } else {
      toast.error("Erro ao alterar status.");
    }
  };

  const handlePlanoChange = async (id: string, currentPlano: string) => {
    const isUpgrading = currentPlano !== 'DUO_II';
    let diasNum: number | undefined = undefined;

    if (isUpgrading) {
        const dias = window.prompt("Ativar DUO II por quantos dias? (Digite o número, ex: 30. Deixe vazio para PERMANENTE)", "");
        if (dias === null) return;
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <p className="text-white text-xs font-black uppercase tracking-widest animate-pulse">Iniciando Central de Comando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      <Navbar />
      
      <main className="container mx-auto max-w-7xl px-6 py-12">
        
        {/* TOP BAR / BREADCRUMBS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">Administração Root</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                    Central de <span className="text-blue-600 not-italic">Excelência.</span>
                </h1>
                <p className="text-slate-500 text-sm font-medium">Gestão estratégica de profissionais e ecossistema PsiDuo.</p>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_12px_rgba(34,197,94,0.5)]"></div>
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Network Online</span>
                </div>
                <button 
                    onClick={handleLogout}
                    className="h-12 w-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-red-600 transition-all shadow-xl shadow-slate-900/10 group"
                >
                    <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>
        </div>

        {/* ANALYTICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <StatCard 
                label="Profissionais" 
                value={metrics?.totalPsicologos || 0} 
                icon={<Users size={24} />} 
                trend="+12% este mês"
                color="blue"
            />
            <StatCard 
                label="Pacientes Ativos" 
                value={metrics?.totalPacientes || 0} 
                icon={<TrendingUp size={24} />} 
                trend="+85 novos"
                color="indigo"
            />
            <StatCard 
                label="Assinantes II" 
                value={metrics?.totalPlanoII || 0} 
                icon={<BadgeCheck size={24} />} 
                trend="24.4% de conversão"
                color="amber"
            />
            <StatCard 
                label="MRR Projetado" 
                value="R$ 14.2k" 
                icon={<DollarSign size={24} />} 
                trend="Em crescimento"
                color="emerald"
                href="/admin/financeiro"
            />
        </div>

        {/* OPERATIONS CENTER */}
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="p-10 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-900">
                        <Users size={24} />
                     </div>
                     <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase italic">Centro de Operações</h2>
                        <div className="flex items-center gap-4 mt-2">
                            <button 
                                onClick={() => setActiveTab('profissionais')}
                                className={`text-[10px] font-black uppercase tracking-widest pb-1 transition-all border-b-2 ${activeTab === 'profissionais' ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                            >
                                Profissionais
                            </button>
                            <button 
                                onClick={() => setActiveTab('suporte')}
                                className={`text-[10px] font-black uppercase tracking-widest pb-1 transition-all border-b-2 flex items-center gap-1.5 ${activeTab === 'suporte' ? 'text-amber-600 border-amber-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                            >
                                Suporte 
                                {suporteMessages.filter(m => !m.lida).length > 0 && (
                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                                )}
                            </button>
                        </div>
                     </div>
                </div>
                
                {/* SEARCH BAR PREMIUM */}
                <div className="relative w-full lg:w-96 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder={activeTab === 'profissionais' ? "Buscar por nome, e-mail ou CRP..." : "Filtrar chamados..."}
                        className="w-full pl-14 pr-6 h-14 bg-slate-50 border-none rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-900 outline-none ring-2 ring-transparent focus:ring-blue-500/10 transition-all placeholder:text-slate-300 placeholder:font-bold"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                {activeTab === 'profissionais' ? (
                    <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                            <th className="px-10 py-6 uppercase italic">Profissional</th>
                            <th className="px-6 py-6 ring-slate-100">Status & Plano</th>
                            <th className="px-6 py-6 text-center">Pacientes</th>
                            <th className="px-10 py-6 text-right">Controle</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/50">
                        {filteredPsis.map(psi => (
                            <tr key={psi.id} className="hover:bg-blue-50/20 transition-all duration-300 group">
                                <td className="px-10 py-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold overflow-hidden relative border-2 border-white shadow-sm">
                                            {psi.nome.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-black text-slate-900 uppercase tracking-tight italic">{psi.nome}</p>
                                                <button 
                                                    onClick={() => handleVerificadoChange(psi.id, psi.verificado)}
                                                    className={`transition-all ${psi.verificado ? "text-blue-500 scale-110" : "text-slate-200 hover:text-blue-300"}`}
                                                >
                                                    <BadgeCheck size={18} fill={psi.verificado ? "currentColor" : "none"} />
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold lowercase">{psi.email}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded tracking-widest uppercase">CRP {psi.crp}</span>
                                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">Membro desde {new Date(psi.criadoEm).getFullYear()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-8">
                                    <div className="flex flex-col gap-2">
                                        <div className={`inline-flex h-6 items-center px-3 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                            psi.status === 'ATIVO' ? 'bg-green-500/10 text-green-600 border-green-200' : 'bg-red-500/10 text-red-600 border-red-200'
                                        }`}>
                                            {psi.status || 'PENDENTE'}
                                        </div>
                                        <button 
                                            onClick={() => handlePlanoChange(psi.id, psi.plano)}
                                            className={`text-[9px] font-black uppercase tracking-tighter transition-colors text-left pl-1 hover:text-blue-600 ${
                                            psi.plano === 'DUO_II' ? 'text-amber-500' : 'text-slate-300'
                                        }`}>
                                            {psi.plano === 'DUO_II' 
                                                ? `★ Plano Duo II (${psi.ciclo === 'YEARLY' ? 'Anual' : 'Mensal'})` 
                                                : '◇ Plano Básico I'}
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-8 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className={`text-2xl font-black italic tracking-tighter ${psi.plano === 'DUO_II' && psi.pacientes >= 15 ? "text-red-500" : "text-slate-900"}`}>
                                            {psi.pacientes}
                                        </span>
                                        <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-1">Base Ativa</p>
                                    </div>
                                </td>
                                <td className="px-10 py-8 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        <button 
                                            onClick={() => setMessagingPsi({ id: psi.id, nome: psi.nome })}
                                            className="h-12 w-12 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-100 flex items-center justify-center transition-all shadow-sm active:scale-95"
                                            title="Enviar mensagem interna"
                                        >
                                            <MessageCircle size={20} />
                                        </button>

                                        <button 
                                            onClick={() => handleStatusChange(psi.id, psi.status)}
                                            className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all shadow-lg ${
                                                psi.status === 'ATIVO' 
                                                ? 'bg-slate-900 text-white hover:bg-red-600 shadow-slate-900/10' 
                                                : 'bg-green-500 text-white hover:bg-green-600 shadow-green-500/20'
                                            }`}
                                        >
                                            {psi.status === 'ATIVO' ? <XCircle size={20} /> : <CheckCircle size={20} />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                ) : (
                    <div className="p-10 space-y-6">
                        {suporteMessages.length === 0 ? (
                            <div className="text-center py-20">
                                <LifeBuoy size={48} className="mx-auto text-slate-200 mb-4" />
                                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Nenhum chamado pendente</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {suporteMessages.map(group => (
                                   <SupportGroupCard 
                                        key={group.id} 
                                        group={group} 
                                        onMessageAdmin={(id: string, nome: string) => setMessagingPsi({ id, nome })}
                                        onRefresh={loadData}
                                   />
                                ))}
                            </div>
                        )}
                    </div>
                )}
                
                {filteredPsis.length === 0 && (
                    <div className="p-24 text-center">
                         <Search size={48} className="mx-auto text-slate-200 mb-4" />
                         <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Nenhum profissional encontrado.</p>
                    </div>
                )}
            </div>
            {messagingPsi && (
                <MessageModal 
                    psicologoId={messagingPsi.id}
                    psicologoNome={messagingPsi.nome}
                    onClose={() => setMessagingPsi(null)}
                />
            )}
        </div>
      </main>
    </div>
  );
}

function SupportGroupCard({ group, onMessageAdmin, onRefresh }: any) {
    const [isExpanded, setIsExpanded] = useState(group.isNew); // Expandido por padrão se houver nova mensagem

    return (
        <div className={`rounded-[2.5rem] border transition-all overflow-hidden ${!group.isNew ? 'bg-slate-50/50 border-slate-100 opacity-60' : 'bg-white border-blue-100 shadow-xl shadow-blue-500/5'}`}>
            {/* Header Clicável */}
            <div 
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-8 flex justify-between items-center cursor-pointer hover:bg-slate-50/50 transition-colors"
            >
                <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                        {group.psicologo.nome.charAt(0)}
                    </div>
                    <div>
                        <h4 className="text-base font-black text-slate-900 uppercase italic">{group.psicologo.nome}</h4>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded tracking-widest uppercase">CRP {group.psicologo.crp}</span>
                            {group.isNew && (
                                <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase tracking-tighter animate-pulse">
                                    {group.messages.filter((m: any) => !m.lida).length} Nova(s)
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <span className="text-[10px] font-bold text-slate-300 uppercase flex items-center justify-end gap-1.5">
                            <Clock size={12} />
                            Última em {new Date(group.latestMessageAt).toLocaleString('pt-BR')}
                        </span>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                         <Clock size={20} className={isExpanded ? "hidden" : "block"} /> {/* Placeholder para arrow se quiser, mas lucide-react arrow-down é melhor */}
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                </div>
            </div>

            {/* Conteúdo Expansível */}
            {isExpanded && (
                <div className="px-8 pb-8 pt-2 animate-in slide-in-from-top-4 duration-300">
                    <div className="space-y-3 mb-8 ml-2 border-l-2 border-slate-100 pl-6">
                        {group.messages.map((m: any) => (
                            <div key={m.id} className="relative group/msg">
                                {!m.lida && <div className="absolute -left-[27px] top-3 w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>}
                                <div className={`p-4 rounded-2xl text-sm ${m.lida ? 'text-slate-500 bg-slate-50/80' : 'text-slate-800 bg-blue-50/50 font-medium'}`}>
                                    {m.conteudo}
                                    <div className="mt-1 text-[8px] font-bold opacity-30 uppercase tracking-widest">
                                        {new Date(m.criadoEm).toLocaleTimeString('pt-BR')}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                        <div className="flex gap-3">
                            <a href={`https://wa.me/${group.psicologo.whatsapp}`} target="_blank" className="h-12 px-6 bg-green-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-green-600 transition-all shadow-lg shadow-green-500/10">
                                Responder WhatsApp
                            </a>
                            <button 
                                onClick={() => onMessageAdmin(group.psicologo.id, group.psicologo.nome)}
                                className="h-12 px-6 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-slate-900/10"
                            >
                                Mensagem Interna
                            </button>
                        </div>
                        {group.isNew && (
                            <button 
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    if(!window.confirm("Marcar todas como resolvidas?")) return;
                                    await marcarLidaPorAdmin(undefined, group.id);
                                    toast.success("Conversa arquivada");
                                    onRefresh();
                                }}
                                className="h-12 px-6 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
                            >
                                <Check size={16} strokeWidth={3} /> Resolver Tudo
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value, icon, trend, color, href }: any) {
    const colors: any = {
        blue: "text-blue-600 bg-blue-500/10",
        indigo: "text-indigo-600 bg-indigo-500/10",
        amber: "text-amber-600 bg-amber-500/10",
        emerald: "text-emerald-600 bg-emerald-500/10",
    };

    const CardContent = (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:scale-[1.02] transition-all cursor-default">
            <div className={`absolute top-0 right-0 w-32 h-32 ${colors[color]} rounded-bl-[3rem] -z-0 opacity-50 group-hover:scale-110 transition-transform`}></div>
            <div className="relative z-10 flex flex-col h-full">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${colors[color]}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">{label}</p>
                    <h3 className="text-4xl font-black text-slate-950 italic tracking-tighter mb-2">{value}</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <TrendingUp size={10} className="text-green-500" />
                        {trend}
                    </p>
                </div>
            </div>
        </div>
    );

    if (href) {
        return <Link href={href} className="contents">{CardContent}</Link>;
    }
    return CardContent;
}

