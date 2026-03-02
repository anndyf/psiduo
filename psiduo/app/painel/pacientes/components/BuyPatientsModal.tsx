"use client";

import { useState } from "react";
import { iniciarCompraPacote, verificarCompraPacote, comprarPacoteCartao } from "../actions";
import { toast } from "sonner";
import { Copy, CheckCircle, Loader2, Sparkles, X, CreditCard, QrCode, ChevronRight } from "lucide-react";

export default function BuyPatientsModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"OFFER" | "PAYMENT" | "SUCCESS">("OFFER");
  const [method, setMethod] = useState<"PIX" | "CREDIT_CARD">("PIX");
  const [pixData, setPixData] = useState<{ image: string; payload: string; id: string } | null>(null);
  const [card, setCard] = useState({ holderName: "", number: "", expiryMonth: "", expiryYear: "", ccv: "", cpfCnpj: "" });

  const formatCardNumber = (v: string) => v.replace(/\D/g, "").replace(/(\d{4})/g, "$1 ").trim().substring(0, 19);
  const onlyNumbers = (v: string, limit: number) => v.replace(/\D/g, "").substring(0, limit);
  const onlyText = (v: string) => v.toUpperCase();
  const formatCPF = (v: string) => v.replace(/\D/g, "").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2").substring(0, 14);

  const handleGeneratePix = async () => {
    setLoading(true);
    try {
      const res = await iniciarCompraPacote();
      if (res.success && res.pix && res.paymentId) {
        setPixData({ image: res.pix.encodedImage, payload: res.pix.payload, id: res.paymentId });
      } else { toast.error(res.error || "Erro ao gerar PIX."); }
    } catch { toast.error("Erro inesperado."); }
    finally { setLoading(false); }
  };

  const handlePayCard = async () => {
    if (!card.number || !card.ccv || !card.holderName || !card.cpfCnpj) { toast.error("Preencha todos os campos."); return; }
    setLoading(true);
    try {
      const res = await comprarPacoteCartao({ ...card, number: card.number.replace(/\s/g, "") }, { name: card.holderName, email: "email@placeholder.com", cpfCnpj: card.cpfCnpj.replace(/\D/g, ""), phone: "11999999999", mobilePhone: "11999999999" });
      if (res.success) { setStep("SUCCESS"); toast.success("Pagamento aprovado!"); }
      else { toast.error(res.error || "Pagamento recusado."); }
    } catch { toast.error("Erro ao processar."); }
    finally { setLoading(false); }
  };

  const handleCheckPix = async () => {
    if (!pixData?.id) return;
    setLoading(true);
    try {
      const res = await verificarCompraPacote(pixData.id);
      if (res.success && res.paid) { setStep("SUCCESS"); toast.success("Pacote ativado!"); }
      else { toast.warning("Pagamento ainda não confirmado."); }
    } catch { toast.error("Erro ao verificar."); }
    finally { setLoading(false); }
  };

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-deep focus:ring-4 focus:ring-deep/10 transition-all placeholder:font-normal placeholder:text-slate-400";
  const labelClass = "block text-[10px] font-medium uppercase text-slate-500 mb-2 ml-1";

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full md:max-w-lg md:rounded-[2rem] rounded-t-[2rem] shadow-2xl overflow-hidden relative animate-in slide-in-from-bottom md:zoom-in duration-300 max-h-[92vh] flex flex-col">

        {/* Close */}
        <button onClick={onClose} className="absolute top-5 right-5 p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition z-10">
          <X size={18} strokeWidth={2} />
        </button>

        {/* OFFER */}
        {step === "OFFER" && (
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-slate-50 text-deep rounded-2xl flex items-center justify-center mb-6 border border-slate-100">
              <Sparkles size={28} strokeWidth={2} />
            </div>
            <h2 className="text-2xl font-medium text-slate-900 mb-2 tracking-tight">Expandir Limite</h2>
            <p className="text-sm text-slate-500 font-normal mb-8 max-w-xs">
              Adquira um pacote extra de pacientes e continue crescendo sem limitações.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 w-full text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-medium px-3 py-1 rounded-bl-xl">
                Pagamento Único
              </div>
              <h3 className="text-lg font-medium text-slate-800 flex items-center gap-2">+ 10 Pacientes</h3>
              <p className="text-4xl font-medium text-deep mt-2 tracking-tight">R$ 10,00</p>
              <p className="text-xs text-slate-400 mt-2 font-normal">Vagas permanentes adicionadas ao seu perfil.</p>
            </div>

            <button
              onClick={() => { setStep("PAYMENT"); if (method === "PIX" && !pixData) handleGeneratePix(); }}
              className="w-full py-4 bg-deep text-white text-sm font-medium uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-deep/20 flex items-center justify-center gap-2 group"
            >
              Comprar Agora
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" strokeWidth={2} />
            </button>
          </div>
        )}

        {/* PAYMENT */}
        {step === "PAYMENT" && (
          <div className="flex flex-col overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-medium text-slate-900">Pagamento Seguro</h3>
              <p className="text-xs text-slate-500 font-normal mt-0.5">Escolha a forma de pagamento</p>
            </div>

            {/* Method Tabs */}
            <div className="flex gap-1 p-3 border-b border-slate-100 bg-white">
              <button
                onClick={() => { setMethod("PIX"); if (!pixData) handleGeneratePix(); }}
                className={`flex-1 py-2.5 text-xs font-medium uppercase tracking-widest flex items-center justify-center gap-2 rounded-xl transition-all ${method === "PIX" ? "bg-deep text-white shadow-sm" : "text-slate-500 hover:text-deep hover:bg-slate-100"}`}
              >
                <QrCode size={16} strokeWidth={2} /> PIX
              </button>
              <button
                onClick={() => setMethod("CREDIT_CARD")}
                className={`flex-1 py-2.5 text-xs font-medium uppercase tracking-widest flex items-center justify-center gap-2 rounded-xl transition-all ${method === "CREDIT_CARD" ? "bg-deep text-white shadow-sm" : "text-slate-500 hover:text-deep hover:bg-slate-100"}`}
              >
                <CreditCard size={16} strokeWidth={2} /> Cartão
              </button>
            </div>

            <div className="p-8 overflow-y-auto">
              {/* PIX */}
              {method === "PIX" && (
                <div className="text-center">
                  {loading && !pixData ? (
                    <div className="py-12"><Loader2 className="animate-spin mx-auto text-slate-300" size={32} /></div>
                  ) : pixData ? (
                    <>
                      <p className="text-xs text-slate-500 font-normal mb-6">Escaneie o QR Code ou use o Copia e Cola.</p>
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 mb-6 inline-block bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`data:image/png;base64,${pixData.image}`} alt="QR Code" className="w-40 h-40 mix-blend-multiply" />
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl flex items-center gap-3 mb-6 border border-slate-100">
                        <div className="flex-1 truncate text-xs font-mono text-slate-500">{pixData.payload}</div>
                        <button onClick={() => { navigator.clipboard.writeText(pixData.payload); toast.success("Copiado!"); }} className="text-deep hover:text-slate-800 transition-colors">
                          <Copy size={18} strokeWidth={2} />
                        </button>
                      </div>
                      <button
                        onClick={handleCheckPix}
                        disabled={loading}
                        className="w-full py-4 bg-emerald-600 text-white text-xs font-medium uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : "Já fiz o pagamento"}
                      </button>
                    </>
                  ) : (
                    <div className="text-red-500 text-sm font-medium">Erro ao carregar PIX.</div>
                  )}
                </div>
              )}

              {/* CARD */}
              {method === "CREDIT_CARD" && (
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Titular do Cartão</label>
                    <input className={inputClass} placeholder="NOME IMPRESSO" value={card.holderName} onChange={e => setCard({ ...card, holderName: onlyText(e.target.value) })} />
                  </div>
                  <div>
                    <label className={labelClass}>CPF do Titular</label>
                    <input className={inputClass} placeholder="000.000.000-00" value={card.cpfCnpj} onChange={e => setCard({ ...card, cpfCnpj: formatCPF(e.target.value) })} maxLength={14} />
                  </div>
                  <div>
                    <label className={labelClass}>Número do Cartão</label>
                    <input className={`${inputClass} font-mono`} placeholder="0000 0000 0000 0000" value={card.number} onChange={e => setCard({ ...card, number: formatCardNumber(e.target.value) })} maxLength={19} />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className={labelClass}>Validade</label>
                      <div className="flex gap-2">
                        <input className={inputClass} placeholder="MM" maxLength={2} value={card.expiryMonth} onChange={e => setCard({ ...card, expiryMonth: onlyNumbers(e.target.value, 2) })} />
                        <input className={inputClass} placeholder="AAAA" maxLength={4} value={card.expiryYear} onChange={e => setCard({ ...card, expiryYear: onlyNumbers(e.target.value, 4) })} />
                      </div>
                    </div>
                    <div className="w-1/3">
                      <label className={labelClass}>CVV</label>
                      <input className={inputClass} placeholder="123" maxLength={4} type="password" value={card.ccv} onChange={e => setCard({ ...card, ccv: onlyNumbers(e.target.value, 4) })} />
                    </div>
                  </div>
                  <button
                    onClick={handlePayCard}
                    disabled={loading}
                    className="w-full mt-2 bg-deep text-white px-8 py-4 rounded-xl font-medium text-xs uppercase tracking-widest hover:bg-slate-800 transition shadow-lg shadow-deep/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : `Pagar R$ 10,00`}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUCCESS */}
        {step === "SUCCESS" && (
          <div className="p-12 text-center bg-deep text-white flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6 border-2 border-white/20">
              <CheckCircle size={48} className="text-white" strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl font-medium mb-3 tracking-tight">Sucesso!</h2>
            <p className="text-white/70 mb-8 font-normal max-w-xs mx-auto leading-relaxed">
              Seu limite foi expandido com +10 pacientes. Você já pode cadastrar novos pacientes.
            </p>
            <button
              onClick={onClose}
              className="w-full py-4 bg-white text-deep text-sm font-medium uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all shadow-xl"
            >
              Voltar para Pacientes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
