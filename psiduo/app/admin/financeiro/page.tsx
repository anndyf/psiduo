"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getFinancialMetrics } from "../actions";
import { toast } from "sonner";
import { TrendingUp, Users, Calendar, DollarSign, PieChart, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminFinanceiro() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [goalMRR, setGoalMRR] = useState(20000);
  const router = useRouter();

  useEffect(() => {
    loadData();
    const savedGoal = localStorage.getItem("psiduo_admin_goal_mrr");
    if (savedGoal) setGoalMRR(Number(savedGoal));
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await getFinancialMetrics();
      setData(res);
    } catch (error: any) {
        if (error.message === 'UNAUTHORIZED_ADMIN' || error.digest?.includes('UNAUTHORIZED_ADMIN')) {
            router.push('/admin/login');
            return;
        }
        toast.error("Erro ao carregar dados financeiros.");
    } finally {
      setLoading(false);
    }
  }

  const handleSetGoal = () => {
      const newGoal = window.prompt("Defina a meta de MRR (ex: 50000):", goalMRR.toString());
      if (newGoal && !isNaN(Number(newGoal))) {
          setGoalMRR(Number(newGoal));
          localStorage.setItem("psiduo_admin_goal_mrr", newGoal);
          toast.success("Meta atualizada com sucesso!");
      }
  };

  if (loading) {
     return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
            <p className="text-white text-xs font-black uppercase tracking-widest animate-pulse">Processando Fluxo de Caixa...</p>
        </div>
      </div>
    );
  }

  const formatMoney = (val: any) => (Number(val) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  
  const currentMRR = data?.revenue.mrr || 0;
  const progressPercent = Math.min(Math.round((currentMRR / goalMRR) * 100), 100);
  const remainingMRR = Math.max(goalMRR - currentMRR, 0);
  // Assumindo ticket médio de R$ 40 para simplificar o cálculo de necessários
  const neededSubs = Math.ceil(remainingMRR / 40);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      <Navbar />
      
      <main className="container mx-auto max-w-7xl px-6 py-12">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <Link href="/admin" className="h-10 w-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm group">
                        <ArrowLeft size={18} className="text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
                    </Link>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">Inteligência Financeira</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                    Saúde <span className="text-emerald-600 not-italic">Financeira.</span>
                </h1>
                <p className="text-slate-500 text-sm font-medium">Métricas de recorrência e performance de assinaturas (SaaS).</p>
            </div>
            
            <div className="bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Mês de Referência</p>
                <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-emerald-500" />
                    <p className="text-sm font-black text-slate-900 uppercase italic">
                        {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </div>
        </div>

        {/* MAIN METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            
            <FinancialCard 
                label="Receita Recorrente (MRR)"
                value={formatMoney(currentMRR)}
                icon={<TrendingUp size={24} />}
                color="emerald"
                description="Projeção total diluída por mês"
                trend="+15.4%"
            />

            <FinancialCard 
                label="Usuários Pagantes (LTV)"
                value={data?.totalPaying}
                icon={<Users size={24} />}
                color="blue"
                description="Assinantes ativos no Duo II"
                trend={`${data?.newSubsThisMonth} novos`}
            />

            <FinancialCard 
                label="Ticket Médio (ARPU)"
                value={data?.totalPaying > 0 ? formatMoney(currentMRR / data?.totalPaying) : "R$ 0,00"}
                icon={<DollarSign size={24} />}
                color="indigo"
                description="Receita média por assinante"
                trend="Estável"
            />

        </div>

        {/* DETAILED BREAKDOWN SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            {/* PROGRESS CHART SECTION */}
            <div className="lg:col-span-3 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-2xl shadow-slate-200/50">
                 <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                            <PieChart size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase italic">Mix de Assinaturas</h3>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Distribuição por ciclo de faturamento</p>
                        </div>
                    </div>
                 </div>

                <div className="space-y-10">
                    <BillProgress 
                        label="DUO II • Ciclo Mensal"
                        count={data?.breakdown.monthly}
                        total={data?.totalPaying}
                        value={formatMoney(data?.revenue.monthlyTotal)}
                        color="bg-indigo-500"
                        price="R$ 40,00"
                    />

                    <BillProgress 
                        label="DUO II • Ciclo Anual"
                        count={data?.breakdown.yearly}
                        total={data?.totalPaying}
                        value={formatMoney(data?.revenue.yearlyShare)}
                        color="bg-emerald-500"
                        price="R$ 430,00"
                        subtext="Parcela mensalizada"
                    />

                    <BillProgress 
                        label="Cortesia / Manual"
                        count={data?.breakdown.manual}
                        total={data?.totalPaying}
                        value="R$ 0,00"
                        color="bg-slate-300"
                        price="Promocional"
                    />
                </div>
            </div>

            {/* INSIGHTS PANEL */}
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden h-full flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full -mr-20 -mt-20 blur-[100px] opacity-20"></div>
                    
                    <div className="relative z-10">
                        <h4 className="text-2xl font-black uppercase italic italic mb-4">Insights de <span className="text-emerald-400">Escala.</span></h4>
                        <p className="text-slate-400 text-sm leading-relaxed mb-8">
                            Sua base demonstra uma retenção de 92%. O ticket médio está saudável para o mercado de Psicologia Digital no Brasil.
                        </p>
                        
                        <div className="space-y-4">
                            <InsightRow label="Novas Ativações" value={data?.newSubsThisMonth} icon={<TrendingUp size={14} className="text-emerald-400" />} />
                            <InsightRow label="Churn Rate (Projetado)" value="2.1%" icon={<Users size={14} className="text-blue-400" />} />
                        </div>
                    </div>

                    <div 
                        className="relative z-10 mt-12 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm cursor-pointer hover:bg-white/10 transition-colors group"
                        onClick={handleSetGoal}
                        title="Clique para definir nova meta"
                    >
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Próxima Meta</p>
                        <div className="flex justify-between items-end">
                            <div>
                                <h5 className="text-xl font-black tracking-tighter text-white uppercase italic">
                                    {Math.floor(goalMRR / 1000)}K MRR
                                </h5>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">
                                    {remainingMRR > 0 ? `Necessário: +${neededSubs} Assinantes` : "Meta Atingida! 🚀"}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-black text-white italic">{progressPercent}%</span>
                            </div>
                        </div>
                        <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
                            <div 
                                className="bg-emerald-500 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000"
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                         <p className="text-[8px] font-bold text-slate-600 uppercase mt-4 opacity-0 group-hover:opacity-100 transition-opacity">Clique para editar meta</p>
                    </div>
                </div>
            </div>

        </div>


      </main>
    </div>
  );
}

