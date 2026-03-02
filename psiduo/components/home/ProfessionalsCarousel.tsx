"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Star, Plus } from "lucide-react";

interface Professional {
  id: string;
  nome: string;
  foto?: string | null;
  abordagem: string;
  temas: string[];
  plano: string;
  slug?: string | null;
}

interface ProfessionalsCarouselProps {
  professionals: Professional[];
  title?: string;
  subtitle?: string;
  badge?: string;
}

export const ProfessionalsCarousel = ({ 
  professionals, 
  title = "Especialistas em Destaque",
  subtitle = "Profissionais verificados e prontos para te ajudar.",
  badge = "Conexão Direta"
}: ProfessionalsCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 340; 
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="py-8 lg:py-12 bg-slate-50 relative z-10 overflow-hidden">
      {/* Background Decorative Blurs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-8">
          <div className="max-w-xl space-y-4">
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">{badge}</div>
            <h2 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-[1.1] italic uppercase py-1" dangerouslySetInnerHTML={{ __html: title }}></h2>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">{subtitle}</p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex gap-2">
                <button 
                  onClick={() => scroll('left')}
                  className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-600 hover:shadow-lg hover:shadow-blue-500/10 transition-all active:scale-95"
                >
                   <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => scroll('right')}
                  className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-600 hover:shadow-lg hover:shadow-blue-500/10 transition-all active:scale-95"
                >
                   <ChevronRight className="w-5 h-5" />
                </button>
             </div>
             <Link href="/catalogo" className="h-12 px-6 bg-slate-900 hover:bg-black text-white rounded-xl flex items-center justify-center font-black uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-slate-900/10 active:scale-95">
                Ver Catálogo
             </Link>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-10 pb-20 -mx-6 px-6 lg:mx-0 lg:px-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] scroll-smooth items-stretch"
        >
          {professionals.map((pro) => (
            <div 
              key={pro.id} 
              className="relative snap-start shrink-0 w-[300px] md:w-[340px] flex py-4"
            >
              <div className="bg-white border border-slate-100 rounded-[2.5rem] p-9 flex flex-col w-full hover:shadow-3xl hover:shadow-blue-900/10 transition-all duration-500 group relative overflow-hidden">
                {/* Card Background Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[4rem] -z-10 group-hover:bg-blue-50 transition-colors duration-500"></div>

                <div className="flex items-center justify-between mb-10">
                   <div className="relative">
                      {pro.foto ? (
                        <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-xl border-4 border-white group-hover:scale-105 transition-transform duration-500">
                          <img src={pro.foto} alt={pro.nome || "Psicólogo"} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center text-3xl border-4 border-white shadow-lg">
                            <span className="font-bold text-slate-400">{(pro.nome || "?").charAt(0)}</span>
                        </div>
                      )}
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg border-2 border-white">
                        <Star className="w-5 h-5 fill-current" />
                      </div>
                   </div>
                    
                    {pro.plano === 'DUO_II' && (
                      <div className="bg-blue-100 text-blue-600 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">Destaque</div>
                    )}
                </div>

                <div className="space-y-1 mb-8">
                  <h4 className="font-black text-slate-900 text-xl uppercase tracking-tight italic line-clamp-1">{pro.nome || "Profissional"}</h4>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-4 h-[1px] bg-blue-600"></span>
                    {pro.abordagem || "Psicologia"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-10">
                  {(pro.temas || []).slice(0, 3).map((tema, t) => (
                    <span key={t} className="text-[9px] bg-slate-50 text-slate-500 px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider">
                      {tema}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-4">
                   <Link href={`/perfil/${pro.slug || pro.id}`}>
                      <button className="w-full h-14 border-2 border-slate-900 group-hover:bg-slate-900 group-hover:text-white text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all duration-300">
                        Ver Perfil Completo
                      </button>
                   </Link>
                </div>
              </div>
            </div>
          ))}
          
          <Link href="/catalogo" className="snap-start shrink-0 w-[280px] flex group py-4">
            <div className="w-full bg-slate-900 rounded-[3rem] flex flex-col items-center justify-center text-center p-10 space-y-8 hover:scale-[1.02] transition-transform duration-500 shadow-2xl">
               <div className="w-20 h-20 rounded-2xl bg-white/10 text-white flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-500">
                 <Plus className="w-10 h-10" />
               </div>
               <div className="space-y-2">
                 <p className="text-white font-black uppercase text-[14px] tracking-widest leading-none">Ver Catálogo</p>
                 <p className="text-slate-400 text-[11px] font-medium">+ de 50 especialistas</p>
               </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};
