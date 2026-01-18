export const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: "Faça o Match",
      description: "Responda ao nosso questionário rápido. O sistema filtra e apresenta os profissionais ideais para sua necessidade.",
      highlight: "Serviço 100% Gratuito."
    },
    {
      number: 2,
      title: "Analise e Escolha",
      description: "Veja o perfil completo, vídeo de apresentação, valores e especialidades. Você tem total liberdade para escolher quem mais lhe agrada."
    },
    {
      number: 3,
      title: "Conexão Direta",
      description: "Clique no botão e fale diretamente no WhatsApp do psicólogo.",
      footer: "Pagamento direto ao profissional."
    }
  ];

  return (
    <section className="py-24 bg-white relative z-10">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-deep mb-4">
            Como funciona o PsiDuo?
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            Um processo simples, gratuito para pacientes e sem intermediários. Você no controle da sua jornada.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto relative mb-16">
          {/* Linha conectora (Desktop) */}
          <div className="hidden md:block absolute top-12 left-0 w-full h-1 bg-blue-50 -z-10"></div>

          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-white border-4 border-blue-50 rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:border-primary transition-colors duration-300 relative">
                <span className="text-4xl font-bold text-primary">{step.number}</span>
              </div>
              <h3 className="text-xl font-bold text-deep mb-3">{step.title}</h3>
              <p className="text-slate-600 px-4 text-sm leading-relaxed">
                {step.description}
                {step.highlight && (
                  <span className="block mt-2 font-bold text-primary">{step.highlight}</span>
                )}
                {step.footer && (
                  <span className="block mt-2 text-slate-500 font-medium bg-slate-50 py-1 px-2 rounded">
                    {step.footer}
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto text-center border-t border-slate-100 pt-8">
           <p className="text-sm text-slate-400 leading-relaxed">
             <span className="font-bold text-slate-500">Nota de Transparência:</span> O PsiDuo atua apenas como facilitador da conexão. 
             Não cobramos taxas sobre as consultas e não interferimos na agenda. Toda a negociação é privada entre você e o psicólogo.
           </p>
        </div>
      </div>
    </section>
  );
};
