"use client";

import { useState } from "react";
import { editarPaciente } from "../actions";
import { X, User, ChevronRight, Calendar, CreditCard } from "lucide-react";

interface EditPatientModalProps {
  paciente: {
    id: string;
    nome: string;
    cpf?: string | null;
    dataInicio: Date;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditPatientModal({ paciente, onClose, onSuccess }: EditPatientModalProps) {
  const [nome, setNome] = useState(paciente.nome);
  const [cpf, setCpf] = useState(paciente.cpf || "");
  const formattedDate = paciente.dataInicio
    ? new Date(paciente.dataInicio).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];
  const [dataInicio, setDataInicio] = useState(formattedDate);
  const [loading, setLoading] = useState(false);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    setCpf(value);
  };

  const handleSave = async () => {
    if (!nome.trim()) return;
    if (cpf && cpf.length < 14) {
      alert("Se informar o CPF, ele deve estar completo.");
      return;
    }
    setLoading(true);
    const res = await editarPaciente(paciente.id, { nome, cpf, dataInicio });
    if (res.success) {
      onSuccess();
    } else {
      alert(res.error || "Erro ao editar.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col border-l border-slate-100">

        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div>
            <h2 className="text-xl font-medium text-slate-900 tracking-tight">Editar Paciente</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">Atualizar dados cadastrais</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-colors shadow-sm border border-transparent hover:border-slate-100"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto bg-white p-8 space-y-6">

          {/* Nome */}
          <div>
            <label className="block text-[10px] font-medium uppercase text-slate-500 mb-2 ml-1">
              Nome Completo <span className="text-red-400">*</span>
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-deep transition-colors">
                <User size={18} strokeWidth={2} />
              </div>
              <input
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-11 text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-deep focus:ring-4 focus:ring-deep/10 transition-all placeholder:font-normal placeholder:text-slate-400"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {/* CPF */}
          <div>
            <label className="block text-[10px] font-medium uppercase text-slate-500 mb-2 ml-1">
              CPF
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-deep transition-colors">
                <CreditCard size={18} strokeWidth={2} />
              </div>
              <input
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-11 text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-deep focus:ring-4 focus:ring-deep/10 transition-all placeholder:font-normal placeholder:text-slate-400"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={handleCpfChange}
                maxLength={14}
              />
            </div>
          </div>

          {/* Data Início */}
          <div>
            <label className="block text-[10px] font-medium uppercase text-slate-500 mb-2 ml-1">
              Data de Início
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-deep transition-colors">
                <Calendar size={18} strokeWidth={2} />
              </div>
              <input
                type="date"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-11 text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-deep focus:ring-4 focus:ring-deep/10 transition-all"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 bg-white flex flex-col gap-3 shrink-0">
          <button
            onClick={handleSave}
            disabled={loading || !nome}
            className={`w-full py-4 px-6 text-xs font-medium uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 group
              ${loading || !nome
                ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                : "bg-deep text-white hover:bg-slate-800 shadow-deep/20 hover:shadow-deep/30"
              }`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Salvar Alterações
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
      </div>
    </div>
  );
}
