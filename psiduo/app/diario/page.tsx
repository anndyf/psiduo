"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { autenticarPaciente } from "./actions";
import LogoPsiDuo from "@/components/LogoPsiDuo";
import { ArrowRight, Lock, User } from "lucide-react";

export default function LoginPaciente() {
  const router = useRouter();
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    
    setCpf(value);
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cpf.length < 14) {
      setError("Digite o CPF completo.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await autenticarPaciente(cpf);
      
      if (res.success && res.token) {
        router.push(`/diario/${res.token}`);
      } else {
        setError(res.error || "CPF não encontrado.");
      }
    } catch (err) {
      setError("Ocorreu um erro ao tentar entrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="p-8 pb-4 flex flex-col items-center">
                <div className="mb-0">
                    <LogoPsiDuo variant="dark" width={190} />
                </div>
                <h1 className="text-xl font-bold text-slate-800 mb-2 flex items-center justify-center gap-2">
                     Área do Paciente
                </h1>
                <p className="text-slate-500 text-sm text-center">
                    Acesse seu diário emocional com segurança.
                </p>
            </div>

            <div className="px-8 pb-8 space-y-6">
                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Seu CPF</label>
                        <div className="relative group">
                            <input
                                type="text"
                                value={cpf}
                                onChange={handleCpfChange}
                                placeholder="000.000.000-00"
                                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 pl-11 transition-all ${error ? 'border-red-200 focus:ring-red-200 focus:border-red-400 text-slate-900 bg-red-50' : 'border-slate-200 focus:ring-slate-200 focus:border-slate-400 text-slate-700 bg-white placeholder:text-slate-300'}`}
                                required
                            />
                            <User className={`absolute left-3.5 top-3.5 transition-colors ${error ? 'text-red-400' : 'text-slate-400 group-focus-within:text-slate-600'}`} size={20} />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg text-center animate-pulse border border-red-100 flex items-center justify-center gap-2">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || cpf.length < 14}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-lg transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <span className="animate-pulse">Verificando...</span>
                        ) : (
                            <>
                                Entrar no Diário <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>
                
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 flex gap-3 items-start">
                    <Lock className="text-slate-400 shrink-0 mt-0.5" size={14} />
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                        <strong>Ambiente Seguro:</strong> Seu acesso é pessoal e as respostas são protegidas por criptografia, acessíveis apenas ao seu psicólogo.
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
}

