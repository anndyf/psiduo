"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Check, ShieldCheck, Star } from "lucide-react";

export default function Planos() {
  return (
    <main className="min-h-screen bg-mist font-sans flex flex-col overflow-x-hidden">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="bg-slate-900 relative py-20 lg:py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(11,30,59,0.8),rgba(2,6,23,1))]"></div>
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>

        <div className="container mx-auto max-w-6xl relative z-10 text-center lg:text-left">
           <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm px-3 py-1 rounded-full text-blue-400">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Investimento em Carreira</span>
              </div>
              <h1 className="text-4xl lg:text-7xl font-black text-white leading-tight tracking-tighter uppercase italic">
                Sua carreira em um <br/> <span className="text-blue-500 not-italic">novo patamar.</span>
              </h1>
              <p className="text-slate-400 text-lg lg:text-xl font-medium max-w-2xl leading-relaxed">
                Escolha o plano que melhor se adapta ao momento da sua jornada clínica. Sem fidelidade e 100% focado no seu crescimento.
              </p>
           </div>
        </div>
      </section>

      {/* --- PLANOS GRID --- */}
      <section className="py-20 px-6 relative -mt-10 bg-mist rounded-t-[3rem] z-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
             
             {/* DUO I (GRÁTIS) */}
             <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 flex flex-col group hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[3rem] -z-10 group-hover:bg-slate-100 transition-colors"></div>
                
                <div className="mb-8">
                   <div className="inline-block bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">Essencial</div>
                   <h3 className="text-4xl font-black text-slate-900 mb-1 leading-none tracking-tighter italic uppercase">Duo I</h3>
                   <p className="text-slate-500 text-sm font-medium mt-2">Visibilidade básica e gratuita.</p>
                </div>
                
                <div className="mb-10 text-slate-900">
                   <span className="text-5xl font-black tracking-tighter leading-none uppercase">GRÁTIS</span>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-3">Sempre gratuito</p>
                </div>

                <ul className="space-y-4 mb-12 flex-1">
                   {[
                     "Perfil Básico no Catálogo",
                     "Botão WhatsApp Direto",
                     "Divulgação de 1 Grupo Terapêutico",
                     "Exibição do Valor da Consulta"
                   ].map((item, i) => (
                     <li key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                           <Check className="w-3 h-3" strokeWidth={4} />
                        </div>
                        <span className="text-slate-600 font-bold uppercase text-[10px] tracking-tight">{item}</span>
                     </li>
                   ))}
                </ul>

                <Link href="/cadastro" className="w-full h-16 bg-slate-900 hover:bg-black text-white flex items-center justify-center rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all shadow-xl shadow-slate-900/10 active:scale-95">
                   Começar Agora
                </Link>
             </div>

             {/* DUO II (PREMIUM) */}
             <div className="bg-blue-600 rounded-[2.5rem] p-10 shadow-2xl shadow-blue-500/20 relative flex flex-col group border border-blue-500 transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-bl-[4rem] -z-10"></div>
                
                <div className="absolute top-6 right-8 bg-white text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-sm z-10">
                   Recomendado
                </div>
                
                <div className="mb-8">
                   <div className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-white/10 backdrop-blur-sm">Premium</div>
                   <h3 className="text-4xl font-black text-white mb-1 leading-none tracking-tighter italic uppercase">Duo II</h3>
                   <p className="text-blue-100/80 text-sm font-medium mt-2">Gestão completa para sua clínica.</p>
                </div>

                <div className="mb-10 text-white flex items-baseline gap-1">
                   <span className="text-2xl font-black opacity-60">R$</span>
                   <span className="text-6xl font-black leading-none tracking-tighter">40,00</span>
                   <span className="text-[10px] text-blue-100/60 font-black uppercase tracking-[0.2em] ml-2">/ mês</span>
                </div>

                <ul className="space-y-4 mb-12 flex-1 relative">
                    <li className="flex items-center gap-3 pb-4 border-b border-white/10 mb-4">
                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white">
                            <Check className="w-3 h-3" strokeWidth={4} />
                        </div>
                        <span className="text-white font-black uppercase text-[10px] tracking-tight">Tudo do Plano Duo I</span>
                    </li>

                    {[
                      "Prontuário & Diário de Pacientes",
                      "Agenda Online e Agendamento",
                      "Fluxo de Caixa e Financeiro",
                      "Aplicação de Instrumentos",
                      "Destaque prioritário na busca",
                      "Vídeo de Apresentação",
                      "Métricas de Acessos",
                      "Links Redes Sociais"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                         <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-xl">
                            <Check className="w-3 h-3" strokeWidth={4} />
                         </div>
                         <span className="text-white font-black uppercase text-[10px] tracking-tight">{item}</span>
                      </li>
                    ))}
                </ul>

                <Link href="/cadastro" className="w-full h-16 bg-white text-blue-600 flex items-center justify-center rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-2xl transition-all hover:bg-blue-50 active:scale-95">
                   Assinar Workspace II
                </Link>
             </div>
          </div>
          
          <div className="mt-20 text-center">
             <div className="inline-flex flex-col md:flex-row items-center gap-4 bg-white/50 backdrop-blur-sm px-8 py-4 rounded-3xl border border-white shadow-sm text-slate-500">
                <div className="flex items-center gap-2">
                   <ShieldCheck className="w-5 h-5 text-green-500" />
                   <span className="text-[11px] font-bold uppercase tracking-tight">Garantia de Ética e Transparência:</span>
                </div>
                <span className="text-[11px] font-medium">Não cobramos taxas sobre suas sessões. O valor da consulta é 100% seu.</span>
             </div>
          </div>
        </div>
      </section>

      {/* --- COMPARATIVO DETALHADO --- */}
      <section className="py-24 bg-white px-6">
        <div className="container mx-auto max-w-5xl">
           <div className="text-center mb-20 space-y-4">
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Tabela Comparativa</div>
              <h2 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tighter uppercase italic">Visão <span className="text-blue-600 not-italic">Técnica.</span></h2>
           </div>

           <div className="bg-slate-50 rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-2xl shadow-blue-900/5">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-slate-900 text-white">
                       <th className="py-8 px-10 font-black text-[11px] uppercase tracking-widest">Recurso do Ecossistema</th>
                       <th className="py-8 px-6 text-center font-black text-[11px] uppercase tracking-widest hidden md:table-cell">Duo I</th>
                       <th className="py-8 px-10 text-center font-black text-[11px] uppercase tracking-widest">Duo II</th>
                    </tr>
                 </thead>
                 <tbody className="text-xs">
                    {[
                       { f: "Visibilidade no Catálogo", a: true, b: true },
                       { f: "Botão WhatsApp Direto", a: true, b: true },
                       { f: "Divulgação de Grupos Terapêuticos", a: "1 Grupo", b: "Ilimitados" },
                       { f: "Destaque Prioritário na Busca", a: false, b: true },
                       { f: "Prontuário Digital Estruturado", a: false, b: true },
                       { f: "Diário de Pacientes & IA", a: false, b: true },
                       { f: "Agenda e Agendamento Online", a: false, b: true },
                       { f: "Gestão Financeira & Fluxo", a: false, b: true },
                       { f: "Instrumentos Psicométricos", a: false, b: true },
                       { f: "Vídeo de Apresentação no Perfil", a: false, b: true },
                       { f: "Métricas de Impacto e Cliques", a: false, b: true },
                       { f: "Taxas sobre Consulta", a: "0%", b: "0%" },
                    ].map((row, i) => (
                       <tr key={i} className="border-b border-slate-200 last:border-0 hover:bg-white transition-colors duration-300">
                          <td className="py-6 px-10 text-slate-700 font-bold uppercase tracking-tight text-[11px]">{row.f}</td>
                          <td className="py-6 px-6 text-center hidden md:table-cell">
                             {typeof row.a === 'boolean' ? (row.a ? <Check className="w-5 h-5 mx-auto text-green-500" strokeWidth={3} /> : <span className="text-slate-200">−</span>) : <span className="font-black text-slate-900 uppercase tracking-widest text-[10px]">{row.a}</span>}
                          </td>
                          <td className="py-6 px-10 text-center bg-blue-50/30">
                             {typeof row.b === 'boolean' ? (row.b ? <Check className="w-5 h-5 mx-auto text-blue-600" strokeWidth={3} /> : <span className="text-slate-200">−</span>) : <span className="font-black text-blue-600 uppercase tracking-widest text-[10px]">{row.b}</span>}
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           <div className="mt-20 flex flex-col items-center gap-8">
              <p className="text-slate-500 text-sm font-medium text-center">Precisa de uma solução para clínicas com múltiplos profissionais?</p>
              <Link href="/contato" className="inline-flex h-14 items-center px-10 bg-slate-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-black transition shadow-xl shadow-slate-900/10">
                 Falar com Consultor
              </Link>
           </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
