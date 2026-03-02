import Link from "next/link";

export const MatchChoice = () => {
  return (
    <section id="growth" className="py-24 bg-slate-900 relative z-10 scroll-mt-24 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-2">Visibilidade Estratégica</div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Sua vitrine profissional, <br/><span className="text-blue-500">potencializando conexões.</span>
            </h2>
          </div>
          <p className="text-slate-400 max-w-sm text-sm leading-relaxed">
            O PsiDuo oferece as ferramentas para que sua presença digital trabalhe por você, facilitando o encontro com pacientes que buscam exatamente seu perfil.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { 
              title: "Vitrine de Perfil", 
              desc: "Seu perfil otimizado para conversão, com vídeo de apresentação e especialidades em destaque.",
              icon: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>,
              label: "Visibilidade"
            },
            { 
              title: "Conexão com Pacientes", 
              desc: "Nosso algoritmo filtra pacientes com base na sua abordagem e nicho, garantindo conexões mais assertivas.",
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />,
              label: "Algoritmo"
            },
            { 
              title: "Zero Intermediação", 
              desc: "Receba 100% do valor da sua consulta diretamente do paciente. Sem taxas, sem surpresas.",
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
              label: "100% Seu"
            }
          ].map((item, i) => (
            <div key={i} className="group bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 relative flex flex-col items-start text-left">
              <div className="absolute top-4 right-4 bg-blue-500/20 text-blue-400 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border border-blue-500/30">
                {item.label}
              </div>
              
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-white/5 border border-white/10 group-hover:scale-110 transition-transform`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-white`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {item.icon}
                </svg>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-slate-400 mb-8 text-xs leading-relaxed">{item.desc}</p>
              
              <div className="mt-auto text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors flex items-center gap-2">
                Ver detalhes <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
