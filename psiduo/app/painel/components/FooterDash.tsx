import LogoPsiDuo from "@/components/LogoPsiDuo";

export function FooterDash() {
  return (
    <footer className="w-full py-1 mt-8 border-t border-slate-200 bg-slate-50">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-2 opacity-60 hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center gap-2">
            <LogoPsiDuo variant="dark" width={80} height={40} />
        </div>
        
        <div className="text-[10px] md:text-xs font-bold text-slate-400 text-center md:text-right uppercase tracking-wider">
          <p>© {new Date().getFullYear()} PsiDuo Tecnologia. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
