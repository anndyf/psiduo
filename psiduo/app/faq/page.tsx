"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function FAQ() {
  const [activeTab, setActiveTab] = useState<"paciente" | "psicologo">("paciente");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqPacientes = [
    {
      q: "O uso da plataforma é gratuito para pacientes?",
      a: "Sim, o PsiDuo é 100% gratuito para quem busca suporte psicológico. Você pode navegar pelo catálogo, filtrar profissionais e entrar em contato sem qualquer custo ou taxa oculta."
    },
    {
      q: "Como entro em contato com o psicólogo?",
      a: "Dentro do perfil de cada profissional, existe um botão de contato direto via WhatsApp. Ao clicar, você será redirecionado para o chat privado do especialista escolhido."
    },
    {
      q: "O PsiDuo cobra alguma taxa sobre as sessões?",
      a: "Não cobramos nenhuma comissão ou taxa sobre o valor das consultas. O valor da sessão informado no perfil é pago integralmente e diretamente ao psicólogo, conforme combinado entre vocês."
    },
    {
      q: "Como são realizados os pagamentos das consultas?",
      a: "Toda a parte financeira é resolvida diretamente com o profissional. O PsiDuo não processa pagamentos de consultas em nome de pacientes; cada psicólogo tem sua própria forma de recebimento (PIX, cartão, transferência, etc)."
    },
    {
      q: "O que fazer se eu não me adaptar ao profissional?",
      a: "A aliança terapêutica é fundamental. Se você sentir que não houve a 'conexão' ideal com o primeiro profissional, você tem total liberdade para retornar ao nosso catálogo e buscar um novo especialista que atenda melhor às suas expectativas."
    }
  ];

  const faqPsicologos = [
    {
      q: "Como funciona o sistema de planos para psicólogos?",
      a: "Oferecemos dois níveis de presença: o Duo I (Grátis), com visibilidade essencial no catálogo, e o Duo II (Premium), que oferece recursos avançados como agenda, vídeo de apresentação e métricas de acesso por apenas R$ 20/mês."
    },
    {
      q: "Preciso pagar comissão por cada paciente que entrar em contato?",
      a: "Não. O PsiDuo defende a liberdade profissional. Cobramos apenas uma assinatura fixa para o plano Premium. O valor que você cobra do seu paciente é 100% seu."
    },
    {
      q: "Como ativo meu perfil para aparecer no catálogo?",
      a: "Para garantir a qualidade da plataforma, o perfil só fica 'Ativo' após o preenchimento completo das informações obrigatórias: foto profissional, biografia detalhada (mínimo 50 caracteres), CRP, especialidades e WhatsApp válido."
    },
    {
      q: "Posso cancelar minha assinatura Premium a qualquer momento?",
      a: "Sim. Não trabalhamos com contratos de fidelidade ou multas de cancelamento. Você tem autonomia total para gerenciar seu plano através do seu painel exclusivo."
    },
    {
      q: "O PsiDuo garante o recebimento das minhas consultas?",
      a: "A gestão financeira das sessões é de inteira responsabilidade do profissional. Facilitamos a conexão inicial, mas o agendamento e a política de cobrança são definidos por você diretamente com o paciente."
    }
  ];

  const currentFaq = activeTab === "paciente" ? faqPacientes : faqPsicologos;

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main className="min-h-screen bg-white font-sans flex flex-col overflow-x-hidden">
      <Navbar />

      {/* --- HEADER --- */}
      <section className="bg-deep py-20 lg:py-32 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <span className="inline-block border border-primary/30 text-primary px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-8">
            Central de Ajuda
          </span>
          <h1 className="text-4xl lg:text-6xl font-black text-white uppercase tracking-tighter leading-none mb-8">
            Dúvidas Frequentes
          </h1>
          <p className="text-slate-400 text-lg lg:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Perguntas e respostas para ajudar você a navegar na plataforma <br className="hidden md:block"/> com total clareza e segurança.
          </p>
        </div>
      </section>

      {/* --- TABS --- */}
      <section className="bg-white -mt-10 relative z-20 pb-24">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="bg-mist p-2 rounded-2xl flex gap-2 mb-16 shadow-inner border border-slate-100">
            <button 
              onClick={() => { setActiveTab("paciente"); setOpenIndex(0); }}
              className={`flex-1 py-5 rounded-xl font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
                activeTab === "paciente" ? "bg-white text-primary shadow-lg" : "text-slate-400 hover:text-deep"
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Sou Paciente
            </button>
            <button 
              onClick={() => { setActiveTab("psicologo"); setOpenIndex(0); }}
              className={`flex-1 py-5 rounded-xl font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
                activeTab === "psicologo" ? "bg-white text-primary shadow-lg" : "text-slate-400 hover:text-deep"
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Sou Psicólogo
            </button>
          </div>

          {/* --- ACCORDION --- */}
          <div className="space-y-4">
            {currentFaq.map((item, idx) => (
              <div 
                key={idx} 
                className={`overflow-hidden transition-all duration-300 border-2 rounded-3xl ${
                  openIndex === idx ? "border-primary/20 bg-primary/5 shadow-xl" : "border-slate-100 hover:border-slate-200"
                }`}
              >
                <button 
                  onClick={() => toggleAccordion(idx)}
                  className="w-full flex items-center justify-between p-8 text-left group"
                >
                  <span className={`text-sm lg:text-base font-black uppercase tracking-tight transition-colors ${
                    openIndex === idx ? "text-primary" : "text-slate-700 group-hover:text-deep"
                  }`}>
                    {item.q}
                  </span>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    openIndex === idx ? "bg-primary text-white rotate-180" : "bg-slate-100 text-slate-400"
                  }`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </button>
                
                <div 
                  className={`transition-all duration-500 ease-in-out ${
                    openIndex === idx ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="p-8 pt-0 border-t border-primary/10">
                    <p className="text-slate-600 font-medium leading-relaxed text-sm lg:text-base">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* --- CONTACT CTA --- */}
          <div className="mt-24 text-center p-12 lg:p-16 bg-slate-900 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
            <h3 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tighter mb-6 relative z-10">Ainda tem alguma pergunta?</h3>
            <p className="text-slate-400 font-medium mb-10 max-w-xl mx-auto opacity-80 relative z-10">Se você não encontrou o que precisava, nosso time está pronto para ajudar você.</p>
            <Link href="mailto:contato@psiduo.com.br" className="bg-primary hover:bg-blue-600 text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-xl shadow-primary/20 transition relative z-10 inline-block">
              Falar com o Suporte
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
