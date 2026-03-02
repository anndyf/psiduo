"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { 
  ShieldCheck, 
  Scale, 
  Eye, 
  UserCheck, 
  Lock, 
  AlertCircle,
  Stethoscope,
  Heart
} from "lucide-react";

export default function Etica() {
  const pillars = [
    {
      title: "Sigilo e Confidencialidade",
      desc: "Seguimos rigorosamente os preceitos do Código de Ética Profissional do Psicólogo e a LGPD. Os dados clínicos são criptografados e acessíveis apenas ao profissional responsável.",
      icon: <Lock className="w-6 h-6" />
    },
    {
      title: "Verificação de Registro (CRP)",
      desc: "Todos os profissionais cadastrados passam por uma verificação sistemática de seu registro profissional ativo junto ao Conselho Federal de Psicologia.",
      icon: <UserCheck className="w-6 h-6" />
    },
    {
      title: "Autonomia do Profissional",
      desc: "O PsiDuo é uma ferramenta de meio. Não interferimos no manejo clínico, nos valores das sessões ou na liberdade técnica de cada psicólogo.",
      icon: <Scale className="w-6 h-6" />
    },
    {
      title: "Transparência de Taxas",
      desc: "Acreditamos na valorização do trabalho braçal. O PsiDuo não cobra comissões sobre as sessões. O valor pago pelo paciente é 100% do profissional.",
      icon: <Eye className="w-6 h-6" />
    }
  ];

  return (
    <main className="min-h-screen bg-slate-50 font-sans flex flex-col overflow-x-hidden">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="bg-slate-900 relative py-24 lg:py-40 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(11,30,59,0.8),rgba(2,6,23,1))]"></div>
        </div>

        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm px-3 py-1 rounded-full text-blue-400">
              <ShieldCheck className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Ethics & Transparency Protocol</span>
            </div>
            
            <h1 className="text-4xl lg:text-7xl font-black text-white leading-tight tracking-tighter uppercase">
              Ética e <br/> <span className="text-blue-500 italic">Transparência.</span>
            </h1>
            
            <p className="text-slate-400 text-lg lg:text-xl font-medium leading-relaxed">
              O compromisso com a saúde mental exige tecnologia responsável. Conheça as diretrizes que regem todo o ecossistema PsiDuo.
            </p>
          </div>
        </div>
      </section>

      {/* --- PILARES ÉTICOS --- */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {pillars.map((pillar, i) => (
                <div key={i} className="flex gap-6 group">
                   <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xl group-hover:bg-blue-600 transition-colors">
                      {pillar.icon}
                   </div>
                   <div className="space-y-3">
                      <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">{pillar.title}</h3>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">
                        {pillar.desc}
                      </p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* --- AVISO DE EMERGÊNCIA (CRITICAL) --- */}
      <section className="py-12 bg-amber-50 px-6 border-y border-amber-100">
         <div className="container mx-auto max-w-4xl flex flex-col md:flex-row items-center gap-6 text-amber-900">
            <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center shrink-0">
               <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center md:text-left">
               <h4 className="font-black uppercase text-xs tracking-widest mb-1">Atenção sobre Emergências</h4>
               <p className="text-xs font-medium leading-relaxed">
                 O PsiDuo não é um serviço de pronto atendimento ou emergência psicológica. Em casos de risco imediato, crise suicida ou necessidade de suporte urgente, ligue para o <strong>CVV no 188</strong> ou dirija-se ao hospital mais próximo imediatamente.
               </p>
            </div>
         </div>
      </section>

      {/* --- DIRETRIZES PARA O PROFISSIONAL --- */}
      <section className="py-24 bg-white px-6">
        <div className="container mx-auto max-w-4xl">
           <div className="space-y-16">
              <div className="space-y-6">
                 <div className="flex items-center gap-3 text-blue-600">
                    <Stethoscope className="w-6 h-6" />
                    <h2 className="text-2xl font-bold uppercase tracking-tight">Compromisso do Profissional</h2>
                 </div>
                 <p className="text-slate-600 font-medium leading-relaxed">
                   Todo psicólogo que utiliza o PsiDuo declara estar em pleno gozo de seus direitos profissionais e compromete-se a utilizar as ferramentas (como o Prontuário e o Diário) de acordo com as resoluções vigentes do Conselho Federal de Psicologia sobre atendimento online e registro documental.
                 </p>
              </div>

              <div className="space-y-6">
                 <div className="flex items-center gap-3 text-blue-600">
                    <Heart className="w-6 h-6" />
                    <h2 className="text-2xl font-bold uppercase tracking-tight">Compromisso com o Paciente</h2>
                 </div>
                 <p className="text-slate-600 font-medium leading-relaxed">
                   Garantimos que o paciente tenha total controle sobre seus dados de diário, podendo desvincular-se de um profissional a qualquer momento, mantendo sua autonomia sobre seu histórico emocional registrado na plataforma.
                 </p>
              </div>
           </div>
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-3xl font-bold text-slate-900 uppercase tracking-tighter leading-none">
            Dúvidas sobre nossos protocolos?
          </h2>
          <p className="text-slate-500 font-medium max-w-xl mx-auto">
            Nossa equipe de suporte e compliance está à disposição para esclarecer qualquer ponto sobre o funcionamento ético do sistema.
          </p>
          <Link href="mailto:etica@psiduo.com.br" className="inline-flex h-14 items-center px-10 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-colors">
            Falar com Compliance
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
