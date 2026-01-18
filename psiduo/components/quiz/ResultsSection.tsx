import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MatchResultCard } from "./MatchResultCard";

interface ResultsSectionProps {
  results: any[];
  title: string;
  description: string;
  onRedoQuiz: () => void;
  catalogLink?: string;
  catalogText?: string;
}

export const ResultsSection = ({ 
  results, 
  title, 
  description, 
  onRedoQuiz,
  catalogLink = "/catalogo",
  catalogText = "Ver Catálogo Completo"
}: ResultsSectionProps) => {
  return (
    <div className="animate-fadeIn space-y-10">
      <div className="text-center space-y-4">
        <Badge variant="primary">Match Encontrado</Badge>
        <h2 className="text-4xl font-black text-deep uppercase tracking-tighter leading-none">{title}</h2>
        <p className="text-slate-500 font-medium max-w-sm mx-auto">{description}</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {results.length > 0 ? (
          results.map((pro, idx) => (
            <MatchResultCard key={pro.id} pro={pro} isBestMatch={idx === 0} />
          ))
        ) : (
          <div className="text-center py-20 animate-fadeIn">
             <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
             <h3 className="text-xl font-black text-slate-700 uppercase mb-2">Ops! Match não encontrado.</h3>
             <p className="text-slate-500 font-medium mb-8">Não conseguimos encontrar profissionais com seu perfil exato no momento.</p>
             <Link href={catalogLink}>
                <Button variant="primary" size="lg">{catalogText}</Button>
             </Link>
          </div>
        )}
      </div>

      <div className="pt-10 flex flex-col gap-4">
        <button 
          onClick={onRedoQuiz}
          className="text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-primary transition"
        >
          Refazer Questionário
        </button>
        <Link href="/catalogo" className="text-slate-500 font-medium text-sm text-center underline">
          Prefiro navegar pelo catálogo manualmente
        </Link>
      </div>
    </div>
  );
};
