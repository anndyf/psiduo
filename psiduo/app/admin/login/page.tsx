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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm p-8 rounded-3xl shadow-2xl animate-in zoom-in duration-300">
        <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-800">
                <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">PsiDuo Admin</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Acesso Restrito</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Usuário</label>
                <input 
                    name="user" 
                    type="text" 
                    required 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-slate-400 transition"
                    placeholder="Usuário Admin"
                />
            </div>
            
            <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Senha</label>
                <input 
                    name="pass" 
                    type="password" 
                    required 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-slate-400 transition"
                    placeholder="••••••••"
                />
            </div>

            <button 
                disabled={loading}
                className="w-full bg-slate-900 text-white font-black uppercase text-xs tracking-[0.2em] py-4 rounded-xl shadow-lg hover:bg-black transition-all disabled:opacity-70 mt-4"
            >
                {loading ? "Verificando..." : "Entrar no Sistema"}
            </button>
        </form>
      </div>
    </div>
  );
}
