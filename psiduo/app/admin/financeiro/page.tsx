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
  const router = useRouter();

  useEffect(() => {
    loadData();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-deep border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Formatter
  // Formatter. Safe check for undefined/null.
  const formatMoney = (val: any) => (Number(val) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="container mx-auto max-w-7xl px-4 py-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center gap-4">
                <Link href="/admin" className="p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-100 transition">
                    <ArrowLeft size={20} className="text-slate-500" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Relatório Financeiro</h1>
                    <p className="text-sm font-bold text-slate-400">Visão detalhada de receitas e assinaturas.</p>
                </div>
            </div>
            
            <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Referência</p>
                <p className="text-sm font-bold text-slate-700 capitalize">
                    {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </p>
            </div>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* MRR */}
            <div className="bg-white p-6 rounded-[2rem] border border-emerald-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <DollarSign size={20} />
                        </div>
                        <h3 className="text-xs font-black text-emerald-800 uppercase tracking-widest">Receita Recorrente Mensal (MRR)</h3>
                    </div>
                    <p className="text-4xl font-black text-slate-900 mb-1">{formatMoney(data?.revenue.mrr || 0)}</p>
                    <p className="text-[10px] font-bold text-slate-400">Projeção baseada em assinaturas ativas</p>
                </div>
            </div>

            {/* TOTAL PAYING */}
            <div className="bg-white p-6 rounded-[2rem] border border-blue-100 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                 <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Users size={20} />
                        </div>
                        <h3 className="text-xs font-black text-blue-800 uppercase tracking-widest">Total Assinantes Pagantes</h3>
                    </div>
                    <p className="text-4xl font-black text-slate-900 mb-1">{data?.totalPaying}</p>
                    <p className="text-[10px] font-bold text-slate-400">Psicólogos com plano DUO II Ativo</p>
                </div>
            </div>

             {/* NEW SUBS */}
             <div className="bg-white p-6 rounded-[2rem] border border-purple-100 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                 <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                            <TrendingUp size={20} />
                        </div>
                        <h3 className="text-xs font-black text-purple-800 uppercase tracking-widest">Assinaturas Neste Mês</h3>
                    </div>
                    <p className="text-4xl font-black text-slate-900 mb-1">{data?.newSubsThisMonth}</p>
                    <p className="text-[10px] font-bold text-slate-400">Novos upgrades iniciados em {new Date().toLocaleDateString('pt-BR', { month: 'long' })}</p>
                </div>
            </div>
        </div>

        {/* BREAKDOWN */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* DISTRIBUIÇÃO */}
            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                 <div className="flex items-center gap-3 mb-8">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                        <PieChart size={16} />
                    </div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Distribuição de Planos</h3>
                </div>

                <div className="space-y-6">
                    {/* MENSAL */}
                    <div>
                        <div className="flex justify-between items-end mb-2">
                             <span className="text-xs font-bold text-slate-500 uppercase">Mensal (R$ 39,99)</span>
                             <span className="text-sm font-black text-slate-900">{data?.breakdown.monthly} assinantes</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                             <div 
                                className="bg-blue-500 h-full rounded-full transition-all duration-1000" 
                                style={{ width: `${(data?.breakdown.monthly / (data?.totalPaying || 1)) * 100}%` }}
                             ></div>
                        </div>
                        <p className="text-right text-[10px] font-bold text-blue-500 mt-1">
                            {formatMoney(data?.revenue.monthlyTotal)} / mês
                        </p>
                    </div>

                     {/* ANUAL */}
                     <div>
                        <div className="flex justify-between items-end mb-2">
                             <span className="text-xs font-bold text-slate-500 uppercase">Anual (R$ 429,90)</span>
                             <span className="text-sm font-black text-slate-900">{data?.breakdown.yearly} assinantes</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                             <div 
                                className="bg-purple-500 h-full rounded-full transition-all duration-1000" 
                                style={{ width: `${(data?.breakdown.yearly / (data?.totalPaying || 1)) * 100}%` }}
                             ></div>
                        </div>
                        <p className="text-right text-[10px] font-bold text-purple-500 mt-1">
                            Eq. {formatMoney(data?.revenue.yearlyShare)} / mês (Diluído)
                        </p>
                    </div>

                     {/* MANUAL */}
                     <div>
                        <div className="flex justify-between items-end mb-2">
                             <span className="text-xs font-bold text-slate-500 uppercase">Manual / Cortesias</span>
                             <span className="text-sm font-black text-slate-900">{data?.breakdown.manual} usuários</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                             <div 
                                className="bg-slate-400 h-full rounded-full transition-all duration-1000" 
                                style={{ width: `${(data?.breakdown.manual / (data?.totalPaying || 1)) * 100}%` }}
                             ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* INFO BOX */}
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full -mr-20 -mt-20 blur-3xl opacity-20"></div>
                <div className="relative z-10">
                    <h3 className="text-xl font-black uppercase mb-4">Insights Financeiros</h3>
                    <p className="text-slate-300 text-sm leading-relaxed mb-6 font-medium">
                        O cálculo de MRR (Receita Recorrente Mensal) considera tanto assinaturas mensais quanto a parcela mensalizada das assinaturas anuais.
                    </p>
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                         <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-blue-200 uppercase">Ticket Médio (ARPU)</span>
                            <span className="text-lg font-black text-white">
                                {data?.totalPaying > 0 
                                    ? formatMoney(data?.revenue.mrr / data?.totalPaying) 
                                    : "R$ 0,00"}
                            </span>
                         </div>
                         <p className="text-[10px] text-slate-400">Receita média por usuário ativo.</p>
                    </div>
                </div>
            </div>

        </div>

      </main>
    </div>
  );
}
