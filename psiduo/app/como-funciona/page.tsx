"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function ComoFunciona() {
  return (
    <main className="min-h-screen bg-white font-sans flex flex-col overflow-x-hidden">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="bg-deep relative py-20 lg:py-32 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse"></div>
        <div className="container mx-auto max-w-6xl relative z-10 text-center lg:text-left flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <span className="inline-block bg-blue-500/10 border border-blue-400/30 text-blue-300 px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.3em] backdrop-blur-sm">
              Conexão Terapêutica
            </span>
            <h1 className="text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tighter">
              A ponte perfeita entre <span className="text-primary italic">você</span> e seu <span className="text-blue-200">psicólogo</span>.
            </h1>
            <p className="text-blue-100 text-lg lg:text-xl font-medium max-w-2xl leading-relaxed opacity-80">
              O PsiDuo não é apenas um diretório. É uma curadoria tecnológica desenhada para que a primeira sessão comece com a certeza da <strong>conexão ideal</strong>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/catalogo" className="bg-primary hover:bg-blue-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl transition shadow-blue-500/20 text-center">
                Encontrar meu Psicólogo
              </Link>
              <Link href="/sou-psicologo" className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition text-center">
                Sou um Profissional
              </Link>
            </div>
          </div>
          <div className="flex-1 hidden lg:block relative">
             <div className="w-full h-[500px] bg-gradient-to-br from-blue-400/20 to-transparent rounded-[3rem] border border-white/5 shadow-inner backdrop-blur-3xl flex items-center justify-center relative group">
                <div className="absolute inset-0 bg-blue-500/10 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
                {/* Ilustração Representativa Simples mas Premium */}
                <div className="relative text-white flex flex-col items-center gap-8 w-full px-12 z-10">
                   <div className="text-center">
                      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/20">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      </div>
                      <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Começar Conexão</h3>
                      <p className="text-blue-100/70 text-sm font-medium">Escolha a modalidade ideal para você.</p>
                   </div>
                   
                   <div className="flex flex-col gap-4 w-full">
                      <Link href="/quiz/individual" className="group bg-white hover:bg-white text-deep px-6 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:shadow-2xl transition-all flex items-center justify-between">
                         Individual
                         <span className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                         </span>
                      </Link>
                      <Link href="/quiz/casal" className="group bg-white/10 border border-white/10 hover:bg-white/20 text-white px-6 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-between backdrop-blur-md">
                         Para Casal
                         <span className="bg-white/10 w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-deep transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                         </span>
                      </Link>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- FLUXO PARA O PACIENTE --- */}
      <section className="py-24 bg-slate-50 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center mb-20 text-center">
            <span className="text-primary font-black text-[11px] uppercase tracking-[0.4em] mb-4">Para Pacientes</span>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 uppercase tracking-tighter">O Caminho para a sua Terapia</h2>
            <div className="w-20 h-2 bg-primary mt-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Steps Connector (Hidden on Mobile) */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 hidden md:block -translate-y-1/2 z-0 opacity-50"></div>
            
            {[
              { 
                step: "01", 
                title: "Busca Inteligente", 
                desc: "Utilize nossos filtros avançados para encontrar profissionais por abordagem, preço ou temas específicos como ansiedade e carreira.",
                icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              },
              { 
                step: "02", 
                title: "Conheça o Perfil", 
                desc: "Assista ao vídeo de apresentação, consulte a agenda e veja as avaliações reais de outros pacientes.",
                icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              },
              { 
                step: "03", 
                title: "Contato Direto", 
                desc: "Fale diretamente com o profissional via WhatsApp. Sem intermediários, sem taxas extras e com total liberdade.",
                icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 flex flex-col items-center text-center relative z-10 group">
                <span className="absolute -top-6 bg-deep text-white w-14 h-14 rounded-full flex items-center justify-center font-black italic text-xl shadow-lg group-hover:bg-primary transition-colors">{item.step}</span>
                <div className="bg-slate-50 w-20 h-20 rounded-3xl flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">{item.icon}</div>
                <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FLUXO PARA O PSICÓLOGO --- */}
      <section className="py-24 bg-white px-6">
        <div className="container mx-auto max-w-6xl flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1 order-2 lg:order-1">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="h-48 bg-slate-900 rounded-3xl p-6 text-white flex flex-col justify-end gap-2 shadow-xl border border-white/5">
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Duo I</span>
                     <p className="text-xs font-bold leading-tight">Visibilidade gratuita e catálogo completo.</p>
                  </div>
                  <div className="h-64 bg-primary rounded-3xl p-6 text-white flex flex-col justify-end gap-2 shadow-xl">
                     <span className="text-[10px] font-black uppercase tracking-widest text-blue-900">Duo II</span>
                     <p className="text-sm font-black leading-tight">Destaque premium, agenda pró e vídeo.</p>
                  </div>
                </div>
                <div className="space-y-4 pt-12">
                   <div className="h-64 bg-mist border-2 border-slate-100 rounded-3xl p-6 flex flex-col justify-end gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dados</span>
                      <p className="text-sm font-black text-deep leading-tight">Métricas de impacto e acessos ao perfil.</p>
                   </div>
                   <div className="h-48 bg-deep rounded-3xl p-6 text-white flex flex-col justify-end gap-2 shadow-xl">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Filtros</span>
                      <p className="text-xs font-bold leading-tight">Leads qualificados que procuram seu nicho.</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="flex-1 order-1 lg:order-2 space-y-8">
            <span className="text-primary font-black text-[11px] uppercase tracking-[0.4em]">Para Profissionais</span>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 uppercase tracking-tighter leading-tight">
              Sua Vitrine de <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Alta Conversão</span>
            </h2>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">
              O PsiDuo foi feito para psicólogos que buscam uma alternativa profissional às redes sociais. Aqui, você não apenas aparece; você se conecta com pacientes que realmente buscam o seu serviço.
            </p>
            
            <ul className="space-y-6">
               {[
                 "Cadastre-se em minutos com seu CRP.",
                 "Escolha entre o plano gratuito ou premium.",
                 "Complete seu perfil com suas especialidades.",
                 "Comece a receber contatos diretos e feedbacks."
               ].map((text, i) => (
                 <li key={i} className="flex items-center gap-4 group">
                    <span className="bg-green-50 text-green-600 w-8 h-8 rounded-full flex items-center justify-center font-black italic scale-90 group-hover:scale-100 group-hover:bg-green-100 transition-all">✓</span>
                    <span className="text-slate-700 font-bold uppercase text-xs tracking-widest">{text}</span>
                 </li>
               ))}
            </ul>

            <div className="pt-6">
                <Link href="/sou-psicologo" className="bg-deep text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-black transition text-center">
                  Criar meu Perfil Clínico
                </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- DIFERENCIAIS --- */}
      <section className="py-24 bg-slate-900 px-6 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -ml-64 -mb-64"></div>
        <div className="container mx-auto max-w-6xl relative z-10 text-center">
            <h2 className="text-3xl lg:text-5xl font-black text-white uppercase tracking-tighter mb-16">Por que somos <br className="md:hidden"/> <span className="text-primary">diferentes?</span></h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {[
                 { t: "Direto ao Ponto", d: "Sem taxas de agendamento ou comissões por sessão.", i: <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
                 { t: "Liberdade Total", d: "O contrato é direto entre você e o profissional.", i: <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg> },
                 { t: "Foco Clínico", d: "Espaço exclusivo para saúde mental, sem distrações.", i: <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg> },
                 { t: "SEO Próprio", d: "Seu perfil é otimizado para aparecer no Google.", i: <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> }
               ].map((card, idx) => (
                 <div key={idx} className="bg-white/5 border border-white/10 p-8 rounded-3xl text-center backdrop-blur-sm group hover:bg-white/10 transition duration-500">
                    <div className="text-primary mb-6 transition duration-500 group-hover:scale-110">{card.i}</div>
                    <h4 className="text-white font-black uppercase tracking-tight mb-3 text-lg">{card.t}</h4>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">{card.d}</p>
                 </div>
               ))}
            </div>
        </div>
      </section>

      {/* --- CTA FINAL --- */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-5xl bg-mist border border-slate-100 rounded-[3rem] p-12 lg:p-24 text-center shadow-2xl relative overflow-hidden group">
           <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
           <h2 className="text-4xl lg:text-6xl font-black text-deep uppercase tracking-tighter mb-8 leading-none relative z-10">
              PRONTO PARA <br/> <span className="text-primary italic">MUDAR SUA JORNADA</span>?
           </h2>
           <p className="text-slate-500 text-lg lg:text-xl font-medium max-w-2xl mx-auto mb-12 opacity-80 relative z-10">
              Escolha seu lado e descubra como o PsiDuo simplifica a conexão que transforma vidas.
           </p>
           <div className="flex flex-col sm:flex-row justify-center gap-6 relative z-10">
              <Link href="/catalogo" className="bg-primary text-white px-12 py-6 rounded-2xl font-black uppercase text-[13px] tracking-[0.2em] shadow-xl hover:bg-blue-600 transition">
                 Sou Paciente
              </Link>
              <Link href="/sou-psicologo" className="bg-deep text-white px-12 py-6 rounded-2xl font-black uppercase text-[13px] tracking-[0.3em] shadow-xl hover:bg-black transition">
                 Sou Profissional
              </Link>
           </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
