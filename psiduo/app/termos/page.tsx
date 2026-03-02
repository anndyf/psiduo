"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ScrollText, Shield, FileText, CheckCircle } from "lucide-react";

export default function Termos() {
  const sections = [
    {
      title: "1. Aceitação dos Termos",
      content: "Ao acessar e utilizar a plataforma PsiDuo, você concorda em cumprir e estar vinculado a estes Termos e Condições de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.",
      icon: <CheckCircle className="w-5 h-5 text-blue-500" />
    },
    {
      title: "2. Descrição do Serviço",
      content: "O PsiDuo é uma plataforma de tecnologia que oferece ferramentas de gestão para psicólogos, incluindo prontuário digital, diário de pacientes, agenda e organização financeira. Não somos uma clínica de psicologia e não oferecemos atendimento direto.",
      icon: <FileText className="w-5 h-5 text-blue-500" />
    },
    {
      title: "3. Responsabilidades do Profissional",
      content: "O profissional é o único responsável pela veracidade de sua formação e registro profissional (CRP). O uso das ferramentas de prontuário e diário deve seguir as normas éticas vigentes do Conselho Federal de Psicologia.",
      icon: <Shield className="w-5 h-5 text-blue-500" />
    },
    {
      title: "4. Privacidade e Dados (LGPD)",
      content: "Tratamos os dados com o mais alto rigor de segurança. Os registros clínicos são criptografados. O psicólogo é o controlador dos dados de seus pacientes, e o PsiDuo atua como operador tecnológico.",
      icon: <Shield className="w-5 h-5 text-blue-500" />
    }
  ];

  return (
    <main className="min-h-screen bg-slate-50 font-sans flex flex-col overflow-x-hidden">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="bg-slate-900 relative py-20 lg:py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(11,30,59,1),rgba(2,6,23,1))]" />
        </div>

        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-blue-400">
              <ScrollText className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Legal & Compliance</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight uppercase tracking-tighter">
              Termos de <span className="text-blue-500 italic">Uso.</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">
              Última atualização: Fevereiro de 2026
            </p>
          </div>
        </div>
      </section>

      {/* --- CONTENT SECTION --- */}
      <section className="py-24 px-6 bg-white">
        <div className="container mx-auto max-w-3xl">
          <div className="space-y-12">
            {sections.map((section, i) => (
              <div key={i} className="space-y-4">
                <div className="flex items-center gap-3">
                  {section.icon}
                  <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">{section.title}</h2>
                </div>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {section.content}
                </p>
              </div>
            ))}

            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-tight">Dúvidas Jurídicas?</h3>
              <p className="text-sm text-slate-500 mb-6 font-medium leading-relaxed">
                Nossa equipe jurídica está à disposição para esclarecer qualquer ponto sobre nossos termos de serviço e políticas de privacidade.
              </p>
              <a href="mailto:juridico@psiduo.com.br" className="text-blue-600 font-black uppercase text-[10px] tracking-widest hover:underline">
                Contatar Departamento Jurídico →
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
