export const DiaryPromo = () => {
  return (
    <section className="py-24 bg-slate-50 px-6 overflow-hidden border-t border-slate-200">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Texto Explicativo */}
          <div className="flex-1 space-y-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-blue-600/10 border border-blue-600/20 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">Exclusividade Duo II</span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">Pacientes Ilimitados</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none">
              O <span className="text-blue-600">Elo Perdido</span> <br/> Entre as Sessões.
            </h2>
            <p className="text-slate-500 text-lg font-medium leading-relaxed">
              Muitas vezes, o que acontece entre uma sessão e outra é perdido. Com o módulo de <strong>Diário de Pacientes</strong>, você cadastra <span className="text-slate-900 font-bold underline decoration-blue-600/30 decoration-2 underline-offset-2">quantos pacientes quiser</span>, sem limites. Eles registram humor e sono diariamente, e você recebe tudo em um painel clínico organizado.
            </p>
            
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">Para o Paciente</h4>
                  <p className="text-xs text-slate-500">Interface simples, amigável e gamificada.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-12 h-12 bg-slate-900/10 rounded-xl flex items-center justify-center text-slate-900">
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
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-blue-600/20 to-blue-200/20 rounded-full blur-3xl -z-10"></div>
            
            <div className="relative z-10">
              {/* Painel Desktop */}
              <div className="rounded-xl overflow-hidden shadow-2xl border-4 border-white transform hover:scale-[1.02] transition-transform duration-500">
                <img src="/painel_mockup.png" alt="Painel de Gerenciamento do Psicólogo" className="w-full h-auto" />
              </div>
              
              {/* Gráficos (Floating Left) */}
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
  );
};
