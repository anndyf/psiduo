import Navbar from "@/components/Navbar";
import Link from "next/link";

export const metadata = {
  title: "Política de Privacidade | PsiDuo",
};

export default function PoliticaPrivacidade() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="container mx-auto max-w-4xl py-12 px-6 lg:px-8">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-2 uppercase tracking-tight">Política de Privacidade</h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-12 border-b pb-8">Última atualização: 25 de Janeiro de 2026</p>
        
        <div className="prose prose-slate max-w-none text-slate-600 font-medium space-y-8 leading-relaxed">
          
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 uppercase">1. Introdução</h2>
            <p className="text-justify indent-0">
              A sua privacidade é nossa prioridade absoluta. O <strong>PsiDuo</strong> compromete-se a proteger e respeitar a privacidade de todos os usuários de nossa plataforma, sejam eles psicólogos ou pacientes. Esta Política de Privacidade explica como coletamos, usamos, compartilhamos e protegemos suas informações pessoais, em total conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)</strong> e as diretrizes do Conselho Federal de Psicologia (CFP).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 uppercase">2. Dados que Coletamos</h2>
            <p>Coletamos minimamente os dados necessários para o funcionamento pleno da plataforma:</p>
            <ul className="list-disc pl-6 space-y-2 marker:text-blue-500">
              <li><strong>Dados de Identificação:</strong> Nome completo, CPF, e-mail e telefone;</li>
              <li><strong>Dados Profissionais (Psicólogos):</strong> Número do CRP (Conselho Regional de Psicologia) e informações de carreira;</li>
              <li><strong>Dados Sensíveis (Pacientes):</strong> Registros de diário emocional (humor, sono, anotações pessoais), que são tratados com sigilo absoluto.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 uppercase">3. Como Usamos Seus Dados</h2>
            <p>Os dados são utilizados exclusivamente para:</p>
            <ul className="list-disc pl-6 space-y-2 marker:text-blue-500">
              <li>Permitir o acesso e uso das funcionalidades da plataforma (Diário, Painel do Psicólogo);</li>
              <li>Facilitar a comunicação terapêutica entre Psicólogo e Paciente vinculados;</li>
              <li>Melhorar a segurança e performance do sistema;</li>
              <li>Cumprir obrigações legais e regulatórias.</li>
            </ul>
            <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100">
              <p className="text-sm text-yellow-800 font-bold">⚠️ IMPORTANTE: O PsiDuo NÃO vende, aluga ou compartilha seus dados pessoais ou sensíveis com terceiros para fins publicitários em hipótese alguma.</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 uppercase">4. Sigilo Profissional e Segurança</h2>
            <p className="text-justify">
              O ambiente do PsiDuo é projetado para respeitar o sigilo profissional ético da psicologia. 
              Apenas o <strong>Psicólogo vinculado</strong> tem acesso aos diários e registros de seus respectivos pacientes. 
              Nenhum outro usuário ou psicólogo da plataforma tem acesso a estas informações.
            </p>
            <p>Utilizamos criptografia (SSL/HTTPS) em todas as comunicações e práticas modernas de segurança de banco de dados para proteger suas informações contra acesso não autorizado.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 uppercase">5. Seus Direitos (LGPD)</h2>
            <p>Conforme a LGPD, você tem o direito de:</p>
            <ul className="list-disc pl-6 space-y-2 marker:text-blue-500">
              <li>Confirmar a existência de tratamento de dados;</li>
              <li>Acessar seus dados de forma facilitada;</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
              <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários;</li>
              <li>Revogar seu consentimento a qualquer momento.</li>
            </ul>
            <p>Para exercer esses direitos, entre em contato conosco através do e-mail de suporte.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 uppercase">6. Retenção de Dados</h2>
            <p className="text-justify">
              Manteremos seus dados pessoais apenas pelo tempo necessário para cumprir as finalidades para as quais os coletamos, inclusive para fins de cumprimento de quaisquer obrigações legais (como o prontuário psicológico, que deve ser guardado por 5 anos conforme Resolução CFP 01/2009), contratuais, ou de prestação de contas.
            </p>
          </section>

           <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 uppercase">7. Exclusão de Conta</h2>
             <p className="text-justify">
              O usuário pode solicitar a exclusão de sua conta a qualquer momento nas configurações do painel ou via suporte. Note que alguns dados médicos/psicológicos podem precisar ser mantidos por lei pelo seu profissional de saúde por um período determinado, independentemente da exclusão da conta na plataforma.
            </p>
          </section>

          <section className="space-y-4 pt-8 border-t">
            <h2 className="text-2xl font-black text-slate-900 uppercase">Contato</h2>
            <p>
              Se tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco pelo e-mail: <a href="mailto:suporte@psiduo.com.br" className="text-blue-600 hover:underline font-bold">suporte@psiduo.com.br</a>.
            </p>
          </section>

        </div>
      </main>
      
      <footer className="bg-slate-50 py-10 text-center border-t border-slate-200 mt-12">
           <Link href="/" className="text-xs font-black uppercase text-slate-400 hover:text-slate-600 tracking-widest transition-colors mb-4 block">Voltar ao Início</Link>
           <p className="text-xs text-slate-300">© 2026 PsiDuo. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
