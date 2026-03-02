"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LogoPsiDuo from "@/components/LogoPsiDuo";
import { ShieldCheck, Lock, ArrowRight, AlertCircle, Terminal, HelpCircle } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (result?.error) {
      if (result.error === "CredentialsSignin") {
        setError("Credenciais inválidas. Verifique seu e-mail e senha.");
      } else {
        setError("Falha na autenticação. Tente novamente.");
      }
      setIsLoading(false);
    } else {
      router.push("/painel");
      router.refresh();
    }
  }

  return (
    <main className="min-h-screen bg-white font-sans flex flex-col overflow-x-hidden">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-6 py-12 lg:py-24 relative bg-slate-50/50">
        {/* Subtle Decorative Backdrop */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[100px] opacity-60"></div>
          <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-slate-100 rounded-full blur-[120px] opacity-40"></div>
          <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>

        <div className="w-full max-w-4xl relative z-10 flex flex-col md:flex-row items-stretch bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.06)] overflow-hidden border border-slate-200/60">
          
          {/* LEFT: Branding/Info Column (Light Professional) */}
          <div className="md:w-[350px] bg-slate-900 p-10 flex flex-col justify-between relative overflow-hidden text-white">
             {/* Abstract BG */}
             <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl"></div>
             
             <div className="relative z-10 space-y-10">
                <LogoPsiDuo variant="light" width={140} height={70} />
                
                <div className="space-y-6">
                   <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-blue-400">
                      <ShieldCheck className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em]">Secure Gateway</span>
                   </div>
                   
                   <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
                      Área do <br /> <span className="text-blue-500 italic">Especialista.</span>
                   </h1>
                   
                   <p className="text-slate-400 text-sm font-medium leading-relaxed">
                      Gerencie sua clínica e seus pacientes em um ambiente seguro e criptografado.
                   </p>
                </div>
             </div>

             <div className="relative z-10 mt-12 space-y-6">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-blue-400">
                      <Lock className="w-4 h-4" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Criptografia Ponta a Ponta</span>
                </div>
                
                <div className="pt-6 border-t border-white/5">
                   <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                     PsiDuo &copy; 2026 <br/> Tecnologia para Saúde Mental
                   </p>
                </div>
             </div>
          </div>

          {/* RIGHT: Login Form (Clean & Modern) */}
          <div className="flex-1 p-10 lg:p-14">
             <div className="max-w-md mx-auto">
                <div className="mb-10 text-center md:text-left">
                   <div className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-2">Autenticação</div>
                   <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Bem-vindo de <span className="text-blue-600">Volta.</span></h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                   {error && (
                     <div className="bg-rose-50 border border-rose-100 text-rose-600 px-6 py-4 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                       <AlertCircle className="w-5 h-5 flex-shrink-0" />
                       <span className="text-xs font-bold uppercase tracking-tight">{error}</span>
                     </div>
                   )}

                   <div className="space-y-8">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">E-mail Cadastrado</label>
                        <input 
                          name="email" required type="email" 
                          className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-slate-900 font-bold outline-none transition-all placeholder:text-slate-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50"
                          placeholder="seu@email.com"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1 flex justify-between items-center">
                          Senha
                          <Link href="/reset-senha" className="text-[9px] text-blue-500 hover:text-blue-700 hover:underline font-bold">Esqueceu a senha?</Link>
                        </label>
                        <input 
                          name="password" required type="password" 
                          className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-slate-900 font-bold outline-none transition-all placeholder:text-slate-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50"
                          placeholder="••••••••"
                        />
                      </div>
                   </div>

                   <button 
                     disabled={isLoading}
                     type="submit" 
                     className="w-full h-16 bg-slate-900 hover:bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl shadow-slate-900/10 transition-all flex items-center justify-center gap-4 group mt-4"
                   >
                     {isLoading ? (
                       <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                     ) : (
                       <>
                         Acessar Área Clínica <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                       </>
                     )}
                   </button>
                   
                   <div className="text-center pt-8 border-t border-slate-50">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Ainda não possui conta? <Link href="/cadastro" className="text-blue-600 hover:underline font-bold ml-2">Cadastre-se como Profissional</Link>
                      </p>
                   </div>
                </form>
             </div>
          </div>
        </div>

        <div className="mt-12 flex items-center gap-3 bg-white border border-slate-200 px-6 py-3 rounded-full text-slate-400 shadow-sm">
           <HelpCircle className="w-4 h-4 text-blue-400" />
           <span className="text-[9px] font-black uppercase tracking-widest leading-none">Problemas no acesso? Contate nosso suporte técnico.</span>
        </div>
      </div>

      <Footer />

      {isLoading && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white/80 backdrop-blur-xl transition-all duration-500">
          <div className="relative">
            <div className="w-24 h-24 border-[12px] border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
               <Terminal className="w-6 h-6 text-slate-400 animate-pulse" />
            </div>
          </div>
          <p className="mt-8 font-black text-slate-900 text-lg uppercase tracking-[0.5em] animate-pulse">
            Sincronizando
          </p>
          <div className="mt-4 flex flex-col items-center">
             <p className="text-blue-600 font-bold text-[10px] uppercase tracking-widest bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full">Carregando Área de Trabalho...</p>
          </div>
        </div>
      )}
    </main>
  );
}