import Link from "next/link";

export default function Footer() {
  return (
    <>
      {/* 1. Barra de Aviso de Crise (Fica junto ao Footer) */}
      <div className="bg-primary text-white py-3 text-center text-xs md:text-sm px-4 relative z-30">
        <p className="max-w-4xl mx-auto leading-relaxed">
          <span className="font-bold">Importante:</span> Este site não oferece atendimento imediato para pessoas em crise suicida. 
          Em caso de emergência, ligue para <span className="font-bold text-yellow-300">188 (CVV)</span> ou procure um hospital.
        </p>
      </div>

      <footer className="bg-deep text-slate-300 pt-16 pb-8 relative z-20 text-sm font-sans">
        <div className="container mx-auto px-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            
            {/* Coluna 1: Marca e Sobre */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Psi<span className="text-primary">Duo</span></h3>
              <p className="mb-6 leading-relaxed text-slate-400 text-xs">
                Plataforma de conexão entre psicólogos e pacientes. Facilitamos o acesso à saúde mental com tecnologia, segurança e ética.
              </p>
              {/* Redes Sociais */}
              <div className="flex gap-4">
                <a href="#" target="_blank" aria-label="Instagram" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition cursor-pointer">
                   <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.069-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.069-4.849 0-3.204.013-3.583.069-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="#" target="_blank" aria-label="LinkedIn" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition cursor-pointer">
                   <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h5v-8.327c0-4.934 5.922-5.405 5.922 0v8.327h5v-9.358c0-7.799-8.749-7.533-10.954-3.646v-3.323z"/></svg>
                </a>
              </div>
            </div>

            {/* Coluna 2: Navegação (Links Next.js) */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6">Navegação</h4>
              <ul className="space-y-3">
                {/* Aqui usamos Link, tal como no Navbar */}
                <li><Link href="/" className="hover:text-primary transition">Início</Link></li>
                <li><Link href="/catalogo" className="hover:text-primary transition">Catálogo de Profissionais</Link></li>
                <li><Link href="/sou-psicologo" className="hover:text-primary transition">Para Psicólogos</Link></li>
                {/* <li><Link href="/faq" className="hover:text-primary transition">Dúvidas</Link></li> */}
                <li><Link href="/login" className="hover:text-primary transition">Login</Link></li>
              </ul>
            </div>

            {/* Coluna 3: Transparência */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6">Transparência</h4>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <p className="text-slate-400 text-xs leading-relaxed">
                  Os profissionais desta plataforma são <strong>autônomos</strong> e não possuem vínculo empregatício com o PsiDuo. Todos são devidamente verificados perante o Conselho Federal de Psicologia (CFP).
                </p>
              </div>
            </div>

            {/* Coluna 4: Contato e Legal */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6">Contato</h4>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center group cursor-pointer">
                  <span className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center mr-3 text-primary group-hover:bg-primary group-hover:text-white transition">✉</span>
                  <a href="mailto:contato@psiduo.com.br" className="group-hover:text-white transition">contato@psiduo.com.br</a>
                </li>
              </ul>
              
              <h4 className="text-white font-bold text-sm mb-4">Legal</h4>
              <div className="flex flex-col gap-2 text-xs text-slate-400">
                 <Link href="/privacidade" className="hover:text-white transition">Política de Privacidade</Link>
                 <Link href="/termos" className="hover:text-white transition">Termos de Uso</Link>
              </div>
            </div>

          </div>

          {/* Rodapé Inferior */}
          <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
            <div className="text-center md:text-left">
              <p className="mb-1">© 2026 PsiDuo Tecnologia Ltda. Todos os direitos reservados.</p>
              <p className="text-slate-600">Responsável Técnica: Dra. Andressa Mirella (CRP 06/12345)</p>
            </div>
            <p>Feito com 💙 para a psicologia.</p>
          </div>
        </div>
      </footer>
    </>
  );
}