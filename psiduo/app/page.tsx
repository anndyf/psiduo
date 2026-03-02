"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, ChevronRight, Sparkles, ShieldCheck, Heart, Search, ClipboardList, ShieldAlert } from "lucide-react";
import LogoPsiDuo from "@/components/LogoPsiDuo";

const PsiIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 100 100" 
    className={className}
    fill="currentColor"
  >
    <text x="50%" y="50%" fontSize="80" textAnchor="middle" dominantBaseline="middle" fontFamily="serif" fontWeight="bold">
      Ψ
    </text>
  </svg>
);

export default function HomeSelection() {
  const [hasVisited, setHasVisited] = useState(false);

  useEffect(() => {
    const visited = localStorage.getItem("psiduo_selection_made");
    if (visited) {
      // Se já escolheu antes, podemos redirecionar ou mostrar um botão de "voltar"
      // Por enquanto vamos apenas manter o estado para uso futuro
      setHasVisited(true);
    }
  }, []);

  const saveSelection = (type: "paciente" | "psicologo") => {
    localStorage.setItem("psiduo_selection_made", type);
  };

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden font-sans selection:bg-blue-500/30">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(11,30,59,0.8),rgba(2,6,23,1))]" />
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        {/* Luminous Orbs */}
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto max-w-6xl flex-1 flex flex-col items-center justify-center px-6 py-20 relative z-10">
        
        {/* LOGO AREA */}
        <div className="mb-16 animate-in fade-in zoom-in duration-1000">
           <LogoPsiDuo variant="light" width={180} height={90} />
        </div>

        {/* WELCOME TEXT */}
        <div className="text-center mb-16 space-y-4 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight tracking-tighter">
                Bem-vindo ao <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">PsiDuo.</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium">
                Escolha o perfil de acesso para continuarmos sua jornada.
            </p>
        </div>

        {/* SELECTION CARDS */}
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
            
            {/* PACIENTE CARD */}
            <Link 
                href="/sou-paciente" 
                onClick={() => saveSelection("paciente")}
                className="group relative bg-white/5 border border-white/10 rounded-[2.5rem] p-10 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-500 flex flex-col items-center text-center overflow-hidden"
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-colors" />
                
                <div className="w-20 h-20 bg-blue-500/10 border border-blue-500/20 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-2xl shadow-blue-500/5">
                    <Heart className="w-10 h-10 text-blue-400" />
                </div>

                <div className="space-y-4 mb-8">
                    <h2 className="text-3xl font-black text-white tracking-tight leading-none">Sou Paciente</h2>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-[240px]">
                        Busco terapeutas, grupos e quero utilizar o meu Diário de Emoções.
                    </p>
                </div>

                <div className="mt-auto inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 group-hover:text-blue-300 transition-colors">
                    Entrar como Paciente <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
            </Link>

            {/* PSICOLOGO CARD */}
            <Link 
                href="/sou-psicologo" 
                onClick={() => saveSelection("psicologo")}
                className="group relative bg-white/5 border border-white/10 rounded-[2.5rem] p-10 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-500 flex flex-col items-center text-center overflow-hidden"
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-colors" />

                <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-2xl shadow-indigo-500/5">
                    <PsiIcon className="w-10 h-10 text-indigo-400" />
                </div>

                <div className="space-y-4 mb-8">
                    <h2 className="text-3xl font-black text-white tracking-tight leading-none">Sou Psicólogo</h2>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-[240px]">
                        Quero gerenciar meu consultório e ferramentas clínicas de alta performance.
                    </p>
                </div>

                <div className="mt-auto inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 group-hover:text-indigo-300 transition-colors">
                    Entrar como Profissional <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
            </Link>

        </div>

        {/* TRUST INDICATORS */}
        <div className="mt-20 flex flex-wrap justify-center gap-8 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
            <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-white" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Privacidade Absoluta</span>
            </div>
            <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-white" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Match de Afinidade</span>
            </div>
            <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-white" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Ética e Sigilo Profissional</span>
            </div>
        </div>

      </div>

      <footer className="py-8 text-center relative z-10">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">
              &copy; {new Date().getFullYear()} PsiDuo - Tecnologia Humana
          </p>
      </footer>
    </main>
  );
}