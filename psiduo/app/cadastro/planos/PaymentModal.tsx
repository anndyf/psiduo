"use client";

import { useState } from "react";
import { X, CreditCard, QrCode, Lock, Check, User } from "lucide-react";
import { toast } from "sonner";
import { gerarAssinaturaCartao, gerarAssinaturaPix } from "./actions";

interface PaymentModalProps {
    email: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function PaymentModal({ email, onClose, onSuccess }: PaymentModalProps) {
    const [method, setMethod] = useState<"PIX" | "CREDIT_CARD">("PIX");
    const [cycle, setCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
    const [loading, setLoading] = useState(false);
    
    // COMMON DATA
    const [cpf, setCpf] = useState("");

    // PIX DATA
    const [pixData, setPixData] = useState<{copiaCola: string, imagem: string} | null>(null);

    // CARD DATA
    const [card, setCard] = useState({
        holderName: "",
        number: "",
        expiryMonth: "",
        expiryYear: "",
        ccv: ""
    });
    const [address, setAddress] = useState({
        postalCode: "",
        addressNumber: ""
    });

    // PRICES
    const PRICE_MONTHLY = 39.99;
    const PRICE_YEARLY = 429.90; 
    
    // MASKS / FORMATTERS
    const formatCardNumber = (value: string) => value.replace(/\D/g, "").replace(/(\d{4})/g, "$1 ").trim().substring(0, 19);
    const formatCEP = (value: string) => value.replace(/\D/g, "").replace(/^(\d{5})(\d)/, "$1-$2").substring(0, 9);
    const formatCPF = (value: string) => value.replace(/\D/g, "").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2").substring(0, 14);
    const onlyNumbers = (value: string, limit: number) => value.replace(/\D/g, "").substring(0, limit);
    const onlyText = (value: string) => value.toUpperCase();

    // HANDLER PIX (MODO TRIAL - 30 DIAS GRÁTIS)
    const handlePix = async () => {
        const cleanCpf = cpf.replace(/\D/g, "");
        if (cleanCpf.length !== 11) {
            toast.error("CPF inválido");
            return;
        }

        setLoading(true);
        // Não limpamos pixData pois não vamos mostrar QR Code no trial
        try {
            const res = await gerarAssinaturaPix(email, cycle, cleanCpf);
            if (res.success) {
                toast.success("Teste ativado! O primeiro PIX será enviado em 30 dias.");
                onSuccess(); // Libera acesso imediato sem mostrar QR
            } else {
                toast.error(res.error || "Erro ao gerar assinatura");
            }
        } catch (e) {
            toast.error("Erro de conexão");
        } finally {
            setLoading(false);
        }
    };

    // HANDLER CARD
    const handleCard = async () => {
        const cleanCard = { ...card, number: card.number.replace(/\s/g, "") };
        const cleanAddress = { ...address, postalCode: address.postalCode.replace("-", "") };
        const cleanCpf = cpf.replace(/\D/g, "");

        if(!cleanCard.number || !cleanCard.ccv || !cleanAddress.postalCode) {
            toast.error("Preencha todos os campos");
            return;
        }
        if (cleanCpf.length !== 11) {
            toast.error("CPF inválido");
            return;
        }

        setLoading(true);
        try {
            // Installments sempre 1 agora
            const res = await gerarAssinaturaCartao(email, cleanCard, cleanAddress, cycle, cleanCpf, 1);
            if (res.success) {
                toast.success("Pagamento aprovado! Bem-vindo ao DUO II.");
                onSuccess();
            } else {
                toast.error(res.error || "Pagamento recusado");
            }
        } catch (e) {
            toast.error("Erro ao processar cartão");
        } finally {
            setLoading(false);
        }
    };

    const getDisplayPrice = () => {
        if (cycle === "MONTHLY") return `R$ ${PRICE_MONTHLY.toFixed(2).replace('.', ',')}`;
        return `R$ ${PRICE_YEARLY.toFixed(2).replace('.', ',')}`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* HEADER */}
                <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <div>
                         <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Assinar Plano DUO II</h2>
                         <p className="text-xs text-slate-500 font-bold">Escolha seu ciclo de pagamento</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                {/* CICLO TOGGLE */}
                <div className="p-6 pb-0">
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button 
                            onClick={() => setCycle("MONTHLY")}
                            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${cycle === "MONTHLY" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                        >
                            Mensal (R$ 39,99)
                        </button>
                        <button 
                            onClick={() => setCycle("YEARLY")}
                            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-lg transition-all relative ${cycle === "YEARLY" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                        >
                            Anual (R$ 429,90)
                            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[9px] px-2 py-0.5 rounded-full shadow-sm animate-bounce">ECONOMIZE</span>
                        </button>
                    </div>
                </div>

                {/* TABS PAGAMENTO */}
                <div className="flex border-b border-slate-100 mt-6 mx-6">
                    <button 
                        onClick={() => setMethod("PIX")}
                        className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition border-b-2 ${method === "PIX" ? "text-green-600 border-green-500" : "text-slate-400 border-transparent hover:text-slate-600"}`}
                    >
                        <QrCode size={16} /> PIX
                    </button>
                    <button 
                        onClick={() => setMethod("CREDIT_CARD")}
                        className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition border-b-2 ${method === "CREDIT_CARD" ? "text-blue-600 border-blue-500" : "text-slate-400 border-transparent hover:text-slate-600"}`}
                    >
                        <CreditCard size={16} /> Cartão de Crédito
                    </button>
                </div>

                {/* CONTENT */}
                <div className="p-8 pt-6 overflow-y-auto">
                    
                    {/* PIX AREA */}
                    {method === "PIX" && (
                        <div className="space-y-4">
                             <div className="bg-green-50 p-4 rounded-xl border border-green-100 mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-green-200 text-green-700 p-1 rounded-full"><QrCode size={10} strokeWidth={4} /></div>
                                        <p className="text-xs text-green-800 font-black uppercase tracking-wide">Total a pagar hoje</p>
                                    </div>
                                    <p className="text-2xl font-black text-green-600">R$ 0,00</p>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-green-200/50">
                                     <p className="text-[10px] text-green-700 font-bold uppercase tracking-wider">Primeiro PIX (30 dias)</p>
                                     <p className="text-xs font-bold text-green-700">{getDisplayPrice()}</p>
                                </div>
                            </div>

                            <p className="text-slate-500 font-medium text-xs text-center px-4">
                                Você receberá o QR Code de pagamento no seu e-mail apenas próximo ao vencimento. 
                                <br/><span className="font-bold text-black">Acesso liberado imediatamente!</span>
                            </p>

                            <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Seu CPF (Para emissão)</label>
                                <input 
                                    placeholder="000.000.000-00" 
                                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium outline-none focus:border-green-500 transition"
                                    value={cpf}
                                    onChange={e => setCpf(formatCPF(e.target.value))}
                                    maxLength={14}
                                />
                            </div>

                            <button 
                                onClick={handlePix}
                                disabled={loading}
                                className="bg-green-600 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-green-700 transition w-full shadow-lg shadow-green-500/20 mt-4"
                            >
                                {loading ? "Ativando..." : "Liberar Acesso (Pagar em 30 dias)"}
                            </button>
                        </div>
                    )}

                    {/* CARD AREA */}
                    {method === "CREDIT_CARD" && (
                        <div className="space-y-4">
                            <div className="bg-green-50 p-4 rounded-xl border border-green-100 mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-green-200 text-green-700 p-1 rounded-full"><Check size={10} strokeWidth={4} /></div>
                                        <p className="text-xs text-green-800 font-black uppercase tracking-wide">Total a pagar hoje</p>
                                    </div>
                                    <p className="text-2xl font-black text-green-600">R$ 0,00</p>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-green-200/50">
                                     <p className="text-[10px] text-green-700 font-bold uppercase tracking-wider">Primeira cobrança (30 dias)</p>
                                     <p className="text-xs font-bold text-green-700">{getDisplayPrice()}</p>
                                </div>
                            </div>

                            {/* CPF FIELD */}
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">CPF do Titular</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        placeholder="000.000.000-00" 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium outline-none focus:border-blue-500 transition"
                                        value={cpf}
                                        onChange={e => setCpf(formatCPF(e.target.value))}
                                        maxLength={14}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Titular do Cartão</label>
                                <input 
                                    placeholder="NOME COMO NO CARTÃO" 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-blue-500 transition"
                                    value={card.holderName}
                                    onChange={e => setCard({...card, holderName: onlyText(e.target.value)})}
                                />
                            </div>
                            
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Número do Cartão</label>
                                <input 
                                    placeholder="0000 0000 0000 0000" 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-blue-500 transition font-mono"
                                    value={card.number}
                                    onChange={e => setCard({...card, number: formatCardNumber(e.target.value)})}
                                    maxLength={19}
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Validade</label>
                                    <div className="flex gap-2">
                                        <input 
                                            placeholder="MM" 
                                            maxLength={2}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-blue-500 transition text-center"
                                            value={card.expiryMonth}
                                            onChange={e => setCard({...card, expiryMonth: onlyNumbers(e.target.value, 2)})}
                                        />
                                        <input 
                                            placeholder="AAAA" 
                                            maxLength={4}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-blue-500 transition text-center"
                                            value={card.expiryYear}
                                            onChange={e => setCard({...card, expiryYear: onlyNumbers(e.target.value, 4)})}
                                        />
                                    </div>
                                </div>
                                <div className="w-1/3">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">CVV</label>
                                    <input 
                                        placeholder="123" 
                                        maxLength={4}
                                        type="password"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-blue-500 transition text-center"
                                        value={card.ccv}
                                        onChange={e => setCard({...card, ccv: onlyNumbers(e.target.value, 4)})}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 mt-4">
                                <h4 className="text-xs font-bold text-slate-800 mb-3 uppercase">Endereço de Cobrança</h4>
                                <div className="flex gap-4">
                                     <div className="flex-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">CEP</label>
                                        <input 
                                            placeholder="00000-000" 
                                            maxLength={9}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-blue-500 transition"
                                            value={address.postalCode}
                                            onChange={e => setAddress({...address, postalCode: formatCEP(e.target.value)})}
                                        />
                                    </div>
                                    <div className="w-1/3">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Número</label>
                                        <input 
                                            placeholder="Nº" 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-blue-500 transition"
                                            value={address.addressNumber}
                                            onChange={e => setAddress({...address, addressNumber: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleCard}
                                disabled={loading}
                                className="w-full mt-6 bg-green-600 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-green-700 transition shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                            >
                                {loading ? "Ativando Teste..." : <><Lock size={16} /> Iniciar Teste Grátis</>}
                            </button>
                        </div>
                    )}

                </div>

                <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                        <Lock size={10} /> Pagamento 100% Seguro via Asaas
                    </p>
                </div>
            </div>
        </div>
    );
}
