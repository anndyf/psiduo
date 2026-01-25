"use client";

import { useState } from "react";
import { cadastrarPaciente } from "../actions";

export default function NewPatientModal({ onClose }: { onClose: () => void }) {
  const [nome, setNome] = useState("");
  // Inicializar com a data de hoje formatada YYYY-MM-DD
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0]);
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [novoLink, setNovoLink] = useState("");

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    
    setCpf(value);
  };

  const handleCreate = async () => {
    if (!nome.trim()) return;
    if (cpf.length < 14) {
        alert("Digite um CPF válido completo.");
        return;
    }
    setLoading(true);

    const res = await cadastrarPaciente(nome, dataInicio, cpf);
    if (res.success && res.data) {
       // Gerar link absoluto (assumindo que window.location.origin está disponível no client)
       const link = `${window.location.origin}/diario/${res.data.tokenAcesso}`;
       setNovoLink(link);
    } else {
       alert(res.error || "Erro ao criar paciente");
    }
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(novoLink);
    alert("Link copiado!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
        
        {!novoLink ? (
            <>
                <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Novo Paciente</h3>
                    <p className="text-sm text-slate-500 font-medium">Gere um link exclusivo para o diário do seu paciente.</p>
                </div>

                <div>
                    <label className="block text-xs font-black uppercase text-slate-400 mb-2">Nome do Paciente</label>
                    <input 
                        className="w-full bg-slate-50 border-b-2 border-slate-200 p-4 font-bold text-slate-900 outline-none focus:border-deep transition-all"
                        placeholder="Ex: João Silva"
                        value={nome}
                        onChange={e => setNome(e.target.value)}
                        autoFocus
                    />
                </div>

                <div>
                    <label className="block text-xs font-black uppercase text-slate-400 mb-2">Data de Início do Diário</label>
                    <input 
                        type="date"
                        className="w-full bg-slate-50 border-b-2 border-slate-200 p-4 font-bold text-slate-900 outline-none focus:border-deep transition-all"
                        value={dataInicio}
                        onChange={e => setDataInicio(e.target.value)}
                    />
                    <p className="text-[10px] text-slate-400 font-bold mt-1">O paciente não poderá registrar antes desta data.</p>
                </div>

                <div>
                    <label className="block text-xs font-black uppercase text-slate-400 mb-2">CPF do Paciente</label>
                    <input 
                        className="w-full bg-slate-50 border-b-2 border-slate-200 p-4 font-bold text-slate-900 outline-none focus:border-deep transition-all"
                        placeholder="000.000.000-00"
                        value={cpf}
                        onChange={handleCpfChange}
                        maxLength={14}
                    />
                    <p className="text-[10px] text-slate-400 font-bold mt-1">Será usado para o acesso seguro do paciente.</p>
                </div>

                <div className="flex gap-4 pt-2">
                    <button onClick={onClose} className="flex-1 py-4 text-xs font-black uppercase text-slate-400 hover:bg-slate-50 rounded-xl">Cancelar</button>
                    <button 
                        onClick={handleCreate} 
                        disabled={loading || !nome || cpf.length < 14}
                        className="flex-1 py-4 bg-deep text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-900 disabled:opacity-50 shadow-lg"
                    >
                        {loading ? "Criando..." : "Gerar Link"}
                    </button>
                </div>
            </>
        ) : (
            <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                    <h3 className="text-xl font-black text-green-600 uppercase tracking-widest mb-2">Sucesso!</h3>
                    <p className="text-sm text-slate-500 font-medium mb-4">Envie este link para <b>{nome}</b> acessar o diário.</p>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 break-all text-xs font-mono text-slate-600">
                    {novoLink}
                </div>

                <button 
                    onClick={handleCopy}
                    className="w-full py-4 bg-green-500 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-green-600 shadow-lg shadow-green-200 animate-pulse"
                >
                    Copiar Link e Fechar
                </button>
            </div>
        )}

      </div>
    </div>
  );
}
