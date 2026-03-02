"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "../actions";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await adminLogin(formData);

    if (res.success) {
      toast.success("Acesso autorizado!");
      router.push("/admin");
    } else {
      toast.error(res.error || "Acesso negado.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]"></div>

      <div className="bg-white w-full max-w-[440px] p-12 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative z-10 border border-white/10 animate-in fade-in zoom-in duration-700">
        
        <div className="flex flex-col items-center mb-12 text-center">
            <div className="w-20 h-20 bg-slate-950 rounded-3xl flex items-center justify-center mb-6 text-white shadow-2xl shadow-slate-900/20 group hover:rotate-6 transition-transform">
                <ShieldCheck size={40} className="text-blue-400" />
            </div>
            <div className="space-y-1">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-2 block">Restricted Environment</span>
                <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
                    PsiDuo <span className="text-blue-600">Admin</span>
                </h1>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2 px-6">Terminal de controle de ecossistema de alto desempenho.</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Usuário Autorizado</label>
                <input 
                    name="user" 
                    type="text" 
                    required 
                    className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 font-black uppercase tracking-widest text-[11px] text-slate-900 outline-none ring-2 ring-transparent focus:ring-blue-500/10 transition-all placeholder:text-slate-200"
                    placeholder="USERNAME"
                />
            </div>
            
            <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chave de Segurança</label>
                <input 
                    name="pass" 
                    type="password" 
                    required 
                    className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 font-black tracking-widest text-[11px] text-slate-900 outline-none ring-2 ring-transparent focus:ring-blue-500/10 transition-all placeholder:text-slate-200"
                    placeholder="••••••••••••"
                />
            </div>

            <div className="pt-4">
                <button 
                    disabled={loading}
                    className="w-full h-16 bg-slate-950 text-white font-black uppercase text-[11px] tracking-[0.3em] rounded-2xl shadow-2xl shadow-slate-950/20 hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-70 group relative overflow-hidden"
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {loading ? "Verificando..." : "Autenticar Acesso"}
                    </span>
                    <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                </button>
            </div>
        </form>

        <p className="mt-12 text-center text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">
            &copy; 2026 PsiDuo Enterprise &bull; Security Protocol V3.0
        </p>
      </div>
    </div>
  );
}

