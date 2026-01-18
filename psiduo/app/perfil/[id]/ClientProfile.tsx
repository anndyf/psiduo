"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { buscarDadosPsicologo, registrarAcessoPerfil, enviarAvaliacao } from "../actions";
import { registrarCliqueWhatsapp } from "../../catalogo/actions";
import Link from "next/link";
import Image from "next/image";

interface PsicologoDados {
  id: string;
  nome: string;
  slug: string;
  crp: string; 
  foto: string;
  biografia: string;
  abordagem: string;
  whatsapp: string;
  preco: number;
  duracaoSessao: number;
  plano: string;
  especialidades: string[];
  temas: string[];
  publicoAlvo: string[];
  idade: number;
  genero: string;
  etnia: string;
  acessos: number;
  cidade?: string; 
  estado?: string; 
  videoApresentacao?: string;
  agendaConfig?: any;
  redesSociais?: any;
}

export default function ClientProfile({ initialData, id }: { initialData: any, id: string }) {
  const router = useRouter();
  const [dados, setDados] = useState<PsicologoDados | null>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const savedFavs = localStorage.getItem("psiduo_favorites");
    if (savedFavs) {
      try {
        setFavorites(JSON.parse(savedFavs));
      } catch (e) { console.error(e); }
    }
  }, []);

  const toggleFavorite = (favId: string) => {
    const newFavs = favorites.includes(favId) 
      ? favorites.filter(f => f !== favId)
      : [...favorites, favId];
    
    setFavorites(newFavs);
    localStorage.setItem("psiduo_favorites", JSON.stringify(newFavs));
  };

  const handleCopiarLink = async () => {
    try {
      const link = window.location.href;
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
      console.error("Erro ao copiar:", err);
    }
  };

  useEffect(() => {
    async function trackAccess() {
      if (!id) return;
      await registrarAcessoPerfil(id);
    }
    trackAccess();
  }, [id]);

  const renderVideoYoutube = (url: string): string => {
    if (!url) return "";
    try {
      let videoId = "";
      if (url.includes("shorts/")) videoId = url.split("shorts/")[1]?.split(/[?&]/)[0];
      else if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1]?.split(/[?&]/)[0];
      else if (url.includes("v=")) videoId = url.split("v=")[1]?.split(/[?&]/)[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1` : "";
    } catch (e) { return ""; }
  };

  const formatarCRP = (valor: string) => {
    const nums = valor.replace(/\D/g, "");
    if (nums.length > 2) {
      return `${nums.slice(0, 2)}/${nums.slice(2)}`;
    }
    return nums;
  };

  if (!dados) return <div className="min-h-screen flex items-center justify-center font-black uppercase tracking-widest text-slate-400">Perfil não encontrado</div>;

  const isDuoII = dados.plano === "DUO_II";
  const videoSrc = renderVideoYoutube(dados.videoApresentacao || "");
  const hasVideo = isDuoII && videoSrc !== "";

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans overflow-x-hidden">
      <Navbar />

      <section className="container mx-auto max-w-6xl py-12 md:py-20 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* COLUNA ESQUERDA */}
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
            
            <div className="w-full max-w-[320px] lg:max-w-none mx-auto aspect-[4/5] rounded-[40px] md:rounded-[60px] overflow-hidden border-[8px] md:border-[10px] border-white shadow-2xl bg-slate-100 relative">
              <Image 
                src={dados.foto || "/placeholder-psico.jpg"} 
                fill
                className="object-cover transition-all duration-700" 
                alt={dados.nome}
                priority
              />
              
              {isDuoII && (
                <div className="absolute top-5 left-5 lg:top-8 lg:left-8 flex items-center justify-center">
                  <span className="w-4 h-4 bg-blue-400 rounded-full animate-pulse shadow-[0_0_20px_rgba(96,165,250,1)] border-2 border-white"></span>
                </div>
              )}
            </div>

            {/* NOME E CRP PARA MOBILE */}
            <div className="lg:hidden text-center space-y-2">
              <h1 className="text-4xl font-black uppercase tracking-tighter leading-tight text-slate-900">{dados.nome}</h1>
              <div className="flex items-center justify-center gap-2 text-primary">
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                  {dados.crp ? formatarCRP(dados.crp) : "Inscrição Pendente"}
                </span>
                <button onClick={handleCopiarLink} className="p-1.5 hover:bg-primary/10 rounded-lg text-primary transition-all active:scale-95" title="Copiar Link">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                </button>
              </div>
            </div>

            {isDuoII && dados.redesSociais && Object.values(dados.redesSociais).some(v => v) && (
              <div className="bg-white p-6 rounded-[35px] shadow-sm border border-slate-100 flex items-center justify-center gap-4 lg:gap-6">
                {Object.entries(dados.redesSociais).map(([rede, link]: [string, any]) => {
                  if (!link) return null;
                  
                  const getIcon = (name: string) => {
                    switch (name.toLowerCase()) {
                      case 'instagram':
                        return (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                          </svg>
                        );
                      case 'linkedin':
                        return (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"></path>
                            <rect x="2" y="9" width="4" height="12"></rect>
                            <circle cx="4" cy="4" r="2"></circle>
                          </svg>
                        );
                      case 'site':
                      default:
                        return (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                            <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"></path>
                          </svg>
                        );
                    }
                  };

                  const getLabel = (name: string) => {
                    if (name.toLowerCase() === 'site') return 'Website';
                    return name.charAt(0).toUpperCase() + name.slice(1);
                  };

                  return (
                    <a 
                      key={rede} 
                      href={link.startsWith('http') ? link : `https://${link}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group flex flex-col items-center gap-2 transition-all"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
                        {getIcon(rede)}
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors">{getLabel(rede)}</span>
                    </a>
                  );
                })}
              </div>
            )}

            <div className="bg-white p-8 rounded-[45px] shadow-sm border border-slate-100 text-center">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-3 block">Abordagem Clínica</span>
              <p className="text-xl font-black uppercase leading-tight mb-8 break-words">{dados.abordagem}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 text-white p-5 rounded-[28px] shadow-lg">
                  <span className="text-[8px] font-black uppercase tracking-widest opacity-40 block mb-1">Sessão</span>
                  <span className="text-base font-black tracking-tight">R${dados.preco}</span>
                </div>
                <div className="bg-slate-900 text-white p-5 rounded-[28px] shadow-lg">
                  <span className="text-[8px] font-black uppercase tracking-widest opacity-40 block mb-1">Duração</span>
                  <span className="text-base font-black tracking-tight">{dados.duracaoSessao}m</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[45px] shadow-sm border border-slate-100">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6 text-center">Detalhes</h3>
              <div className="space-y-4">
                {[
                  { label: "Gênero", value: dados.genero },
                  { label: "Idade", value: `${dados.idade} anos` },
                  { label: "Etnia", value: dados.etnia },
                  { label: "Local", value: dados.cidade ? `${dados.cidade} - ${dados.estado}` : "Atendimento Online" }
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{item.label}</span>
                    <span className="text-sm font-black uppercase text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA */}
          <div className="lg:col-span-8 space-y-8">
            <div className="hidden lg:block">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none break-words text-slate-900">{dados.nome}</h1>
                <button 
                  onClick={() => toggleFavorite(dados.id)}
                  className={`mt-2 p-3 rounded-full transition-all ${favorites.includes(dados.id) ? 'text-red-500 bg-red-50' : 'text-slate-300 hover:text-red-400 hover:bg-slate-50'}`}
                >
                  <svg className="w-8 h-8 md:w-10 md:h-10" fill={favorites.includes(dados.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </button>
              </div>
              <div className="flex items-center gap-4 text-primary ml-1">
                <span className="text-xs font-black uppercase tracking-[0.4em]">
                  CRP: {dados.crp ? formatarCRP(dados.crp) : "Pendente"}
                </span>
                <button onClick={handleCopiarLink} className="flex items-center gap-2 bg-slate-50 hover:bg-primary/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 text-slate-400 hover:text-primary">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  Compartilhar Perfil
                </button>
              </div>
            </div>

            <div className="bg-white p-10 md:p-14 rounded-[50px] shadow-sm border border-slate-100">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-6">Apresentação</h3>
              <p className="text-xl md:text-2xl font-bold leading-snug text-slate-600 italic break-words">"{dados.biografia}"</p>
            </div>

            <div className="bg-white p-10 md:p-14 rounded-[50px] shadow-sm border border-slate-100 space-y-12">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900 mb-8">Especialidades</h3>
                <div className="flex flex-wrap gap-3">
                  {dados.especialidades.map(e => <span key={e} className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-8 py-4 rounded-full shadow-lg">{e}</span>)}
                </div>
              </div>

              {hasVideo && (
                <div className="pt-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-6 text-center md:text-left">Apresentação em Vídeo</h3>
                  <div className="w-full aspect-video rounded-[40px] overflow-hidden border-[8px] border-slate-50 shadow-inner bg-black">
                    <iframe src={videoSrc} className="w-full h-full border-none" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen></iframe>
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900 mb-8">Temas e Demandas</h3>
                <div className="flex flex-wrap gap-2">
                  {dados.temas.map(t => <span key={t} className="bg-slate-50 text-slate-500 text-[9px] font-black uppercase tracking-widest px-6 py-3 rounded-full border border-slate-100">{t}</span>)}
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900 mb-6">Público Alvo</h3>
                <div className="flex flex-wrap gap-4">
                  {dados.publicoAlvo.map(p => <span key={p} className="text-sm font-black uppercase text-slate-400">• {p}</span>)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <a 
                href={`https://wa.me/${dados.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Olá! Encontrei seu perfil no PsiDuo e gostaria de saber mais sobre a terapia.")}`} 
                target="_blank" 
                onClick={() => registrarCliqueWhatsapp(dados.id)}
                className="bg-[#16A34A] text-white text-[11px] font-black uppercase tracking-[0.4em] py-10 rounded-full shadow-2xl text-center hover:bg-green-700 transition-colors"
              >
                WhatsApp
              </a>
              {isDuoII && <button onClick={() => setIsModalOpen(true)} className="bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.4em] py-10 rounded-full shadow-2xl hover:bg-black transition-colors">Agenda Digital</button>}
            </div>

            {/* SEÇÃO DE AVALIAÇÃO PRIVADA */}
            <div className="bg-white p-10 md:p-14 rounded-[50px] shadow-sm border border-slate-100">
              {/* ... (Feedback Section) ... */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900 mb-2">Feedback do Paciente</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Sua avaliação é enviada de forma privada para o profissional.</p>
                </div>
                <div className="flex gap-1" id="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      type="button"
                      onClick={() => {
                        const stars = document.querySelectorAll('.star-btn');
                        stars.forEach((s, idx) => {
                          if (idx < star) s.classList.add('text-amber-400');
                          else s.classList.remove('text-amber-400');
                        });
                        (window as any).currentRating = star;
                      }}
                      className="star-btn text-2xl text-slate-200 hover:text-amber-300 transition-colors"
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <textarea 
                  id="testimonial-text"
                  placeholder="Deixe aqui seu depoimento ou sugestão..."
                  rows={4}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-[30px] p-8 text-sm font-medium outline-none focus:border-primary transition-all resize-none"
                  suppressHydrationWarning
                ></textarea>
                
                <div className="flex justify-end">
                  <button 
                    onClick={async (e) => {
                      const btn = e.currentTarget;
                      const text = (document.getElementById('testimonial-text') as HTMLTextAreaElement).value;
                      const nota = (window as any).currentRating || 0;
                      if (nota === 0) { alert("Por favor, selecione uma nota de 1 a 5 estrelas."); return; }
                      btn.disabled = true;
                      btn.innerText = "Enviando...";
                      try {
                        const res = await enviarAvaliacao(dados.id, nota, text, "Acesso Perfil");
                        if (res.success) {
                          alert("Obrigado pelo seu feedback!");
                          (document.getElementById('testimonial-text') as HTMLTextAreaElement).value = "";
                        }
                      } catch (err) { console.error(err); }
                      finally { btn.disabled = false; btn.innerText = "Enviar Depoimento Privado"; }
                    }}
                    className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] px-10 py-5 rounded-full hover:bg-black transition-all shadow-xl active:scale-95"
                  >
                    Enviar Depoimento Privado
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL AGENDA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-[40px] md:rounded-[55px] p-6 md:p-12 relative shadow-2xl animate-in zoom-in-95 duration-300">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 md:top-8 md:right-8 text-slate-400 hover:text-slate-900 font-black uppercase text-[10px] tracking-[0.2em] bg-slate-50 px-4 py-2 rounded-full transition-all active:scale-95">Fechar [x]</button>
            <div className="text-center mb-10">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] block mb-2">Disponibilidade</span>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-slate-900">Agenda Digital</h2>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"].map((dia) => {
                const horarios = dados.agendaConfig?.[dia] || [];
                if (horarios.length === 0) return null;
                return (
                  <div key={dia} className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-6 pt-2 gap-4">
                    <span className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest min-w-[120px] text-center shadow-lg self-start md:self-auto">
                      {dia}
                    </span>
                    <div className="flex flex-wrap gap-2 md:justify-end">
                      {horarios.map((hora: string) => (
                        <span key={hora} className="bg-slate-50 border-2 border-slate-100 text-slate-900 px-4 py-2 rounded-xl text-[11px] font-black shadow-sm">{hora}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-10 pt-8 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide text-center md:text-left">* Os horários acima estão sujeitos a confirmação via WhatsApp.</p>
              <a 
                 href={`https://wa.me/${dados.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Olá! Vi sua agenda no PsiDuo e gostaria de agendar um horário.")}`} 
                 target="_blank" 
                 onClick={() => registrarCliqueWhatsapp(dados.id)}
                 className="bg-green-600 text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-xl active:scale-95"
              >
                Agendar via WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}    
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Pronto!</span>
              <span className="text-xs font-bold uppercase tracking-wider">Link copiado para compartilhar</span>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
