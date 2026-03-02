"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { buscarConfiguracoes, cancelarAssinatura } from "./actions";
import { atualizarCredenciais } from "../actions";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Calendar, AlertCircle, Users, CreditCard, Star } from "lucide-react";
import { UpdateCardModal } from "./UpdateCardModal";
import PaymentModal from "../../cadastro/planos/PaymentModal";

export default function ConfiguracoesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState<any>(null);
    const [canceling, setCanceling] = useState(false);
    const [isUpdateCardOpen, setIsUpdateCardOpen] = useState(false);
    const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [isAware, setIsAware] = useState(false);

    // --- Credenciais ---
    const [editandoEmail, setEditandoEmail] = useState(false);
    const [novoEmail, setNovoEmail] = useState("");
    const [senhaAtual, setSenhaAtual] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");
    const [statusEnvio, setStatusEnvio] = useState({ tipo: "", texto: "" });
    const [loadingCredenciais, setLoadingCredenciais] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") { router.push("/login"); return; }
        if (session?.user?.email) loadData();
    }, [status, session, router]);

    const loadData = () => {
        if (session?.user?.email) {
            buscarConfiguracoes(session.user.email).then(res => {
                if (res.success && res.dados) {
                    setConfig(res.dados);
                    setNovoEmail(res.dados.email || session.user?.email || "");
                }
                else toast.error("Erro ao carregar dados.");
                setLoading(false);
            });
        }
    };

    const handleCancelarClick = () => { setIsAware(false); setShowCancelModal(true); };

    const confirmCancellation = async () => {
        setCanceling(true);
        const res = await cancelarAssinatura(session?.user?.email!);
        if (res.success) {
            toast.success("Assinatura cancelada com sucesso.");
            setConfig((prev: any) => ({ ...prev, subscriptionId: null, asaas: null }));
            setShowCancelModal(false);
        } else {
            toast.error(res.error || "Erro ao cancelar.");
        }
        setCanceling(false);
    };

    const handleSalvarCredenciais = async () => {
        setStatusEnvio({ tipo: "", texto: "" });
        if (novaSenha) {
            if (!senhaAtual) return setStatusEnvio({ tipo: "erro", texto: "Digite sua senha atual." });
            if (novaSenha !== confirmarNovaSenha) return setStatusEnvio({ tipo: "erro", texto: "Senhas não conferem." });
            if (novaSenha.length < 6) return setStatusEnvio({ tipo: "erro", texto: "Mínimo 6 caracteres." });
        }
        setLoadingCredenciais(true);
        const res = await atualizarCredenciais({
            emailNovo: editandoEmail ? novoEmail : undefined,
            senhaNova: novaSenha || undefined,
            senhaAtual: senhaAtual || undefined
        });
        if (res.success) {
            setStatusEnvio({ tipo: "sucesso", texto: res.message });
            setEditandoEmail(false);
            setSenhaAtual(""); setNovaSenha(""); setConfirmarNovaSenha("");
            toast.success("Credenciais atualizadas!");
        } else {
            setStatusEnvio({ tipo: "erro", texto: res.error || "Erro ao atualizar credenciais." });
            toast.error(res.error || "Erro ao atualizar credenciais.");
        }
        setLoadingCredenciais(false);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Carregando...</p>
            </div>
        </div>
    );

    const isDuoII = config?.plano === "DUO_II";
    const validadeDB = config?.planoValidade ? new Date(config.planoValidade) : null;
    const nextDueAsaas = config?.asaas?.nextDueDate ? new Date(config.asaas.nextDueDate) : null;
    const dataExibicao = nextDueAsaas || validadeDB;
    const textoData = dataExibicao ? format(dataExibicao, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Indefinido";
    const cartaoInfo = config?.asaas?.creditCard
        ? `${config.asaas.creditCard.brand} •••• ${config.asaas.creditCard.last4}`
        : "PIX / Boleto";

    const totalPacientes = config?.totalPacientes || 0;
    const limitePacientes = (config?.limitePlano || 1) + (config?.limiteExtraPacientes || 0);
    const percentUso = Math.round((totalPacientes / limitePacientes) * 100);

    return (
        <main className="min-h-screen bg-slate-50 pb-16">

            <div className="w-full px-4 md:px-8 py-8 space-y-6">

                {/* PAGE TITLE */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-700 transition shadow-sm"
                        >
                            <ArrowLeft size={18} strokeWidth={2} />
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-medium text-slate-900 tracking-tight">
                                Minha Assinatura
                            </h1>
                            <p className="text-sm text-slate-400 mt-1">Gerencie seu plano e pagamentos</p>
                        </div>
                    </div>
                    {isDuoII && (
                        <span className="flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-semibold">
                            <Star size={12} strokeWidth={2.5} fill="currentColor" />
                            Duo II Premium
                        </span>
                    )}
                </div>

                {/* TOP CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* CARD: PLANO */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-5">
                        <div className="space-y-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Plano Atual</p>
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        {isDuoII ? "Duo II — Premium" : "Duo I — Básico"}
                                    </h2>
                                </div>
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                                    isDuoII
                                        ? "bg-green-50 text-green-700 border-green-200"
                                        : "bg-slate-100 text-slate-500 border-slate-200"
                                }`}>
                                    {isDuoII ? "Ativo" : "Gratuito"}
                                </span>
                            </div>

                            <div className="space-y-3 pt-1">
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                                        {config?.subscriptionId ? "Próxima Renovação" : "Vigência"}
                                    </p>
                                    <div className="flex items-center gap-2 text-slate-700">
                                        <Calendar size={14} className="text-slate-400 shrink-0" />
                                        <span className="text-sm font-medium capitalize">{textoData}</span>
                                    </div>
                                </div>

                                {isDuoII && (
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Pagamento</p>
                                        <div className="flex items-center gap-2 text-slate-700">
                                            <CreditCard size={14} className="text-slate-400 shrink-0" />
                                            <span className="text-sm font-medium">{cartaoInfo}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 pt-5 border-t border-slate-100 flex gap-3">
                            {isDuoII ? (
                                <>
                                    <button
                                        onClick={() => setIsUpdateCardOpen(true)}
                                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                                    >
                                        Trocar Cartão
                                    </button>
                                    <button
                                        onClick={handleCancelarClick}
                                        disabled={canceling}
                                        className="flex-1 py-2.5 rounded-xl border border-red-100 bg-red-50 text-xs font-semibold text-red-500 hover:bg-red-100 transition"
                                    >
                                        Cancelar Plano
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsUpgradeOpen(true)}
                                    className="w-full py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition shadow-md shadow-primary/20"
                                >
                                    Fazer Upgrade para Duo II
                                </button>
                            )}
                        </div>
                    </div>

                    {/* CARD: CAPACIDADE */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-5">
                        <div className="space-y-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Capacidade</p>
                                    <h2 className="text-lg font-semibold text-slate-900">Uso de Pacientes</h2>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-slate-900 tracking-tight">
                                        {totalPacientes}
                                        <span className="text-base text-slate-400 font-normal">/{limitePacientes}</span>
                                    </span>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
                                    <span>Progresso</span>
                                    <span>{percentUso}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-700 ${percentUso > 90 ? "bg-amber-500" : "bg-emerald-500"}`}
                                        style={{ width: `${Math.min(100, percentUso)}%` }}
                                    />
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-semibold text-slate-500">Limite base</span>
                                    <span className="text-xs font-semibold text-slate-700">{config?.limitePlano || 1} pacientes</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-semibold text-slate-500">Pacotes extras</span>
                                    <span className="text-xs font-semibold text-emerald-600">+{config?.limiteExtraPacientes || 0}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-5 border-t border-slate-100">
                            <button
                                onClick={() => router.push('/painel/pacientes')}
                                className="w-full py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-2"
                            >
                                <Users size={14} />
                                Gerenciar Pacientes
                            </button>
                        </div>
                    </div>
                </div>

                {/* ACESSO & CREDENCIAIS */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Sistema</p>
                        <h2 className="text-lg font-semibold text-slate-900 leading-none">Configurações de Acesso</h2>
                    </div>

                    {statusEnvio.texto && (
                        <div className={`p-4 rounded-xl text-center font-semibold text-sm animate-in fade-in slide-in-from-top-2 duration-300 ${
                            statusEnvio.tipo === 'sucesso' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                        }`}>
                            {statusEnvio.texto}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        {/* E-mail */}
                        <div className="flex flex-col gap-3">
                            <div>
                                <div className="flex justify-between items-end mb-1.5 min-h-[18px]">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider leading-none">E-mail de Acesso</label>
                                    <button onClick={() => setEditandoEmail(!editandoEmail)} className="text-[10px] font-bold text-primary uppercase hover:underline leading-none">
                                        {editandoEmail ? "Cancelar Editar" : "Alterar"}
                                    </button>
                                </div>
                                <input
                                    type="email"
                                    disabled={!editandoEmail}
                                    value={editandoEmail ? novoEmail : (config?.email || session?.user?.email || "")}
                                    onChange={(e) => setNovoEmail(e.target.value)}
                                    className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition ${
                                       editandoEmail ? 'border-primary/50 bg-white text-slate-800' : 'border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed'
                                    }`}
                                />
                            </div>
                        </div>

                        {/* Senha */}
                        <div className="flex flex-col gap-3">
                            <div>
                                <div className="flex items-end mb-1.5 min-h-[18px]">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider leading-none">Alterar Senha</label>
                                </div>
                                <input
                                    type="password"
                                    placeholder="Senha Atual (Obrigatório para trocar)"
                                    value={senhaAtual}
                                    onChange={(e) => setSenhaAtual(e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="password"
                                    placeholder="Nova Senha"
                                    value={novaSenha}
                                    onChange={(e) => setNovaSenha(e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition"
                                />
                                <input
                                    type="password"
                                    placeholder="Confirmar Nova Senha"
                                    value={confirmarNovaSenha}
                                    onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button
                            onClick={handleSalvarCredenciais}
                            disabled={loadingCredenciais || (!editandoEmail && !novaSenha)}
                            className="bg-deep text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 active:scale-95 transition-all shadow-md shadow-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loadingCredenciais ? "Salvando..." : "Salvar Alterações"}
                        </button>
                    </div>
                </div>

                {/* HISTÓRICO */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Histórico de Pagamentos</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    {["Data", "Descrição", "Valor", "Status"].map(h => (
                                        <th key={h} className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {config?.historicoCompras && config.historicoCompras.length > 0 ? (
                                    config.historicoCompras.map((compra: any) => (
                                        <tr key={compra.id} className="hover:bg-slate-50/60 transition">
                                            <td className="px-6 py-4 text-sm text-slate-700">
                                                {format(new Date(compra.createdAt), "dd MMM yyyy", { locale: ptBR })}
                                                <span className="text-slate-400 text-xs ml-1.5">{format(new Date(compra.createdAt), "HH:mm")}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-slate-800">
                                                    {compra.metadata?.qtd ? `Pacote +${compra.metadata.qtd} Vagas` : "Assinatura Duo II"}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {compra.action === 'COMPRA_PACOTE_PACIENTES' ? 'Pagamento único' : 'Recorrente'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                                                R$ {Number(compra.metadata?.valor || 0).toFixed(2).replace('.', ',')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-full border border-green-100 text-xs font-semibold">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                    Pago
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-16 text-center">
                                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <Calendar size={18} className="text-slate-400" />
                                            </div>
                                            <p className="text-sm text-slate-400 font-medium">Nenhum pagamento registrado</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODALS */}
            <UpdateCardModal
                isOpen={isUpdateCardOpen}
                onClose={() => setIsUpdateCardOpen(false)}
                onSuccess={() => { loadData(); setIsUpdateCardOpen(false); }}
                userEmail={session?.user?.email!}
            />

            {isUpgradeOpen && session?.user?.email && (
                <PaymentModal
                    email={session.user.email}
                    onClose={() => setIsUpgradeOpen(false)}
                    onSuccess={() => {
                        setIsUpgradeOpen(false);
                        loadData();
                        toast.success("Parabéns! Seu plano foi atualizado para DUO II.");
                    }}
                />
            )}

            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-5">
                            <AlertCircle size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 text-center mb-1">Cancelar Assinatura?</h3>
                        <p className="text-sm text-slate-500 text-center mb-6">
                            Sua assinatura Duo II não será renovada e você voltará ao plano gratuito ao fim do ciclo.
                        </p>

                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-5">
                            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <AlertCircle size={12} /> Importante
                            </p>
                            <p className="text-sm text-amber-800 leading-relaxed">
                                Seus dados (pacientes, diários, grupos) ficarão salvos por <strong>45 dias</strong>. Após esse período, serão excluídos permanentemente caso não haja renovação.
                            </p>
                        </div>

                        <label className="flex items-start gap-3 cursor-pointer mb-6">
                            <input
                                id="confirm-risk"
                                type="checkbox"
                                checked={isAware}
                                onChange={(e) => setIsAware(e.target.checked)}
                                className="w-4 h-4 mt-0.5 accent-deep rounded cursor-pointer"
                            />
                            <span className="text-sm text-slate-600 leading-snug">
                                Estou ciente que meus dados serão excluídos após 45 dias se eu não renovar o plano.
                            </span>
                        </label>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="py-3 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition"
                            >
                                Manter Plano
                            </button>
                            <button
                                onClick={confirmCancellation}
                                disabled={canceling || !isAware}
                                className={`py-3 text-sm font-semibold rounded-xl transition ${
                                    !isAware || canceling
                                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                        : "bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/20"
                                }`}
                            >
                                {canceling ? "Cancelando..." : "Confirmar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
