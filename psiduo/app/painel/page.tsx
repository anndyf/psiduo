"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { buscarDadosPainel } from "./actions";
import { toast } from "sonner";
import { buscarAvaliacoes } from "../perfil/actions";
import { 
    Calendar, Users, Clock, TrendingUp, Settings, 
    Link as LinkIcon, Lock, ChevronRight, Activity,
    Search, Bell, Plus, FileText, Share2, 
    MoreHorizontal, ShieldAlert, BadgeCheck, Zap,
    CircleDollarSign, User
} from "lucide-react";
import { Button } from "@/components/ui/Button";
// --- Componentes Visuais ---

const Sparkline = ({ color = "amber" }: { color?: string }) => (
    <div className="h-10 w-full overflow-hidden opacity-50">
        <svg viewBox="0 0 100 20" preserveAspectRatio="none" className={`w-full h-full text-${color}-500 fill-current`}>
            <path d="M0,10 Q10,5 20,12 T40,8 T60,15 T80,5 T100,12 V20 H0 Z" fillOpacity="0.1" />
            <path d="M0,10 Q10,5 20,12 T40,8 T60,15 T80,5 T100,12" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
    </div>
);

const StatCard = ({ label, value, icon: Icon, trend, subtext, chart = false }: any) => (
    <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 hover:border-slate-300 transition-all flex flex-col justify-between h-full relative overflow-hidden group">
        <div className="flex justify-between items-start mb-2 relative z-10">
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{value}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 text-slate-900 group-hover:bg-deep group-hover:text-white transition-all shadow-sm">
                <Icon size={18} strokeWidth={2.5} />
            </div>
        </div>
        
        {chart && <div className="mt-4 -mx-2 opacity-30 group-hover:opacity-60 transition-opacity grayscale group-hover:grayscale-0"><Sparkline color="amber" /></div>}
        
        {subtext && !chart && (
            <div className="mt-auto pt-4 flex items-center gap-2">
                {trend && (
                    <span className="text-[9px] font-black text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded uppercase tracking-wide border border-amber-100">
                        {trend}
                    </span>
                )}
                <p className="text-[10px] text-slate-400 font-bold truncate">{subtext}</p>
            </div>
        )}
    </div>
);

const ActionCard = ({ title, desc, icon: Icon, onClick, disabled = false, locked = false }: any) => (
    <button 
        onClick={!disabled ? onClick : undefined}
        disabled={disabled}
        className={`w-full text-left group relative overflow-hidden bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-slate-200/60 shadow-sm hover:border-deep hover:shadow-2xl hover:shadow-deep/5 transition-all duration-500 ${disabled ? 'opacity-60 grayscale-[0.5] cursor-not-allowed' : 'cursor-pointer'}`}
    >
        {locked && (
            <div className="absolute top-4 right-4 text-slate-300 group-hover:text-deep transition-colors">
                <Lock size={14} />
            </div>
        )}
        <div className="flex items-start gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 text-slate-900 group-hover:bg-deep group-hover:text-white transition-all shrink-0 shadow-sm group-hover:shadow-lg group-hover:shadow-deep/10">
                <Icon size={24} strokeWidth={2} />
            </div>
            <div>
                <h4 className="text-sm font-black text-slate-900 mb-1 px-1 py-0.5 rounded transition-colors uppercase tracking-tight inline-block group-hover:text-deep">{title}</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[200px]">{desc}</p>
            </div>
            {!disabled && (
                <div className="ml-auto self-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 text-deep">
                    <ChevronRight size={20} strokeWidth={3} />
                </div>
            )}
        </div>
    </button>
);

import AdminNotice from "./AdminNotice";
import SupportModal from "./SupportModal";
import { LifeBuoy } from "lucide-react";

