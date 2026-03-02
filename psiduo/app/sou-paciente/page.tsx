"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { 
  Users, 
  Search, 
  MessageSquare, 
  Sparkles, 
  Heart, 
  ChevronRight, 
  Calendar, 
  ClipboardList,
  Target,
  ShieldCheck,
  Send,
  Smartphone
} from "lucide-react";
import { getPsicologosDestaque } from "../catalogo/actions";
import { ProfessionalsCarousel } from "@/components/home/ProfessionalsCarousel";

export default function SouPaciente() {
  const [professionals, setProfessionals] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const data = await getPsicologosDestaque();
      setProfessionals(data);
    }
    loadData();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 font-sans flex flex-col overflow-x-hidden">
      <Navbar />

      {/* --- HERO PACIENTE --- */}
      <section className="bg-slate-900 relative py-20 lg:py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.15),rgba(2,6,23,1))]" />
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full text-blue-400">
               <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Espaço de Cuidado & Conexão</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-black text-white leading-[1.2] tracking-tighter py-4 px-2">
              Encontre o <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 font-black italic pr-4">apoio ideal</span> <br className="hidden md:block"/> para sua jornada.
            </h1>
            
            <p className="text-slate-400 text-lg lg:text-xl font-medium leading-relaxed max-w-2xl px-1">
              Estamos aqui para unir você ao profissional ideal, garantindo uma conexão humana e segura para que você receba o acolhimento necessário em cada etapa da sua jornada.
            </p>

            <div className="pt-6 flex flex-wrap gap-5">
               <button 
                 onClick={() => document.getElementById('jornada')?.scrollIntoView({ behavior: 'smooth' })}
                 className="h-16 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-blue-500/20 transition-all active:scale-95"
               >
                 Escolher Minha Jornada
               </button>
               <Link href="/catalogo" className="h-16 px-10 border border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-2xl flex items-center justify-center font-black uppercase text-[10px] tracking-widest backdrop-blur-sm transition-all active:scale-95">
                 Explorar Catálogo
               </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- ESCOLHA DE JORNADA --- */}
      <section id="jornada" className="py-8 lg:py-12 px-6 bg-white relative z-10 scroll-mt-24">
        <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-8 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
                   <Target className="w-3 h-3" />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em]">Ponto de Partida</span>
                </div>
                <h2 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">COMO PODEMOS <span className="text-blue-600">TE AJUDAR?</span></h2>
                <p className="text-slate-500 max-w-2xl mx-auto font-medium text-lg leading-relaxed">Selecione o tipo de cuidado que você busca para iniciarmos o seu quiz de conexão.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    title: "Individual",
                    desc: "Foco no seu autoconhecimento, superação de desafios e equilíbrio pessoal.",
                    icon: <Heart className="w-10 h-10 text-blue-500" />,
                    link: "/quiz/individual",
                    label: "Iniciar Jornada",
                    color: "group-hover:text-blue-600",
                    bg: "bg-blue-50/50"
                  },
                  {
                    title: "Para Casal",
                    desc: "Melhore a comunicação, resolva conflitos e fortaleça a conexão emocional a dois.",
                    icon: <Users className="w-10 h-10 text-indigo-500" />,
                    link: "/quiz/casal",
                    label: "Cuidar do Casal",
                    color: "group-hover:text-indigo-600",
                    bg: "bg-indigo-50/50"
                  },
                  {
                    title: "Em Grupo",
                    desc: "Trocas terapêuticas em espaços seguros mediados por especialistas verificados.",
                    icon: <Sparkles className="w-10 h-10 text-emerald-500" />,
                    link: "/catalogo?filter=Terapia em Grupo",
                    label: "Explorar Grupos",
                    color: "group-hover:text-emerald-600",
                    bg: "bg-emerald-50/50"
                  }
                ].map((item, i) => (
                  <div key={i} className="group bg-slate-50/50 border border-slate-100 p-10 rounded-[3rem] hover:bg-white hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 flex flex-col items-center text-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/50 rounded-bl-[3rem] -z-10 group-hover:bg-slate-50"></div>
                      
                      <div className={`w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 group-hover:shadow-xl transition-all duration-500 ${item.color}`}>
                          {item.icon}
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight italic">{item.title}</h3>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10 flex-1">
                          {item.desc}
                      </p>
                      <Link href={item.link} className="w-full py-5 bg-slate-900 group-hover:bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all duration-300 shadow-xl shadow-slate-900/10 active:scale-95">
                          {item.label}
                      </Link>
                  </div>
                ))}
            </div>
        </div>
      </section>

      {/* --- FERRAMENTAS DE CONEXÃO --- */}
      <section className="py-20 lg:py-24 px-6 bg-slate-50 relative overflow-hidden border-y border-slate-100">
        {/* Decorative background element */}
        <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-[120px] -z-10 -translate-x-1/2 -translate-y-1/2"></div>

        <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
                {/* Content */}
                <div className="space-y-16">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-600 rounded-full">
                           <Sparkles className="w-3 h-3" />
                           <span className="text-[10px] font-black uppercase tracking-[0.2em]">Tecnologia Humana</span>
                        </div>
                        <h2 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-[1.1] italic uppercase py-1">FERRAMENTAS PARA <br/> <span className="text-blue-600">SUA ESCOLHA.</span></h2>
                        <p className="text-slate-500 font-medium text-lg leading-relaxed">Nossas soluções foram desenhadas para que a distância entre você e o seu bem-estar seja a menor possível.</p>
                    </div>

                    <div className="grid gap-10">
                        <div className="flex gap-6 items-start group">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shrink-0 shadow-sm border border-slate-100 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/10 transition-all duration-500">
                                <ClipboardList className="w-6 h-6" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight italic">Quiz de Afinidade</h3>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed">Nosso algoritmo analisa suas demandas, estilo de vida e preferências para sugerir o profissional com maior probabilidade de sucesso no seu tratamento.</p>
                            </div>
                        </div>

                        <div className="flex gap-6 items-start group">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shrink-0 shadow-sm border border-slate-100 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/10 transition-all duration-500">
                                <Search className="w-6 h-6" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight italic">Catálogo Especializado</h3>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed">Navegue por um catálogo curado com filtros avançados. Escolha por abordagem, temas e a faixa de preço que melhor te atende.</p>
                            </div>
                        </div>

                        <div className="flex gap-6 items-start group">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shrink-0 shadow-sm border border-slate-100 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/10 transition-all duration-500">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight italic">Perfis Verificados</h3>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed">Segurança em primeiro lugar. Todos os psicólogos passam por uma verificação rigorosa de CRP e especialidades.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Preview */}
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-100/50 rounded-full blur-[100px] opacity-40 -z-10 animate-pulse"></div>
                    <div className="bg-white p-3 rounded-[3rem] border border-slate-200 shadow-3xl overflow-hidden group">
                        <div className="aspect-[4/3] rounded-[2rem] overflow-hidden relative border border-slate-100 bg-slate-50">
                            <img src="/images/catalogo.png" alt="Catálogo PsiDuo" className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60"></div>
                            <div className="absolute bottom-8 left-8 right-8">
                                <div className="bg-white/95 backdrop-blur px-6 py-4 rounded-2xl border border-white inline-flex items-center gap-4 shadow-2xl">
                                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                                        <Search className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="space-y-0.5 text-left">
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Busca Inteligente</p>
                                        <p className="text-sm font-bold text-slate-900">Encontre por abordagem ou preço</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* --- CARROSSEL DE PROFISSIONAIS --- */}
      {professionals.length > 0 && (
          <ProfessionalsCarousel 
            professionals={professionals} 
            badge="Conexão Direta"
            title="ESPECIALISTAS EM <br/> <span class='text-blue-600'>DESTAQUE NO CATÁLOGO.</span>"
            subtitle="Conecte-se com profissionais verificados e comece sua jornada hoje mesmo."
          />
      )}

      {/* --- CTA FINAL FOCADO EM CONEXÃO --- */}
      <section className="py-20 bg-slate-900 px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),rgba(2,6,23,1))]" />
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        </div>
        
        <div className="container mx-auto max-w-4xl relative z-10 text-center space-y-8">
           <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tighter leading-tight italic uppercase">
             PRONTO PARA ENCONTRAR <br/><span className="text-blue-500">SUA MELHOR VERSÃO?</span>
           </h2>
           <p className="text-slate-400 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
             Não deixe sua saúde mental para depois. Use nossas ferramentas de conexão agora mesmo e dê o primeiro passo.
           </p>
           <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link href="/quiz/individual" className="h-16 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-blue-500/20 transition-all active:scale-95">
                 Iniciar Quiz de Conexão
              </Link>
              <Link href="/catalogo" className="h-16 px-10 border border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl flex items-center justify-center font-black uppercase text-[10px] tracking-widest backdrop-blur-sm transition-all active:scale-95">
                 Navegar no Catálogo
              </Link>
           </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
