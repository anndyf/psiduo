"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import Link from "next/link";
import { toast } from "sonner";
import { Check } from "lucide-react";
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
    <main className="min-h-screen bg-mist font-sans flex flex-col relative">
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

      <div className="flex-1 container mx-auto px-4 py-12 md:py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-3xl md:text-4xl font-extrabold text-deep mb-4 uppercase tracking-tighter leading-tight">
            Ative seu Consultório Digital
          </h1>
          <p className="text-slate-500 text-lg font-medium">
            Sua conta está no plano <span className="font-bold text-primary italic">DUO I</span>. 
            Escolha o melhor caminho para começar sua jornada no PsiDuo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
          
          {/* CARD PLANO DUO I */}
          <div className="relative bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border-2 border-slate-100 flex flex-col">
            <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-100 border border-slate-200">
              Plano de Entrada
            </span>

            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">Plano DUO I</h2>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-300 italic uppercase">Gratuito</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-4 font-black uppercase tracking-widest italic leading-relaxed">Ativação imediata <br/>após completar o cadastro</p>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {[
                "Presença no Catálogo Principal",
                "Filtros de Especialidades",
                "Bio e Foto Profissional",
                "Botão de Whatsapp Direto",
                "Recebimento de Avaliações"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-1 bg-slate-100 text-slate-400 rounded-full p-0.5">
                    <Check size={12} strokeWidth={4} />
                  </div>
                  <span className="text-sm font-bold text-slate-600 italic uppercase tracking-tight">{item}</span>
                </li>
              ))}
            </ul>

            <Link 
              href="/perfil/editar" 
              className="w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-center border-2 border-slate-100 text-slate-400 hover:bg-slate-50 transition-all active:scale-95"
            >
              Manter DUO I
            </Link>
          </div>

          {/* CARD PLANO DUO II */}
          <div className="relative bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl border-4 border-primary scale-105 z-10 flex flex-col">
            <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white bg-primary shadow-lg shadow-primary/30">
              Recomendado
            </span>

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                 <h2 className="text-2xl font-black text-white uppercase tracking-tight">Plano DUO II</h2>
                 <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.8)]"></span>
              </div>
              <div className="flex flex-col items-start gap-1">
                 <span className="bg-white text-blue-600 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest mb-1">Oferta de Lançamento</span>
                 <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-white italic">GRÁTIS</span>
                    <span className="text-blue-200 font-bold uppercase text-[10px] tracking-widest self-end mb-2">/ 30 DIAS</span>
                 </div>
                 <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Depois apenas R$ 39,99/mês</p>
              </div>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
                {/* BASE INCLUSA */}
                <li className="flex items-center gap-3 mb-2">
                   <div className="bg-white/10 text-white rounded-full p-1">
                     <Check size={10} strokeWidth={4} />
                   </div>
                   <span className="text-xs font-black text-white/80 uppercase tracking-widest">
                     + Todas as vantagens do DUO I
                   </span>
                </li>

                {/* DESTAQUE */}
                <li className="flex items-center gap-3">
                   <div className="mt-0 bg-yellow-400 text-slate-900 rounded-full p-1 shadow-[0_0_15px_rgba(250,204,21,0.6)]">
                     <Check size={14} strokeWidth={4} />
                   </div>
                   <span className="text-sm font-black text-yellow-400 uppercase tracking-widest drop-shadow-sm">
                     Diário de Pacientes
                   </span>
                </li>

               {[
                "Agenda Disponível e Link",
                "Vídeo de Apresentação",
                "Métricas de Acessos",
                "Destaque na Busca"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-500/20 text-blue-400 rounded-full p-0.5">
                    <Check size={12} strokeWidth={4} />
                  </div>
                  <span className="text-sm font-bold text-slate-300 uppercase tracking-tight">{item}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={handleAssinarPremium}
              disabled={loading}
              className="w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-center bg-primary text-white hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50 border-2 border-white/20 hover:border-white/50"
            >
              TESTAR GRÁTIS POR 30 DIAS
            </button>
          </div>

        </div>

        <p className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-16 max-w-sm mx-auto leading-relaxed opacity-60">
          Nota: O upgrade para DUO II libera recursos exclusivos e garante que seu perfil apareça no topo das buscas do catálogo.
        </p>
      </div>

      <Footer />
    </main>
  );
}