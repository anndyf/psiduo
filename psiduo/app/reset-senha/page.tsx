"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { solicitarResetSenha, resetarSenha } from "./actions";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Lock, Mail, ArrowRight, CheckCircle } from "lucide-react";

function ResetSenhaContent() {
  const searchParams = useSearchParams();
  const token = searchParams ? searchParams.get("token") : null; 
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  // MODO 1: SOLICITAR
  const handleSolicitar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simula delay para não entregar se email existe ou não
    await new Promise(r => setTimeout(r, 1000));
    
    await solicitarResetSenha(email);
    setEnviado(true);
    setLoading(false);
  };

  // MODO 2: TROCAR
  const handleTrocar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (novaSenha !== confirmar) {
      toast.error("As senhas não conferem!");
      return;
    }
    if (novaSenha.length < 8) {
      toast.error("A senha deve ter no mínimo 8 caracteres.");
      return;
    }

    setLoading(true);
    const res = await resetarSenha(token!, novaSenha);
    setLoading(false);

    if (res.success) {
      toast.success("Senha alterada com sucesso!");
      setTimeout(() => router.push("/login"), 2000);
    } else {
      toast.error(res.error || "Erro ao alterar senha.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl border border-slate-100">
          
          <div className="flex flex-col items-center mb-6">
            <span className="text-3xl font-black text-slate-800 tracking-tight">Psi<span className="text-blue-600">Duo</span></span>
          </div>

          {/* SUCESSO NO ENVIO */}
          {enviado && !token ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Verifique seu E-mail</h2>
              <p className="text-slate-500 mb-6">Enviamos as instruções de recuperação para <strong>{email}</strong>.</p>
              <button onClick={() => router.push("/login")} className="text-blue-600 font-bold hover:underline">
                Voltar para Login
              </button>
            </div>
          ) : token ? (
            /* TELA 2: DIGITAR NOVA SENHA */
            <form onSubmit={handleTrocar} className="space-y-6">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-black text-slate-900 uppercase">Criar Nova Senha</h1>
                    <p className="text-sm text-slate-400 font-bold">Defina sua nova senha de acesso.</p>
                </div>

                <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nova Senha</label>
                    <input 
                        type="password" 
                        required 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-slate-400 transition"
                        placeholder="••••••••"
                        value={novaSenha}
                        onChange={e => setNovaSenha(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Confirmar Senha</label>
                    <input 
                        type="password" 
                        required 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-slate-400 transition"
                        placeholder="••••••••"
                        value={confirmar}
                        onChange={e => setConfirmar(e.target.value)}
                    />
                </div>

                <button 
                    disabled={loading}
                    className="w-full bg-slate-900 text-white font-black uppercase text-xs tracking-[0.2em] py-4 rounded-xl shadow-lg hover:bg-black transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                    {loading ? "Salvando..." : "Redefinir Senha"} <CheckCircle size={16} />
                </button>
            </form>
          ) : (
            /* TELA 1: DIGITAR EMAIL */
            <form onSubmit={handleSolicitar} className="space-y-6">
                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-800">
                        <Lock size={24} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase">Esqueci a Senha</h1>
                    <p className="text-sm text-slate-400 font-bold">Digite seu e-mail para receber o link.</p>
                </div>

                <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">E-mail Cadastrado</label>
                    <input 
                        type="email" 
                        required 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-slate-400 transition"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </div>

                <button 
                    disabled={loading}
                    className="w-full bg-slate-900 text-white font-black uppercase text-xs tracking-[0.2em] py-4 rounded-xl shadow-lg hover:bg-black transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                    {loading ? "Enviando..." : "Enviar Instruções"} <ArrowRight size={16} />
                </button>
                
                <div className="text-center">
                    <button type="button" onClick={() => router.push("/login")} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
                        Voltar para Login
                    </button>
                </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetSenhaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">Carregando...</div>}>
      <ResetSenhaContent />
    </Suspense>
  );
}
