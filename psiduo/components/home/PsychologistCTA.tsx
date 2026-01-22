import Link from "next/link";
import { BookOpen, Calendar, Video, BarChart2, ArrowRight } from "lucide-react";

export const PsychologistCTA = () => {
  return (
    <section className="py-24 bg-deep relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-blue-600 overflow-hidden">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="bg-white rounded-[3rem] p-10 lg:p-16 shadow-2xl shadow-blue-900/20 border border-white/20 flex flex-col lg:flex-row items-center justify-between gap-16 relative overflow-hidden group">
          
          <div className="flex-1 space-y-8 relative z-10">
            <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-blue-100">
               <span className="w-2 h-2 rounded-full bg-blue-600"></span>
               Para Profissionais
            </span>
            
            <h2 className="text-3xl lg:text-5xl font-black text-slate-900 uppercase tracking-tighter leading-tight">
              Potencialize sua <br/> <span className="text-blue-600">Carreira Clínica</span>
            </h2>
            
            <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-xl">
              Centralize sua jornada no PsiDuo com <strong>Diário de Pacientes</strong>, Agenda e tecnologias que fidelizam.
            </p>

            <ul className="space-y-2 py-2">
                <li className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">✓</div>
                    Receba 100% do valor da consulta (Sem taxas)
                </li>
                <li className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">✓</div>
                    Ferramentas de Gestão (Visualização de Agenda e Diário de Paciente)
                </li>
                <li className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">✓</div>
                    Visibilidade para milhares de pacientes
                </li>
            </ul>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/sou-psicologo" className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-slate-900/20 transition-all transform hover:-translate-y-1 flex items-center gap-3">
                Conhecer Recursos <ArrowRight size={16} />
              </Link>
              <Link href="/sou-psicologo#planos" className="bg-white border-2 border-slate-100 hover:border-slate-300 text-slate-600 px-8 py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center gap-2">
                Ver Planos
              </Link>
            </div>
          </div>

          <div className="relative w-full lg:w-1/2 flex justify-center lg:justify-end mt-12 lg:mt-0">
             {/* Product Mockup Composition */}
             <div className="relative w-full max-w-lg">
                
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-blue-600/20 to-purple-500/20 rounded-full blur-3xl -z-10"></div>
                
                <div className="relative z-10 transition-transform duration-500 hover:scale-[1.02]">
                    {/* Main Image (Dashboard) */}
                    <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                        <img src="/painel_mockup.png" alt="Painel do Psicólogo" className="w-full h-auto object-cover" />
                    </div>

                    {/* Floating Mobile App (Diary) */}
                    <div className="absolute -bottom-10 -right-8 w-1/3 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-4 border-white transform rotate-6 hover:rotate-0 transition-all duration-500 hover:scale-105 z-20">
                        <img src="/diario_mockup.png" alt="App do Paciente" className="w-full h-auto" />
                    </div>

                    {/* Floating Chart (Stats) */}
                    <div className="absolute -bottom-6 -left-8 w-2/5 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-4 border-white transform -rotate-3 hover:rotate-0 transition-all duration-500 hover:scale-105 z-20">
                        <img src="/graficos_mockup.png" alt="Gráficos" className="w-full h-auto bg-white" />
                    </div>
                </div>

             </div>
          </div>

        </div>
      </div>
    </section>
  );
};
