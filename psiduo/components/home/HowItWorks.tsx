export const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: "Setup de Perfil",
      description: "Cadastre seu CRP, crie seu perfil público enriquecido com vídeo e especialidades.",
      highlight: "Verificação Instantânea."
    },
    {
      number: 2,
      title: "Configuração Clínica",
      description: "Defina seus horários na agenda, configure seus valores de sessão e ferramentas de diário.",
    },
    {
      number: 3,
      title: "Operação Ativa",
      description: "Apareça no catálogo, receba solicitações via WhatsApp e gerencie tudo pelo painel.",
    }
  ];

  return (
    <section className="py-24 bg-white relative z-10 border-t border-slate-100">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
              Sua clínica digital em <br/><span className="text-blue-600">3 passos simples.</span>
            </h2>
          </div>
          <p className="text-slate-500 max-w-md text-sm leading-relaxed">
            Uma transição suave do manual para o automático, com suporte total em cada etapa do processo.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step) => (
            <div key={step.number} className="relative p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 group">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-lg group-hover:bg-blue-600 transition-colors">
                0{step.number}
              </div>
              
              <div className="space-y-4 pt-2">
                <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {step.description}
                </p>
                
                {step.highlight && (
                  <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    <span className="w-1 h-1 rounded-full bg-blue-600 animate-pulse"></span>
                    {step.highlight}
                  </div>
                )}
                

              </div>
            </div>
          ))}
        </div>


      </div>
    </section>
  );
};
