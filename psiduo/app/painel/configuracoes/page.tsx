"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { buscarConfiguracoes, cancelarAssinatura } from "./actions";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CreditCard, Calendar, AlertCircle, CheckCircle } from "lucide-react";
import { UpdateCardModal } from "./UpdateCardModal";
import PaymentModal from "../../cadastro/planos/PaymentModal";
import Footer from "@/components/Footer";

export default function ConfiguracoesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState<any>(null);
    const [canceling, setCanceling] = useState(false);
    const [isUpdateCardOpen, setIsUpdateCardOpen] = useState(false);
    const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }
        if (session?.user?.email) {
            loadData();
        }
    }, [status, session, router]);

    const loadData = () => {
        if (session?.user?.email) {
            buscarConfiguracoes(session.user.email).then(res => {
                if(res.success) {
                    setConfig(res.dados);
                } else {
                    toast.error("Erro ao carregar dados.");
                }
                setLoading(false);
            });
        }
    }

    const handleCancelar = async () => {
        if (!confirm("Tem certeza? Sua assinatura não será renovada.")) return;
        
        setCanceling(true);
        const res = await cancelarAssinatura(session?.user?.email!);
        if (res.success) {
            toast.success("Assinatura cancelada com sucesso.");
            setConfig((prev: any) => ({ ...prev, subscriptionId: null, asaas: null }));
        } else {
            toast.error(res.error || "Erro ao cancelar.");
        }
        setCanceling(false);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-bold uppercase tracking-widest animate-pulse">
            Carregando Configurações...
        </div>
    );

    const isDuoII = config?.plano === "DUO_II";
    
    // Datas
    const validadeDB = config?.planoValidade ? new Date(config.planoValidade) : null;
    const nextDueAsaas = config?.asaas?.nextDueDate ? new Date(config.asaas.nextDueDate) : null;
    
    const dataExibicao = nextDueAsaas || validadeDB;
    const textoData = dataExibicao ? format(dataExibicao, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Indefinido";

    // Cartão
    const cartaoInfo = config?.asaas?.creditCard 
        ? `${config.asaas.creditCard.brand} •••• ${config.asaas.creditCard.last4}`
        : "PIX / Boleto";

    return (
        <main className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            
            <div className="container mx-auto max-w-4xl py-12 px-6 flex-1">
                <div className="mb-10">
                    <button onClick={() => router.back()} className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 mb-4 flex items-center gap-1 transition-colors">
                        ← Voltar
                    </button>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-800 uppercase tracking-tighter">Minha Assinatura</h1>
                    <p className="text-slate-500 font-medium mt-2">Gerencie os detalhes e pagamentos do seu plano PsiDuo.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    {/* CARD 1: ASSINATURA */}
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col">
                        <div className={`p-8 ${isDuoII ? "bg-slate-900" : "bg-white border-b"}`}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className={`text-lg font-black uppercase tracking-widest ${isDuoII ? "text-white" : "text-slate-800"}`}>
                                        {isDuoII ? "Plano DUO II" : "Plano DUO I"}
                                    </h2>
                                    <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${isDuoII ? "text-slate-400" : "text-slate-400"}`}>
                                        {isDuoII ? "Premium Ativo" : "Básico Gratuito"}
                                    </p>
                                </div>
                                {isDuoII && (
                                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-green-900/20">
                                        <CheckCircle size={10} strokeWidth={4} /> Ativo
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-2">
                                    <Calendar size={14} /> {config?.subscriptionId ? "Próxima Cobrança" : "Válido Até"}
                                </label>
                                <p className="text-xl font-black text-slate-800 tracking-tight capitalize">
                                    {textoData}
                                </p>
                            </div>

                            {isDuoII ? (
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-2">
                                        <CreditCard size={14} /> Forma de Pagamento
                                    </label>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-5 bg-slate-100 rounded flex items-center justify-center border border-slate-200">
                                            <div className="w-5 h-2.5 bg-slate-300 rounded-sm"></div>
                                        </div>
                                        <p className="text-xs font-bold text-slate-700 uppercase">
                                            {cartaoInfo}
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => setIsUpdateCardOpen(true)}
                                            className="text-[10px] font-bold uppercase text-blue-600 hover:text-blue-800 transition underline decoration-2 underline-offset-2"
                                        >
                                            Trocar Cartão
                                        </button>
                                        <button 
                                            onClick={handleCancelar}
                                            disabled={canceling}
                                            className="text-[10px] font-bold uppercase text-red-400 hover:text-red-600 transition hover:underline decoration-2 underline-offset-2"
                                        >
                                            {canceling ? "Cancelando..." : "Cancelar Plano"}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => setIsUpgradeOpen(true)}
                                    className="w-full py-3 bg-deep text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-slate-900 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                                >
                                    Fazer Upgrade Agora
                                </button>
                            )}
                        </div>
                    </div>

                    {/* CARD 2: BALANÇO E EXTRAS */}
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col">
                        <div className="p-8 bg-amber-50 border-b border-amber-100">
                            <h2 className="text-lg font-black uppercase tracking-widest text-amber-900 flex items-center gap-2">
                                Limite Extra
                            </h2>
                            <p className="text-[10px] font-bold uppercase tracking-wider mt-1 text-amber-700/60">
                                Capacidade Adicional de Pacientes
                            </p>
                        </div>
                        <div className="p-8 flex-1 flex flex-col justify-center items-center text-center">
                            
                            {/* Usage Stats added here */}
                            <div className="mb-6 w-full px-4">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                                    <span>Uso Atual</span>
                                    <span>{config?.totalPacientes || 0} / {(config?.limitePlano || 1) + (config?.limiteExtraPacientes || 0)}</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                     <div 
                                        className="bg-deep h-full rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, ((config?.totalPacientes || 0) / ((config?.limitePlano || 1) + (config?.limiteExtraPacientes || 0))) * 100)}%` }}
                                     ></div>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2 font-medium">
                                    Base: {config?.limitePlano || 1} + Extra: {config?.limiteExtraPacientes || 0}
                                </p>
                            </div>

                            <div className="mb-4">
                                <span className="text-5xl font-black text-slate-800 tracking-tighter">
                                    +{config?.limiteExtraPacientes || 0}
                                </span>
                                <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-2">
                                    Vagas Extras Disponíveis
                                </span>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                            <button onClick={() => router.push('/painel/pacientes')} className="text-[10px] font-black uppercase tracking-widest text-deep hover:text-slate-600 transition">
                                Adquirir Mais Vagas →
                            </button>
                        </div>
                    </div>
                </div>

                {/* HISTÓRICO DE COMPRAS */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">Histórico de Compras</h3>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-3 py-1 rounded-full">Últimos Lançamentos</span>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Data</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Descrição</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Valor</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {config?.historicoCompras && config.historicoCompras.length > 0 ? (
                                    config.historicoCompras.map((compra: any) => (
                                        <tr key={compra.id} className="hover:bg-slate-50/50 transition">
                                            <td className="px-8 py-5 text-xs font-bold text-slate-600">
                                                {format(new Date(compra.createdAt), "dd/MM/yyyy 'às' HH:mm")}
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-xs font-black text-deep uppercase tracking-wide">
                                                    {compra.metadata?.qtd ? `+ ${compra.metadata.qtd} Pacientes` : "Pacote de Pacientes"}
                                                </span>
                                                <span className="block text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                                                    {compra.action === 'COMPRA_PACOTE_PACIENTES' ? 'Via PIX' : 'Via Cartão'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-sm font-black text-slate-800">
                                                R$ {Number(compra.metadata?.valor || 0).toFixed(2).replace('.', ',')}
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                    Aprovado
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-10 text-center text-slate-400 text-sm font-bold uppercase tracking-wide">
                                            Nenhuma compra realizada recentemente.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <UpdateCardModal 
                isOpen={isUpdateCardOpen} 
                onClose={() => setIsUpdateCardOpen(false)} 
                onSuccess={() => {
                    loadData();
                    setIsUpdateCardOpen(false);
                }}
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

            <Footer />
        </main>
    );
}
