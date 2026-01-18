"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import Link from "next/link";
import { atualizarPlanoDuoII } from "../../catalogo/actions";

export default function SelecaoPlanos() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Link simbólico para o checkout (substitua pelo seu link real do Stripe/MercadoPago)
  const LINK_PAGAMENTO_DUO_II = "https://checkout.seupagamento.com/duo-ii-20reais";

  useEffect(() => {
    // Tenta pegar o ID do usuário que acabou de se cadastrar (se estiver logado ou no session/local storage)
    // Se não encontrar, redireciona para o login
    const id = localStorage.getItem("psiduo_user_id");
    if (!id) {
      // Se não houver ID, ele não deveria estar aqui
      // router.push("/login"); 
    } else {
      setUserId(id);
    }
  }, [router]);

  const handleAssinarPremium = async () => {
    if (!userId) {
      alert("Sessão não identificada. Por favor, faça login.");
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      // 1. Simulação: Abre o link de pagamento em uma nova aba
      window.open(LINK_PAGAMENTO_DUO_II, "_blank");

      // 2. Chamada para a action que faz o upgrade (em um sistema real, isso seria via Webhook de confirmação de pagamento)
      // Aqui estamos facilitando o fluxo para o usuário
      const res = await atualizarPlanoDuoII(userId);

      if (res.success) {
        alert("Pagamento processado com sucesso! Seu plano foi atualizado para DUO II.");
        router.push("/painel");
      }
    } catch (error) {
      console.error("Erro ao processar assinatura:", error);
      alert("Houve um problema ao processar sua assinatura.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-mist font-sans flex flex-col">
      <Navbar />

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
          
          {/* CARD PLANO DUO I (GRATUITO/INCLUSO) */}
          <div className="relative bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border-2 border-slate-100 flex flex-col">
            <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-100 border border-slate-200">
              Plano de Entrada
            </span>

            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">Plano DUO I</h2>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-300 italic uppercase">Gratuito</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-4 font-black uppercase tracking-widest italic leading-relaxed">Ativação após revisão <br/>manual de perfil</p>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {[
                "Perfil visível no catálogo completo",
                "Contato direto via WhatsApp",
                "Gestão básica de perfil",
                "Limites de especialidades aplicados"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-1 bg-slate-100 text-slate-400 rounded-full p-0.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-sm font-bold text-slate-600 italic">{item}</span>
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

          {/* CARD PLANO DUO II (PREMIUM) */}
          <div className="relative bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl border-4 border-primary scale-105 z-10 flex flex-col">
            <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white bg-primary shadow-lg shadow-primary/30">
              Recomendado
            </span>

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                 <h2 className="text-2xl font-black text-white uppercase tracking-tight">Plano DUO II</h2>
                 <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.8)]"></span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-blue-300">R$</span>
                <span className="text-6xl font-black text-white italic">20</span>
                <span className="text-blue-300 font-bold uppercase text-[10px] tracking-widest">/mês</span>
              </div>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
               {[
                "Ativação Prioritária e Imediata",
                "Agenda Digital Integrada ao Perfil",
                "Apresentação em Vídeo com Autoplay",
                "Redes Sociais Públicas no Perfil",
                "Indicador Visual de Destaque",
                "Métricas de Acessos ao Perfil"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-500/20 text-blue-400 rounded-full p-0.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-sm font-bold text-slate-300 uppercase tracking-tight">{item}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={handleAssinarPremium}
              disabled={loading}
              className="w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-center bg-primary text-white hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Processando..." : "Assinar e Ativar DUO II ⚡"}
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