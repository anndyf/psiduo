import Navbar from "@/components/Navbar";
import Link from "next/link";

export const metadata = {
  title: "Termos de Uso | PsiDuo",
};

export default function TermosUso() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="container mx-auto max-w-4xl py-12 px-6 lg:px-8">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-2 uppercase tracking-tight">Termos de Uso</h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-12 border-b pb-8">Última atualização: 25 de Janeiro de 2026</p>
        
        <div className="prose prose-slate max-w-none text-slate-600 font-medium space-y-8 leading-relaxed">
          
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 uppercase">1. Aceitação dos Termos</h2>
            <p className="text-justify indent-0">
              Ao acessar e utilizar a plataforma <strong>PsiDuo</strong>, você concorda expressamente com estes Termos de Uso e com nossa Política de Privacidade. Se você não concordar com qualquer disposição destes termos, não deve utilizar nossos serviços.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 uppercase">2. Descrição do Serviço</h2>
            <p>
              O PsiDuo é uma plataforma tecnológica que facilita a gestão de consultórios de psicologia e o acompanhamento terapêutico de pacientes.
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-blue-500">
              <li><strong>Para Psicólogos:</strong> Oferecemos ferramentas de gestão de pacientes, diário clínico, criação de perfil profissional e visibilidade online.</li>
              <li><strong>Para Pacientes:</strong> Oferecemos uma ferramenta de diário emocional (Wellness Tracker) conectada ao seu profissional de confiança.</li>
            </ul>
             <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <p className="text-sm text-blue-800 font-bold">⚠️ IMPORTANTE: O PsiDuo NÃO presta serviços de saúde, emergência ou plantão psicológico. A plataforma é uma ferramenta meio para profissionais autônomos.</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 uppercase">3. Responsabilidades</h2>
            
            <h3 className="text-lg font-black text-slate-800 uppercase mt-4">3.1. Do Profissional (Psicólogo)</h3>
            <p className="text-justify">
              O psicólogo é inteiramente responsável pela veracidade de suas informações profissionais (incluindo regularidade no CRP), pelo conteúdo dos atendimentos e pelo sigilo das informações de seus pacientes, devendo agir em conformidade com o Código de Ética Profissional do Psicólogo.
            </p>

            <h3 className="text-lg font-black text-slate-800 uppercase mt-4">3.2. Do Paciente</h3>
            <p className="text-justify">
              O paciente compromete-se a fornecer informações verdadeiras e a utilizar a plataforma de boa fé. O paciente entende que o registo no diário não substitui uma sessão de terapia e que em casos de urgência deve procurar serviços de emergência (como o CVV no 188 ou hospitais).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 uppercase">4. Planos e Pagamentos</h2>
            <p>
              O uso da plataforma para psicólogos pode estar sujeito ao pagamento de planos de assinatura. Os valores e funcionalidades de cada plano estão descritos na página de planos. O não pagamento pode implicar na suspensão ou limitação do acesso às ferramentas premium.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 uppercase">5. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo, design, código, logotipos e marcas presentes no PsiDuo são de propriedade exclusiva da plataforma ou de seus licenciadores. É proibida a cópia, reprodução ou distribuição não autorizada deste material.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 uppercase">6. Modificações</h2>
            <p>
              O PsiDuo reserva-se o direito de alterar estes Termos de Uso a qualquer momento. Alterações significativas serão notificadas aos usuários. O uso continuado da plataforma após as alterações implica na aceitação dos novos termos.
            </p>
          </section>
          
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 uppercase">7. Foro</h2>
            <p>
              Fica eleito o Foro da Comarca de [Sua Cidade/Estado], para dirimir quaisquer dúvidas oriundas destes Termos, com renúncia expressa a qualquer outro.
            </p>
          </section>

          <section className="space-y-4 pt-8 border-t">
            <h2 className="text-2xl font-black text-slate-900 uppercase">Contato</h2>
            <p>
              Dúvidas? Entre em contato pelo e-mail: <a href="mailto:suporte@psiduo.com.br" className="text-blue-600 hover:underline font-bold">suporte@psiduo.com.br</a>.
            </p>
          </section>

        </div>
      </main>
      
      <footer className="bg-slate-50 py-10 text-center border-t border-slate-200 mt-12">
            <div className="flex justify-center gap-6 mb-4">
                <Link href="/" className="text-xs font-black uppercase text-slate-400 hover:text-slate-600 tracking-widest transition-colors">Início</Link>
                <Link href="/privacidade" className="text-xs font-black uppercase text-slate-400 hover:text-slate-600 tracking-widest transition-colors">Privacidade</Link>
            </div>
           <p className="text-xs text-slate-300">© 2026 PsiDuo. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
