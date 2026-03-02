"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ptBR } from "date-fns/locale";
import { format, addMonths, subMonths } from "date-fns";
import {
    ChevronLeft, ChevronRight, TrendingUp, DollarSign,
    CheckCircle, XCircle, BarChart2, Calendar, FileText, User
} from "lucide-react";
import { buscarFinanceiroDetalhado, buscarEvolucaoMensal } from "./actions";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from "recharts";

function fmtBRL(v: number) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function FinanceiroPage() {
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [financeiro, setFinanceiro] = useState<any>(null);
    const [evolucao, setEvolucao] = useState<any[]>([]);
    const [abaRef, setAbaRef] = useState<"PACIENTES" | "SESSOES">("PACIENTES");

    const load = useCallback(async () => {
        setLoading(true);
        const ano = currentDate.getFullYear();
        const mes = currentDate.getMonth() + 1;
        const [finRes, evoRes] = await Promise.all([
            buscarFinanceiroDetalhado(ano, mes),
            buscarEvolucaoMensal(),
        ]);
        if (finRes.success) setFinanceiro(finRes.dados);
        if (evoRes.success) setEvolucao(evoRes.dados ?? []);
        setLoading(false);
    }, [currentDate]);

    useEffect(() => { load(); }, [load]);

    // Calcular valores totais para o gráfico ou sumário
    const maxValue = evolucao.length > 0
        ? Math.max(...evolucao.map(e => e.recebido + e.previsto))
        : 1;

    return (
        <main className="min-h-screen bg-slate-50 pb-16">
            <div className="w-full px-4 md:px-8 py-8 space-y-6">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-slate-400 mb-1">
                            <span className="cursor-pointer hover:text-slate-800 transition" onClick={() => router.push('/painel')}>Painel</span>
                            <ChevronRight size={12} strokeWidth={2} />
                            <span className="text-slate-800">Financeiro</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-medium text-slate-900 tracking-tight">Financeiro</h1>
                    </div>
                </div>

                {/* MONTH SELECTOR */}
                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl w-max border border-slate-200 shadow-sm">
                    <button onClick={() => setCurrentDate(d => subMonths(d, 1))} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition">
                        <ChevronLeft size={18} />
                    </button>
                    <h2 className="text-sm font-semibold text-slate-900 capitalize min-w-[120px] text-center">
                        {format(currentDate, "MMMM yyyy", { locale: ptBR })}
                    </h2>
                    <button onClick={() => setCurrentDate(d => addMonths(d, 1))} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition">
                        <ChevronRight size={18} />
                    </button>
                </div>

                {loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-slate-200 border-t-deep rounded-full animate-spin" />
                            <p className="text-xs text-slate-400 font-medium">Carregando dados financeiros...</p>
                        </div>
                    </div>
                ) : !financeiro ? (
                    <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200 shadow-sm">
                        Não foi possível carregar os dados.
                    </div>
                ) : (
                    <>
                        {/* 4 CARDS RESUMO */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recebido</p>
                                    <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center">
                                        <CheckCircle size={15} className="text-emerald-600" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-slate-900">{fmtBRL(financeiro.resumo.recebido)}</p>
                                <p className="text-xs text-slate-400 mt-1">{financeiro.resumo.realizadas} sessões realizadas</p>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">A Receber</p>
                                    <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center">
                                        <TrendingUp size={15} className="text-deep" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-slate-900">{fmtBRL(financeiro.resumo.previsto)}</p>
                                <p className="text-xs text-slate-400 mt-1">{financeiro.resumo.agendadas} sessões agendadas</p>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cancelado</p>
                                    <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center">
                                        <XCircle size={15} className="text-red-500" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-slate-900">{fmtBRL(financeiro.resumo.cancelado)}</p>
                                <p className="text-xs text-slate-400 mt-1">{financeiro.resumo.canceladas} sessões canceladas</p>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                                <div className="flex items-center justify-between mb-3 relative z-10">
                                    <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Total Estimado</p>
                                    <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
                                        <BarChart2 size={15} className="text-white" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-white relative z-10">{fmtBRL(financeiro.resumo.total)}</p>
                                <p className="text-xs text-slate-400 mt-1 relative z-10">{financeiro.resumo.total} sessões remuneradas este mês</p>
                            </div>
                        </div>

                        {/* EVOLUÇÃO & DETALHES PACIENTES */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            {/* GRÁFICO (Evolução últimos 6 meses) */}
                            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                <h3 className="text-sm font-semibold text-slate-900 mb-6 flex items-center gap-2">
                                    <TrendingUp size={16} className="text-deep" /> Evolução de Faturamento
                                </h3>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={evolucao} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `R$ ${value}`} />
                                            <RechartsTooltip
                                                cursor={{ fill: '#f8fafc' }}
                                                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                formatter={(value: number | undefined) => [fmtBRL(value || 0), ""]}
                                                labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}
                                            />
                                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
                                            <Bar dataKey="recebido" name="Recebido" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} barSize={32} />
                                            <Bar dataKey="previsto" name="A Receber" stackId="a" fill="#0B1E3B" radius={[4, 4, 0, 0]} barSize={32} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* EXTRATO RESUMIDO */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                        <FileText size={16} className="text-slate-400" /> Detalhamento
                                    </h3>
                                </div>
                                <div className="flex border-b border-slate-100">
                                    <button
                                        onClick={() => setAbaRef("PACIENTES")}
                                        className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition ${abaRef === "PACIENTES" ? "text-deep bg-slate-50 border-b-2 border-deep" : "text-slate-500 hover:bg-slate-50"}`}
                                    >
                                        Por Paciente / Grupo
                                    </button>
                                    <button
                                        onClick={() => setAbaRef("SESSOES")}
                                        className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition ${abaRef === "SESSOES" ? "text-deep bg-slate-50 border-b-2 border-deep" : "text-slate-500 hover:bg-slate-50"}`}
                                    >
                                        Extrato de Sessões
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[340px]">
                                    
                                    {abaRef === "PACIENTES" && (
                                        financeiro.porPaciente.length === 0 ? (
                                            <p className="text-xs text-slate-400 text-center py-6">Nenhum dado financeiro neste mês.</p>
                                        ) : (
                                            financeiro.porPaciente.map((p: any, i: number) => (
                                                <div key={i} className="flex flex-col gap-1 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition">
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-sm font-semibold text-slate-800 line-clamp-1">{p.nome}</span>
                                                        <span className="text-sm font-bold text-slate-900">{fmtBRL(p.recebido + p.previsto)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs text-slate-500">
                                                        <span>{p.total} sessões</span>
                                                        <span className="flex items-center gap-2">
                                                            {p.recebido > 0 && <span className="text-emerald-600 flex items-center gap-1"><CheckCircle size={10} /> {fmtBRL(p.recebido)}</span>}
                                                            {p.previsto > 0 && <span className="text-deep flex items-center gap-1"><TrendingUp size={10} /> {fmtBRL(p.previsto)}</span>}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        )
                                    )}

                                    {abaRef === "SESSOES" && (
                                        financeiro.lista.length === 0 ? (
                                            <p className="text-xs text-slate-400 text-center py-6">Nenhuma sessão neste mês.</p>
                                        ) : (
                                            financeiro.lista.map((s: any) => (
                                                <div key={s.id} className="flex justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition">
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-semibold text-slate-800">{s.titulo}</p>
                                                        <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-medium">
                                                            <span className="flex items-center gap-1"><Calendar size={10} /> {format(new Date(s.data), "dd/MM 'às' HH:mm")}</span>
                                                            {s.status === "REALIZADO" && <span className="text-emerald-600">Realizado</span>}
                                                            {s.status === "AGENDADO" && <span className="text-deep">Agendado</span>}
                                                            {s.status === "REMARCADO" && <span className="text-amber-600">Remarcado</span>}
                                                            {s.status === "CANCELADO" && <span className="text-red-500">Cancelado</span>}
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex flex-col justify-end">
                                                        <span className={`text-sm font-bold ${s.status === "CANCELADO" ? "text-slate-400 line-through" : "text-slate-900"}`}>
                                                            {s.valorSessao ? fmtBRL(s.valorSessao) : "R$ 0,00"}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        )
                                    )}

                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
