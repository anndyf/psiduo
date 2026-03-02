"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import Link from "next/link";
import { toast } from "sonner";
import { Check, Zap, Star, ShieldCheck, ArrowRight, LayoutDashboard, Sparkles } from "lucide-react";
import PaymentModal from "./PaymentModal";

export default function SelecaoPlanos() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  
  useEffect(() => {
    if (status === "unauthenticated") {
        toast.error("Você precisa estar logado para acessar essa página.");
        router.push("/login");
    }
  }, [status, router]);

  const handleAssinarPremium = async () => {
    if (!session?.user?.email) {
      toast.error("Sessão não identificada. Por favor, faça login.");
      return;
    }
    setShowPayment(true);
  };

  return (
    <main className="min-h-screen bg-white font-sans flex flex-col relative overflow-x-hidden">
      <Navbar />

      {/* MODAL DE PAGAMENTO (PIX / CARTÃO) */}
      {showPayment && session?.user?.email && (
          <PaymentModal 
            email={session.user.email} 
            onClose={() => setShowPayment(false)}
            onSuccess={() => {
                setShowPayment(false);
                router.push("/painel");
            }}
          />
      )}

      {/* Subtle Backdrop Decor */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-slate-50/50">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-50 rounded-full blur-[140px] opacity-60"></div>
        <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center container mx-auto px-6 py-12 lg:py-24 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-8">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full text-blue-600 shadow-sm">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Activation Workspace</span>
          </div>
          <h1 className="text-4xl lg:text-7xl font-black text-slate-900 leading-tight uppercase tracking-tighter">
            Ative seu <span className="text-blue-600 italic">Espaço Clínico.</span>
          </h1>
          <p className="text-slate-500 text-lg lg:text-xl font-medium leading-relaxed max-w-2xl mx-auto">
            Sua conta está no nível <span className="text-slate-900 font-bold">Essencial</span>. 
            Escolha o pacote tecnológico que melhor atende sua demanda profissional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto items-stretch">
          
          {/* CARD DUO ONE (Light & Minimal) */}
          <div className="bg-white border border-slate-200 rounded-[3rem] p-10 lg:p-14 flex flex-col group hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 relative overflow-hidden">
            <div className="mb-10">
               <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-8 group-hover:bg-slate-100 transition-colors">
                  <LayoutDashboard className="w-6 h-6" />
               </div>
               <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-3">Duo One</h3>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ambiente de Entrada</p>
            </div>

            <div className="mb-12">
               <span className="text-5xl font-black text-slate-200 tracking-tighter uppercase italic">Livre</span>
               <p className="text-[10px] text-slate-400 mt-3 font-black uppercase tracking-widest leading-none">Acesso aos recursos básicos do catálogo</p>
            </div>

            <ul className="space-y-5 mb-14 flex-1">
              {[
                "Presença no Catálogo Profissional",
                "Filtros de Especialidades e Região",
                "Bio e Perfil Dinâmico",
                "Botão de Whatsapp Direto",
                "Gestão de Avaliações"
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-4">
                  <div className="bg-slate-50 text-slate-400 rounded-full p-1.5 border border-slate-100 shrink-0">
                    <Check className="w-3.5 h-3.5" strokeWidth={4} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{item}</span>
                </li>
              ))}
            </ul>

            <Link href="/painel" className="w-full h-16 bg-slate-50 border border-slate-200 hover:bg-slate-900 hover:text-white flex items-center justify-center rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] transition-all">
               Continuar com Essencial
            </Link>
          </div>

          {/* CARD DUO PRO (The Hero Card - Vibrant Blue) */}
          <div className="bg-slate-900 rounded-[3rem] p-10 lg:p-14 shadow-2xl shadow-blue-500/20 relative flex flex-col group border border-white/5 scale-[1.02] lg:scale-105 z-10 transition-all hover:scale-[1.04] lg:hover:scale-110">
            <div className="absolute top-8 right-10 flex items-center gap-2 bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg shadow-blue-500/40">
               <Sparkles className="w-3 h-3 fill-current" />
               Evolução Pro
            </div>

            <div className="mb-10 text-white">
               <div className="w-14 h-14 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center text-blue-400 mb-8 shadow-inner">
                  <Star className="w-7 h-7 fill-current" />
               </div>
               <h3 className="text-3xl font-black uppercase tracking-tighter leading-none mb-3">Duo Pro</h3>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Business Management Suite</p>
            </div>

            <div className="mb-12">
               <div className="flex items-baseline gap-2">
                  <span className="text-sm font-black text-blue-400 tracking-tighter uppercase mr-1">R$</span>
                  <span className="text-6xl font-black text-white italic tracking-tighter leading-none">20,00</span>
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">/ mensal</span>
               </div>
               <p className="text-blue-400/80 text-[10px] font-black uppercase tracking-widest mt-4 px-3 py-1.5 bg-blue-400/10 border border-blue-400/20 inline-block rounded-xl">Otimizado para Psicólogos Autônomos</p>
            </div>

            <ul className="space-y-5 mb-14 flex-1">
               <li className="flex items-center gap-4 mb-3 opacity-50">
                  <div className="bg-white/10 text-white rounded-full p-1 border border-white/10">
                    <Check className="w-3 h-3" strokeWidth={4} />
                  </div>
                  <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">+ Tudo do Duo One</span>
               </li>
              {[
                "Prontuário Digital & Evoluções",
                "Diário de Humor com Predição IA",
                "Instrumentos & Escalas Digitais",
                "Agenda Integrada e Link de Agendamento",
                "Destaque Prioritário no Catálogo"
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-4">
                  <div className="bg-blue-500 text-white rounded-full p-1.5 shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-blue-400/50 shrink-0">
                    <Check className="w-3.5 h-3.5" strokeWidth={4} />
                  </div>
                  <span className="text-[11px] font-black text-white uppercase tracking-wider">{item}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={handleAssinarPremium}
              disabled={loading}
              className="w-full h-20 bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center rounded-[2rem] font-black uppercase text-[11px] tracking-[0.3em] shadow-[0_20px_40px_rgba(59,130,246,0.3)] transition-all hover:scale-[1.02] active:scale-95 group border-b-4 border-blue-800"
            >
              Ativar Workspace Pro <ArrowRight className="w-4 h-4 ml-4 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>

        </div>

        <div className="mt-24 flex items-center gap-4 bg-slate-50 border border-slate-200 px-8 py-4 rounded-full text-slate-500 shadow-sm">
           <ShieldCheck className="w-5 h-5 text-emerald-500" />
           <span className="text-[10px] font-black uppercase tracking-widest leading-none">Ambiente Seguro PsiDuo v2.0 • Cancelamento disponível a qualquer momento.</span>
        </div>
      </div>

      <Footer />
    </main>
  );
}