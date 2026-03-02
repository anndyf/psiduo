"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { buscarAvaliacoes } from "../actions";

// Definição do Tipo baseada na sua tabela do banco
interface Avaliacao {
  id: string;
  nota: number;
  comentario: string | null;
  data: Date;
  psicologoId: string;
  localizacao: string | null;
}

export default function PaginaAvaliacoes() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  
  // Inicialização correta do estado com o Tipo definido
  const [dados, setDados] = useState<{
    avaliacoes: Avaliacao[];
    total: number;
    media: string;
  }>({ 
    avaliacoes: [], 
    total: 0, 
    media: "0.0" 
  });
  
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    async function carregar() {
        // Se a sessão tiver o ID, usamos ele. Caso contrário, precisamos buscar pelo email ou outra via.
        // Vamos assumir que buscarAvaliacoes pode lidar com a sessão no server-side se passarmos nada? 
        // Não, a definição pede ID.
        // Vamos tentar pegar o ID da sessão se estiver disponível no objeto session.user (customizado nas callbacks do NextAuth)
        // Ou pelo email.
        
        // CORREÇÃO: O ID do usuário deve vir da sessão auth.
        // Como o tipo session.user default não tem ID, vamos tentar usar o email para buscar o ID primeiro ou assumir que o ID foi injetado.
        // Mas para simplificar rápido: Se o painel sabe quem é, ele deve ter o ID.
        // Vamos tentar buscar o ID via server action usando o email da sessão.
        
        if (session?.user) {
             // O ID correto para buscar avaliações é o do PERFIL DE PSICÓLOGO, não do USUÁRIO (login)
             // O NextAuth foi configurado para injetar 'psicologoId' na sessão.
             const psicologoId = (session.user as any).psicologoId;
             console.log("PsicologoID Session:", psicologoId);
             
             if (psicologoId) {
                 const res = await buscarAvaliacoes(psicologoId);
                 if (res.success && res.avaliacoes) {
                    setDados({ 
                      avaliacoes: res.avaliacoes as Avaliacao[], 
                      total: res.total, 
                      media: res.media 
                    });
                 }
             } else {
                 console.error("ID de Psicólogo não encontrado na sessão.");
             }
        }
        setLoading(false);
    }
    carregar();
  }, [router, session, status]);

  if (loading) return (
    <div className="flex items-center justify-center h-96 text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">
      Carregando Depoimentos...
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">
        {/* Cabeçalho */}
        <header className="mb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                <span className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-2 block">Reputação Clínica</span>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tight leading-none">
                    Avaliações Recebidas
                </h1>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center min-w-[180px]">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Nota Média</span>
                <span className="text-4xl font-black text-amber-500 tracking-tighter">{dados.media}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mt-1">{dados.total} avaliações</span>
                </div>
            </div>
            <div className="h-px bg-slate-200 mt-8 w-full block"></div>
        </header>

        {/* Listagem */}
        <div className="grid gap-4">
        {dados.avaliacoes.length > 0 ? (
            dados.avaliacoes.map((av) => (
            <div key={av.id} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-4">
                <div className="flex gap-1 bg-slate-50 p-2 rounded-xl w-fit">
                    {[...Array(5)].map((_, i) => (
                    <svg 
                        key={i} 
                        className={`w-4 h-4 ${i < av.nota ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} 
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    ))}
                </div>
                <div className="text-left sm:text-right">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                    {new Date(av.data).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest block mt-0.5">
                    {av.localizacao || "Anônimo"}
                    </span>
                </div>
                </div>
                
                <p className="text-slate-700 text-lg font-medium leading-relaxed mb-6">
                "{av.comentario || "Sem comentário."}"
                </p>
                
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Depoimento Verificado</span>
                </div>
            </div>
            ))
        ) : (
            <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nenhuma avaliação encontrada.</p>
            </div>
        )}
        </div>
    </div>
  );
}