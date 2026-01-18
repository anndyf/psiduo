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
        <div className="bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-3xl shadow-xl border border-white/50 max-w-3xl mx-auto">
          <h1 className="text-4xl lg:text-6xl font-bold text-deep leading-tight mb-4 tracking-tight">
            Do encontro consigo <br/>
            <span className="text-primary">ao encontro com o outro.</span>
          </h1>
          <p className="text-lg lg:text-xl text-slate-700 font-medium max-w-2xl mx-auto leading-relaxed mb-0">
            Navegue pelas suas emoções com segurança. Conectamos você ao psicólogo ideal através de um match inteligente e humanizado.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full mt-8 items-center">
          <Link href="#match" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" fullWidth>
              Começar Conexão
            </Button>
          </Link>
          
          <Link href="/catalogo" className="w-full sm:w-auto">
            <Button variant="white" size="lg" fullWidth>
              Ver Catálogo
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
