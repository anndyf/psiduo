"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getPsicologos, registrarCliqueWhatsapp } from "./actions";

// --- DADOS DOS FILTROS ---
const FILTERS_DATA = [
  {
    category: "Público Alvo",
    items: ["Individual", "Casais", "Adultos", "Idosos", "Público LGBTQIA+", "Mulheres", "Homens", "Público Negro", "Público Indígena", "Refugiados"],
  },
  {
    category: "Saúde emocional e mental",
    items: ["Ansiedade", "Depressão", "Estresse e Burnout", "Transtornos do humor", "Luto e perdas"],
  },
  {
    category: "Autoconhecimento",
    items: ["Autoestima e confiança", "Identidade e propósito", "Autocrítica excessiva", "Regulação emocional", "Tomada de decisões"],
  },
  {
    category: "Relacionamentos",
    items: ["Conflitos familiares", "Relacionamentos amorosos", "Comunicação assertiva", "Dependência emocional", "Separação e divórcio"],
  },
  {
    category: "Trabalho e Carreira",
    items: ["Carreira", "Insatisfação profissional", "Conflitos no trabalho", "Equilíbrio vida/trabalho"],
  },
];

export default function Catalogo() {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<number[]>([0]);
  const [hasMounted, setHasMounted] = useState(false);

  // --- ESTADO DOS PROFISSIONAIS ---
  const [professionalsList, setProfessionalsList] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(true);

  // --- ESTADOS DOS FILTROS ---
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedApproach, setSelectedApproach] = useState("Todas");
  const [selectedPriceRange, setSelectedPriceRange] = useState("Qualquer valor");

  // --- FAVORITOS ---
  const [favorites, setFavorites] = useState<string[]>([]);

  // --- BUSCAR DADOS DO BANCO ---
  useEffect(() => {
    setHasMounted(true);
    // Carregar favoritos do localStorage
    const savedFavs = localStorage.getItem("psiduo_favorites");
    if (savedFavs) {
      try {
        setFavorites(JSON.parse(savedFavs));
      } catch (e) { console.error(e); }
    }

    async function loadData() {
      try {
        const data = await getPsicologos();
        setProfessionalsList(data);
      } catch (error) {
        console.error("Erro ao buscar psicólogos:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const hasFilters = selectedFilters.length > 0 || selectedApproach !== "Todas" || selectedPriceRange !== "Qualquer valor";

  const clearAllFilters = () => {
    setSelectedFilters([]);
    setSelectedApproach("Todas");
    setSelectedPriceRange("Qualquer valor");
  };

  const toggleFavorite = (id: string) => {
    const newFavs = favorites.includes(id) 
      ? favorites.filter(favId => favId !== id)
      : [...favorites, id];
    
    setFavorites(newFavs);
    localStorage.setItem("psiduo_favorites", JSON.stringify(newFavs));
  };

  // --- LÓGICA DE FILTRAGEM ---
  const filteredProfessionals = useMemo(() => {
    return professionalsList.filter((pro) => {
      // 1. Abordagem
      if (selectedApproach !== "Todas" && pro.abordagem !== selectedApproach) return false;
      
      // 2. Preço
      if (selectedPriceRange !== "Qualquer valor") {
        if (selectedPriceRange === "Até R$ 100" && pro.preco > 100) return false;
        if (selectedPriceRange === "R$ 100 - R$ 200" && (pro.preco < 100 || pro.preco > 200)) return false;
        if (selectedPriceRange === "Acima de R$ 200" && pro.preco <= 200) return false;
      }
      
      // 3. Filtro de Temas / Público / Especialidade
      if (selectedFilters.length > 0) {
        const hasMatch = selectedFilters.some(filter => {
          const lowerFilter = filter.toLowerCase();
          const inTemas = pro.temas.some((tema: string) => tema.toLowerCase().includes(lowerFilter) || lowerFilter.includes(tema.toLowerCase()));
          const inPublico = pro.publicoAlvo?.some((p: string) => p.toLowerCase().includes(lowerFilter) || lowerFilter.includes(p.toLowerCase()));
          const inEspec = pro.especialidades?.some((e: string) => e.toLowerCase().includes(lowerFilter) || lowerFilter.includes(e.toLowerCase()));
          return inTemas || inPublico || inEspec;
        });
        if (!hasMatch) return false;
      }
      return true;
    });
  }, [selectedApproach, selectedPriceRange, selectedFilters, professionalsList]);

  // Funções de UI
  const toggleCategory = (index: number) => {
    if (openCategories.includes(index)) {
      setOpenCategories(openCategories.filter((i) => i !== index));
    } else {
      setOpenCategories([...openCategories, index]);
    }
  };

  const handleCheckboxChange = (item: string) => {
    if (selectedFilters.includes(item)) {
      setSelectedFilters(selectedFilters.filter((i) => i !== item));
    } else {
      setSelectedFilters([...selectedFilters, item]);
    }
  };

  return (
    <main className="min-h-screen bg-mist font-sans flex flex-col">
      <Navbar />

      {/* HEADER */}
      <div className="bg-deep text-white py-12 text-center px-4">
        <h1 className="text-3xl lg:text-4xl font-bold mb-2">Catálogo de Profissionais</h1>
        <p className="text-slate-300 max-w-xl mx-auto">
          Encontre o especialista ideal. Os resultados atualizam automaticamente.
        </p>
      </div>

      <div className="container mx-auto px-4 py-8 relative">
        
        {/* BANNER DE AJUDA */}
        <div className="bg-gradient-to-r from-blue-600 to-deep rounded-3xl p-8 mb-10 text-white shadow-xl relative overflow-hidden border border-white/10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="text-center md:text-left max-w-2xl">
                    <h3 className="text-2xl font-bold mb-2 flex items-center justify-center md:justify-start gap-2">
                        <svg className="w-6 h-6 text-blue-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM11 2a1 1 0 011-1.5 1 1 0 112 0A1 1 0 0115 2v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0V5h-1a1 1 0 110-2h1V2zm0 10a1 1 0 011-1.5 1 1 0 112 0A1 1 0 0115 12v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1z" clipRule="evenodd" /></svg>
                        Não sabe por onde começar?
                    </h3>
                    <p className="text-blue-100 text-sm md:text-base leading-relaxed">
                        Responda ao nosso questionário inteligente e receba uma recomendação personalizada.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <Link href="/quiz/individual" className="bg-white text-blue-700 font-bold py-3.5 px-6 rounded-xl hover:bg-blue-50 transition shadow-md whitespace-nowrap text-center text-sm">
                        Conexão Individual
                    </Link>
                    <Link href="/quiz/casal" className="bg-blue-800/50 border border-blue-400/30 text-white font-bold py-3.5 px-6 rounded-xl hover:bg-blue-800 transition whitespace-nowrap text-center text-sm backdrop-blur-sm">
                        Conexão para Casal
                    </Link>
                </div>
            </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* BOTÃO FILTRO MOBILE */}
            <div className="lg:hidden w-full sticky top-4 z-30">
                <button 
                className="w-full bg-deep text-white py-3 px-4 rounded-xl shadow-lg border border-white/10 font-bold flex justify-between items-center"
                onClick={() => setIsMobileFilterOpen(true)}
                >
                <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                    Filtrar Resultados
                </span>
                <span className="bg-primary px-2 py-0.5 rounded text-xs">
                    {selectedFilters.length > 0 ? `${selectedFilters.length}` : "+"}
                </span>
                </button>
            </div>

            <aside 
                className={`
                    bg-white shadow-sm border border-slate-100 p-6
                    ${isMobileFilterOpen ? 'fixed inset-0 z-50 overflow-y-auto w-full h-full rounded-none' : 'hidden lg:block lg:w-1/4 lg:rounded-2xl lg:sticky lg:top-8'}
                `.replace(/\s+/g, ' ').trim()}
            >
            <div className="lg:hidden flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <h3 className="font-bold text-xl text-deep">Filtros</h3>
                <div className="flex items-center gap-4">
                {hasFilters && (
                    <button onClick={clearAllFilters} className="text-sm font-bold text-primary hover:text-blue-700 transition">Limpar</button>
                )}
                <button onClick={() => setIsMobileFilterOpen(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold">✕</button>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6 hidden lg:flex">
                <h3 className="font-bold text-lg text-deep">Filtros</h3>
                {hasFilters && (
                    <span onClick={clearAllFilters} className="text-xs text-primary cursor-pointer hover:underline">Limpar tudo</span>
                )}
            </div>

            {/* Filtros Básicos */}
            <div className="mb-8 space-y-4">
                <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Abordagem</label>
                <select 
                    value={selectedApproach}
                    onChange={(e) => setSelectedApproach(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm text-slate-600 focus:ring-2 focus:ring-primary outline-none bg-white"
                    suppressHydrationWarning={true}
                >
                    <option value="Todas">Todas as abordagens</option>
                    <option value="Psicanálise">Psicanálise</option>
                    <option value="TCC">TCC</option>
                    <option value="Humanista">Humanista</option>
                    <option value="Gestalt">Gestalt</option>
                    <option value="Comportamental">Comportamental</option>
                </select>
                </div>
                <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Valor da Sessão</label>
                <select 
                    value={selectedPriceRange}
                    onChange={(e) => setSelectedPriceRange(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm text-slate-600 focus:ring-2 focus:ring-primary outline-none bg-white"
                    suppressHydrationWarning={true}
                >
                    <option>Qualquer valor</option>
                    <option>Até R$ 100</option>
                    <option>R$ 100 - R$ 200</option>
                    <option>Acima de R$ 200</option>
                </select>
                </div>
            </div>
            <hr className="border-slate-100 mb-6" />
            
            {/* Filtros por TEMAS */}
            <div className="space-y-2 mb-20 lg:mb-0">
                <p className="text-sm font-bold text-slate-700 mb-3">Temas e Queixas</p>
                {FILTERS_DATA.map((category, idx) => (
                <div key={idx} className="border-b border-slate-50 last:border-0">
                    <button 
                    onClick={() => toggleCategory(idx)}
                    className="w-full flex justify-between items-center py-3 text-left hover:bg-slate-50 transition rounded-lg px-2 group"
                    >
                    <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition">{category.category}</span>
                    <span className="text-slate-400 text-lg">{openCategories.includes(idx) ? "−" : "+"}</span>
                    </button>
                    {openCategories.includes(idx) && (
                    <div className="pl-4 pb-3 space-y-3 animate-fadeIn">
                        {category.items.map((item, itemIdx) => (
                        <label key={itemIdx} className="flex items-start space-x-3 cursor-pointer group">
                            <input 
                                type="checkbox" 
                                className="mt-0.5 rounded border-slate-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer" 
                                checked={selectedFilters.includes(item)}
                                onChange={() => handleCheckboxChange(item)}
                                suppressHydrationWarning={true}
                            />
                            <span className={`text-xs transition ${selectedFilters.includes(item) ? 'text-primary font-bold' : 'text-slate-500 group-hover:text-deep'}`}>
                                {item}
                            </span>
                        </label>
                        ))}
                    </div>
                    )}
                </div>
                ))}
            </div>
            <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
                <button onClick={() => setIsMobileFilterOpen(false)} className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-xl">Ver {filteredProfessionals.length} Profissionais</button>
            </div>
            </aside>

{/* --- GRID DE RESULTADOS (CENTRALIZAÇÃO DEFINITIVA) --- */}
            <section className="flex-1 min-h-[500px] w-full">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <p className="text-slate-500 text-sm">Encontramos <strong>{filteredProfessionals.length}</strong> profissionais</p>
                </div>

                {isLoading ? (
                    // LOADING SKELETON (Centralizado)
                    <div className="flex flex-wrap justify-center gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-full max-w-[380px] h-96 bg-white rounded-2xl shadow-sm animate-pulse border border-slate-100"></div>
                    ))}
                    </div>
                ) : filteredProfessionals.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                        <div className="text-slate-300 mb-4 flex justify-center">
                            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <p className="text-slate-500 font-medium">Nenhum profissional encontrado.</p>
                        <button onClick={clearAllFilters} className="text-primary text-sm font-bold mt-2 hover:underline">Limpar filtros</button>
                    </div>
                ) : (
                    // CONTAINER PRINCIPAL: flex-wrap + justify-center
                    <div className="flex flex-wrap justify-center content-start gap-6 w-full">
                        {filteredProfessionals.map((pro) => (
                        <div 
                            key={pro.id} 
                            className={`w-full max-w-[400px] bg-white rounded-[2.5rem] p-5 sm:p-6 flex flex-col shadow-sm border transition-all duration-300 group relative ${
                                pro.plano === 'DUO_II' 
                                ? 'border-primary/20 shadow-[0_20px_60px_rgba(59,130,246,0.08)] hover:shadow-[0_20px_60px_rgba(59,130,246,0.15)]' 
                                : 'border-slate-100 hover:shadow-2xl hover:border-slate-200'
                            }`}
                        >
                            {/* --- HEADER: Foto + Name + CRP --- */}
                            <div className="flex items-center gap-4 sm:gap-5 mb-4">
                                <div className="relative shrink-0">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.25rem] sm:rounded-[1.5rem] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-2 sm:border-[3px] border-white relative">
                                        {pro.foto ? (
                                            <div className="w-full h-full rounded-[1.1rem] sm:rounded-[1.3rem] overflow-hidden relative">
                                                <Image src={pro.foto} alt={pro.nome} fill className="object-cover" sizes="(max-width: 640px) 64px, 80px" />
                                            </div>
                                        ) : (
                                            <div className="w-full h-full rounded-[1.1rem] sm:rounded-[1.3rem] bg-mist flex items-center justify-center text-xl sm:text-2xl font-black text-primary">
                                                {pro.nome.charAt(0)}
                                            </div>
                                        )}
                                        {pro.plano === 'DUO_II' && (
                                            <div className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 bg-primary text-white p-1 sm:p-1.5 rounded-lg shadow-lg ring-2 ring-white z-10">
                                                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-slate-800 text-base sm:text-lg tracking-tight leading-tight">{pro.nome}</h3>
                                        <button 
                                            onClick={(e) => { e.preventDefault(); toggleFavorite(pro.id); }}
                                            className={`p-1.5 rounded-full transition-all ${favorites.includes(pro.id) ? 'text-red-500 bg-red-50 scale-110' : 'text-slate-300 hover:text-red-400 hover:bg-slate-50'}`}
                                        >
                                            <svg className="w-4 h-4" fill={favorites.includes(pro.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                        </button>
                                    </div>
                                    <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">CRP {pro.crp}</p>
                                </div>
                            </div>

                            {/* --- WHATSAPP FAST CONTACT --- */}
                            <div className="mb-4">
                                <a 
                                    href={`https://wa.me/${pro.whatsapp?.replace(/\D/g, "")}?text=${encodeURIComponent("Olá! Encontrei seu perfil no PsiDuo e gostaria de saber mais sobre a terapia.")}`}
                                    target="_blank"
                                    onClick={() => registrarCliqueWhatsapp(pro.id)}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-50 text-green-600 border border-green-100 font-bold text-[10px] uppercase tracking-widest hover:bg-green-100 transition-colors"
                                >
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                    Contato via WhatsApp
                                </a>
                            </div>

                            {/* --- ABORDAGEM (BOX) --- */}
                            <div className="mb-4">
                                <div className="bg-blue-50/50 border border-blue-100/50 rounded-xl p-3 text-center">
                                    <span className="text-[9px] font-black text-blue-700 uppercase tracking-widest truncate block w-full px-2">
                                        {pro.abordagem}
                                    </span>
                                </div>
                            </div>

                            {/* --- ESPECIALIDADES & TEMAS --- */}
                            <div className="space-y-3 mb-4 flex-1">
                                {/* Especialidades */}
                                {pro.especialidades && pro.especialidades.length > 0 && (
                                    <div>
                                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Especialidade</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {pro.especialidades.map((esp: string) => (
                                                <span key={esp} className="text-[9px] text-blue-500 font-bold bg-blue-50/30 px-2.5 py-0.5 rounded-lg border border-blue-100/30">
                                                    {esp}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Temas */}
                                <div>
                                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Temas</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {pro.temas.slice(0, 2).map((tema: string) => (
                                            <span key={tema} className="text-[9px] text-slate-500 font-bold bg-slate-50 px-2.5 py-0.5 rounded-lg border border-slate-100">
                                                {tema}
                                            </span>
                                        ))}
                                        {pro.temas.length > 2 && (
                                            <span className="text-[9px] text-slate-400 font-bold py-0.5 px-1">+{pro.temas.length - 2}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Público Alvo */}
                                {pro.publicoAlvo && pro.publicoAlvo.length > 0 && (
                                    <div>
                                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1 ">Acompanhamento</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {pro.publicoAlvo.map((p: string) => (
                                                <span key={p} className="text-[8px] text-slate-400 font-bold bg-white px-2 py-0.5 rounded-md border border-slate-100">
                                                    {p}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Bio Snippet */}
                                {pro.biografia && (
                                    <div className="pt-2">
                                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Apresentação</p>
                                        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 italic font-medium">
                                            "{pro.biografia}"
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* --- FOOTER: Valor + Botão --- */}
                            <div className="pt-4 border-t border-slate-50 flex items-center justify-between gap-3">
                                <div className="shrink-0">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Sessão</p>
                                    <div className="flex items-baseline gap-1 whitespace-nowrap">
                                        <span className="text-xl font-black text-green-500 tracking-tight leading-none">R$ {pro.preco}</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase opacity-60">/ {pro.duracaoSessao || 50}m</span>
                                    </div>
                                </div>
                                
                                <Link 
                                    href={`/perfil/${pro.slug || pro.id}`}
                                    className="flex-1 bg-deep text-white px-5 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-deep/10 hover:bg-black transition-all flex items-center justify-center gap-2 group/btn whitespace-nowrap"
                                >
                                    Perfil Completo
                                    <svg className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                </Link>
                            </div>
                        </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}