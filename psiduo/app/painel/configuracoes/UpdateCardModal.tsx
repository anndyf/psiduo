"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CreditCard, Lock, Calendar, User } from "lucide-react";
import { atualizarCartaoAssinatura } from "./actions";

interface UpdateCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userEmail: string;
}

export function UpdateCardModal({ isOpen, onClose, onSuccess, userEmail }: UpdateCardModalProps) {
    const [loading, setLoading] = useState(false);
    const [cardData, setCardData] = useState({
        holderName: "",
        number: "",
        expiryMonth: "",
        expiryYear: "",
        ccv: ""
    });

    if (!isOpen) return null;

    const handleSave = async () => {
        // Validação básica
        if (!cardData.holderName || !cardData.number || !cardData.expiryMonth || !cardData.expiryYear || !cardData.ccv) {
            toast.error("Preencha todos os campos do cartão.");
            return;
        }

        setLoading(true);
        try {
            const res = await atualizarCartaoAssinatura(userEmail, cardData);
            if (res.success) {
                toast.success("Cartão atualizado com sucesso!");
                onSuccess();
                onClose();
            } else {
                toast.error(res.error || "Erro ao atualizar cartão.");
            }
        } catch (error) {
            toast.error("Erro interno ao salvar.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
                    <h2 className="font-black uppercase tracking-widest text-sm flex items-center gap-2">
                        <CreditCard size={18} /> Atualizar Cartão
                    </h2>
                    <button onClick={onClose} className="text-white/60 hover:text-white transition">✕</button>
                </div>

                <div className="p-8 space-y-6">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Nome no Cartão</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            <input 
                                type="text"
                                placeholder="COMO ESTÁ NO CARTÃO"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 pl-12 pr-4 font-bold text-slate-800 uppercase text-xs placeholder:text-slate-300 focus:border-deep focus:outline-none transition-all"
                                value={cardData.holderName}
                                onChange={e => setCardData({...cardData, holderName: e.target.value.toUpperCase()})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Número do Cartão</label>
                        <div className="relative">
                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            <input 
                                type="text"
                                maxLength={16}
                                placeholder="0000 0000 0000 0000"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 pl-12 pr-4 font-bold text-slate-800 text-xs placeholder:text-slate-300 focus:border-deep focus:outline-none transition-all"
                                value={cardData.number}
                                onChange={e => setCardData({...cardData, number: e.target.value.replace(/\D/g, "")})}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Validade</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text"
                                    maxLength={2}
                                    placeholder="MM"
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-4 font-bold text-slate-800 text-xs placeholder:text-slate-300 focus:border-deep focus:outline-none text-center transition-all"
                                    value={cardData.expiryMonth}
                                    onChange={e => setCardData({...cardData, expiryMonth: e.target.value.replace(/\D/g, "")})}
                                />
                                <input 
                                    type="text"
                                    maxLength={4}
                                    placeholder="AAAA"
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-4 font-bold text-slate-800 text-xs placeholder:text-slate-300 focus:border-deep focus:outline-none text-center transition-all"
                                    value={cardData.expiryYear}
                                    onChange={e => setCardData({...cardData, expiryYear: e.target.value.replace(/\D/g, "")})}
                                />
                            </div>
                        </div>

                        <div className="w-24">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">CCV</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                <input 
                                    type="text"
                                    maxLength={4}
                                    placeholder="123"
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 pl-9 pr-2 font-bold text-slate-800 text-xs placeholder:text-slate-300 focus:border-deep focus:outline-none transition-all"
                                    value={cardData.ccv}
                                    onChange={e => setCardData({...cardData, ccv: e.target.value.replace(/\D/g, "")})}
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full py-4 bg-deep text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-slate-900 transition-all shadow-lg hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {loading ? "Salvando..." : "Atualizar Método de Pagamento"}
                    </button>
                    
                    <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
                        <Lock size={10} /> Seus dados são criptografados e enviados diretamente ao processador.
                    </p>
                </div>
            </div>
        </div>
    );
}
