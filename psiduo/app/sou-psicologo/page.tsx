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

      {/* --- VANTAGENS --- */}
      <section className="py-24 bg-white px-6">
        <div className="container mx-auto max-w-6xl">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-12">
                 <div>
                    <h2 className="text-3xl lg:text-4xl font-black text-slate-900 uppercase tracking-tighter mb-6">Por que escolher o <span className="text-primary italic">PsiDuo</span>?</h2>
                    <p className="text-slate-500 font-medium">Diferente das redes sociais barulhentas, aqui o foco é 100% clínico e na sua autoridade professional.</p>
                 </div>

                 <div className="space-y-8">
                    {[
                      { t: "SEO Otimizado", d: "Seu perfil é indexado pelo Google, facilitando que pacientes te encontrem organicamente.", i: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> },
                      { t: "Zero Comissões", d: "O valor da sua sessão é integralmente seu. Não cobramos porcentagem sobre seus atendimentos.", i: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
                      { t: "Autoridade Visual", d: "Perfis limpos, modernos e com recursos premium como vídeo e agenda pró.", i: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> }
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-6 group">
                         <div className="bg-slate-50 w-14 h-14 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">{item.i}</div>
                         <div>
                            <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-1">{item.t}</h4>
                            <p className="text-slate-500 text-sm leading-relaxed">{item.d}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
              
              <div className="relative">
                 <div className="absolute inset-0 bg-primary/20 rounded-[3rem] blur-3xl -z-10 animate-pulse"></div>
                 <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl border border-white/10 aspect-square flex flex-col justify-center gap-8">
                     <div className="space-y-4">
                        <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden">
                           <div className="w-[85%] h-full bg-primary"></div>
                        </div>
                        <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Preenchimento do Perfil</p>
                     </div>
                     <div className="space-y-4">
                        <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden">
                           <div className="w-[60%] h-full bg-blue-300"></div>
                        </div>
                        <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Acessos este mês</p>
                     </div>
                     <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                         <div className="flex justify-between items-center mb-4">
                            <span className="text-white text-xs font-black uppercase tracking-widest">Contatos Recebidos</span>
                            <span className="text-primary font-black">+12</span>
                         </div>
                         <div className="flex -space-x-3">
                            {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-700"></div>)}
                         </div>
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
                     "Recebimento de avaliações",
                     "URL com seu nome (Slug)"
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
                     { t: "Tudo do plano Duo I", v: true },
                     { t: "Horários Disponíveis (Agenda)", v: true },
                     { t: "Vídeo de Apresentação", v: true },
                     { t: "Links Redes Sociais", v: true },
                     { t: "Visualizador de Acessos", v: true },
                     { t: "Suporte prioritário", v: true }
                   ].map((item, i) => (
                     <li key={i} className="flex items-center gap-4">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                           <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <span className="text-blue-50/90 font-bold uppercase text-[10px] tracking-widest">{item.t}</span>
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

      {/* --- FAQ MINI --- */}
      <section className="py-24 bg-white px-6">
         <div className="container mx-auto max-w-4xl text-center">
             <h2 className="text-3xl lg:text-4xl font-black text-slate-900 uppercase tracking-tighter mb-16">Dúvida rápida?</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
                   <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-3">Posso trocar de plano depois?</h4>
                   <p className="text-slate-500 text-sm leading-relaxed">Sim, você pode alternar entre o Duo I e Duo II a qualquer momento através do seu painel de controle.</p>
                </div>
                <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
                   <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-3">Tem fidelidade ou multa?</h4>
                   <p className="text-slate-500 text-sm leading-relaxed">Não. O PsiDuo trabalha com liberdade total. Você pode cancelar sua assinatura premium sem qualquer burocracia.</p>
                </div>
             </div>
         </div>
      </section>

      {/* --- CTA FINAL --- */}
      <section className="py-24 px-6 bg-slate-900">
         <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl lg:text-6xl font-black text-white uppercase tracking-tighter mb-8 leading-tight">
               SUA PRÓXIMA SESSÃO <br/> <span className="text-primary italic">COMEÇA AQUI.</span>
            </h2>
            <p className="text-slate-400 text-lg lg:text-xl font-medium mb-12 opacity-80 max-w-2xl mx-auto">
               Crie seu perfil profissional agora e faça parte da plataforma que mais cresce na conexão terapêutica.
            </p>
            <Link href="/cadastro" className="bg-primary text-white px-14 py-6 rounded-2xl font-black uppercase text-[13px] tracking-[0.3em] shadow-2xl hover:bg-blue-600 transition">
               Criar meu Perfil Agora
            </Link>
         </div>
      </section>

      <Footer />
    </main>
  );
}
