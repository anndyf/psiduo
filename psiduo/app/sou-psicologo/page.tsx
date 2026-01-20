"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function SouPsicologo() {
  return (
    <main className="min-h-screen bg-white font-sans flex flex-col overflow-x-hidden">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="bg-slate-900 relative py-24 lg:py-36 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -mr-64 -mt-64"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="max-w-3xl space-y-8">
            <span className="inline-block bg-primary/10 border border-primary/20 text-primary px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.3em]">
              Direcionado a Profissionais
            </span>
            <h1 className="text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tighter">
              A vitrine clínica que <br/> <span className="text-primary">valoriza</span> sua jornada.
            </h1>
            <p className="text-slate-400 text-lg lg:text-xl font-medium leading-relaxed opacity-90">
              O PsiDuo é o espaço onde tecnologia e ética se encontram para conectar você a pacientes qualificados. Sem taxas por sessão, sem intermediários.
            </p>
            <div className="pt-4">
               <Link href="#planos" className="bg-primary hover:bg-blue-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl transition inline-block">
                 Conhecer os Planos
               </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- VANTAGENS DO PSIDUO (Geral) --- */}
      <section className="py-24 bg-white px-6">
        <div className="container mx-auto max-w-6xl">
           <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-black text-slate-900 uppercase tracking-tighter mb-6">Por que escolher o <span className="text-primary italic">PsiDuo</span>?</h2>
              <p className="text-slate-500 font-medium max-w-2xl mx-auto">Diferente das redes sociais barulhentas, aqui o foco é 100% clínico e na sua autoridade professional.</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                   t: "Visibilidade Qualificada", 
                   d: "Pacientes utilizam filtros avançados para encontrar exatamente a sua especialidade.", 
                   icon: <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
                   color: "bg-blue-500"
                },
                { 
                   t: "Zero Comissões", 
                   d: "Receba 100% do valor da sua consulta. O pagamento é acordado diretamente com o paciente.", 
                   icon: <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                   color: "bg-green-500"
                },
                { 
                   t: "Autonomia Profissional", 
                   d: "Você define seus horários e regras. Somos a ponte tecnológica, não seu chefe.", 
                   icon: <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                   color: "bg-slate-800"
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                   <div className={`${item.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-3 group-hover:rotate-0 transition-transform`}>
                      {item.icon}
                   </div>
                   <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-3">{item.t}</h3>
                   <p className="text-slate-500 text-sm font-medium leading-relaxed">
                      {item.d}
                   </p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* --- DETALHES DUO II (PREMIUM FEATURES) - MOVED UP --- */}
      <section className="py-24 bg-deep relative overflow-hidden">
         {/* Background Elements */}
         <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -ml-24 -mt-24 pointer-events-none"></div>
         <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -mr-24 -mb-24 pointer-events-none"></div>

         <div className="container mx-auto max-w-6xl relative z-10 px-6">
            <div className="text-center mb-20">
               <span className="inline-block bg-white/10 text-blue-300 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md mb-6 border border-white/5">
                  Exclusividade Premium
               </span>
               <h2 className="text-3xl lg:text-5xl font-black text-white uppercase tracking-tighter leading-tight">
                  Por que ser <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-300">Duo II</span>?
               </h2>
               <p className="text-slate-400 mt-6 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
                  Desbloqueie ferramentas que vão além da divulgação. O Duo II é um sistema completo de gestão e fidelização clínica.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Feature 1: Diário (Large) */}
               <div className="md:col-span-2 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-10 rounded-[2.5rem] hover:border-primary/50 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-32 bg-primary/20 blur-[80px] rounded-full -mr-16 -mt-16 pointer-events-none group-hover:bg-primary/30 transition-colors"></div>
                  <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 text-primary relative z-10">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-3 relative z-10">Diário do Paciente</h3>
                  <p className="text-slate-400 font-medium leading-relaxed max-w-sm relative z-10">Acompanhe o humor, sono e anotações dos seus pacientes entre sessões. Receba insights valiosos.</p>
               </div>

               {/* Feature 2: Vídeo (Standard) */}
               <div className="md:col-span-1 bg-white/5 border border-white/5 p-10 rounded-[2.5rem] hover:bg-white/10 transition-all group">
                  <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 text-blue-300">
                     <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3">Vídeo Apresentação</h3>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">Gere 3x mais conexão antes mesmo do primeiro contato.</p>
               </div>

               {/* Feature 3: Agenda (Standard) */}
               <div className="md:col-span-1 bg-white/5 border border-white/5 p-10 rounded-[2.5rem] hover:bg-white/10 transition-all group">
                  <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 text-purple-300">
                     <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3">Agenda Inteligente</h3>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">Exiba seus horários disponíveis de forma clara. Reduza a troca de mensagens.</p>
               </div>

               {/* Feature 4: Métricas (Large) */}
               <div className="md:col-span-2 bg-gradient-to-bl from-white/10 to-white/5 border border-white/10 p-10 rounded-[2.5rem] hover:border-blue-400/50 transition-all group relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 p-32 bg-blue-500/20 blur-[80px] rounded-full -ml-16 -mb-16 pointer-events-none group-hover:bg-blue-500/30 transition-colors"></div>
                  <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 text-blue-300 relative z-10">
                     <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-3 relative z-10">Métricas de Dados</h3>
                  <p className="text-slate-400 font-medium leading-relaxed max-w-sm relative z-10">Entenda seu funil. Saiba quantas pessoas visitam seu perfil, clicam no WhatsApp e interagem com você.</p>
               </div>
            </div>
         </div>
      </section>

      {/* --- VISUAL SHOWCASE DO DIÁRIO --- */}
      <section className="py-24 bg-slate-50 px-6 overflow-hidden">
         <div className="container mx-auto max-w-6xl">
             <div className="flex flex-col lg:flex-row items-center gap-16">
                 
                 {/* Texto Explicativo */}
                 <div className="flex-1 space-y-8">
                     <div className="flex flex-wrap items-center gap-3">
                        <span className="bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">Exclusividade Duo II</span>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">Pacientes Ilimitados</span>
                     </div>
                     <h2 className="text-4xl lg:text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                         O <span className="text-primary">Elo Perdido</span> <br/> Entre as Sessões.
                     </h2>
                     <p className="text-slate-500 text-lg font-medium leading-relaxed">
                         Muitas vezes, o que acontece entre uma sessão e outra é perdido. Com o módulo de <strong>Diário de Pacientes</strong>, você cadastra <span className="text-deep font-bold underline decoration-primary/30 decoration-2 underline-offset-2">quantos pacientes quiser</span>, sem limites. Eles registram humor e sono diariamente, e você recebe tudo em um painel clínico organizado.
                     </p>
                     
                     <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-primary">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">Para o Paciente</h4>
                                <p className="text-xs text-slate-500">Interface simples, amigável e gamificada.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="w-12 h-12 bg-deep/10 rounded-xl flex items-center justify-center text-deep">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">Para Você</h4>
                                <p className="text-xs text-slate-500">Gráficos de tendência e alertas de oscilação.</p>
                            </div>
                        </div>
                     </div>
                 </div>

                 {/* Imagens (Mockups) */}
                 <div className="flex-1 relative">
                     {/* Background Blob */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary/20 to-blue-200/20 rounded-full blur-3xl -z-10"></div>
                     
                     <div className="relative z-10">
                        {/* Painel Desktop */}
                        <div className="rounded-xl overflow-hidden shadow-2xl border-4 border-white transform hover:scale-[1.02] transition-transform duration-500">
                           <img src="/painel_mockup.png" alt="Painel de Gerenciamento do Psicólogo" className="w-full h-auto" />
                        </div>
                        
                        {/* Gráficos (Floating Left) - NOVA IMAGEM */}
                        <div className="absolute -bottom-8 -left-8 w-72 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-4 border-white transform -rotate-3 hover:rotate-0 transition-all duration-500 hover:scale-105 hover:z-30">
                           <img src="/graficos_mockup.png" alt="Análise de Dados Clínicos" className="w-full h-auto bg-white" />
                        </div>
                        
                        {/* App Mobile (Overlapping Right) */}
                        <div className="absolute -bottom-12 -right-6 w-1/3 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-4 border-white transform rotate-3 hover:rotate-0 transition-all duration-500 hover:scale-105 hover:z-20">
                           <img src="/diario_mockup.png" alt="Aplicativo do Paciente" className="w-full h-auto" />
                        </div>
                     </div>
                 </div>
             </div>
         </div>
      </section>

      {/* --- TABELA DE PLANOS --- */}
      <section id="planos" className="py-24 bg-mist px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-primary font-black text-[11px] uppercase tracking-[0.4em] mb-4">Investimento</span>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 uppercase tracking-tighter">Escolha seu Nível de Presença</h2>
            <div className="w-20 h-2 bg-primary mx-auto mt-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
             {/* DUO I */}
             <div className="bg-white rounded-[2.5rem] p-10 lg:p-14 shadow-sm border border-slate-100 flex flex-col group hover:shadow-xl transition-all duration-500">
                <div className="mb-10">
                   <h3 className="text-3xl font-black text-deep uppercase tracking-tighter mb-2">DUO I</h3>
                   <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Perfil Essencial</p>
                </div>
                
                <div className="flex items-baseline mb-10 text-deep">
                   <span className="text-5xl font-black leading-none tracking-tighter">GRÁTIS</span>
                </div>

                <ul className="space-y-5 mb-12 flex-1">
                   {[
                     "Presença no catálogo principal",
                     "Filtros de especialidades",
                     "Bio e foto profissional",
                     "Botão de WhatsApp direto",
                     "Recebimento de avaliações"
                   ].map((item, i) => (
                     <li key={i} className="flex items-center gap-4">
                        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        <span className="text-slate-600 font-bold uppercase text-[10px] tracking-widest">{item}</span>
                     </li>
                   ))}
                </ul>

                <Link href="/cadastro" className="w-full bg-slate-100 text-slate-600 py-6 rounded-2xl font-black uppercase text-xs tracking-[0.2em] text-center hover:bg-slate-200 transition">
                   Começar Gratuitamente
                </Link>
             </div>

             {/* DUO II */}
             <div className="bg-deep rounded-[2.5rem] p-10 lg:p-14 shadow-[0_20px_50px_-12px_rgba(11,30,59,0.5)] relative flex flex-col group transform md:-translate-y-4 border border-blue-800/30">
                <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-8 py-4 rounded-bl-[2rem] rounded-tr-[2.5rem]">
                   Recomendado
                </div>
                
                <div className="mb-10">
                   <div className="inline-block bg-primary/20 text-blue-300 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                      Premium
                   </div>
                   <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Duo II</h3>
                   <p className="text-blue-300/80 text-sm font-medium uppercase tracking-widest">Ferramentas completas de gestão.</p>
                </div>

                <div className="flex items-baseline mb-10 text-white">
                   <span className="text-sm font-bold mr-2">R$</span>
                   <span className="text-5xl font-black leading-none tracking-tighter text-blue-100">20,00</span>
                   <span className="text-sm text-blue-300 font-bold ml-2 uppercase tracking-widest opacity-60">assinatura mensal</span>
                </div>

                <ul className="space-y-6 mb-12 flex-1">
                   {[
                     { t: "Diário de Pacientes (Novo!)", v: true, highlight: true },
                     { t: "Agenda Disponível e Link", v: true },
                     { t: "Vídeo de Apresentação", v: true },
                     { t: "Métricas de Acessos", v: true },
                     { t: "Destaque na Busca", v: true },
                   ].map((item, i) => (
                     <li key={i} className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${item.highlight ? 'bg-amber-400 text-deep shadow-lg shadow-amber-400/50' : 'bg-blue-500/20 text-blue-400'}`}>
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <span className={`font-bold uppercase text-[10px] tracking-widest ${item.highlight ? 'text-amber-400 font-black' : 'text-blue-50/90'}`}>{item.t}</span>
                     </li>
                   ))}
                </ul>

                <Link href="/cadastro" className="w-full bg-primary text-white py-6 rounded-2xl font-black uppercase text-xs tracking-[0.2em] text-center shadow-xl shadow-primary/40 hover:bg-blue-600 transition active:scale-95">
                   Quero ser Premium
                </Link>
             </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
