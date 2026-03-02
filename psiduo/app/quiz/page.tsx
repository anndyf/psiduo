"use client";

import Link from "next/link";
import { User, Users, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function QuizLandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center p-6 pb-20">
       
       {/* Background Gradients */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
       </div>

       {/* Back Button */}
       <button onClick={() => router.back()} className="absolute top-6 left-6 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition z-10">
          <ArrowLeft size={24} />
       </button>

       <div className="max-w-4xl w-full relative z-10 animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tighter">
                Qual é o seu momento?
            </h1>
            <p className="text-slate-400 font-medium text-lg max-w-xl mx-auto leading-relaxed">
               Selecione a jornada que melhor se adapta às suas necessidades atuais.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
             {/* Card Individual */}
             <Link href="/quiz/individual" className="group relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-[2rem] p-10 transition-all hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col items-center text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative z-10 bg-slate-800 w-20 h-20 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-lg shadow-black/20">
                   <User size={32} strokeWidth={2.5} />
                </div>
                <h3 className="relative z-10 text-2xl font-black text-white mb-2">Individual (Uno)</h3>
                <p className="relative z-10 text-slate-400 mb-8 leading-relaxed text-sm">
                    Foco no seu autoconhecimento, superação de desafios e desenvolvimento emocional.
                </p>
                <div className="relative z-10 mt-auto bg-slate-800/50 text-indigo-300 font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-full group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    Começar Jornada
                </div>
             </Link>

             {/* Card Casal */}
             <Link href="/quiz/casal" className="group relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-[2rem] p-10 transition-all hover:-translate-y-1 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 flex flex-col items-center text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10 bg-slate-800 w-20 h-20 rounded-2xl flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300 shadow-lg shadow-black/20">
                   <Users size={32} strokeWidth={2.5} />
                </div>
                 <h3 className="relative z-10 text-2xl font-black text-white mb-2">Casal (Duo)</h3>
                 <p className="relative z-10 text-slate-400 mb-8 leading-relaxed text-sm">
                    Espaço seguro para melhorar a comunicação, resolver conflitos e fortalecer o vínculo.
                </p>
                <div className="relative z-10 mt-auto bg-slate-800/50 text-purple-300 font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-full group-hover:bg-purple-500 group-hover:text-white transition-all">
                    Começar Jornada
                </div>
             </Link>
          </div>
       </div>
    </div>
  )
}
