"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { registrarAcessoPerfil, enviarAvaliacao } from "../actions";
import { registrarCliqueWhatsapp } from "../../catalogo/actions";
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
  atendeOnline?: boolean;
  atendePresencial?: boolean;
}

// Helper functions for Social Icons
const getSocialColor = (name: string) => {
    switch(name.toLowerCase()) {
        case 'instagram': return "text-[#E1306C] hover:text-[#C13584]";
        case 'linkedin': return "text-[#0077B5] hover:text-[#004182]";
        case 'facebook': return "text-[#1877F2] hover:text-[#166FE5]";
        case 'twitter': return "text-black hover:text-slate-700";
        case 'youtube': return "text-[#FF0000] hover:text-[#D40000]";
        case 'tiktok': return "text-black hover:text-slate-800";
        default: return "text-slate-600 hover:text-slate-900";
    }
};

const getSocialIcon = (name: string) => {
    switch(name.toLowerCase()) {
        case 'instagram': return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>;
        case 'linkedin': return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>;
        case 'facebook': return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>;
        case 'twitter': return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>;
        case 'youtube': return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>;
        case 'tiktok': return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.35-1.17 1.09-1.19 1.83 0 .42.06.84.18 1.25.26.83.97 1.5 1.75 1.8 1.52.6 3.24.1 4.14-1.19.64-.93.76-2.05.76-3.15V.02z"/></svg>;
        case 'site': 
        default: return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm1 16.057v-3.057h2.994c-.059 1.143-.212 2.183-.442 3.057h-2.552zm-6.546-6.057h2.546v3h-2.994c-.059-1.143-.212-2.183-.442-3.057h.89zm0-1h.89c.23-.874.383-1.914.442-3.057h-2.546v3.057zm6.546 5h-2v2.943c.877-.494 1.579-1.296 2-2.289v-.654zm-4-9h2v-2.943c-.877.494-1.579 1.296-2 2.289v.654zm3.546 3h2.546v-3h-.89c-.23.874-.383 1.914-.442 3.057h-1.214zm-1.546 3v3.057c.928-.216 1.747-.796 2.253-1.636.327-.542.547-1.173.651-1.854h-2.904zm-4 4.057v-3.057h-2.904c.104.681.324 1.312.651 1.854.506.84 1.325 1.42 2.253 1.636zm0-13.114v3.057h-2.904c-.104-.681-.324-1.312-.651-1.854-.506-.84-1.325-1.42-2.253-1.636zm4 0c-.928.216-1.747.796-2.253 1.636-.327.542-.547 1.173-.651 1.854h2.904v-3.49zm9.546 6.057h-2.994c.059-1.143.212-2.183.442-3.057h2.552v3.057zm-14.717 3.057h2.623c.23.874.383 1.914.442 3.057h-3.065v-3.057zm5.171 0h2v2.943c.877-.494 1.579-1.296 2-2.289v-.654zm-4-9h2v-2.943c-.877.494-1.579 1.296-2 2.289v.654zm3.546 3h2.546v-3h-.89c-.23.874-.383 1.914-.442 3.057h-1.214zm-1.546 3v3h1.546v-3h-1.546z"/></svg>;
    }
};

