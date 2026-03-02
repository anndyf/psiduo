"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Users, Lock } from "lucide-react";
import { toast } from "sonner";

interface GrupoLoginClientProps {
    grupo: {
        id: string;
        titulo: string;
        descricao: string;
        psicologo: {
            nome: string;
            foto: string | null;
        };
    };
}

export default function GrupoLoginClient({ grupo }: GrupoLoginClientProps) {
    const router = useRouter();
    const [cpf, setCpf] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!cpf.trim()) {
            toast.error("Digite seu CPF");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/grupo/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ grupoId: grupo.id, cpf })
            });

            const data = await res.json();

            if (data.success) {
                // Redirecionar para o painel do grupo com token
                router.push(`/grupo/${grupo.id}/painel?token=${data.token}`);
            } else {
                toast.error(data.error || "CPF não encontrado neste grupo");
            }
        } catch (e) {
            toast.error("Erro ao fazer login");
        } finally {
            setLoading(false);
        }
    };

    const formatCPF = (value: string) => {
        const numbers = value.replace(/\D/g, "");
        if (numbers.length <= 11) {
            return numbers
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        }
        return value;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center p-4">
            <div className="mb-8">
                 <span className="text-3xl font-bold tracking-tight text-slate-800 font-logo">
                    PsiDuo<span className="text-amber-500">.</span>
                 </span>
            </div>
            <div className="w-full max-w-md">
                {/* Card Principal */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
                    
                    {/* Header com info do grupo */}
                    <div className="bg-gradient-to-r from-deep to-blue-600 p-8 text-white text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                        
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Users size={32} className="text-white" />
                            </div>
                            <h1 className="text-2xl font-black uppercase tracking-tight mb-2">
                                {grupo.titulo}
                            </h1>
                            <p className="text-sm text-blue-100 font-medium">
                                Grupo Terapêutico
                            </p>
                        </div>
                    </div>

                    {/* Informações do Psicólogo */}
                    <div className="px-8 py-6 bg-slate-50 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            {grupo.psicologo.foto ? (
                                <img 
                                    src={grupo.psicologo.foto} 
                                    alt={grupo.psicologo.nome}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-deep/10 flex items-center justify-center">
                                    <span className="text-deep font-bold text-sm">
                                        {grupo.psicologo.nome.substring(0, 2).toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Coordenado por
                                </p>
                                <p className="text-sm font-bold text-slate-800">
                                    {grupo.psicologo.nome}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Formulário de Login */}
                    <form onSubmit={handleLogin} className="p-8">
                        <div className="mb-6">
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">
                                Acesso ao Grupo
                            </h2>
                            <p className="text-sm text-slate-500 font-medium">
                                Digite seu CPF para acessar o painel do grupo
                            </p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                                <Lock size={12} className="inline mr-1" />
                                CPF (Login)
                            </label>
                            <input
                                type="text"
                                value={cpf}
                                onChange={(e) => setCpf(formatCPF(e.target.value))}
                                placeholder="000.000.000-00"
                                maxLength={14}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-medium outline-none focus:border-deep focus:bg-white transition-all"
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !cpf}
                            className="w-full bg-deep hover:bg-slate-900 text-white font-black uppercase tracking-wider py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-deep/20"
                        >
                            {loading ? (
                                "Entrando..."
                            ) : (
                                <>
                                    <LogIn size={18} />
                                    Acessar Grupo
                                </>
                            )}
                        </button>

                        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <p className="text-xs text-blue-800 font-medium text-center">
                                <strong>Primeira vez?</strong> Use o CPF que você forneceu ao psicólogo para acessar.
                            </p>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-slate-400 mt-6 font-medium">
                    Plataforma PsiDuo - Grupos Terapêuticos
                </p>
            </div>
        </div>
    );
}
