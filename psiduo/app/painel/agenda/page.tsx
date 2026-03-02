"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    format, startOfMonth, endOfMonth, eachDayOfInterval,
    isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    ChevronLeft, ChevronRight, Plus, X, Clock, User,
    CheckCircle, XCircle, AlertCircle, Trash2, Calendar,
    TrendingUp, DollarSign, BarChart2, RefreshCw, UsersRound
} from "lucide-react";
import { toast } from "sonner";
import {
    buscarAgendamentos, criarAgendamento, atualizarStatusAgendamento,
    excluirAgendamento, buscarPacientesParaAgenda, buscarBalancoFinanceiro,
    remarcarAgendamento, buscarGruposParaAgenda
} from "./actions";

// ── CONSTANTS ──────────────────────────────────────────────────────────────
const STATUS_CHIP: Record<string, string> = {
    AGENDADO:  "bg-slate-100 text-deep border-slate-200",
    REALIZADO: "bg-emerald-100 text-emerald-800 border-emerald-200",
    CANCELADO: "bg-red-100 text-red-700 border-red-200",
    REMARCADO: "bg-amber-100 text-amber-800 border-amber-200",
};
const STATUS_DOT: Record<string, string> = {
    AGENDADO:  "bg-deep",
    REALIZADO: "bg-emerald-500",
    CANCELADO: "bg-red-400",
    REMARCADO: "bg-amber-500",
};
const RECORRENCIA_LABELS: Record<string, string> = {
    NENHUMA:   "Sem recorrência",
    SEMANAL:   "Semanal (por 3 meses)",
    QUINZENAL: "Quinzenal (por 3 meses)",
    MENSAL:    "Mensal (por 3 meses)",
};

const labelClass = "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5";
const inputClass = "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-deep/10 focus:border-deep/30 transition placeholder:text-slate-300";

