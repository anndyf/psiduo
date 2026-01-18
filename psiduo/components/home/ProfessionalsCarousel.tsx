import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Professional {
  id: string;
  nome: string;
  foto?: string | null;
  abordagem: string;
  temas: string[];
  plano: string;
  slug?: string | null;
}

interface ProfessionalsCarouselProps {
  professionals: Professional[];
}

export const ProfessionalsCarousel = ({ professionals }: ProfessionalsCarouselProps) => {
  const bgColors = [
    "bg-blue-100", "bg-indigo-100", "bg-teal-100", "bg-green-100", "bg-rose-100", "bg-amber-100"
  ];

  return (
    <section className="py-24 bg-white relative z-10 overflow-hidden">
      <div className="container mx-auto px-6">
        
        <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between mb-12 gap-6 text-center lg:text-left">
          <div className="max-w-xl">
            <span className="text-primary font-bold tracking-widest uppercase text-sm mb-2 block">Nosso Time</span>
            <h2 className="text-3xl lg:text-5xl font-bold text-deep mb-4">
              Conheça os profissionais disponíveis
            </h2>
            <p className="text-slate-600 text-lg">
              Psicólogos verificados. Deslize para explorar.
            </p>
          </div>
          <div className="hidden lg:flex gap-4">
             <Button variant="outline" className="w-12 h-12 rounded-full !p-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
             </Button>
             <Button variant="outline" className="w-12 h-12 rounded-full !p-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
             </Button>
          </div>
        </div>

        <div className="flex overflow-x-auto gap-6 pb-16 -mx-6 px-6 lg:mx-0 lg:px-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          
          {professionals.map((pro, index) => (
            <div 
              key={pro.id} 
              className="relative snap-center shrink-0 w-[280px] md:w-[320px]"
            >
              <Card 
                variant={pro.plano === 'DUO_II' ? 'deep' : 'white'}
                className="h-full p-8 flex flex-col group"
              >
                {pro.plano === 'DUO_II' && (
                    <div className="absolute top-6 right-6">
                        <span className="flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-400"></span>
                        </span>
                    </div>
                )}

                {pro.foto ? (
                  <div className={`w-20 h-20 rounded-full mb-6 overflow-hidden shadow-sm group-hover:scale-110 transition-transform duration-300 border-2 ${pro.plano === 'DUO_II' ? 'border-blue-400/30' : 'border-white'}`}>
                    <img src={pro.foto} alt={pro.nome || "Psicólogo"} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className={`w-20 h-20 ${bgColors[index % bgColors.length]} rounded-full mb-6 flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                      <span className={`font-bold opacity-60 text-deep`}>
                        {(pro.nome || "?").charAt(0)}
                      </span>
                  </div>
                )}
                
                <h4 className={`font-bold text-xl mb-1 line-clamp-1 ${pro.plano === 'DUO_II' ? 'text-white' : 'text-deep'}`}>
                  {pro.nome || "Profissional"}
                </h4>
                <p className={`text-[10px] font-bold mb-3 uppercase tracking-wider ${pro.plano === 'DUO_II' ? 'text-blue-300' : 'text-primary'}`}>
                  {pro.abordagem || "Psicologia"}
                </p>
                <p className={`text-sm mb-8 leading-relaxed line-clamp-2 ${pro.plano === 'DUO_II' ? 'text-slate-400' : 'text-slate-500'}`}>
                  {pro.temas && pro.temas.length > 0 ? pro.temas.slice(0, 3).join(" • ") : "Diversos temas"}
                </p>
                
                <div className="mt-auto">
                  <Link href={`/perfil/${pro.slug || pro.id}`}>
                    <Button 
                      variant={pro.plano === 'DUO_II' ? 'primary' : 'secondary'}
                      fullWidth
                    >
                      Ver Perfil
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          ))}

          <Link 
            href="/catalogo"
            className="snap-center shrink-0 w-[200px] flex items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 hover:border-primary hover:bg-blue-50/50 transition cursor-pointer"
          >
              <div className="text-center p-6">
                  <span className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 text-primary shadow-sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </span>
                  <p className="text-deep font-bold">Ver Catálogo</p>
              </div>
          </Link>
        </div>
      </div>
    </section>
  );
};
