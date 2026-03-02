import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const Hero = () => {
  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden bg-slate-900">
      {/* System Background Effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(11,30,59,0.8),rgba(2,6,23,1))]"></div>
        <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        {/* Animated Glows */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <section className="relative z-10 container mx-auto px-6 pt-24 pb-12 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm px-3 py-1 rounded-full text-blue-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">SaaS de Gestão Clínica Integrada</span>
          </div>

          <h1 className="text-4xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
            A revolução digital da <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">sua prática clínica.</span>
          </h1>
          
          <p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Potencialize seu consultório com <strong className="text-white">recursos de ponta</strong>. A plataforma completa para o <strong>psicólogo autônomo</strong>: prontuário, instrumentos, agenda e financeiro em um só lugar.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link href="/cadastro" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto min-w-[220px] h-12 bg-blue-600 hover:bg-blue-700 text-white border-0 text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20">
                Criar Conta Grátis
              </Button>
            </Link>
            
            <Link href="/recursos" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto min-w-[200px] h-12 border-white/10 bg-white/5 hover:bg-white/10 text-white text-[11px] font-black uppercase tracking-[0.2em] backdrop-blur-sm">
                Explorar Recursos
              </Button>
            </Link>
          </div>

          {/* Device Mockup Preview */}
          <div className="pt-12 relative">
             <div className="absolute inset-0 bg-blue-500/20 blur-[100px] -z-10 rounded-full"></div>
             <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-2 shadow-2xl backdrop-blur-xl">
                <div className="rounded-xl overflow-hidden border border-white/5 relative group">
                   <img src="/images/painel.png" alt="Dashboard Preview" className="w-full h-auto object-cover opacity-90 transition-all duration-700 group-hover:opacity-100 group-hover:scale-[1.01]" />
                   
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};
