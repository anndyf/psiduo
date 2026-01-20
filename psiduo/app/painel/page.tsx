"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { buscarDadosPainel, atualizarCredenciais } from "./actions";
import { buscarAvaliacoes } from "../perfil/actions";

export default function PainelPsicologo() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState({ 
    nome: "", 
    slug: "",
    status: "PENDENTE", 
    email: "",
    media: "0.0",
    plano: "DUO_I",
    acessos: 0,
    cliquesWhatsapp: 0
  });
  
  const [isModalSistemaOpen, setIsModalSistemaOpen] = useState(false);
  const [editandoEmail, setEditandoEmail] = useState(false);
  const [novoEmail, setNovoEmail] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");
  const [statusEnvio, setStatusEnvio] = useState({ tipo: "", texto: "" });
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // Verificar autenticação
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    async function init() {
      try {
        const resPainel = await buscarDadosPainel();
        let resAv: any = { success: true, media: "0.0" };

        if (resPainel.success && resPainel.dados?.id) {
            resAv = await buscarAvaliacoes(resPainel.dados.id);
        }

        console.log("Resposta Painel:", resPainel);

        if (resPainel.error) {
          console.error("Erro ao buscar painel:", resPainel.error);
          setLoading(false);
          return;
        }

        if (resPainel.success && resPainel.dados) {
          setDados({ 
            nome: resPainel.dados.nome || "Profissional", 
            slug: resPainel.dados.slug || "",
            status: resPainel.dados.status || "PENDENTE", 
            email: resPainel.dados.email || "",
            media: resAv.success ? resAv.media : "0.0",
            plano: resPainel.dados.plano || "DUO_I",
            acessos: resPainel.dados.acessos || 0,
            cliquesWhatsapp: resPainel.dados.cliquesWhatsapp || 0
          });
          setNovoEmail(resPainel.dados.email || "");
        } else {
          console.error("Erro ao buscar dados do painel:", (resPainel as any).error);
          setStatusEnvio({ tipo: "erro", texto: (resPainel as any).error || "Não foi possível carregar seu perfil. Tente logar novamente." });
        }
      } catch (err) {
        console.error("Falha crítica no carregamento do painel:", err);
        setStatusEnvio({ tipo: "erro", texto: "Erro interno ao carregar o painel." });
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

// Logout agora é feito pelo Navbar com signOut()
// Esta função não é mais necessária

const handleCopiarLink = async () => {
    const link = `${window.location.origin}/perfil/${dados.slug}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = link;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error("Erro ao copiar link:", err);
    }
  };

const handleSalvarCredenciais = async () => {
    setStatusEnvio({ tipo: "", texto: "" });

    // Validações de Senha
    if (novaSenha) {
        if (!senhaAtual) {
            setStatusEnvio({ tipo: "erro", texto: "Digite sua senha atual para confirmar a troca." });
            return;
        }
        if (novaSenha !== confirmarNovaSenha) {
            setStatusEnvio({ tipo: "erro", texto: "A nova senha e a confirmação não conferem." });
            return;
        }
        if (novaSenha.length < 6) {
             setStatusEnvio({ tipo: "erro", texto: "A nova senha deve ter pelo menos 6 caracteres." });
             return;
        }
    }

    setLoading(true);
    const res = await atualizarCredenciais({
      emailNovo: editandoEmail ? novoEmail : undefined,
      senhaNova: novaSenha || undefined,
      senhaAtual: senhaAtual || undefined
    });

    if (res.success) {
      setStatusEnvio({ tipo: "sucesso", texto: res.message });
      setDados(prev => ({ ...prev, email: editandoEmail ? novoEmail : prev.email }));
      setEditandoEmail(false);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarNovaSenha("");
      setTimeout(() => setIsModalSistemaOpen(false), 3000);
    } else {
      setStatusEnvio({ tipo: "erro", texto: res.error || "Erro ao atualizar." });
    }
    setLoading(false);
  };

  if (loading && !isModalSistemaOpen) return (
    <div className="min-h-screen flex items-center justify-center bg-white font-black text-slate-300 uppercase tracking-[0.4em] animate-pulse">
      Autenticando
    </div>
  );

  const isAtivo = dados.status === "ATIVO";
  const isDuoII = dados.plano === "DUO_II";

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <Navbar />
      
      <div className="container mx-auto max-w-[1400px] py-8 md:py-12 px-6 md:px-8 flex-1">
        {/* Header Profissional */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-6 text-left">
          <div className="w-full">
            <span className="text-deep font-black text-[11px] uppercase tracking-[0.4em] mb-3 block opacity-60">Área Exclusiva</span>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter leading-tight break-words">
              Olá, {dados.nome}
            </h1>
            <div className="w-16 h-1.5 bg-deep mt-4 md:mt-6"></div>
          </div>
        </header>

        {/* Status Tracker */}
        {statusEnvio.texto && statusEnvio.tipo === "erro" && (
          <div className="mb-8 p-6 bg-red-50 border-2 border-red-200 rounded-3xl text-red-600 font-black uppercase text-xs tracking-widest text-center flex items-center justify-center gap-3 animate-bounce">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            {statusEnvio.texto}
            <button onClick={() => window.location.reload()} className="ml-4 underline">Tentar novamente</button>
          </div>
        )}

        <div className={`mb-12 p-10 md:p-14 bg-white border-t-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 transition-all ${
          isAtivo ? "border-green-500" : "border-amber-500"
        }`}>
          <div className="w-full md:w-auto text-left">
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Visibilidade Atual</h2>
            <p className={`text-3xl md:text-4xl font-black uppercase tracking-tight ${isAtivo ? "text-green-600" : "text-amber-600"}`}>
              {dados.status}
            </p>
          </div>
          <button 
            onClick={() => router.push("/perfil/editar")}
            className={`w-full md:w-auto px-14 py-6 font-black uppercase text-[11px] tracking-[0.3em] transition-all shadow-lg active:scale-95 ${
              isAtivo ? "bg-slate-900 text-white hover:bg-black" : "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-200"
            }`}
          >
            {isAtivo ? "Gerenciar Perfil" : "Ativar Agora"}
          </button>
        </div>

        {/* Banner Upgrade */}
        {/* Banner Upgrade (Apenas para NÃO Duo II) */}
        {!isDuoII && (
          <div className="mb-12 bg-slate-900 p-10 md:p-16 flex flex-col lg:flex-row items-center justify-between gap-10 relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-deep/20 rounded-full -mr-48 -mt-48 blur-[100px] group-hover:bg-deep/30 transition-all duration-1000"></div>
            <div className="relative z-10 max-w-2xl text-left">
              <span className="text-deep font-black text-[10px] uppercase tracking-[0.4em] mb-4 block">Potencialize seu Perfil</span>
              <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-6 leading-none">VÍDEO E AGENDA <br className="hidden md:block"/> NO PLANO DUO II</h2>
              <p className="text-slate-400 font-bold text-sm uppercase tracking-widest leading-relaxed opacity-80">Assinantes Premium desbloqueiam ferramentas de alta conversão e métricas avançadas.</p>
            </div>
            <button onClick={() => router.push("/cadastro/planos")} className="relative z-10 px-14 py-7 bg-deep text-white font-black text-[11px] uppercase tracking-[0.3em] hover:bg-white hover:text-slate-900 transition-all shadow-2xl w-full lg:w-auto">
              Fazer Upgrade
            </button>
          </div>
        )}

        {/* Banner Duo II (Gestão de Assinatura) */}
        {isDuoII && (
             <div className="mb-12 bg-gradient-to-r from-slate-900 to-slate-800 p-8 md:p-10 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-slate-700">
                <div className="flex items-center gap-6">
                    <div className="bg-primary/20 p-4 rounded-full">
                        <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                    </div>
                    <div>
                        <h3 className="text-white font-black uppercase tracking-widest text-lg">Membro Premium Duo II</h3>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Sua assinatura está ativa e rodando.</p>
                    </div>
                </div>
                <button className="px-8 py-3 bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-600 transition">
                    Gerenciar Plano
                </button>
             </div>
        )}

        {/* Grid de Cards com Tipografia Ampliada */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Informações", desc: isDuoII ? "Biografia, Especialidades, Vídeo e Redes." : "Gestão de biografia, foto e especialidades.", icon: <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>, route: "/perfil/editar", color: "border-deep" },
            { 
                label: "Visibilidade", 
                desc: "Visualização pública do seu perfil clínico.", 
                icon: <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>, 
                action: () => window.open(`/perfil/${dados.slug}`, "_blank"),
                color: "border-blue-500", 
                disabled: !isAtivo 
            },
            ...(isDuoII ? [
              { 
                label: "Visitas", 
                desc: "Total de acessos ao seu perfil.", 
                icon: <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>, 
                highlight: dados.acessos,
                color: "border-indigo-500",
                action: () => {} 
              }
            ] : []),
            { label: "Reputação", desc: "Depoimentos e notas dos seus pacientes.", icon: <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>, route: "/perfil/avaliacoes", color: "border-amber-500", highlight: dados.media },
            { 
               label: "Minha Agenda", 
               desc: " Configure seus horários de atendimento.", 
               icon: <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>, 
               route: "/perfil/editar#agenda", 
               color: "border-green-500",
               disabled: !isDuoII 
            },
            {
               label: "Meus Pacientes",
               desc: "Diário de humor e sono dos seus pacientes.",
               icon: <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
               route: "/painel/pacientes",
               color: "border-pink-500",
               disabled: !isDuoII
            },
            { label: "Sistema", desc: "Configurações de acesso e credenciais.", icon: <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, action: () => setIsModalSistemaOpen(true), color: "border-slate-400" }
          ].map((item: any, idx) => (
            <div 
              key={idx}
              onClick={item.disabled ? undefined : (item.action || (() => router.push(item.route!)))}
              className={`group bg-white p-10 md:p-12 flex flex-col items-start text-left transition-all duration-300 shadow-md ${item.disabled ? "opacity-40 grayscale cursor-not-allowed" : "hover:shadow-2xl hover:-translate-y-1 cursor-pointer"} border-t-4 ${item.color}`}
            >
              <div className="w-full flex justify-between items-start mb-8">
                <div className="text-slate-200 group-hover:text-slate-900 transition-colors duration-300">
                  {item.icon}
                </div>
                {item.label === "Visibilidade" && !item.disabled && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleCopiarLink(); }} 
                    className="p-2 hover:bg-slate-50 rounded-lg text-slate-300 hover:text-primary transition-all active:scale-90"
                    title="Copiar Link do Perfil"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  </button>
                )}
              </div>
              <h3 className="text-sm md:text-base font-black text-slate-900 uppercase tracking-[0.2em] mb-4">{item.label}</h3>
              
              {item.highlight !== undefined && (
                <div className="w-full mb-4">
                  <p className="text-slate-900 font-black text-3xl md:text-4xl tracking-tighter mb-2">
                    {item.highlight} 
                    {item.label === "Reputação" ? <span className="text-sm text-slate-300 ml-1">/ 5.0</span> : ""}
                  </p>
                  {isDuoII && (item.label === "Visitas" || item.label === "Contatos") && (
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full opacity-60 transition-all duration-1000 ${
                          item.label === "Visitas" ? "bg-indigo-500" : 
                          item.label === "Contatos" ? "bg-green-500" : "bg-primary"
                        }`}
                        style={{ width: '65%' }}
                      />
                    </div>
                  )}
                </div>
              )}
              
              <p className="text-slate-500 font-bold text-xs md:text-sm uppercase tracking-wider leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Sucesso</span>
              <span className="text-xs font-bold uppercase tracking-wider">Link do Perfil Copiado!</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sistema */}
      {isModalSistemaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-none border-t-8 border-deep shadow-2xl p-10 md:p-12 max-h-[90vh] overflow-y-auto">
            <header className="mb-10 flex justify-between items-start">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-widest mb-2">SISTEMA</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Configurações de Acesso</p>
              </div>
              <button onClick={() => setIsModalSistemaOpen(false)} className="text-slate-300 hover:text-red-600 transition-colors text-3xl">✕</button>
            </header>
            
            {statusEnvio.texto && (
              <div className={`mb-6 p-4 text-[10px] font-black uppercase tracking-widest text-center ${statusEnvio.tipo === 'sucesso' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {statusEnvio.texto}
              </div>
            )}

            <div className="space-y-8">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">E-mail de Acesso</label>
                  <button onClick={() => setEditandoEmail(!editandoEmail)} className="text-[10px] font-black text-deep uppercase hover:underline">Alterar</button>
                </div>
                <input 
                  disabled={!editandoEmail}
                  type="email" 
                  value={editandoEmail ? novoEmail : dados.email}
                  onChange={(e) => setNovoEmail(e.target.value)}
                  className="w-full bg-slate-50 border-b-2 border-slate-200 p-4 font-bold text-slate-900 outline-none focus:border-deep transition-all"
                />
              </div>

              <div>
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Alterar Senha</label>
                 <div className="space-y-3">
                    <input 
                      type="password" 
                      placeholder="Senha Atual (Obrigatório)"
                      value={senhaAtual}
                      onChange={(e) => setSenhaAtual(e.target.value)}
                      className="w-full bg-slate-50 border-b-2 border-slate-200 p-4 font-bold text-slate-900 outline-none focus:border-deep transition-all"
                    />
                    <input 
                      type="password" 
                      placeholder="Nova Senha"
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      className="w-full bg-slate-50 border-b-2 border-slate-200 p-4 font-bold text-slate-900 outline-none focus:border-deep transition-all"
                    />
                    <input 
                      type="password" 
                      placeholder="Confirmar Nova Senha"
                      value={confirmarNovaSenha}
                      onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                      className="w-full bg-slate-50 border-b-2 border-slate-200 p-4 font-bold text-slate-900 outline-none focus:border-deep transition-all"
                    />
                 </div>
              </div>

              <div className="pt-4 space-y-4">
                <button 
                  onClick={handleSalvarCredenciais}
                  className="w-full bg-slate-900 text-white font-black py-6 text-[11px] uppercase tracking-[0.4em] hover:bg-black transition-all shadow-xl"
                >
                  Confirmar Alterações
                </button>
                <button onClick={() => setIsModalSistemaOpen(false)} className="w-full border border-slate-200 text-slate-600 font-black py-4 text-[11px] uppercase tracking-[0.3em] hover:bg-slate-50 transition-all">Fechar</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </main>
  );
}