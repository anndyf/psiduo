export const DiaryPromo = () => {
  return (
    <section className="py-24 bg-slate-50 px-6 overflow-hidden border-t border-slate-200">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Texto Explicativo */}
          <div className="flex-1 space-y-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-blue-600/10 border border-blue-600/20 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">Gestão Clínica</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 leading-tight">
              O sistema operacional <br/><span className="text-blue-600">da sua clínica digital.</span>
            </h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-lg">
              Deixe de lado as planilhas e processos manuais. O PsiDuo centraliza toda a sua operação em uma interface nítida, intuitiva e segura.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
              {[
                { title: 'Gestão de Agenda', desc: 'Sincronização inteligente e controle de horários própria.', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
                { title: 'Prontuário Digital', desc: 'Histórico clínico seguro e evoluções estruturadas.', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
                { title: 'Instrumentos Pro', desc: 'Aplicação de escalas (ISI, WHO5) com score automático.', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> },
                { title: 'Controle Financeiro', desc: 'Fluxo de caixa completo e taxa 0% sobre consultas.', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> }
              ].map((feature, i) => (
                <div key={i} className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex flex-col gap-2 hover:border-blue-200 transition-colors group">
                   <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">{feature.icon}</svg>
                   </div>
                   <div>
                      <h4 className="font-bold text-slate-900 text-xs">{feature.title}</h4>
                      <p className="text-[10px] text-slate-500">{feature.desc}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>

          {/* Imagens (Mockups) */}
          <div className="flex-1 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-100 rounded-full blur-3xl -z-10 opacity-50"></div>
            
            <div className="relative z-10 flex items-center justify-center">
              <div className="rounded-xl overflow-hidden shadow-2xl border border-slate-200 bg-white p-2 transform rotate-2 hover:rotate-0 transition-all duration-500">
                <img src="/images/pacientes.png" alt="Gestão de Pacientes" className="w-full h-auto rounded-lg shadow-inner" />
              </div>
              
              <div className="absolute -bottom-6 -right-4 w-1/3 rounded-[1.5rem] overflow-hidden shadow-2xl border-4 border-white bg-white p-1 transform -rotate-3 hover:rotate-0 transition-all duration-500">
                <img src="/images/diario.png" alt="Diário de Humor" className="w-full h-auto rounded-[1.2rem]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
