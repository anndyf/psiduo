"use client";

import { useState } from "react";
import { cadastrarPaciente } from "../actions";
import { isValidCPF, formatPhone } from "@/lib/utils/validators";
import BuyPatientsModal from "./BuyPatientsModal";
import { Check, Copy, X, ChevronRight, User } from "lucide-react";

export default function NewPatientModal({ onClose }: { onClose: () => void }) {
  const [nome, setNome] = useState("");
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0]);
  const [cpf, setCpf] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [novoLink, setNovoLink] = useState("");
  
  // Novo estado: Habilitar diário (Default false para focar no cadastro)
  const [enableDiary, setEnableDiary] = useState(false);

  // Estado para Exibir Modal de Compra
  const [showBuyModal, setShowBuyModal] = useState(false);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    
    setCpf(value);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setWhatsapp(formatPhone(e.target.value));
  };

  const handleCreate = async () => {
    if (!nome.trim()) {
        alert("Nome é obrigatório.");
        return;
    }
    
    // CPF agora é obrigatório sempre
    if (!isValidCPF(cpf)) {
        alert("CPF inválido ou não preenchido. O CPF é obrigatório.");
        return;
    }

    if (whatsapp.length > 0 && whatsapp.length < 14) {
        alert("Telefone inválido.");
        return;
    }

    setLoading(true);

    const res = await cadastrarPaciente(nome, dataInicio, cpf || undefined, whatsapp || undefined);

    if (res.success && res.data) {
       if (enableDiary) {
           // Se habilitou diário, mostra o link
           const link = `${window.location.origin}/diario/${res.data.tokenAcesso}`;
           setNovoLink(link);
       } else {
           onClose();
           window.location.reload();
       }
    } else {
       // SE LIMITE ATINGIDO -> MOSTRAR MODAL DE COMPRA
       if (res.limitReached) {
           setShowBuyModal(true);
       } else {
           alert(res.error || "Erro ao criar paciente");
       }
    }
    setLoading(false);
  };

  if (showBuyModal) {
      return <BuyPatientsModal onClose={() => setShowBuyModal(false)} />;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(novoLink);
    alert("Link copiado!");
    onClose();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

      {/* Slide-over Drawer */}
      <div className={`relative w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col border-l border-slate-100`}>
        
        {/* Header - Subtle Navy Accent */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
             <div>
                <h2 className="text-xl font-medium text-slate-900 tracking-tight">Novo Paciente</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">Cadastro de Prontuário</p>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-colors shadow-sm border border-transparent hover:border-slate-100">
                 <X size={20} strokeWidth={2} />
             </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-white p-8">
            
            {!novoLink ? (
                <div className="space-y-8">
                    
                    <div className="space-y-6">
                         {/* Nome - Blue-900 Focus Ring */}
                         <div>
                            <label className="block text-[10px] font-medium uppercase text-slate-500 mb-2 ml-1">Nome Completo <span className="text-red-400">*</span></label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-deep transition-colors">
                                    <User size={18} strokeWidth={2} />
                                </div>
                                <input 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-11 text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-deep focus:ring-4 focus:ring-deep/10 transition-all placeholder:font-normal placeholder:text-slate-400"
                                    placeholder="Nome do paciente"
                                    value={nome}
                                    onChange={e => setNome(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* CPF - Obrigatório */}
                        <div>
                            <label className="block text-[10px] font-medium uppercase text-slate-500 mb-2 ml-1">CPF <span className="text-red-400">*</span></label>
                            <input 
                                className={`w-full bg-slate-50 border rounded-xl p-4 text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-deep focus:ring-4 focus:ring-deep/10 transition-all placeholder:font-normal placeholder:text-slate-400 ${!cpf ? 'border-amber-200/50' : 'border-slate-200'}`}
                                placeholder="000.000.000-00"
                                value={cpf}
                                onChange={handleCpfChange}
                                maxLength={14}
                            />
                            {!cpf && <p className="text-[10px] font-medium text-amber-500 mt-1.5 ml-1">Obrigatório para identificação única.</p>}
                        </div>

                        {/* WhatsApp */}
                        <div>
                            <label className="block text-[10px] font-medium uppercase text-slate-500 mb-2 ml-1">WhatsApp / Telefone</label>
                            <input 
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-deep focus:ring-4 focus:ring-deep/10 transition-all placeholder:font-normal placeholder:text-slate-400"
                                placeholder="(00) 00000-0000"
                                value={whatsapp}
                                onChange={handlePhoneChange}
                                maxLength={15}
                            />
                        </div>
                        
                         {/* Toggle Diário - Navy Accent */}
                        <div 
                            className={`p-5 rounded-2xl border transition-all cursor-pointer select-none group relative overflow-hidden shadow-sm ${enableDiary ? 'bg-slate-50 border-deep/20' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
                            onClick={() => setEnableDiary(!enableDiary)}
                        >
                            <div className="flex items-start gap-4 relative z-10">
                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors shrink-0 mt-0.5 ${enableDiary ? 'bg-deep border-deep text-white' : 'bg-white border-slate-300'}`}>
                                    {enableDiary && <Check size={14} strokeWidth={3} /> }
                                </div>
                                <div className="flex-1">
                                    <h4 className={`text-xs font-medium uppercase tracking-wide mb-1 ${enableDiary ? 'text-deep' : 'text-slate-700'}`}>Habilitar Diário</h4>
                                    <p className={`text-[11px] leading-relaxed font-normal ${enableDiary ? 'text-slate-600' : 'text-slate-400'}`}>
                                        Gera acesso para registro de humor e sono.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Success State inside Drawer - Navy Theme */
                <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="w-24 h-24 bg-slate-50 text-deep rounded-full flex items-center justify-center border-4 border-white shadow-xl shadow-slate-900/10">
                         <Check size={40} strokeWidth={3} />
                    </div>
                    
                    <div>
                        <h3 className="text-2xl font-medium text-slate-800 tracking-tight mb-2">Sucesso!</h3>
                        <p className="text-sm text-slate-500 font-normal px-8">Paciente cadastrado. Envie o link de acesso abaixo.</p>
                    </div>

                    <div className="w-full bg-white p-1 rounded-2xl border border-slate-200 shadow-sm relative group text-left">
                        <div className="flex items-center gap-2 p-3">
                             <div className="flex-1 truncate text-xs font-mono text-slate-600 select-all bg-slate-50 py-2 px-3 rounded-lg border border-slate-100">
                                {novoLink}
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleCopy}
                        className="w-full py-4 bg-deep text-white text-xs font-medium uppercase tracking-widest rounded-xl hover:bg-slate-800 shadow-lg shadow-deep/20 hover:shadow-deep/30 transition-all flex items-center justify-center gap-2"
                    >
                        <Copy size={16} strokeWidth={2} /> Copiar e Fechar
                    </button>
                    
                     <button 
                        onClick={() => { onClose(); window.location.reload(); }}
                        className="text-[10px] font-medium uppercase text-slate-400 hover:text-slate-600 tracking-widest py-2"
                     >
                        Fechar sem copiar
                     </button>
                </div>
            )}

        </div>

        {/* Footer Actions - Navy Primary Button */}
        {!novoLink && (
            <div className="p-8 border-t border-slate-100 bg-white flex flex-col gap-3 shrink-0">
                <button 
                    onClick={handleCreate} 
                    disabled={loading || !nome || !cpf || (enableDiary && cpf.length < 14)}
                    className={`
                        w-full py-4 px-6 text-xs font-medium uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 group
                        ${loading || !nome || !cpf || (enableDiary && cpf.length < 14) 
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                            : 'bg-deep text-white hover:bg-slate-800 shadow-deep/20 hover:shadow-deep/30'}
                    `}
                >
                    {loading ? (
                         <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                         <>
                            {enableDiary ? "Salvar e Gerar Link" : "Adicionar Paciente"}
                            <ChevronRight size={14} className="text-white group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                         </>
                    )}
                </button>
                <button 
                    onClick={onClose} 
                    className="w-full py-3 text-[10px] font-medium uppercase text-slate-400 hover:text-slate-600 transition-colors tracking-widest"
                >
                    Cancelar
                </button>
            </div>
        )}

      </div>
    </div>
  );
}
