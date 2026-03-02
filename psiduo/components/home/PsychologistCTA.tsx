import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const PsychologistCTA = () => {
  return (
    <section className="py-24 bg-slate-900 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10 text-center">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm px-4 py-2 rounded-full text-blue-400">
             <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
             <span className="text-[10px] font-black uppercase tracking-[0.3em]">Pronto para Começar?</span>
          </div>
          
          <h2 className="text-3xl lg:text-5xl font-black text-white leading-tight tracking-tighter uppercase">
            Sua clínica digital, <br/> <span className="text-blue-500">sem complicação e sem taxas.</span>
          </h2>
          
          <p className="text-slate-400 text-lg font-medium max-w-2xl mx-auto">
            Comece agora a simplificar a sua gestão clínica com o PsiDuo.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link href="/sou-psicologo" className="w-full sm:w-auto min-w-[240px] bg-blue-600 h-14 hover:bg-blue-700 text-white px-8 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3">
              Conhecer Todos os Recursos <ArrowRight size={14} />
            </Link>
            <Link href="/planos" className="w-full sm:w-auto min-w-[200px] bg-white h-14 border border-white/10 hover:bg-slate-50 text-slate-900 px-8 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center">
              Ver Planos e Preços
            </Link>
          </div>
        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px]"></div>
      </div>
    </section>
  );
};
