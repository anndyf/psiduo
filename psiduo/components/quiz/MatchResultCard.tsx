import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface MatchResultCardProps {
  pro: any;
  isBestMatch?: boolean;
}

export const MatchResultCard = ({ pro, isBestMatch }: MatchResultCardProps) => {
  return (
    <Card 
      variant="white"
      className={`relative p-6 lg:p-8 flex flex-col md:flex-row gap-6 ${
        isBestMatch ? "border-primary/20 ring-4 ring-primary/5" : "border-slate-100"
      }`}
    >
      {isBestMatch && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="deep" className="px-4 py-1.5 shadow-lg">
            Melhor Conexão
          </Badge>
        </div>
      )}
      
      <div className="shrink-0 flex flex-col items-center">
        <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border-2 border-white">
          {pro.foto ? (
            <img src={pro.foto} alt={pro.nome} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-blue-50 flex items-center justify-center text-3xl font-bold text-primary">
              {pro.nome.charAt(0)}
            </div>
          )}
        </div>
        <div className="mt-4 text-center">
          <Badge variant="green">
            R$ {pro.preco}
          </Badge>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-xl font-black text-slate-800 truncate">{pro.nome}</h3>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">{pro.abordagem}</p>
          </div>
          <div className="shrink-0 flex flex-col items-end">
             <span className="text-[20px] font-black text-primary leading-none">{Math.round((pro.score / 50) * 100)}%</span>
             <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Afinidade</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {pro.temas.slice(0, 3).map((t: string) => (
            <Badge key={t} variant="slate" className="normal-case">
              {t}
            </Badge>
          ))}
        </div>

        <p className="text-xs text-slate-500 leading-relaxed italic line-clamp-2">
          "{pro.biografia || "Profissional especializado pronto para te acolher."}"
        </p>

        <Link href={`/perfil/${pro.slug || pro.id}`}>
          <Button variant="deep" size="sm" fullWidth className="gap-2">
             Ver Perfil Completo
             <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </Button>
        </Link>
      </div>
    </Card>
  );
};
