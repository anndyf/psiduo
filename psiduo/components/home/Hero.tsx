import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const Hero = () => {
  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="absolute inset-0 z-0">
        <Image 
          src="/fundo.png"
          alt="Textura de ondas em aquarela"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-white/0"></div>
      </div>

      <section className="relative z-10 flex flex-col items-center justify-center container mx-auto px-4 py-20 flex-1 text-center">
        <div className="bg-white/80 backdrop-blur-md rounded-[3rem] shadow-2xl shadow-blue-900/10 border border-white/60 max-w-4xl mx-auto overflow-hidden">
          
          <div className="p-8 md:p-12 pb-8">


              <h1 className="text-4xl lg:text-7xl font-black text-deep leading-tight mb-6 tracking-tight">
                Do encontro consigo <br/>
                <span className="text-primary">ao encontro com o outro.</span>
              </h1>
              
              <p className="text-lg lg:text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed mb-10">
                Navegue pelas suas emoções com segurança. Conectamos você ao psicólogo ideal através de uma <strong>conexão</strong> inteligente e humanizada.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center w-full items-center">
                <Link href="#match" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto min-w-[200px] h-14 text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">
                    Começar Conexão
                  </Button>
                </Link>
                
                <Link href="/catalogo" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto min-w-[180px] h-14 border-2 bg-transparent hover:bg-blue-50 text-slate-600 text-sm font-black uppercase tracking-widest">
                    Ver Catálogo
                  </Button>
                </Link>
              </div>
          </div>

          {/* Footer do Card - Stats */}
          <div className="bg-slate-50/80 border-t border-white/50 p-6 flex flex-wrap justify-center gap-8 md:gap-16 text-center">
             <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-slate-800">100%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verificados</span>
             </div>
             <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
             <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-slate-800">0%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Taxas</span>
             </div>

          </div>

        </div>
      </section>
    </div>
  );
};