export default function PainelPsicologo() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [showSupport, setShowSupport] = useState(false);
  const [dados, setDados] = useState({ 
    nome: "", 
    foto: null as string | null,
    slug: "",
    status: "PENDENTE", 
    email: "",
    media: "0.0",
    plano: "DUO_I",
    acessos: 0,
    cliquesWhatsapp: 0,
    especialidades: [] as string[],
    publicoAlvo: [] as string[],
    agendamentosHoje: [] as any[],
    kpis: {
        totalPacientes: 0,
        totalGrupos: 0,
        sessoesMes: 0
    }
  });
  
  const [dataHoje, setDataHoje] = useState("");

  useEffect(() => {
    const dateStr = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    const capitalized = dateStr.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
    setDataHoje(capitalized);
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") { router.push("/login"); return; }

    async function init() {
      try {
        console.log("CLIENTE: Chamando buscarDadosPainel...");
        const resPainel = await buscarDadosPainel();
        console.log("CLIENTE: Resposta painel:", resPainel);
        
        let resAv: any = { success: true, media: "0.0" };
        if (resPainel.success && resPainel.dados?.id) {
            resAv = await buscarAvaliacoes(resPainel.dados.id);
            console.log("CLIENTE: Resposta avaliações:", resAv);
        }

        if (resPainel.success && resPainel.dados) {
          setDados({ 
            nome: resPainel.dados.nome || "Profissional", 
            foto: resPainel.dados.foto || null,
            slug: resPainel.dados.slug || "",
            status: resPainel.dados.status || "PENDENTE", 
            email: resPainel.dados.email || "",
            media: resAv.success ? resAv.media : "0.0",
            plano: resPainel.dados.plano || "DUO_I",
            acessos: resPainel.dados.acessos || 0,
            cliquesWhatsapp: resPainel.dados.cliquesWhatsapp || 0,
            especialidades: resPainel.dados.especialidades || [],
            publicoAlvo: resPainel.dados.publicoAlvo || [],
            agendamentosHoje: resPainel.dados.agendamentosHoje || [],
            kpis: resPainel.dados.kpis || { totalPacientes: 0, totalGrupos: 0, sessoesMes: 0 }
          });
        } else if (resPainel.error) {
          console.error("Erro retornado do servidor:", resPainel.error);
          toast.error(resPainel.error);
        }
      } catch (err) { 
        console.error("Erro na inicialização do painel:", err); 
        toast.error("Erro ao carregar dados do painel.");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router, status]);

  const handleShareProfile = () => {
      const link = `${window.location.origin}/perfil/${dados.slug}`;
      navigator.clipboard.writeText(link);
      alert("Link copiado para a área de transferência.");
  };

  if (loading) return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 animate-pulse">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-deep rounded-full animate-spin"></div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Carregando Painel...</p>
          </div>
      </div>
  );

  const isDuoII = dados.plano === "DUO_II";
  const firstName = (dados.nome?.trim() || "Profissional").split(' ')[0];

  return (
    <div className="max-w-[1280px] mx-auto py-6 px-4 md:px-8 animate-in fade-in duration-700">
      
      {/* Top Header Compacto */}
      <header className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200/60">
        <div>
           <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Olá, {firstName} <span className="text-xl">👋</span>
           </h1>
           <div className="flex items-center gap-2 mt-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">
               <Calendar size={14} strokeWidth={2.5} className="text-amber-500" />
               {dataHoje}
           </div>
        </div>
        
        <div className="flex items-center gap-4">
             <Button 
                variant="outline"
                className="h-10 px-4 text-xs font-bold bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 uppercase tracking-wide hidden sm:flex"
                onClick={() => window.open(`/perfil/${dados.slug}`, '_blank')}
             >
                 <Search size={14} className="mr-2" strokeWidth={2.5} /> Meu Perfil
             </Button>

             <Button 
                variant="outline"
                className="h-10 px-4 text-xs font-bold bg-white border-slate-200 text-amber-600 hover:text-amber-700 hover:border-amber-200 hover:bg-amber-50 uppercase tracking-wide hidden sm:flex"
                onClick={() => setShowSupport(true)}
             >
                 <LifeBuoy size={14} className="mr-2" strokeWidth={2.5} /> Suporte
             </Button>

             <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>

             <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push('/painel/perfil')} role="button">
                 <div className="text-right hidden md:block">
                     <p className="text-sm font-black text-slate-900 group-hover:text-amber-600 transition-colors">{dados.nome}</p>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {isDuoII ? 'Plano Premium' : 'Plano Básico'}
                     </p>
                 </div>
                 {dados.foto ? (
                     // eslint-disable-next-line @next/next/no-img-element
                     <img src={dados.foto} alt="Profile" className="w-10 h-10 rounded-xl object-cover border-2 border-slate-100 shadow-sm group-hover:border-amber-500 transition-all" />
                 ) : (
                     <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold border-2 border-transparent group-hover:border-amber-500 transition-all shadow-lg shadow-slate-900/20">
                         {dados.nome.charAt(0)}
                     </div>
                 )}
             </div>
        </div>
      </header>
      
      <AdminNotice />
      
      {showSupport && <SupportModal onClose={() => setShowSupport(false)} />}
      
      {/* Alert Banner (Se Free) */}
      {!isDuoII && (
          <div className="mb-8 bg-deep rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between shadow-2xl shadow-deep/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none group-hover:bg-white/10 transition-all duration-700"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] -ml-24 -mb-24 pointer-events-none"></div>
              
              <div className="flex items-center gap-6 relative z-10 mb-6 md:mb-0">
                  <div className="p-4 bg-white/10 rounded-2xl text-amber-400 backdrop-blur-md shadow-inner border border-white/10 group-hover:scale-110 transition-transform duration-500">
                      <Zap size={28} fill="currentColor" />
                  </div>
                  <div>
                      <h3 className="text-lg font-black text-white mb-1 uppercase tracking-tight">Evolua para o Duo II</h3>
                      <p className="text-sm text-slate-300 font-medium max-w-md">Tenha acesso a prontuários ilimitados, gestão de grupos, agenda inteligente e muito mais.</p>
                  </div>
              </div>
              <Button 
                size="lg" 
                onClick={() => router.push('/cadastro/planos')} 
                className="relative z-10 bg-amber-400 text-deep hover:bg-white hover:text-deep font-black text-xs uppercase tracking-[0.15em] h-12 px-8 rounded-xl border-none transition-all shadow-xl hover:shadow-amber-400/20 active:scale-95"
              >
                  Ver Planos
              </Button>
          </div>
      )}

      {/* Grid de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
             label="Sessões no Mês" 
             value={dados.kpis.sessoesMes} 
             icon={Activity}
             chart={true}
             trend="Mensal"
          />
          <StatCard 
             label="Pacientes Ativos" 
             value={dados.kpis.totalPacientes} 
             icon={Users} 
             subtext="Acompanhamento clínico"
          />
          <StatCard 
             label="Grupos Terapêuticos" 
             value={dados.kpis.totalGrupos} 
             icon={Share2} 
             subtext="Grupos em andamento"
          />
      </div>
      
      {/* Layout Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Coluna Esquerda - Ações Clínicas */}
          <div className="lg:col-span-2 space-y-8">
              
              <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Gestão Clínica</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <ActionCard 
                         title="Visão Geral" 
                         desc="Gerenciar prontuários e evoluções." 
                         icon={Users} 
                         onClick={() => router.push('/painel/pacientes')}
                         locked={!isDuoII}
                         disabled={!isDuoII}
                      />
                      
                      <ActionCard 
                         title="Minha Agenda" 
                         desc="Controle total de sessões e horários." 
                         icon={Calendar} 
                         onClick={() => router.push('/painel/agenda')}
                         locked={!isDuoII}
                         disabled={!isDuoII}
                      />
                      
                      <ActionCard 
                         title="Grupos Terapêuticos" 
                         desc="Rodas de conversa e participantes." 
                         icon={Users} 
                         onClick={() => router.push('/painel/grupos')}
                         locked={!isDuoII}
                         disabled={!isDuoII}
                      />

                      <ActionCard 
                         title="Financeiro" 
                         desc="Controle de receitas e recebíveis." 
                         icon={CircleDollarSign} 
                         onClick={() => router.push('/painel/financeiro')}
                         locked={!isDuoII}
                         disabled={!isDuoII}
                      />
                  </div>
              </div>

               {/* SEÇÃO AGENDA DE HOJE */}
               <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden group">
                   <div className="px-6 py-5 border-b border-slate-100/60 flex items-center justify-between bg-slate-50/20">
                       <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.1em] flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)] animate-pulse" />
                           Agenda de Hoje
                       </h3>
                       <Button variant="ghost" size="sm" onClick={() => router.push('/painel/agenda')} className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-deep hover:bg-slate-100/50 h-8 px-3">
                           Ver Completa
                       </Button>
                   </div>
                   
                   {isDuoII ? (
                       <div className="p-0">
                           {dados.agendamentosHoje.length === 0 ? (
                               <div className="p-10 text-center">
                                   <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 mb-4 text-slate-300">
                                       <Calendar size={20} />
                                   </div>
                                   <p className="text-sm font-bold text-slate-500 mb-1">Dia livre!</p>
                                   <p className="text-xs text-slate-400 mb-4 max-w-xs mx-auto">Você não tem sessões agendadas para hoje.</p>
                                   <Button variant="outline" size="sm" onClick={() => router.push('/painel/agenda')} className="text-[10px] h-9 px-5 bg-white border-slate-200 uppercase font-bold tracking-widest hover:border-slate-900 hover:text-slate-900">
                                       Ir para Agenda
                                   </Button>
                               </div>
                           ) : (
                               <div className="divide-y divide-slate-100">
                                   {dados.agendamentosHoje.map((a: any) => (
                                       <div key={a.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-4">
                                           {/* Horário e Status */}
                                           <div className="flex flex-col items-center justify-center min-w-[60px] border-r border-slate-100 pr-4">
                                               <span className="text-base font-black text-slate-900">
                                                   {new Date(a.hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                               </span>
                                                <span className={`mt-1 text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${
                                                    a.status === 'REALIZADO' ? 'text-emerald-700 bg-emerald-100' :
                                                    a.status === 'AGENDADO' ? 'text-deep bg-slate-100' :
                                                    'text-amber-700 bg-amber-100'
                                                }`}>
                                                    {a.status}
                                                </span>
                                           </div>
                                           {/* Detalhes */}
                                           <div className="flex-1 min-w-0">
                                               <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-amber-600 transition-colors">{a.titulo}</h4>
                                               <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1.5 text-xs text-slate-500 font-medium">
                                                   <span className="flex items-center gap-1.5 min-w-0 truncate">
                                                       {a.tipo === 'INDIVIDUAL' ? <User size={12}/> : <Users size={12}/>}
                                                       <span className="truncate">{a.tipo}</span>
                                                   </span>
                                                   <span className="hidden sm:inline text-slate-300">•</span>
                                                   <span className="flex items-center gap-1.5 whitespace-nowrap">
                                                       <Clock size={12}/> {a.duracao || 50} min
                                                   </span>
                                               </div>
                                           </div>
                                       </div>
                                   ))}
                               </div>
                           )}
                       </div>
                   ) : (
                       <div className="p-10 flex flex-col items-center justify-center text-center opacity-60 pointer-events-none grayscale">
                            <Lock size={24} className="text-slate-400 mb-3" />
                            <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Agenda Bloqueada</p>
                       </div>
                   )}
               </div>

          </div>

          {/* Coluna Direita - Sistema & Perfil */}
          <div className="space-y-6">
              
              {/* Meu Perfil Widget */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden group">
                  <div className="p-6 border-b border-slate-50/60">
                      <div className="flex items-center justify-between mb-5">
                          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meu Perfil Público</h3>
                          <div className={`flex items-center gap-2 px-2 py-1 rounded-lg border ${dados.status === 'ATIVO' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${dados.status === 'ATIVO' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`}></div>
                                <span className="text-[8px] font-black uppercase tracking-tighter">{dados.status}</span>
                          </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                           {dados.foto ? (
                               // eslint-disable-next-line @next/next/no-img-element
                               <img src={dados.foto} alt="Profile" className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-xl shadow-slate-200/50 group-hover:scale-105 transition-transform duration-500" />
                           ) : (
                               <div className="w-16 h-16 rounded-2xl bg-deep text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-deep/20 group-hover:scale-105 transition-transform duration-500">
                                   {(dados.nome || "P").charAt(0)}
                               </div>
                           )}
                           <div className="min-w-0">
                               <h4 className="font-black text-slate-900 text-lg leading-none tracking-tight mb-1 truncate">{firstName}</h4>
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Psicólogo(a) Clínico</p>
                           </div>
                      </div>
                  </div>
                  <div className="p-2 bg-slate-50/50">
                      <button onClick={handleShareProfile} className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all flex items-center justify-between group/btn mb-1">
                          Copiar Link <Share2 size={14} className="text-slate-400 group-hover/btn:text-amber-500 transition-colors" />
                      </button>
                      <button onClick={() => router.push('/painel/perfil')} className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all flex items-center justify-between group/btn">
                          Editar Informações <Settings size={14} className="text-slate-400 group-hover/btn:text-amber-500 transition-colors" />
                      </button>
                  </div>
              </div>

                {/* Atalhos do Sistema */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-sm p-6 group">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Suporte & Conta</h3>
                    <div className="space-y-2">
                        <button onClick={() => router.push('/painel/configuracoes')} className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-slate-50 text-slate-600 hover:text-deep transition-all text-xs font-black uppercase tracking-wider group/item border border-transparent hover:border-slate-100">
                            <div className="p-2 rounded-xl bg-slate-100 text-slate-500 group-hover/item:bg-deep group-hover/item:text-white transition-all"><Settings size={14} strokeWidth={2.5}/></div>
                            Configurações
                        </button>
                        <button onClick={() => window.location.href="mailto:suporte@psiduo.com.br"} className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-slate-50 text-slate-600 hover:text-deep transition-all text-xs font-black uppercase tracking-wider group/item border border-transparent hover:border-slate-100">
                            <div className="p-2 rounded-xl bg-slate-100 text-slate-500 group-hover/item:bg-deep group-hover/item:text-white transition-all"><ShieldAlert size={14} strokeWidth={2.5}/></div>
                            Suporte Técnico
                        </button>
                    </div>
                </div>

          </div>
      </div>
    </div>
  );
}