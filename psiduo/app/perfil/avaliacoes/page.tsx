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
    <div className="min-h-screen flex items-center justify-center bg-white font-black text-slate-300 uppercase tracking-[0.4em] animate-pulse">
      Carregando Depoimentos
    </div>
  );

  return (
    <main className="min-h-screen bg-white flex flex-col text-slate-900">
      <Navbar />
      
      <div className="container mx-auto max-w-4xl py-20 px-8 flex-1">
        {/* Cabeçalho Profissional */}
        <header className="mb-16">
          <button 
            onClick={() => router.back()}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-deep mb-8 transition-colors flex items-center gap-2"
          >
            ← Voltar ao Dashboard
          </button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <span className="text-deep font-black text-xs uppercase tracking-[0.3em] mb-4 block">Reputação Clínica</span>
              <h1 className="text-5xl font-black text-slate-900 uppercase tracking-tighter leading-tight">
                Avaliações <br className="md:hidden" /> Recebidas
              </h1>
            </div>
            <div className="bg-slate-50 p-8 border border-slate-100 text-center min-w-[200px]">
              <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Média Geral</span>
              <span className="text-4xl font-black text-amber-500">{dados.media}</span>
              <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">{dados.total} Depoimentos</span>
            </div>
          </div>
          <div className="w-20 h-1 bg-deep mt-10"></div>
        </header>

        {/* Listagem de Depoimentos Real */}
        <div className="space-y-0 border-t border-slate-100">
          {dados.avaliacoes.length > 0 ? (
            dados.avaliacoes.map((av) => (
              <div key={av.id} className="py-12 border-b border-slate-100 group hover:bg-slate-50 transition-colors px-4">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i} 
                        className={`w-4 h-4 ${i < av.nota ? "text-amber-500 fill-amber-500" : "text-slate-200"}`} 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                      {new Date(av.data).toLocaleDateString('pt-BR')} às {new Date(av.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[9px] font-bold text-primary uppercase tracking-widest block mt-1">
                      {av.localizacao || "Origem não identificada"}
                    </span>
                  </div>
                </div>
                
                <p className="text-slate-700 text-lg font-medium leading-relaxed mb-4">
                  "{av.comentario || "O paciente não deixou um comentário por escrito."}"
                </p>
                
                <div className="flex items-center gap-2">
                  <div className="w-6 h-[1px] bg-slate-200"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Depoimento Privado</span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center">
              <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Aguardando as primeiras avaliações.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}