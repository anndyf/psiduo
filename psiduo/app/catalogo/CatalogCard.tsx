"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { registrarCliqueWhatsapp } from "./actions";

interface CatalogCardProps {
  pro: any;
  isFavorite: boolean;
  toggleFavorite: (id: string) => void;
}

export function CatalogCard({ pro, isFavorite, toggleFavorite }: CatalogCardProps) {
  const [isBioExpanded, setIsBioExpanded] = useState(false);

  // Lógica para mostrar parte do texto
  // Se for curto (< 150 chars), mostra tudo e esconde botão.
  const bioText = pro.biografia || "";
  const isLongBio = bioText.length > 150;
  const displayBio = isBioExpanded ? bioText : (isLongBio ? bioText.slice(0, 150) + "..." : bioText);

  return (
    <div 
        className={`w-full max-w-[400px] bg-white rounded-3xl p-5 flex flex-col shadow-sm border transition-all duration-300 group relative ${
            pro.plano === 'DUO_II' 
            ? 'border-primary/20 shadow-[0_20px_60px_rgba(59,130,246,0.08)] hover:shadow-[0_20px_60px_rgba(59,130,246,0.15)] transform hover:-translate-y-1' 
            : 'border-slate-100 hover:shadow-xl hover:border-slate-200 hover:-translate-y-1'
        }`}
    >
        {/* --- HEADER: Foto + Name + CRP --- */}
        <div className="flex items-center gap-4 sm:gap-5 mb-4">
            <div className="relative shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-2 sm:border-[3px] border-white relative">
                    {pro.foto ? (
                        <div className="w-full h-full rounded-xl overflow-hidden relative">
                            <Image src={pro.foto} alt={pro.nome} fill className="object-cover" sizes="(max-width: 640px) 64px, 80px" />
                        </div>
                    ) : (
                        <div className="w-full h-full rounded-xl bg-mist flex items-center justify-center text-xl sm:text-2xl font-black text-primary">
                            {pro.nome.charAt(0)}
                        </div>
                    )}
                    {pro.plano === 'DUO_II' && (
                        <div className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 bg-primary text-white p-1 sm:p-1.5 rounded-lg shadow-lg ring-2 ring-white z-10">
                            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        </div>
                    )}
                    {pro.type === 'grupo' && (
                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white text-[8px] font-black px-2 py-1 rounded-md shadow-md items-center gap-1 uppercase tracking-wider hidden sm:flex">
                            GRUPO
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <div>
                        {pro.type === 'grupo' && <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">Grupo Terapêutico</p>}
                        <h3 className="font-bold text-slate-800 text-lg sm:text-xl tracking-tight leading-tight line-clamp-2">{pro.nome}</h3>
                        {pro.type === 'grupo' && <p className="text-sm text-slate-600 mt-1">Psi. {pro.psicologoNome} <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider ml-1">CRP {pro.crp}</span></p>}
                    </div>
                    {/* Botão de Favorito (Para todos) */}
                    <button 
                        onClick={(e) => { e.preventDefault(); toggleFavorite(pro.id); }}
                        className={`p-1.5 rounded-full transition-all ${isFavorite ? 'text-red-500 bg-red-50 scale-110' : 'text-slate-400 hover:text-red-400 hover:bg-slate-50'}`}
                    >
                        <svg className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    </button>
                </div>
                {pro.type === 'individual' && <p className="text-[10px] sm:text-xs font-black text-slate-600 uppercase tracking-widest mt-0.5">CRP {pro.crp}</p>}
            </div>
        </div>

        {/* --- ABORDAGEM (BOX) --- */}
        <div className="mb-4">
            <div className={`border rounded-xl p-3 text-center ${pro.type === 'grupo' ? 'bg-emerald-50/50 border-emerald-100/50' : 'bg-blue-50/50 border-blue-100/50'}`}>
                <div className={`text-xs font-black uppercase tracking-widest w-full px-2 ${pro.type === 'grupo' ? 'text-emerald-700' : 'text-blue-700 truncate block'}`}>
                    {pro.type === 'grupo' ? (
                        <div className="flex flex-col gap-1 py-0.5">
                            <span>
                                <span className="opacity-70">Encontros: </span> 
                                {pro.diaSemana} - {pro.horario}
                            </span>
                            <div className="opacity-80 flex items-center justify-center gap-2 flex-wrap text-[8px]">
                                {pro.atendeOnline && (
                                    <span className="flex items-center gap-1">
                                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Online
                                    </span>
                                )}
                                {pro.atendePresencial && pro.cidade && (
                                    <span className="flex items-center gap-1">
                                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        {pro.cidade}
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : pro.abordagem}
                </div>
            </div>
        </div>

        {/* --- APRESENTAÇÃO (BIO) --- */}
        {pro.biografia && (
            <div className="mb-4 px-1 relative">
                <p className="text-sm text-slate-600 leading-relaxed italic font-medium">
                    "{displayBio}"
                </p>
                {isLongBio && (
                    <button 
                        onClick={() => setIsBioExpanded(!isBioExpanded)}
                        className="text-xs font-bold text-primary hover:underline mt-1 focus:outline-none"
                    >
                        {isBioExpanded ? "Ler menos" : "Ver mais"}
                    </button>
                )}
            </div>
        )}

        {/* --- ESPECIALIDADES & TEMAS --- */}
        <div className="space-y-3 mb-4 flex-1">
            {/* Especialidades (Ocultar se for grupo, já está implícito) */}
            {pro.type !== 'grupo' && pro.especialidades && pro.especialidades.length > 0 && (
                <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Especialidade</p>
                    <div className="flex flex-wrap gap-1.5">
                        {pro.especialidades.map((esp: string) => (
                            <span key={esp} className="text-[11px] text-blue-500 font-bold bg-blue-50/30 px-2.5 py-0.5 rounded-lg border border-blue-100/30">
                                {esp}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className={`grid ${pro.type === 'grupo' && pro.publicoAlvo?.length ? 'grid-cols-2 gap-2' : 'grid-cols-1'}`}>
                {/* Temas */}
                <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Temas</p>
                    <div className="flex flex-wrap gap-1.5">
                        {pro.temas.slice(0, pro.type === 'grupo' ? 1 : 2).map((tema: string) => (
                            <span key={tema} className="text-[11px] text-slate-600 font-bold bg-slate-50 px-2.5 py-0.5 rounded-lg border border-slate-100">
                                {tema}
                            </span>
                        ))}
                        {pro.temas.length > (pro.type === 'grupo' ? 1 : 2) && (
                            <span className="text-[11px] text-slate-600 font-bold py-0.5 px-1">+{pro.temas.length - (pro.type === 'grupo' ? 1 : 2)}</span>
                        )}
                    </div>
                </div>

                {/* Público Alvo (SÓ SE FOR GRUPO) */}
                {pro.type === 'grupo' && pro.publicoAlvo && pro.publicoAlvo.length > 0 && (
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Público Alvo</p>
                        <div className="flex flex-wrap gap-1.5">
                            {pro.publicoAlvo.map((p: string) => (
                                <span key={p} className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100">
                                    {p}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* VAGAS AQUI (NOVO) */}
            {pro.type === 'grupo' && (
                <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Vagas</p>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                        <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        {pro.vagasTotais || 'Ilimitadas'} vagas
                    </div>
                </div>
            )}
        </div>

        {/* --- FOOTER: Valor + Botões --- */}
        <div className="pt-4 border-t border-slate-50 flex items-center justify-between gap-3">
            {/* Preço */}
            <div className="shrink-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-0.5">
                    {pro.type === 'grupo' ? 'Sessão' : 'Sessão'}
                </p>
                <div className="flex items-baseline gap-1 whitespace-nowrap">
                    <span className={`text-2xl font-black tracking-tight leading-none ${pro.type === 'grupo' ? 'text-emerald-500' : 'text-green-500'}`}>R$ {pro.preco}</span>
                    <span className="text-xs text-slate-600 font-bold uppercase opacity-60">
                        {pro.type === 'grupo' ? '/ sessão' : `/ ${pro.duracaoSessao || 50} Min`}
                    </span>
                </div>
            </div>
            
            {/* Botões (Whatsapp Icon Only + Perfil) */}
            <div className="flex flex-1 gap-2 justify-end">
                 {/* WhatsApp Icon Btn */}
                <a 
                    href={`https://wa.me/${pro.whatsapp?.replace(/\D/g, "")}?text=${encodeURIComponent(pro.type === 'grupo' ? `Olá! Tenho interesse no grupo terapêutico "${pro.nome}".` : "Olá! Encontrei seu perfil no PsiDuo e gostaria de saber mais sobre a terapia.")}`}
                    target="_blank"
                    onClick={() => registrarCliqueWhatsapp(pro.id)}
                    className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all shadow-md hover:scale-105 ${pro.type === 'grupo' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                    title="Entrar em contato via WhatsApp"
                >
                     <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                </a>

                {pro.type !== 'grupo' ? (
                    <Link 
                        href={`/perfil/${pro.slug || pro.id}`}
                        className="flex-1 bg-deep text-white px-4 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-deep/10 hover:bg-black transition-all flex items-center justify-center gap-2 group/btn whitespace-nowrap"
                    >
                        Ver Perfil
                        <svg className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </Link>
                ) : (
                    <Link 
                        href={`https://wa.me/${pro.whatsapp?.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá! Quero me inscrever no grupo "${pro.nome}".`)}`}
                        target="_blank"
                        className="flex-1 bg-emerald-500 text-white px-4 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 group/btn whitespace-nowrap"
                    >
                        Participar
                         <svg className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </Link>
                )}
            </div>
        </div>
    </div>
  );
}
