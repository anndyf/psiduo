"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

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
        setError("E-mail ou senha incorretos.");
      } else {
        setError("Ocorreu um erro ao entrar. Tente novamente.");
      }
      setIsLoading(false);
    } else {
      router.push("/painel");
      router.refresh();
    }
  }

  return (
    <main className="min-h-screen bg-mist font-sans flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          
          <div className="bg-deep p-8 text-center text-white">
            <h1 className="text-2xl font-bold">Bem-vindo(a)</h1>
            <p className="text-blue-200 text-sm mt-1">Acesse sua área profissional</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100 flex items-center justify-center gap-3 font-medium">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">E-mail</label>
              <input 
                name="email" required type="email" 
                className="w-full border border-slate-200 rounded-xl p-4 text-slate-700 focus:ring-2 focus:ring-primary outline-none bg-slate-50 focus:bg-white transition"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Senha</label>
              <input 
                name="password" required type="password" 
                className="w-full border border-slate-200 rounded-xl p-4 text-slate-700 focus:ring-2 focus:ring-primary outline-none bg-slate-50 focus:bg-white transition"
                placeholder="••••••••"
              />
            </div>

            <button 
              disabled={isLoading}
              type="submit" 
              className="w-full bg-deep text-white font-bold py-4 rounded-xl shadow-lg hover:bg-primary transition disabled:opacity-50 active:scale-[0.98] text-lg"
            >
              {isLoading ? "Entrando..." : "Entrar na Conta"}
            </button>

            <div className="text-center pt-2 space-y-2">
               <Link 
                 href="/reset-senha" 
                 className="block text-sm text-primary hover:underline font-medium"
               >
                 Esqueci minha senha
               </Link>
               <p className="text-sm text-slate-500">
                 Ainda não tem conta? <Link href="/cadastro" className="text-primary font-bold hover:underline">Cadastre-se agora</Link>
               </p>
            </div>
          </form>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-deep/80 backdrop-blur-md transition-all duration-500">
          <div className="relative">
            <div className="w-20 h-20 border-8 border-white/10 border-t-white rounded-full animate-spin shadow-2xl"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-primary/20 rounded-full animate-ping"></div>
            </div>
          </div>
          <p className="mt-8 font-black text-white text-lg uppercase tracking-[0.4em] animate-in fade-in slide-in-from-bottom-4 duration-500">
            Acessando sua conta
          </p>
          <p className="mt-2 text-blue-200/60 font-bold text-[10px] uppercase tracking-widest italic font-serif">Preparando seu painel...</p>
        </div>
      )}
      <Footer />
    </main>
  );
}