function fmtBRL(v: number) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ── COMPONENT ──────────────────────────────────────────────────────────────
export default function AgendaPage() {
    const router = useRouter();
    const [currentDate, setCurrentDate]     = useState(new Date());
    const [agendamentos, setAgendamentos]   = useState<any[]>([]);
    const [pacientes, setPacientes]         = useState<any[]>([]);
    const [grupos, setGrupos]               = useState<any[]>([]);
    const [balanco, setBalanco] = useState<any>({ recebido: 0, previsto: 0, cancelado: 0, total: 0, realizados: 0, agendados: 0 });
    const [loading, setLoading]             = useState(true);
    const [selectedDay, setSelectedDay]     = useState<Date | null>(null);
    const [showModal, setShowModal]         = useState(false);
    const [showDetail, setShowDetail]       = useState<any | null>(null);
    const [showDailyAgenda, setShowDailyAgenda] = useState<Date | null>(null);
    const [saving, setSaving]               = useState(false);
    const [remarcarForm, setRemarcarForm]   = useState<{ open: boolean; data: string; hora: string }>({ open: false, data: "", hora: "" });

    const [form, setForm] = useState({
        titulo: "", data: "", hora: "09:00", duracao: 50,
        tipo: "INDIVIDUAL", pacienteId: "", grupoId: "",
        observacoes: "", valorSessao: "", recorrencia: "NENHUMA",
    });

    const load = useCallback(async () => {
        setLoading(true);
        const [agRes, pacRes, balRes, gruRes] = await Promise.all([
            buscarAgendamentos(currentDate.getFullYear(), currentDate.getMonth() + 1),
            buscarPacientesParaAgenda(),
            buscarBalancoFinanceiro(currentDate.getFullYear(), currentDate.getMonth() + 1),
            buscarGruposParaAgenda(),
        ]);
        if (agRes.success)  { setAgendamentos(agRes.dados ?? []); console.log("AGENDAMENTOS AQUI:", agRes.dados); }
        else { console.error("ERRO AGRES:", agRes.error); }
        if (pacRes.success) setPacientes(pacRes.dados ?? []);
        if (balRes.success) { setBalanco(balRes.dados); console.log("BALANCO:", balRes.dados); }
        if (gruRes.success) setGrupos(gruRes.dados ?? []);
        setLoading(false);
    }, [currentDate]);

    useEffect(() => { load(); }, [load]);

    // Calendar grid
    const monthStart = startOfMonth(currentDate);
    const monthEnd   = endOfMonth(currentDate);
    const days       = eachDayOfInterval({
        start: startOfWeek(monthStart, { weekStartsOn: 0 }),
        end:   endOfWeek(monthEnd,   { weekStartsOn: 0 }),
    });

    const agendamentosDodia = (day: Date) =>
        agendamentos.filter(a => isSameDay(new Date(a.data), day));

    const openNewModal = (day: Date) => {
        setSelectedDay(day);
        setForm(f => ({ ...f, data: format(day, "yyyy-MM-dd"), hora: "09:00" }));
        setShowModal(true);
    };

    const handleCreate = async () => {
        if (!form.titulo.trim() || !form.data || !form.hora) {
            toast.error("Preencha título, data e horário."); return;
        }
        setSaving(true);
        const res = await criarAgendamento({
            titulo:      form.titulo,
            data:        `${form.data}T${form.hora}:00`,
            duracao:     form.duracao,
            tipo:        form.tipo,
            pacienteId:  form.tipo === "INDIVIDUAL" ? (form.pacienteId || undefined) : undefined,
            grupoId:     form.tipo === "GRUPO" ? (form.grupoId || undefined) : undefined,
            observacoes: form.observacoes || undefined,
            valorSessao: form.valorSessao ? Number(form.valorSessao) : undefined,
            recorrencia: form.recorrencia,
        });
        if (res.success) {
            const msg = res.criados && res.criados > 1
                ? `${res.criados} sessões agendadas!`
                : "Atendimento agendado!";
            toast.success(msg);
            setShowModal(false);
            setForm({ titulo: "", data: "", hora: "09:00", duracao: 50, tipo: "INDIVIDUAL", pacienteId: "", grupoId: "", observacoes: "", valorSessao: "", recorrencia: "NENHUMA" });
            load();
        } else {
            toast.error(res.error || "Erro ao agendar.");
        }
        setSaving(false);
    };

    const handleStatus = async (id: string, status: string) => {
        const res = await atualizarStatusAgendamento(id, status);
        if (res.success) { toast.success("Status atualizado!"); setShowDetail(null); load(); }
        else toast.error("Erro ao atualizar.");
    };

    const handleRemarcar = async () => {
        if (!remarcarForm.data || !remarcarForm.hora) {
            toast.error("Escolha a nova data e horário."); return;
        }
        const novaData = `${remarcarForm.data}T${remarcarForm.hora}:00`;
        const res = await remarcarAgendamento(showDetail.id, novaData);
        if (res.success) {
            toast.success("Sessão remarcada!");
            setShowDetail(null);
            setRemarcarForm({ open: false, data: "", hora: "" });
            load();
        } else {
            toast.error(res.error || "Erro ao remarcar.");
        }
    };

    const handleDelete = async (id: string, serie = false) => {
        const msg = serie ? "Excluir TODAS as sessões desta série?" : "Excluir este agendamento?";
        if (!confirm(msg)) return;
        const res = await excluirAgendamento(id, serie);
        if (res.success) { toast.success("Excluído!"); setShowDetail(null); load(); }
        else toast.error("Erro ao excluir.");
    };

    const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    return (
        <main className="min-h-screen bg-slate-50 pb-16">
            <div className="w-full px-4 md:px-8 py-8 space-y-6">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
                            <span className="cursor-pointer hover:text-deep transition-colors" onClick={() => router.push('/painel')}>Painel</span>
                            <ChevronRight size={10} strokeWidth={3} className="opacity-50" />
                            <span className="text-slate-900">Agenda</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Minha Agenda</h1>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => setCurrentDate(new Date())}
                            className="flex-1 sm:flex-none h-11 px-6 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition hover:bg-slate-50 active:scale-95 shadow-sm"
                        >
                            Hoje
                        </button>
                        <button
                            onClick={() => openNewModal(new Date())}
                            className="flex-[2] sm:flex-none flex items-center justify-center gap-2 h-11 px-6 bg-deep text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition hover:bg-slate-800 active:scale-95 shadow-xl shadow-deep/20 group"
                        >
                            <Plus size={18} strokeWidth={3} />
                            Novo Agendamento
                        </button>
                    </div>
                </div>

                {/* SUMMARY CARDS */}
                {balanco && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Realizadas", value: balanco.realizados, sub: "Sessões concluídas", color: "emerald", icon: CheckCircle },
                            { label: "Agendadas", value: balanco.agendados + (balanco.remarcadas || 0), sub: "Atendimentos futuros", color: "deep", icon: Calendar },
                            { label: "Canceladas", value: balanco.canceladas ?? 0, sub: "Sessões perdidas", color: "red", icon: XCircle },
                            { label: "Total Mês", value: balanco.total, sub: "Total na agenda", color: "slate", icon: BarChart2 },
                        ].map((card, i) => {
                            const Icon = card.icon;
                            return (
                                <div key={i} className="bg-white/80 backdrop-blur-sm p-5 rounded-3xl border border-slate-200/60 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/40 relative overflow-hidden group">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
                                        <div className={`p-2 rounded-xl bg-${card.color === 'deep' ? 'slate' : card.color}-50 text-${card.color === 'deep' ? 'deep' : card.color}-600 group-hover:scale-110 transition-transform`}>
                                            <Icon size={16} strokeWidth={2.5} />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">{card.value}</h3>
                                    <p className="text-[10px] font-bold text-slate-400">{card.sub}</p>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* CALENDAR */}
                <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-200/20 overflow-hidden">
                    {/* Month nav */}
                    <div className="flex items-center justify-between px-8 py-6 bg-white/50 border-b border-slate-100">
                        <button onClick={() => setCurrentDate(d => subMonths(d, 1))} className="p-2.5 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition active:scale-90">
                            <ChevronLeft size={20} strokeWidth={2.5} />
                        </button>
                        <div className="text-center">
                            <h2 className="text-lg font-black text-slate-900 capitalize tracking-tight">
                                {format(currentDate, "MMMM yyyy", { locale: ptBR })}
                            </h2>
                        </div>
                        <button onClick={() => setCurrentDate(d => addMonths(d, 1))} className="p-2.5 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition active:scale-90">
                            <ChevronRight size={20} strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* Weekday headers */}
                    <div className="grid grid-cols-7 bg-slate-50/50 border-b border-slate-100">
                        {weekDays.map(d => (
                            <div key={d} className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{d}</div>
                        ))}
                    </div>

                    {/* Day cells */}
                    {loading ? (
                        <div className="h-96 flex items-center justify-center bg-white/50">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-10 h-10 border-4 border-slate-100 border-t-deep rounded-full animate-spin" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizando...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-7">
                            {days.map((day, idx) => {
                                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                                const isT  = isToday(day);
                                const ags  = agendamentosDodia(day);
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => setShowDailyAgenda(day)}
                                        className={`min-h-[70px] sm:min-h-[120px] p-2 border-r border-b border-slate-100 cursor-pointer transition-all duration-300 group
                                            ${!isCurrentMonth ? "bg-slate-50/30" : "bg-white hover:bg-slate-50/80"}`}
                                    >
                                        <div className="flex justify-between items-start mb-1.5">
                                            <div className={`w-7 h-7 flex items-center justify-center rounded-xl text-[11px] font-black transition-all duration-300
                                                ${isT ? "bg-deep text-white shadow-lg shadow-deep/20 scale-110" : isCurrentMonth ? "text-slate-700 group-hover:bg-slate-200 group-hover:text-deep" : "text-slate-300"}`}>
                                                {format(day, "d")}
                                            </div>
                                            {ags.length > 0 && (
                                                <div className="sm:hidden w-1.5 h-1.5 rounded-full bg-deep/20 animate-pulse" />
                                            )}
                                        </div>

                                        {/* Desktop View: Labels */}
                                        <div className="hidden sm:block space-y-1">
                                            {ags.slice(0, 3).map(a => (
                                                <div
                                                    key={a.id}
                                                    onClick={e => { e.stopPropagation(); setShowDetail(a); }}
                                                    className={`text-[9px] font-black px-2 py-1 rounded-lg border truncate cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all ${STATUS_CHIP[a.status] || STATUS_CHIP.AGENDADO}`}
                                                >
                                                    {format(new Date(a.data), "HH:mm")} {a.titulo}
                                                </div>
                                            ))}
                                            {ags.length > 3 && (
                                                <div className="text-[9px] font-black text-slate-400 pl-1 uppercase tracking-tighter">
                                                    + {ags.length - 3} sessões
                                                </div>
                                            )}
                                        </div>

                                        {/* Mobile View: Indicators (Dots) */}
                                        <div className="flex sm:hidden flex-wrap items-center justify-center gap-1 mt-2">
                                            {ags.slice(0, 4).map(a => (
                                                <div
                                                    key={a.id}
                                                    className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[a.status] || STATUS_DOT.AGENDADO}`}
                                                />
                                            ))}
                                            {ags.length > 4 && (
                                                <span className="text-[8px] font-black text-slate-400">+{ags.length - 4}</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* LEGEND */}
                <div className="flex flex-wrap items-center justify-center gap-6 px-4 py-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                    {[
                        { label: "Agendado", color: "bg-deep" },
                        { label: "Realizado", color: "bg-emerald-500" },
                        { label: "Cancelado", color: "bg-red-400" },
                        { label: "Remarcado", color: "bg-amber-500" },
                    ].map(st => (
                        <div key={st.label} className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${st.color}`} />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{st.label}</span>
                        </div>
                    ))}
                    <div className="flex items-center gap-2 border-l border-slate-200 pl-6 ml-2">
                        <RefreshCw size={12} className="text-slate-400" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recorrente</span>
                    </div>
                </div>
            </div>

            {/* ══ MODAL: NOVO AGENDAMENTO ═══════════════════════════════════ */}
            {showModal && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-10">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 tracking-tight">Novo Agendamento</h3>
                                {selectedDay && <p className="text-[10px] font-black text-slate-400 mt-0.5 uppercase tracking-widest">{format(selectedDay, "EEEE, dd 'de' MMMM", { locale: ptBR })}</p>}
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-slate-100 text-slate-400 transition-all active:scale-90">
                                <X size={20} strokeWidth={2.5} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Título */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Título do Compromisso *</label>
                                <input type="text" placeholder="Ex: Sessão Semanal" value={form.titulo}
                                    onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-deep/5 focus:border-deep/20 transition-all" />
                            </div>

                            {/* Data + Hora */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Data *</label>
                                    <input type="date" value={form.data}
                                        onChange={e => setForm(f => ({ ...f, data: e.target.value }))} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl px-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-deep/5 focus:border-deep/20 transition-all" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Horário *</label>
                                    <input type="time" value={form.hora}
                                        onChange={e => setForm(f => ({ ...f, hora: e.target.value }))} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl px-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-deep/5 focus:border-deep/20 transition-all" />
                                </div>
                            </div>

                            {/* Duração + Tipo */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Duração (min)</label>
                                    <input type="number" min={10} max={240} value={form.duracao}
                                        onChange={e => setForm(f => ({ ...f, duracao: Number(e.target.value) }))} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl px-4 text-sm font-bold text-slate-900 outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tipo</label>
                                    <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl px-4 text-sm font-bold text-slate-900 outline-none">
                                        <option value="INDIVIDUAL">Individual</option>
                                        <option value="GRUPO">Grupo</option>
                                        <option value="BLOQUEADO">Bloqueado</option>
                                    </select>
                                </div>
                            </div>

                            {/* Valor + Recorrência */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Valor (R$)</label>
                                    <input type="number" min={0} step={0.01} placeholder="0,00"
                                        value={form.valorSessao}
                                        onChange={e => setForm(f => ({ ...f, valorSessao: e.target.value }))} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl px-4 text-sm font-bold text-slate-900 outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Recorrência</label>
                                    <select value={form.recorrencia} onChange={e => setForm(f => ({ ...f, recorrencia: e.target.value }))} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl px-4 text-sm font-bold text-slate-900 outline-none">
                                        {Object.entries(RECORRENCIA_LABELS).map(([v, l]) => (
                                            <option key={v} value={v}>{l}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {form.recorrencia !== "NENHUMA" && (
                                <div className="flex items-center gap-3 p-4 bg-deep/5 border border-deep/10 rounded-2xl text-[10px] font-black text-deep uppercase tracking-widest">
                                    <RefreshCw size={14} className="shrink-0 animate-spin-slow" />
                                    <span>Serão criadas sessões automaticamente por 3 meses.</span>
                                </div>
                            )}

                            {/* Paciente ou Grupo conforme tipo */}
                            {(form.tipo === "INDIVIDUAL" || form.tipo === "GRUPO") && (
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                                        {form.tipo === "INDIVIDUAL" ? "Paciente" : "Grupo Terapêutico"}
                                    </label>
                                    <select
                                        value={form.tipo === "INDIVIDUAL" ? form.pacienteId : form.grupoId}
                                        onChange={e => {
                                            const id = e.target.value;
                                            if (form.tipo === "INDIVIDUAL") {
                                                const pac = pacientes.find((p: any) => p.id === id);
                                                setForm(f => ({ ...f, pacienteId: id, titulo: pac ? pac.nome : f.titulo }));
                                            } else {
                                                const grp = grupos.find((g: any) => g.id === id);
                                                setForm(f => ({ ...f, grupoId: id, titulo: grp ? grp.titulo : f.titulo, duracao: grp ? grp.duracaoSessao : f.duracao }));
                                            }
                                        }}
                                        className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 text-sm font-bold text-slate-900 outline-none shadow-sm"
                                    >
                                        <option value="">Selecionar...</option>
                                        {form.tipo === "INDIVIDUAL" 
                                            ? pacientes.map((p: any) => <option key={p.id} value={p.id}>{p.nome}</option>)
                                            : grupos.map((g: any) => <option key={g.id} value={g.id}>{g.titulo}</option>)
                                        }
                                    </select>
                                </div>
                                
                            )}

                            {/* Observações */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Observações Internas</label>
                                <textarea rows={3} placeholder="Notas clínicas ou lembretes..."
                                    value={form.observacoes}
                                    onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm font-bold text-slate-900 outline-none resize-none" />
                            </div>
                        </div>

                        <div className="px-8 pb-8 flex gap-3 justify-end border-t border-slate-100 pt-6">
                            <button onClick={() => setShowModal(false)} className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Cancelar</button>
                            <button onClick={handleCreate} disabled={saving}
                                className="px-10 py-3 bg-deep hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition shadow-xl shadow-deep/20 disabled:opacity-60 active:scale-95">
                                {saving ? "Processando..." : "Confirmar Agendamento"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══ MODAL: DETALHE DO AGENDAMENTO ════════════════════════════ */}
            {showDetail && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="flex items-start justify-between px-8 py-6 border-b border-slate-100">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{showDetail.tipo}</p>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">{showDetail.titulo}</h3>
                            </div>
                            <button onClick={() => setShowDetail(null)} className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all active:scale-90">
                                <X size={18} strokeWidth={2.5} />
                            </button>
                        </div>

                        <div className="p-8 space-y-4">
                            <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                                <div className="p-2 bg-slate-50 rounded-xl text-deep"><Calendar size={14} strokeWidth={2.5} /></div>
                                <span className="capitalize">{format(new Date(showDetail.data), "EEEE, dd 'de' MMMM", { locale: ptBR })}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                                <div className="p-2 bg-slate-50 rounded-xl text-deep"><Clock size={14} strokeWidth={2.5} /></div>
                                <span>{format(new Date(showDetail.data), "HH:mm")} · {showDetail.duracao} min</span>
                            </div>
                            {showDetail.valorSessao != null && (
                                <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                                    <div className="p-2 bg-slate-50 rounded-xl text-emerald-600"><DollarSign size={14} strokeWidth={2.5} /></div>
                                    <span>{fmtBRL(showDetail.valorSessao)}</span>
                                </div>
                            )}
                            {showDetail.observacoes && (
                                <div className="bg-slate-50 rounded-2xl p-4 text-xs font-medium text-slate-500 border border-slate-100 mt-2 italic">
                                    "{showDetail.observacoes}"
                                </div>
                            )}
                            <div className={`mt-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${STATUS_CHIP[showDetail.status] || STATUS_CHIP.AGENDADO}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[showDetail.status]}`} />
                                {showDetail.status}
                            </div>
                        </div>

                        <div className="px-8 pb-8 space-y-3">
                            {showDetail.status === "AGENDADO" && (
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => handleStatus(showDetail.id, "REALIZADO")} className="flex items-center justify-center gap-2 py-3.5 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all hover:bg-emerald-100 active:scale-95 focus:ring-4 focus:ring-emerald-500/10">
                                        <CheckCircle size={14} strokeWidth={3} /> Realizado
                                    </button>
                                    <button onClick={() => handleStatus(showDetail.id, "CANCELADO")} className="flex items-center justify-center gap-2 py-3.5 bg-red-50 text-red-600 border border-red-100 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all hover:bg-red-100 active:scale-95 focus:ring-4 focus:ring-red-500/10">
                                        <XCircle size={14} strokeWidth={3} /> Cancelar
                                    </button>
                                </div>
                            )}
                            
                            <button
                                onClick={() => setRemarcarForm(f => ({ ...f, open: !f.open, data: format(new Date(showDetail.data), "yyyy-MM-dd"), hora: format(new Date(showDetail.data), "HH:mm") }))}
                                className="w-full flex items-center justify-center gap-2 py-3.5 bg-white text-amber-600 border border-amber-200 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all hover:bg-amber-50 active:scale-95"
                            >
                                <RefreshCw size={14} strokeWidth={3} /> Remarcar Sessão
                            </button>

                            {remarcarForm.open && (
                                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest text-center">Nova Data e Hora</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input type="date" value={remarcarForm.data} onChange={e => setRemarcarForm(f => ({ ...f, data: e.target.value }))} className="bg-white border-amber-200 rounded-xl px-3 py-2 text-xs font-bold outline-none" />
                                        <input type="time" value={remarcarForm.hora} onChange={e => setRemarcarForm(f => ({ ...f, hora: e.target.value }))} className="bg-white border-amber-200 rounded-xl px-3 py-2 text-xs font-bold outline-none" />
                                    </div>
                                    <button onClick={handleRemarcar} className="w-full py-3 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all">Sincronizar Novo Horário</button>
                                </div>
                            )}

                            <div className="pt-2">
                                {showDetail.recorrenciaId ? (
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleDelete(showDetail.id, false)} className="flex-1 py-3 text-red-400 hover:text-red-600 text-[9px] font-black uppercase tracking-tighter border border-slate-100 rounded-xl">Excluir este</button>
                                        <button onClick={() => handleDelete(showDetail.id, true)} className="flex-[1.5] py-3 bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-tighter rounded-xl">Excluir Série</button>
                                    </div>
                                ) : (
                                    <button onClick={() => handleDelete(showDetail.id)} className="w-full py-3 text-slate-400 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-colors">Excluir Agendamento</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* DAILY AGENDA MODAL */}
            {showDailyAgenda && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowDailyAgenda(null)}>
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 overflow-hidden" onClick={e => e.stopPropagation()}>
                        
                        <div className="p-8 border-b border-slate-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Agenda do Dia</h3>
                                <button onClick={() => setShowDailyAgenda(null)} className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all active:scale-90">
                                    <X size={20} strokeWidth={2.5} />
                                </button>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest capitalize">{format(showDailyAgenda, "EEEE, dd 'de' MMMM", { locale: ptBR })}</p>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1 space-y-4">
                            {agendamentosDodia(showDailyAgenda).length === 0 ? (
                                <div className="text-center py-12 px-6 border-2 border-dashed border-slate-100 rounded-[2rem]">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                                        <Calendar size={24} />
                                    </div>
                                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Dia Disponível</p>
                                    <p className="text-[10px] text-slate-400 mt-1 font-bold">Nenhuma sessão programada para este dia.</p>
                                </div>
                            ) : (
                                agendamentosDodia(showDailyAgenda).map(a => (
                                    <div
                                        key={a.id}
                                        onClick={() => { setShowDailyAgenda(null); setShowDetail(a); }}
                                        className={`group p-5 rounded-[2rem] border transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-deep/5 bg-white ${STATUS_CHIP[a.status] || STATUS_CHIP.AGENDADO}`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-lg font-black text-slate-900 tracking-tight">{format(new Date(a.data), "HH:mm")}</span>
                                            <div className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider bg-white/60 ${STATUS_CHIP[a.status]}`}>
                                                {a.status}
                                            </div>
                                        </div>
                                        <div className="text-sm font-black text-slate-800 group-hover:text-deep transition-colors line-clamp-1">{a.titulo}</div>
                                        
                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200/40">
                                            <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                {a.tipo === "INDIVIDUAL" ? <User size={10} /> : <UsersRound size={10} />}
                                                {a.tipo}
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400">{a.duracao}m</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-8 bg-slate-50 border-t border-slate-100">
                            <button
                                onClick={() => { setShowDailyAgenda(null); openNewModal(showDailyAgenda); }}
                                className="w-full py-4 bg-deep text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-deep/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={16} strokeWidth={3} /> Agendar Nova Sessão
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
