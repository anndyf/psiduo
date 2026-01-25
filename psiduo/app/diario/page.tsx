"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { autenticarPaciente } from "./actions";
import Image from "next/image";
import LogoPsiDuo from "@/components/LogoPsiDuo";

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
    <main className="min-h-screen bg-mist flex flex-col items-center justify-center p-4">
      
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 md:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <LogoPsiDuo />

        <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h1 className="text-2xl font-black text-deep uppercase tracking-tighter">Área do Paciente</h1>
            <p className="text-slate-500 font-medium">Acesse seu diário emocional com segurança.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Seu CPF</label>
                <input 
                    type="text" 
                    placeholder="000.000.000-00"
                    className={`w-full bg-slate-50 border-2 p-4 rounded-xl text-lg font-black text-center tracking-widest outline-none transition-all ${error ? 'border-red-100 bg-red-50 text-red-500 placeholder-red-300' : 'border-slate-100 focus:border-primary focus:bg-white text-slate-800'}`}
                    value={cpf}
                    onChange={handleCpfChange}
                    maxLength={14}
                    disabled={loading}
                />
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl text-center animate-pulse border border-red-100 flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    {error}
                </div>
            )}

            <button 
                type="submit" 
                disabled={loading || cpf.length < 14}
                className="w-full bg-deep text-white font-black py-4 rounded-xl shadow-xl hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm flex items-center justify-center gap-3"
            >
                {loading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Acessando...
                    </>
                ) : (
                    <>
                        Entrar no Diário
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </>
                )}
            </button>
        </form>

        <div className="text-center">
            <p className="text-xs text-slate-400 font-bold mb-4">
                Seu acesso é pessoal e intransferível. <br/>
                Em caso de dúvidas, contate seu psicólogo.
            </p>
            <div className="flex justify-center items-center gap-2 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
               <span className="font-black tracking-tighter text-deep">PsiDuo</span>
            </div>
        </div>
      </div>
    </main>
  );
}