export default function ClientProfile({ initialData, id }: { initialData: any, id: string }) {
  const router = useRouter();
  const [dados, setDados] = useState<PsicologoDados | null>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);
  
  // Rating State
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");

  const getModalidade = () => {
      const online = dados?.atendeOnline ?? true;
      const presencial = dados?.atendePresencial ?? false;
      if (online && presencial) return "Online e Presencial";
      if (presencial) return "Presencial";
      return "100% Online";
  };

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
      await navigator.clipboard.writeText(link);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) { console.error(err); }
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
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
      const match = url.match(regExp);
      const videoId = (match && match[2].length === 11) ? match[2] : null;
      return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : "";
    } catch (e) { return ""; }
  };

  const formatarCRP = (valor: string) => {
    const nums = valor.replace(/\D/g, "");
    if (nums.length > 2) return `${nums.slice(0, 2)}/${nums.slice(2)}`;
    return nums;
  };

  if (!dados) return <div className="min-h-screen flex items-center justify-center font-black uppercase tracking-widest text-slate-600">Perfil não encontrado</div>;

  const isDuoII = dados.plano === "DUO_II";
  const videoSrc = renderVideoYoutube(dados.videoApresentacao || "");
  const hasVideo = isDuoII && videoSrc !== "";

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans">
      <Navbar />

      {/* LAYOUT TIPO REDE SOCIAL / BIO LINK */}
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 pb-32">
         
         {/* HEADER PERFIL */}
         <header className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 text-center md:text-left">
            <div className="relative shrink-0">
                <div className="w-32 h-32 md:w-36 md:h-36 rounded-full p-1 bg-deep">
                    <div className="w-full h-full rounded-full overflow-hidden bg-white border-4 border-white relative">
                        <Image 
                            src={dados.foto || "/placeholder-psico.jpg"} 
                            fill
                            className="object-cover" 
                            alt={dados.nome}
                            priority
                        />
                    </div>
                </div>
                {isDuoII && (
                    <div className="absolute bottom-1 right-1 bg-deep text-white p-1.5 rounded-full border-2 border-white shadow-sm" title="Verificado">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-row items-center justify-center md:justify-between gap-3 w-full">
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight text-center md:text-left">{dados.nome}</h1>
                    <button 
                        onClick={() => toggleFavorite(dados.id)}
                        className={`p-2 rounded-full transition-all shrink-0 ${favorites.includes(dados.id) ? 'text-red-500' : 'text-slate-400 hover:text-red-400'}`}
                    >
                        <svg className="w-6 h-6" fill={favorites.includes(dados.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    </button>
                </div>
                <p className="text-sm font-bold text-slate-800 mt-1 uppercase tracking-wide">
                    Psi • CRP {dados.crp ? formatarCRP(dados.crp) : "Processing"}
                </p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4 text-xs font-bold text-white">
                    <span className="flex items-center gap-1.5 bg-deep px-4 py-2 rounded-xl shadow-lg shadow-slate-200/50">
                        <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {dados.duracaoSessao} min
                    </span>
                    <span className="flex items-center gap-1.5 bg-deep px-4 py-2 rounded-xl shadow-lg shadow-slate-200/50">
                        <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                       R$ {dados.preco}
                    </span>
                    <span className="flex items-center gap-1.5 bg-deep px-4 py-2 rounded-xl shadow-lg shadow-slate-200/50">
                        <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        {getModalidade()}
                    </span>
                </div>
            </div>
         </header>

         {/* BIO */}
         <div className="mb-8 px-2 md:px-0">
            <p className="text-slate-800 text-sm md:text-base leading-relaxed whitespace-pre-line">
                {dados.biografia}
            </p>
         </div>

         {/* ACTIONS */}
         <div className="grid grid-cols-2 gap-3 mb-10">
            <a 
               href={`https://wa.me/${dados.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Olá! Vim pelo PsiDuo.")}`} 
               target="_blank"
               onClick={() => registrarCliqueWhatsapp(dados.id)}
               className="col-span-1 bg-green-600 text-white font-bold py-3.5 rounded-xl text-center shadow-lg shadow-green-200 hover:bg-green-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
                <span>WhatsApp</span>
            </a>
            {isDuoII ? (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="col-span-1 bg-deep text-white font-bold py-3.5 rounded-xl text-center shadow-lg hover:bg-slate-800 hover:scale-[1.02] transition-all"
                >
                    Agendar
                </button>
            ) : (
                <button 
                  onClick={handleCopiarLink}
                  className="col-span-1 bg-slate-100 text-slate-700 font-bold py-3.5 rounded-xl text-center hover:bg-slate-200 transition-all border border-slate-200"
                >
                    Compartilhar Perfil
                </button>
            )}
         </div>

         {/* DIVIDER */}
         <div className="h-px bg-slate-100 mb-10"></div>

         {/* VIDEO FEED */}
         {/* REDES SOCIAIS */}
         {isDuoII && dados.redesSociais && Object.values(dados.redesSociais).some(v => v) && (
            <div className="mb-10">
                <h3 className="text-sm font-black uppercase text-deep mb-3 tracking-widest pl-1">Redes Sociais</h3>
                <div className="flex gap-2">
                    {Object.entries(dados.redesSociais).map(([rede, link]: [string, any]) => {
                        if (!link) return null;
                        const label = rede === 'site' ? 'Website' : rede.charAt(0).toUpperCase() + rede.slice(1);
                        return (
                            <a key={rede} href={link.startsWith('http') ? link : `https://${link}`} target="_blank" title={label} className="group transition-transform hover:-translate-y-1">
                                <div className={`w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center transition-colors ${getSocialColor(rede)}`}>
                                    {getSocialIcon(rede)}
                                </div>
                            </a>
                        )
                    })}
                </div>
            </div>
         )}

         {/* VIDEO FEED */}
         {hasVideo && (
            <div className="mb-10">
                <h3 className="text-sm font-black uppercase text-deep mb-3 tracking-widest pl-1">Vídeo de Apresentação</h3>
                <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-black aspect-video">
                    <iframe src={videoSrc} className="w-full h-full border-none" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen></iframe>
                </div>
            </div>
         )}

         {/* INFO CARDS */}
         <div className="space-y-8">
             {/* ESPECIALIDADES */}
             <div className="mb-8">
                 <h3 className="text-sm font-black uppercase text-deep mb-3 tracking-widest pl-1">Especialidades</h3>
                 <div className="flex flex-wrap gap-2">
                     {dados.especialidades.map(e => (
                         <span key={e} className="bg-deep text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-slate-200">
                             {e}
                         </span>
                     ))}
                 </div>
             </div>

             {/* ABORDAGEM & TEMAS GRID */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                 {/* COLUNA 1: ABORDAGEM */}
                 <div className="flex flex-col">
                    <h3 className="text-sm font-black uppercase text-deep mb-3 tracking-widest pl-1">Abordagem</h3>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 min-h-[140px] flex items-center justify-center text-center h-full">
                        <p className="font-black text-slate-800 uppercase text-base">{dados.abordagem}</p>
                    </div>
                 </div>

                 {/* COLUNA 2: PÚBLICO ALVO */}
                 <div className="flex flex-col">
                    <h3 className="text-sm font-black uppercase text-deep mb-3 tracking-widest pl-1">Público Alvo</h3>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 min-h-[140px] flex items-center h-full">
                        <div className="flex flex-wrap gap-2 content-center">
                            {dados.publicoAlvo.map(p => (
                                <span key={p} className="text-xs font-bold uppercase bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg shadow-sm">
                                    {p}
                                </span>
                            ))}
                        </div>
                    </div>
                 </div>
             </div>

             {/* TEMAS */}
             <div>
                 <h3 className="text-sm font-black uppercase text-deep mb-3 tracking-widest pl-1">Temas de Trabalho</h3>
                 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex flex-wrap gap-2">
                        {dados.temas.map(t => (
                            <span key={t} className="bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-sm font-semibold">
                                {t}
                            </span>
                        ))}
                    </div>
                 </div>
             </div>
             
             {/* DETALHES */}
             <div>
                <h3 className="text-sm font-black uppercase text-deep mb-3 tracking-widest pl-1">Detalhes do Profissional</h3>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                        <div>
                            <span className="block text-[10px] uppercase text-slate-600 font-bold mb-0.5">Local</span>
                            <span className="text-sm font-bold text-slate-800">{dados.cidade ? `${dados.cidade}/${dados.estado}` : "Online"}</span>
                        </div>
                        <div>
                            <span className="block text-[10px] uppercase text-slate-600 font-bold mb-0.5">Idade/Gênero</span>
                            <span className="text-sm font-bold text-slate-800">{dados.idade} anos • {dados.genero}</span>
                        </div>
                    </div>
                </div>
             </div>
         </div>

         {/* FEEDBACK SECTION */}
         <div className="mt-12 pt-10 border-t border-slate-100">
            <h3 className="text-center text-xs font-black uppercase text-deep mb-6 tracking-widest">Avaliação Anônima</h3>
            <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm text-center">
                 <div className="flex justify-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      onClick={() => setRating(star)}
                      className={`text-3xl transition-colors ${star <= rating ? 'text-amber-400' : 'text-slate-200'}`}
                    >★</button>
                  ))}
                 </div>
                 <textarea 
                   className="w-full bg-slate-50 border-0 rounded-xl p-3 text-sm mb-4 focus:ring-2 focus:ring-deep/5 outline-none resize-none"
                   rows={3}
                   placeholder="Escreva seu depoimento..."
                   value={feedbackText}
                   onChange={e => setFeedbackText(e.target.value)}
                 />
                 <button 
                    onClick={() => {
                        if (rating > 0) {
                            enviarAvaliacao(dados.id, rating, feedbackText);
                            alert("Obrigado!"); setRating(0); setFeedbackText("");
                        }
                    }}
                    className="w-full bg-deep text-white text-xs font-bold uppercase py-3 rounded-xl hover:bg-slate-800 transition-colors"
                 >Enviar</button>
            </div>
         </div>
      </div>

       {/* MODAL AGENDA */}
       {isModalOpen && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
           {/* Modal on all devices */}
           <div className="bg-white w-full max-w-lg rounded-3xl p-6 md:p-8 max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200 shadow-2xl">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-slate-900">Agenda Disponível</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-800">✕</button>
             </div>

             <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      👋 Selecione um horário de preferência abaixo para enviar uma mensagem personalizada ao profissional e confirmar a disponibilidade.
                  </p>
              </div>

             <div className="space-y-6">
                 {/* Agenda Logic Simplified for 'Rede Social' look */}
                {["Seg", "Ter", "Qua", "Qui", "Sex"].map(d => {
                    const horarios = dados.agendaConfig?.[d] || [];
                    if(!horarios.length) return null;

                    const diasMap: Record<string, string> = {
                        'Seg': 'Segunda-feira', 'Ter': 'Terça-feira', 'Qua': 'Quarta-feira',
                        'Qui': 'Quinta-feira', 'Sex': 'Sexta-feira', 'Sab': 'Sábado', 'Dom': 'Domingo'
                    };
                    const diaExtenso = diasMap[d] || d;

                    return (
                        <div key={d}>
                            <h4 className="font-black text-xs uppercase text-slate-600 mb-2">{d}</h4>
                            <div className="flex flex-wrap gap-2">
                                {horarios.map((h:any) => (
                                    <a 
                                        key={h} 
                                        href={`https://wa.me/${dados.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá! Vi seu perfil no PsiDuo. Gostaria de verificar a disponibilidade para uma sessão na ${diaExtenso} às ${h}. É possível?`)}`} 
                                        target="_blank" 
                                        className="bg-slate-50 text-slate-700 text-xs font-bold px-3 py-2 rounded-lg border border-slate-100 hover:border-green-500 hover:text-green-600 transition-colors"
                                    >
                                        {h}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )
                })}
             </div>
           </div>
         </div>
       )}

       {showToast && (
         <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-fade-in z-50">
            Link copiado!
         </div>
       )}

      <Footer />
    </main>
  );
}
