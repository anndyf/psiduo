import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const Plans = () => {
  return (
    <>
      <section className="py-24 bg-deep text-white relative z-10">
        <div className="container mx-auto px-6 text-center">
            <span className="text-primary font-bold tracking-widest uppercase text-sm mb-2 block">Para Psicólogos</span>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight max-w-3xl mx-auto">
              Leve sua carreira para o digital
            </h2>
            <p className="text-blue-100 text-lg mb-12 max-w-2xl mx-auto">
              Plataforma feita para psicólogos autônomos. Tenha visibilidade, segurança e ferramentas profissionais e sem burocracia.
            </p>
        </div>
      </section>

      <section className="py-20 bg-mist relative z-20 -mt-10 rounded-t-[3rem]">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">
            
            {/* PLANO DUO I (GRÁTIS) */}
            <Link href="/cadastro" className="h-full">
              <Card variant="white" className="h-full flex flex-col p-8 opacity-90 hover:opacity-100 group">
                  <div className="mb-6">
                      <span className="bg-gray-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Básico</span>
                      <h3 className="text-3xl font-bold text-deep mt-4">Duo I</h3>
                      <p className="text-slate-500 mt-2">Visibilidade essencial para começar.</p>
                  </div>
                  <div className="text-4xl font-bold text-deep mb-8">
                      Grátis 
                  </div>
                  
                  <ul className="space-y-4 mb-8 flex-1">
                      {[
                        "Perfil Básico no Catálogo",
                        "Recebimento de Avaliações",
                        "Botão WhatsApp Direto",
                        "Exibição do Valor da Consulta"
                      ].map(item => (
                        <li key={item} className="flex items-center text-slate-700">
                            <svg className="w-5 h-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            {item}
                        </li>
                      ))}
                  </ul>

                  <Button variant="outline" fullWidth className="group-hover:bg-slate-50">
                      Cadastrar Grátis
                  </Button>
              </Card>
            </Link>

            {/* PLANO DUO II (PREMIUM R$ 20) */}
            <Link href="/cadastro" className="h-full">
              <Card 
                variant="white" 
                className="h-full flex flex-col p-10 border-2 border-primary relative transform md:-translate-y-4 z-10 hover:shadow-primary/20"
              >
                  <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-4 py-2 rounded-bl-xl rounded-tr-2xl shadow-sm">
                      RECOMENDADO
                  </div>
                  <div className="mb-6">
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Premium</span>
                      <h3 className="text-3xl font-bold text-deep mt-4">Duo II</h3>
                      <p className="text-slate-500 mt-2">Ferramentas completas de gestão.</p>
                  </div>
                  <div className="text-5xl font-bold text-primary mb-2">
                      R$ 20,00
                  </div>
                  <div className="text-sm text-slate-400 font-normal mb-8">assinatura mensal</div>
                  
                  <ul className="space-y-5 mb-10 flex-1">
                      <li className="flex items-center text-slate-700 font-medium">
                          <span className="w-6 h-6 bg-blue-50 text-primary rounded-full flex items-center justify-center mr-3 text-sm">✓</span>
                          Tudo do plano Duo I
                      </li>
                      {[
                        { text: "Horários Disponíveis (Agenda)", highlight: true },
                        { text: "Vídeo de Apresentação" },
                        { text: "Links Redes Sociais" },
                        { text: "Visualizador de Acessos" }
                      ].map(item => (
                        <li key={item.text} className={`flex items-center ${item.highlight ? 'text-deep font-semibold' : 'text-slate-700'}`}>
                            <span className={`w-6 h-6 ${item.highlight ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-primary'} rounded-full flex items-center justify-center mr-3 ${item.highlight ? 'shadow-sm' : ''}`}>✓</span>
                            {item.text}
                        </li>
                      ))}
                  </ul>

                  <Button variant="primary" fullWidth className="group-hover:bg-blue-700 group-hover:shadow-lg transition transform group-hover:-translate-y-1">
                      Quero ser Premium
                  </Button>
              </Card>
            </Link>
          </div>
          
          <p className="text-center text-slate-400 text-sm mt-12 pb-12">
            *Planos exclusivos para psicólogos com CRP ativo. Não cobramos comissão por consulta.
          </p>
        </div>
      </section>
    </>
  );
};
