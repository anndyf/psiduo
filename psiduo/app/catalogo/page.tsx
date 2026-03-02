"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getPsicologos, registrarCliqueWhatsapp } from "./actions";
import { ABORDAGENS } from "../../lib/constants";
import { CatalogCard } from "./CatalogCard";

// --- DADOS DOS FILTROS ---
const FILTERS_DATA = [
  {
    category: "Público Alvo",
    items: ["Individual", "Casais", "Terapia em Grupo", "Idosos", "Público LGBTQIA+", "Mulheres", "Homens", "Público Negro", "Público Indígena"],
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
  const searchParams = useSearchParams();
  const router = useRouter(); 
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
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

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

  // Ler query param de filtro
  useEffect(() => {
    const filterParam = searchParams?.get('filter');
    if (filterParam) {
       setSelectedFilters(prev => prev.includes(filterParam) ? prev : [...prev, filterParam]);
    }
  }, [searchParams]);

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
    const showOnlyGroups = selectedFilters.includes("Terapia em Grupo");

    return professionalsList.filter((pro) => {
      // 0. Filtro Exclusivo de Favoritos
      if (showFavoritesOnly && !favorites.includes(pro.id)) return false;

      // 0.1 Filtro Exclusivo de GRUPO
      // Se "Terapia em Grupo" estiver selecionado, mostra APENAS cards de grupo.
      // O psicólogo dono não deve aparecer, mesmo que atenda grupos (feature request).
      if (showOnlyGroups && pro.type !== 'grupo') return false;

      // 1. Abordagem (Ignora para grupos, pois eles têm abordagem fixa "Grupo Terapêutico" e não devem sumir)
      if (pro.type !== 'grupo' && selectedApproach !== "Todas" && pro.abordagem !== selectedApproach) return false;
      
      // 2. Preço
      if (selectedPriceRange !== "Qualquer valor") {
        if (selectedPriceRange === "Até R$ 100" && pro.preco > 100) return false;
        if (selectedPriceRange === "R$ 100 - R$ 200" && (pro.preco < 100 || pro.preco > 200)) return false;
        if (selectedPriceRange === "Acima de R$ 200" && pro.preco <= 200) return false;
      }
      
      // 3. Filtro de Temas / Público / Especialidade
      // Se tiver filtros (e não for só o de grupo que já tratamos acima), verifica match
      if (selectedFilters.length > 0) {
        // Se só tiver "Terapia em Grupo" selecionado e já filtramos pelo tipo, não precisa checar match de string para esse item específico,
        // mas a lógica abaixo funciona igual (vai dar match porque o grupo tem a tag).
        // Porém, para OUTROS filtros (ex: Ansiedade) junto com Grupo, precisamos verificar.
        
        const filtersToCheck = selectedFilters; // Verifica todos
        const hasMatch = filtersToCheck.some(filter => {
          // Se o filtro for "Terapia em Grupo", ele semrpe dá match se for do type grupo (que já garantimos acima)
          if (filter === "Terapia em Grupo" && pro.type === 'grupo') return true;

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
  }, [selectedApproach, selectedPriceRange, selectedFilters, professionalsList, showFavoritesOnly, favorites]);

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

  // Helper para o botão de destaque de Grupo
  const handleAddGroupFilter = () => {
     if (!selectedFilters.includes("Terapia em Grupo")) {
         setSelectedFilters(prev => [...prev, "Terapia em Grupo"]);
     }
  };

  return (
    <main className="min-h-screen bg-mist font-sans flex flex-col">
      <Navbar />

      {/* HEADER - LIGHT PREMIUM STYLE */}
      <div className="bg-white border-b border-slate-100 relative py-12 lg:py-20 px-6 overflow-hidden">
        {/* Subtle Decorative Backdrop */}
        <div className="absolute inset-0 z-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="absolute top-0 right-0 w-[600px] h-full bg-blue-50/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="container mx-auto max-w-6xl relative z-10 text-center lg:text-left">
           <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full text-blue-600 mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Exploração Profissional</span>
           </div>
           
           <h1 className="text-4xl lg:text-6xl font-black text-slate-900 leading-tight uppercase tracking-tighter mb-4">
             Catálogo de <br className="hidden lg:block"/> <span className="text-blue-600 italic">Especialistas.</span>
           </h1>
           
           <p className="text-slate-500 max-w-2xl font-medium text-lg leading-relaxed">
             Conecte-se com profissionais verificados e encontre o suporte ideal para sua jornada emocional. Resultados atualizados em tempo real.
           </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 md:py-8 relative">
        
        {/* BANNER DE AJUDA */}
        <div className="bg-gradient-to-r from-blue-600 to-deep rounded-3xl p-4 md:p-8 mb-6 md:mb-10 text-white shadow-xl relative overflow-hidden border border-white/10">
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
                    <button onClick={handleAddGroupFilter} className="bg-emerald-500/90 border border-emerald-400/30 text-white font-bold py-3.5 px-6 rounded-xl hover:bg-emerald-600 transition whitespace-nowrap text-center text-sm backdrop-blur-sm shadow-lg">
                        Terapia em Grupo
                    </button>
                </div>
            </div>
        </div>

        {/* DESCRIÇÃO DE GRUPOS TERAPÊUTICOS (Só aparece se não tiver filtro ou se tiver filtro de grupo) */}
        {selectedFilters.includes("Terapia em Grupo") && (
             <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 mb-10 flex flex-col md:flex-row items-center gap-6 animate-fadeIn">
                <div className="bg-emerald-100 p-4 rounded-full shrink-0">
                    <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-emerald-800 mb-1">O que é um Grupo Terapêutico?</h3>
                    <p className="text-emerald-700/80 text-sm leading-relaxed">
                        Grupos terapêuticos são espaços seguros de troca e acolhimento, mediados por um psicólogo, onde pessoas com vivências semelhantes compartilham experiências e crescem juntas. É uma forma transformadora e acessível de terapia.
                    </p>
                </div>
             </div>
        )}

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

            {/* Toggle Favoritos */}
            <div className="mb-6 pb-6 border-b border-slate-100">
                <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors flex items-center gap-2">
                        <svg className={`w-4 h-4 ${showFavoritesOnly ? 'text-red-500 fill-current' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        Apenas Favoritos
                    </span>
                    <div className={`relative w-10 h-5 rounded-full transition-colors duration-200 ease-in-out ${showFavoritesOnly ? 'bg-primary' : 'bg-slate-200'}`}>
                        <input 
                            type="checkbox" 
                            className="sr-only" 
                            checked={showFavoritesOnly} 
                            onChange={() => setShowFavoritesOnly(!showFavoritesOnly)} 
                        />
                        <span className={`absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${showFavoritesOnly ? 'translate-x-5' : 'translate-x-0'}`}></span>
                    </div>
                </label>
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
                    {ABORDAGENS.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
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
                    <p className="text-slate-600 text-sm">Encontramos <strong>{filteredProfessionals.length}</strong> profissionais</p>
                </div>

                {isLoading ? (
                    // LOADING SKELETON (Centralizado)
                    <div className="flex flex-wrap justify-center gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-full max-w-[380px] h-96 bg-white rounded-3xl shadow-sm animate-pulse border border-slate-100"></div>
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
                        <CatalogCard 
                            key={pro.id} 
                            pro={pro} 
                            isFavorite={favorites.includes(pro.id)} 
                            toggleFavorite={toggleFavorite} 
                        />
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