import Link from "next/link";

export const MatchChoice = () => {
  return (
    <section id="match" className="py-24 bg-deep relative z-10 scroll-mt-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Qual é o seu momento?
          </h2>
          <p className="text-blue-100 max-w-xl mx-auto text-lg">
            Conectamos você ao suporte especializado tanto para jornadas individuais quanto para relacionamentos.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Link href="/quiz/individual" className="group bg-white rounded-[2rem] p-10 shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer text-center relative overflow-hidden border border-transparent hover:border-primary/20">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-300 to-primary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            <div className="w-20 h-20 bg-mist rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-deep mb-3">Individual (Uno)</h3>
            <p className="text-slate-600 mb-8 leading-relaxed">Foco no seu autoconhecimento e desenvolvimento emocional.</p>
            <div className="text-primary font-bold group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
              Começar jornada pessoal <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </div>
          </Link>

          <Link href="/quiz/casal" className="group bg-white rounded-[2rem] p-10 shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer text-center relative overflow-hidden border border-transparent hover:border-deep/20">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-deep transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            <div className="w-20 h-20 bg-mist rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-deep mb-3">Casal (Duo)</h3>
            <p className="text-slate-600 mb-8 leading-relaxed">Espaço seguro para melhorar a comunicação e fortalecer o vínculo a dois.</p>
            <div className="text-deep font-bold group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
              Começar jornada a dois <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};
