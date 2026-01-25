"use client";

import { useState } from "react";
import { format } from "date-fns";
import { editarPaciente } from "../actions";

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
  // Formatar data para YYYY-MM-DD para o input type="date"
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-6">
        
        <div>
           <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Editar Paciente</h3>
        </div>

        <div className="space-y-4">
            <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-2">Nome</label>
                <input 
                    className="w-full bg-slate-50 border-b-2 border-slate-200 p-3 font-bold text-slate-900 outline-none focus:border-deep transition-all"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                />
            </div>

            <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-2">CPF</label>
                <input 
                    className="w-full bg-slate-50 border-b-2 border-slate-200 p-3 font-bold text-slate-900 outline-none focus:border-deep transition-all"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={handleCpfChange}
                    maxLength={14}
                />
            </div>

            <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-2">Data Início</label>
                <input 
                    type="date"
                    className="w-full bg-slate-50 border-b-2 border-slate-200 p-3 font-bold text-slate-900 outline-none focus:border-deep transition-all"
                    value={dataInicio}
                    onChange={e => setDataInicio(e.target.value)}
                />
            </div>
        </div>

        <div className="flex gap-4 pt-2">
            <button onClick={onClose} className="flex-1 py-4 text-xs font-black uppercase text-slate-400 hover:bg-slate-50 rounded-xl">Cancelar</button>
            <button 
                onClick={handleSave} 
                disabled={loading || !nome}
                className="flex-1 py-4 bg-deep text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-900 disabled:opacity-50 shadow-lg"
            >
                {loading ? "Salvando..." : "Salvar"}
            </button>
        </div>

      </div>
    </div>
  );
}