function FinancialCard({ label, value, icon, color, description, trend }: any) {
    const colors: any = {
        emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-100 shadow-emerald-500/5",
        blue: "bg-blue-500/10 text-blue-600 border-blue-100 shadow-blue-500/5",
        indigo: "bg-indigo-500/10 text-indigo-600 border-indigo-100 shadow-indigo-500/5",
    };

    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative group overflow-hidden">
             <div className="relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${colors[color]}`}>
                    {icon}
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">{label}</p>
                <h3 className="text-4xl font-black text-slate-900 italic tracking-tighter mb-2">{value}</h3>
                <div className="flex items-center justify-between mt-4 pb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{description}</span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg ${colors[color]}`}>{trend}</span>
                </div>
             </div>
        </div>
    );
}

function BillProgress({ label, count, total, value, color, price, subtext }: any) {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    
    return (
        <div className="group">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase italic leading-none mb-1">{label}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{price} • {count} Assinaturas</p>
                </div>
                <div className="text-right">
                    <span className="text-lg font-black text-slate-900 italic leading-none">{value}</span>
                    {subtext && <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">{subtext}</p>}
                </div>
            </div>
            <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden border border-slate-100">
                <div 
                    className={`${color} h-full rounded-full transition-all duration-1000 ease-out shadow-sm`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
}

function InsightRow({ label, value, icon }: any) {
    return (
        <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3">
                <div className="text-slate-400">{icon}</div>
                <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest">{label}</span>
            </div>
            <span className="text-sm font-black text-white italic">{value}</span>
        </div>
    );
}

