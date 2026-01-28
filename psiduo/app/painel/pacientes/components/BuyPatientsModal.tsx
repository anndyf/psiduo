"use client";

import { useState } from "react";
import { iniciarCompraPacote, verificarCompraPacote, comprarPacoteCartao } from "../actions";
import { toast } from "sonner";
import { Copy, CheckCircle, Loader2, Sparkles, X, CreditCard, QrCode } from "lucide-react";

export default function BuyPatientsModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"OFFER" | "PAYMENT" | "SUCCESS">("OFFER");
  const [method, setMethod] = useState<"PIX" | "CREDIT_CARD">("PIX");
  
  const [pixData, setPixData] = useState<{ image: string, payload: string, id: string } | null>(null);
  
  // CARD STATE
  const [card, setCard] = useState({
      holderName: "",
      number: "",
      expiryMonth: "",
      expiryYear: "",
      ccv: "",
      cpfCnpj: ""
  });

  // FORMATTERS
  const formatCardNumber = (value: string) => value.replace(/\D/g, "").replace(/(\d{4})/g, "$1 ").trim().substring(0, 19);
  const onlyNumbers = (value: string, limit: number) => value.replace(/\D/g, "").substring(0, limit);
  const onlyText = (value: string) => value.toUpperCase();
  const formatCPF = (value: string) => value.replace(/\D/g, "").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2").substring(0, 14);

  const handleGeneratePix = async () => {
    setLoading(true);
    try {
      const res = await iniciarCompraPacote();
      if (res.success && res.pix && res.paymentId) {
        setPixData({
            image: res.pix.encodedImage,
            payload: res.pix.copiaCola,
            id: res.paymentId
        });
      } else {
        toast.error(res.error || "Erro ao gerar PIX.");
      }
    } catch (e) {
        toast.error("Erro inesperado.");
    } finally {
        setLoading(false);
    }
  };

  const handlePayCard = async () => {
      if(!card.number || !card.ccv || !card.holderName || !card.cpfCnpj) {
          toast.error("Preencha todos os campos do cartão.");
          return;
      }

      setLoading(true);
      try {
          const cleanCard = { ...card, number: card.number.replace(/\s/g, "") };
          const holderInfo = {
             name: card.holderName,
             email: "email@placeholder.com", // O backend pega o real
             cpfCnpj: card.cpfCnpj.replace(/\D/g, ""),
             phone: "11999999999", // Placeholder, backend corrige
             mobilePhone: "11999999999"
          };

          const res = await comprarPacoteCartao(cleanCard, holderInfo);
          if(res.success) {
              setStep("SUCCESS");
              toast.success("Pagamento aprovado!");
          } else {
              toast.error(res.error || "Pagamento recusado.");
          }
      } catch (e) {
          toast.error("Erro ao processar cartão.");
      } finally {
          setLoading(false);
      }
  };

  const handleCheckPix = async () => {
    if (!pixData?.id) return;
    setLoading(true);
    try {
        const res = await verificarCompraPacote(pixData.id);
        if (res.success && res.paid) {
            setStep("SUCCESS");
            toast.success("Pacote ativado com sucesso!");
        } else {
            toast.warning("Pagamento ainda não confirmado. Aguarde alguns instantes.");
        }
    } catch (e) {
        toast.error("Erro ao verificar.");
    } finally {
        setLoading(false);
    }
  };

  const copyToClipboard = () => {
      if (pixData?.payload) {
          navigator.clipboard.writeText(pixData.payload);
          toast.success("Código Copiado!");
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
        
        {/* CLOSE BUTTON */}
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition z-10"
        >
            <X size={18} />
        </button>

        {step === "OFFER" && (
            <div className="p-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-2xl flex items-center justify-center mb-6">
                    <Sparkles size={32} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Expanda seu Limite</h2>
                <p className="text-sm text-slate-500 mb-8 max-w-xs">
                    Adquira um pacote extra de pacientes e continue crescendo sem limitações.
                </p>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8 w-full text-left relative overflow-hidden group">
                     <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow-sm">
                        Pagamento Único
                     </div>
                     <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                        + 10 Pacientes
                     </h3>
                     <p className="text-4xl font-black text-deep mt-2">R$ 10,00</p>
                     <p className="text-xs text-slate-400 mt-2 font-medium">Vagas permanentes adicionadas ao seu perfil.</p>
                </div>

                <button 
                    onClick={() => {
                        setStep("PAYMENT");
                        // Se for PIX, já gera pra adiantar
                        if(method === "PIX" && !pixData) handleGeneratePix();
                    }}
                    className="w-full py-4 bg-deep text-white text-sm font-black uppercase tracking-widest rounded-xl hover:bg-slate-900 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                    Comprar Agora
                </button>
            </div>
        )}

        {step === "PAYMENT" && (
            <div className="flex flex-col h-full overflow-hidden">
                <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                    <h3 className="text-lg font-black text-slate-900 uppercase">Pagamento Seguro</h3>
                </div>
                
                {/* TABS */}
                <div className="flex border-b border-slate-100 px-6 pt-2">
                    <button 
                        onClick={() => { setMethod("PIX"); if(!pixData) handleGeneratePix(); }}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition border-b-2 ${method === "PIX" ? "text-green-600 border-green-500" : "text-slate-400 border-transparent hover:text-slate-600"}`}
                    >
                        <QrCode size={16} /> PIX
                    </button>
                    <button 
                        onClick={() => setMethod("CREDIT_CARD")}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition border-b-2 ${method === "CREDIT_CARD" ? "text-blue-600 border-blue-500" : "text-slate-400 border-transparent hover:text-slate-600"}`}
                    >
                        <CreditCard size={16} /> Cartão
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    
                    {/* PIX CONTENT */}
                    {method === "PIX" && (
                        <div className="text-center">
                            {loading && !pixData ? (
                                <div className="py-12"><Loader2 className="animate-spin mx-auto text-slate-300" size={32} /></div>
                            ) : pixData ? (
                                <>
                                    <p className="text-xs text-slate-400 mb-6 font-medium">Escaneie o QR Code ou use o Copia e Cola.</p>
                                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 mb-6 inline-block bg-white">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={`data:image/png;base64,${pixData.image}`} alt="QR Code" className="w-40 h-40 mix-blend-multiply" />
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-lg flex items-center gap-3 mb-6 border border-slate-100">
                                        <div className="flex-1 truncate text-xs font-mono text-slate-500">{pixData.payload}</div>
                                        <button onClick={copyToClipboard} className="text-deep hover:text-slate-900"><Copy size={18} /></button>
                                    </div>
                                    <button 
                                        onClick={handleCheckPix}
                                        disabled={loading}
                                        className="w-full py-4 bg-green-500 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-green-600 transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={16}/> : "Já fiz o pagamento"}
                                    </button>
                                </>
                            ) : (
                                <div className="text-red-500 text-sm font-bold">Erro ao carregar PIX.</div>
                            )}
                        </div>
                    )}

                    {/* CARD CONTENT */}
                    {method === "CREDIT_CARD" && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Titular</label>
                                <input 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 transition"
                                    placeholder="NOME IMPRESSO"
                                    value={card.holderName}
                                    onChange={e => setCard({...card, holderName: onlyText(e.target.value)})}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">CPF do Titular</label>
                                <input 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 transition"
                                    placeholder="000.000.000-00"
                                    value={card.cpfCnpj}
                                    onChange={e => setCard({...card, cpfCnpj: formatCPF(e.target.value)})}
                                    maxLength={14}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Número do Cartão</label>
                                <input 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 transition font-mono"
                                    placeholder="0000 0000 0000 0000"
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
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-3 text-sm font-bold outline-none focus:border-blue-500 transition text-center"
                                            placeholder="MM"
                                            maxLength={2}
                                            value={card.expiryMonth}
                                            onChange={e => setCard({...card, expiryMonth: onlyNumbers(e.target.value, 2)})}
                                        />
                                        <input 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-3 text-sm font-bold outline-none focus:border-blue-500 transition text-center"
                                            placeholder="AAAA"
                                            maxLength={4}
                                            value={card.expiryYear}
                                            onChange={e => setCard({...card, expiryYear: onlyNumbers(e.target.value, 4)})}
                                        />
                                    </div>
                                </div>
                                <div className="w-1/3">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">CVV</label>
                                    <input 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 transition text-center"
                                        placeholder="123"
                                        maxLength={4}
                                        type="password"
                                        value={card.ccv}
                                        onChange={e => setCard({...card, ccv: onlyNumbers(e.target.value, 4)})}
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={handlePayCard}
                                disabled={loading}
                                className="w-full mt-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                            >
                                {loading ? "Processando..." : `Pagar R$ 10,00`}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )}

        {step === "SUCCESS" && (
            <div className="p-12 text-center bg-deep text-white flex flex-col items-center justify-center h-full">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <CheckCircle size={48} className="text-white" />
                </div>
                <h2 className="text-3xl font-black mb-4">Sucesso!</h2>
                <p className="text-white/80 mb-8 font-medium max-w-xs mx-auto">
                    Seu limite foi expandido (+10 Pacientes).<br/>Você já pode cadastrar novos pacientes.
                </p>
                <button 
                    onClick={onClose}
                    className="w-full py-4 bg-white text-deep text-sm font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all shadow-xl"
                >
                    Voltar para Pacientes
                </button>
            </div>
        )}

      </div>
    </div>
  );
}
