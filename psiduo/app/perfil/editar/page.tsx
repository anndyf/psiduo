"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { salvarEAtivarPerfilCompleto, buscarDadosPsicologo } from "../actions";
import { useSession } from "next-auth/react";
import ProfileHealth from "./components/ProfileHealth";
import DuoIISection from "./components/DuoIISection";
import { PsicologoFormData } from "@/types/psicologo";
import { compressImage } from "@/utils/imageCompression";

// LISTAS DE OPÇÕES
const ESTADOS_BR = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

const ABORDAGENS = [
  "Psicanálise Freudiana (Sigmund Freud)", "Psicologia Analítica / Jungiana (Carl Gustav Jung)", "Psicanálise Lacaniana (Jacques Lacan)",
  "Psicanálise Winnicottiana (Donald Winnicott)", "Análise do comportamento", "TCC – Terapia cognitivo-comportamental",
  "Terapia Racional-Emotiva Comportamental (REBT)", "Terapia Cognitiva Construtivista", "ACT – Terapia de Aceitação e Compromisso",
  "DBT – Terapia Dialética Comportamental", "FAP – Psicoterapia Analítico-Funcional", "Terapia de Esquemas",
  "Psicologia Baseada em Evidências - PBE", "Psicoterapia Breve", "Terapia Comportamental Integrativa de Casais - IBCT",
  "Gestalt-Terapia", "Abordagem Centrada na Pessoa (ACP)", "Terapia Focada na Emoção (EFT)", "Psicoterapia Humanista-Existencial",
  "Fenomenológica/Existencial", "Logoterapia", "Daseinsanalyse", "Esquizoanálise", "Terapia Sistêmica",
  "Terapia Familiar Estrutural", "Terapia Familiar Estratégica", "Terapia Familiar de Bowen", "Terapia Narrativa",
  "Terapia Sistêmica Pós-Moderna", "Terapia de Casal Sistêmica", "Psicoterapia Construtivista", "Análise Bioenergética",
  "Psicoterapia Corporal", "Psicodrama", "Psicodinâmica", "Neuropsicologia Clínica", "Psicoterapia Baseada em Neurociência",
  "Programação neurolinguística - PNL", "Teoria do Apego (clínica)", "Psicologia Positiva Clínica", "Orientação profissional e vocacional"
];

const LISTA_ESPECIALIDADES = [
  "Avaliação Neuropsicológica",
  "Avaliação Psicológica",
  "Clima e Cultura Organizacional",
  "Clínica com Adultos e Idosos",
  "Gestalt-terapia",
  "Gestão de Conflitos no Trabalho",
  "Gestão de Pessoas / Desenvolvimento Humano",
  "Instrumentos e Técnicas de Avaliação Psicológica",
  "Laudos e Pareceres em Avaliação Psicológica",
  "MBA em Gestão de Recursos Humanos",
  "Neuropsicologia",
  "Neuropsicologia Clínica",
  "People Analytics para Psicólogos",
  "Psicanálise (clínica psicanalítica)",
  "Psico-oncologia",
  "Psicodrama",
  "Psicologia Clínica",
  "Psicologia Clínica em Saúde",
  "Psicologia da Dor e Reabilitação",
  "Psicologia da Saúde Mental",
  "Psicologia do Trauma e Luto",
  "Psicologia em Saúde",
  "Psicologia Hospitalar",
  "Psicologia Organizacional e do Trabalho",
  "Psicologia Paliativa",
  "Psicometria e Avaliação Psicológica",
  "Psicoterapia",
  "Reabilitação Neuropsicológica",
  "Recrutamento, Seleção e Avaliação de Talentos",
  "Recursos Humanos (RH)",
  "Saúde Coletiva com ênfase em Psicologia",
  "Saúde Mental e Qualidade de Vida no Trabalho",
  "Terapia de Casal e Família",
  "Terapia Humanista/Existencial",
  "Terapia Sistêmica e Familiar",
  "Terapias Cognitivo-Comportamentais (TCC)",
  "Terapias Contextuais / 3ª Geração (ACT, DBT, FAP)",
  "Testes Psicológicos: Aplicação e Interpretação",
  "Treinamento e Desenvolvimento (T&D)"
];

const LISTA_TEMAS = [
  "Ansiedade", "Depressão", "Estresse e Burnout", "Transtornos do humor", "Luto e perdas",
  "Autoestima e confiança", "Identidade e propósito", "Regulação emocional", "Conflitos familiares",
  "Relacionamentos amorosos", "Dependência emocional", "Carreira", "Insatisfação profissional"
];

const OPCOES_GENERO = ["Mulher Cis", "Homem Cis", "Mulher Trans", "Homem Trans", "Não-binário", "Agênero", "Gênero Fluido", "Queer", "Prefiro não dizer"];
const OPCOES_ETNIA = ["Branca", "Preta", "Parda", "Amarela", "Indígena"];
const OPCOES_SEXUALIDADE = ["Heterossexual", "Lésbica", "Gay", "Bissexual", "Pansexual", "Assexual", "Queer"];
const OPCOES_RELIGIAO = ["Católico", "Evangélico", "Espírita", "Budista", "Religião de Matriz Africana", "Ateu / Agnóstico", "Sem religião específica", "Prefiro não dizer"];
const OPCOES_ESTILO = [
  { l: "Casual (Mais descontraído)", v: "CASUAL" },
  { l: "Formal (Postura mais clássica)", v: "FORMAL" },
  { l: "Meio Termo (Equilíbrio)", v: "MEIO_TERMO" }
];
const OPCOES_DIRETIVIDADE = [
  { l: "Não Diretivo (Mais escuta, menos interferência)", v: "NAO_DIRETIVO" },
  { l: "Pouco Diretivo (Interfere ocasionalmente)", v: "POUCO_DIRETIVO" },
  { l: "Muito Diretivo (Sugere ações e ferramentas)", v: "MUITO_DIRETIVO" }
];
const LISTA_PUBLICO = ["Idosos","Público LGBTQIA+", "Mulheres", "Homens", "Público Negro", "Público Indígena", "Refugiados"];

export default function EditarPerfilCompleto() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [msg, setMsg] = useState({ tipo: "", texto: "" });
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<PsicologoFormData>({
    foto: "", biografia: "", abordagem: "", whatsapp: "", preco: 150, duracaoSessao: 50,
    especialidades: [], temas: [],
    idade: "", genero: "", etnia: "", sexualidade: "", religiao: "", estilo: "", diretividade: "", publicoAlvo: [],
    cidade: "", estado: "", videoApresentacao: "", 
    redesSociais: { instagram: "", linkedin: "", site: "" },
    agendaConfig: { Seg: [], Ter: [], Qua: [], Qui: [], Sex: [], Sab: [], Dom: [] },
    plano: "DUO_I",
    acessos: 0,
    nome: ""
  });

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    async function init() {
      const user = session?.user as any;
      if (!user?.psicologoId) {
         setFetching(false);
         return;
      }
      
      const psid = user.psicologoId as string;
      setUserId(psid);
      
      const res = await buscarDadosPsicologo(psid); 
      if (res.success && res.dados) {
        const valorFormatado = formatarMascaraWhatsapp(res.dados.whatsapp);
        
        let agenda = res.dados.agendaConfig as any;
        if (!agenda || typeof agenda !== 'object') {
            agenda = { Seg: [], Ter: [], Qua: [], Qui: [], Sex: [], Sab: [], Dom: [] };
        }

        setFormData({ 
            ...res.dados,
            // Cast forçando conformidade com a interface se necessário, mas res.dados deve bater
            whatsapp: valorFormatado,
            redesSociais: res.dados.redesSociais || { instagram: "", linkedin: "", site: "" },
            agendaConfig: agenda,
            plano: res.dados.plano || "DUO_I",
        } as PsicologoFormData);
      }
      setFetching(false);
    }
    init();
  }, [router, session, status]);

  const formatarMascaraWhatsapp = (valor: string) => {
    const nums = valor.replace(/\D/g, ""); 
    if (nums.length <= 2) return nums;
    if (nums.length <= 3) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
    if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2, 3)} ${nums.slice(3)}`;
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 3)} ${nums.slice(3, 7)}-${nums.slice(7, 11)}`;
  };

  const handleWhatsappChange = (valor: string) => {
    const formatado = formatarMascaraWhatsapp(valor);
    setFormData({ ...formData, whatsapp: formatado });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setLoading(true);
        // Compress image to max 800x800 and 70% quality
        const compressedBase64 = await compressImage(file, 800, 800, 0.7);
        setFormData({ ...formData, foto: compressedBase64 });
      } catch (error) {
        console.error("Erro ao processar imagem:", error);
        setMsg({ tipo: "erro", texto: "Não foi possível processar a imagem. Tente outra." });
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleItem = (item: string, categoria: 'especialidades' | 'temas' | 'publicoAlvo') => {
    const LIMITES = {
      especialidades: 2,
      temas: 5,
      publicoAlvo: 10
    };
    const limite = LIMITES[categoria];

    setFormData(prev => {
      const lista = prev[categoria] as string[];
      if (lista.includes(item)) return { ...prev, [categoria]: lista.filter(i => i !== item) };
      if (lista.length < limite) return { ...prev, [categoria]: [...lista, item] };
      return prev;
    });
  };

  const handleSubmit = async () => {
    if (!userId) return;

    // VALIDATION: Modalidade Obrigatória
    const temModalidade = formData.publicoAlvo.includes("Individual") || formData.publicoAlvo.includes("Casais");
    if (!temModalidade) {
        setMsg({ tipo: "erro", texto: "Selecione pelo menos uma modalidade: Individual ou Casais." });
        setShowModal(false);
        // Scroll to top to see error ideally, or standard toast handles it
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    setShowModal(false);
    setLoading(true);
    const result = await salvarEAtivarPerfilCompleto(userId, formData);
    if (result.success) {
      setMsg({ tipo: "sucesso", texto: "Alterações salvas com sucesso! Redirecionando..." });
      setTimeout(() => router.push("/painel"), 2000);
    } else {
      setMsg({ tipo: "erro", texto: result.error || "Erro ao salvar alterações." });
    }
    setLoading(false);
  };

  if (fetching) return (
    <div className="min-h-screen bg-mist flex flex-col items-center justify-center gap-6">
      <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      <p className="font-black text-deep text-lg uppercase tracking-[0.3em] animate-pulse">Carregando Perfil...</p>
    </div>
  );

  return (
    <main className="min-h-screen bg-mist flex flex-col text-slate-800">
      <Navbar />
      <div className="container mx-auto max-w-5xl py-10 px-4 flex-1">
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
          
          <div className="bg-deep p-8 text-white text-center">
            <h1 className="text-3xl font-black mb-2 uppercase tracking-tight">Editar Perfil Profissional</h1>
            <p className="text-blue-200 text-base font-bold">Mantenha seus dados atualizados.</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); setShowModal(true); }} className="px-4 py-8 md:p-12 space-y-12">
            
            {msg.texto && (
              <div className={`p-4 rounded-xl text-center font-black text-lg animate-in fade-in slide-in-from-top-2 duration-300 ${
                msg.tipo === 'sucesso' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
              }`}>
                {msg.texto}
              </div>
            )}

            {/* BARRA DE SAÚDE COMPONENTIZADA */}
            <ProfileHealth formData={formData} />

            {/* SEÇÃO 0: DESEMPENHO E PLANO */}
            <section className="bg-slate-50 border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                <div className="flex-1 text-center md:text-left px-4">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Seu Plano Atual</span>
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <span className={`text-lg font-black uppercase tracking-tight flex items-center gap-2 ${formData.plano === 'DUO_II' ? 'text-primary' : 'text-slate-500'}`}>
                      {formData.plano === 'DUO_II' && (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      )}
                      {formData.plano === 'DUO_II' ? 'Duo II (Premium)' : 'Duo I (Básico)'}
                    </span>
                  </div>
                </div>
                <Link href="/cadastro/planos" className="bg-white text-deep border-2 border-slate-200 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition shadow-sm whitespace-nowrap">
                   Mudar de Plano
                </Link>
            </section>

            {/* SEÇÃO 1: APRESENTAÇÃO E LOCALIZAÇÃO */}
            <section className="space-y-8">
              <h2 className="text-2xl font-black text-deep border-b-2 border-slate-100 pb-3 flex items-center gap-3 uppercase">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-base font-black italic">1</span>
                Apresentação e Localização
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-10 items-start">
                <div className="flex flex-col items-center gap-4">
                  <label className="block text-sm font-black text-slate-500 uppercase tracking-widest text-center">Sua Foto Profissional</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()} 
                    className="w-44 h-44 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition shadow-inner group relative"
                  >
                    {formData.foto ? (
                      <Image src={formData.foto} fill className="object-cover" alt="Preview" />
                    ) : (
                      <div className="text-center p-4 text-slate-400 text-xs font-black uppercase">Upload</div>
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <span className="text-white text-xs font-black uppercase tracking-wider">Alterar Foto</span>
                    </div>
                  </div>
                  <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />
                </div>
                
                <div className="md:col-span-3 space-y-6">
                  <div>
                    <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Nome Completo</label>
                    <input required type="text" placeholder="Seu nome profissional" className="w-full border border-slate-200 rounded-xl p-4 bg-slate-50 text-base font-black text-deep outline-none focus:ring-2 focus:ring-primary transition" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-1">
                      <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">WhatsApp</label>
                      <input required type="text" placeholder="(00) 0 0000-0000" className="w-full border border-slate-200 rounded-xl p-4 bg-slate-50 text-base font-black text-deep outline-none focus:ring-2 focus:ring-primary transition" value={formData.whatsapp} onChange={(e) => handleWhatsappChange(e.target.value)} />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Cidade</label>
                      <input required type="text" placeholder="Ex: São Paulo" className="w-full border border-slate-200 rounded-xl p-4 bg-slate-50 text-base font-black text-deep outline-none focus:ring-2 focus:ring-primary transition" value={formData.cidade} onChange={(e) => setFormData({...formData, cidade: e.target.value})} />
                    </div>

                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Estado (UF)</label>
                      <select required className="w-full border border-slate-200 rounded-xl p-4 bg-white text-base font-black text-deep outline-none focus:ring-2 focus:ring-primary transition" value={formData.estado} onChange={(e) => setFormData({...formData, estado: e.target.value})}>
                        <option value="">UF</option>
                        {ESTADOS_BR.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-base font-black text-slate-700 mb-2 uppercase tracking-wide">Biografia Profissional (Máx. 300 caracteres)</label>
                    <textarea required rows={4} maxLength={300} className="w-full border border-slate-200 rounded-2xl p-5 bg-slate-50 text-lg outline-none focus:ring-2 focus:ring-primary transition font-medium leading-relaxed" placeholder="Conte para os pacientes sobre sua experiência..." value={formData.biografia} onChange={e => setFormData({...formData, biografia: e.target.value})} />
                    <div className="flex justify-between mt-2 px-1">
                      <p className="text-xs text-slate-500 font-bold tracking-tight">Mínimo 50 caracteres.</p>
                      <span className={`text-xs font-black ${formData.biografia.length < 50 ? "text-red-500" : "text-green-600"}`}>
                        {formData.biografia.length} / 300
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SEÇÃO 2: IDENTIDADE PROFISSIONAL (Mantida, pode ser extraída num futuro update) */}
            <section className="space-y-8">
              <h2 className="text-2xl font-black text-deep border-b-2 border-slate-100 pb-3 flex items-center gap-3 uppercase">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-base font-black italic">2</span>
                Identidade Profissional
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-base font-black text-slate-700 mb-2 uppercase">Idade</label>
                  <input required type="number" className="w-full border border-slate-200 rounded-xl p-4 bg-slate-50 text-base font-black" value={formData.idade} onChange={e => setFormData({...formData, idade: e.target.value})} />
                </div>
                <div>
                  <label className="block text-base font-black text-slate-700 mb-2 uppercase">Gênero</label>
                  <select required className="w-full border border-slate-200 rounded-xl p-4 bg-white text-base font-black" value={formData.genero} onChange={e => setFormData({...formData, genero: e.target.value})}>
                    <option value="">Selecione</option>
                    {OPCOES_GENERO.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-base font-black text-slate-700 mb-2 uppercase">Etnia</label>
                  <select required className="w-full border border-slate-200 rounded-xl p-4 bg-white text-base font-black" value={formData.etnia} onChange={e => setFormData({...formData, etnia: e.target.value})}>
                    <option value="">Selecione</option>
                    {OPCOES_ETNIA.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-base font-black text-slate-700 mb-2 uppercase">Sexualidade</label>
                  <select required className="w-full border border-slate-200 rounded-xl p-4 bg-white text-base font-black" value={formData.sexualidade} onChange={e => setFormData({...formData, sexualidade: e.target.value})}>
                    <option value="">Selecione</option>
                    {OPCOES_SEXUALIDADE.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-base font-black text-slate-700 mb-2 uppercase">Religião</label>
                  <select required className="w-full border border-slate-200 rounded-xl p-4 bg-white text-base font-black" value={formData.religiao} onChange={e => setFormData({...formData, religiao: e.target.value})}>
                    <option value="">Selecione</option>
                    {OPCOES_RELIGIAO.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                <div className="px-4 py-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <label className="block text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Seu Estilo de Atendimento</label>
                  <div className="grid grid-cols-1 gap-2">
                    {OPCOES_ESTILO.map(opt => (
                      <button
                        key={opt.v}
                        type="button"
                        onClick={() => setFormData({...formData, estilo: opt.v})}
                        className={`p-4 rounded-xl font-bold text-xs md:text-sm text-center md:text-left transition-all border-2 ${
                          formData.estilo === opt.v ? "bg-primary text-white border-primary shadow-md shadow-primary/20" : "bg-white text-slate-600 border-slate-100 hover:border-blue-100"
                        }`}
                      >
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="px-4 py-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <label className="block text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Nível de Diretividade</label>
                  <div className="grid grid-cols-1 gap-2">
                    {OPCOES_DIRETIVIDADE.map(opt => (
                      <button
                        key={opt.v}
                        type="button"
                        onClick={() => setFormData({...formData, diretividade: opt.v})}
                        className={`p-4 rounded-xl font-bold text-xs md:text-sm text-center md:text-left transition-all border-2 ${
                          formData.diretividade === opt.v ? "bg-primary text-white border-primary shadow-md shadow-primary/20" : "bg-white text-slate-600 border-slate-100 hover:border-blue-100"
                        }`}
                      >
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8">
                  <label className="block text-base font-black text-slate-700 mb-2 uppercase">Abordagem Teórica Principal</label>
                  <select required className="w-full border border-slate-200 rounded-xl p-4 bg-white text-base font-black" value={formData.abordagem} onChange={e => setFormData({...formData, abordagem: e.target.value})}>
                    <option value="">Selecione sua abordagem...</option>
                    {ABORDAGENS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
            </section>

           {/* SEÇÃO 3: CONFIGURAÇÕES DE ATENDIMENTO (Mantida) */}
            <section className="space-y-12">
              <h2 className="text-2xl font-black text-deep border-b-2 border-slate-100 pb-3 flex items-center gap-3 uppercase">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-base font-black italic">3</span>
                Especialidade e Público
              </h2>

              <div className="bg-slate-50 px-4 py-6 rounded-[2.5rem] border border-slate-100 space-y-6 shadow-sm">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-lg font-black text-deep uppercase tracking-wide">ESPECIALIZAÇÃO PROFISSIONAL</label>
                    <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1.5 rounded-full uppercase tracking-tighter shadow-sm">{formData.especialidades.length} de 2 selecionadas</span>
                  </div>
                  <p className="text-sm text-slate-600 font-bold">Selecione até 2 especializações técnicas.</p>
                </div>
                <div className="space-y-4">
                  <select 
                    className="w-full border border-slate-200 rounded-xl p-4 bg-white text-base font-black text-slate-700"
                    value=""
                    onChange={(e) => {
                      if(e.target.value === "nenhuma") setFormData({...formData, especialidades: []});
                      else if(e.target.value) toggleItem(e.target.value, 'especialidades');
                    }}
                  >
                    <option value="">Clique para selecionar...</option>
                    <option value="nenhuma" className="text-amber-600 font-black">Não possuo especialização</option>
                    {LISTA_ESPECIALIDADES.map(esp => <option key={esp} value={esp} disabled={formData.especialidades.includes(esp)}>{esp}</option>)}
                  </select>
                    <div className="flex flex-wrap gap-3">
                      {formData.especialidades.map(esp => (
                        <div key={esp} className="flex items-center gap-3 bg-primary text-white px-5 py-3 rounded-xl text-sm font-black uppercase shadow-sm w-full md:w-auto">
                          <span className="flex-1 leading-tight py-0.5">{esp}</span>
                          <button 
                            type="button" 
                            onClick={() => toggleItem(esp, 'especialidades')} 
                            className="shrink-0 hover:text-amber-200 transition-colors p-1 bg-white/10 rounded-lg"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                </div>
              </div>

              {/* MODALIDADE (INDIVIDUAL / CASAIS) */}
              <div className="bg-slate-50 px-4 py-6 rounded-[2.5rem] border border-slate-100 space-y-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <label className="block text-lg font-black text-deep uppercase tracking-wide">MODALIDADE DE ATENDIMENTO</label>
                  <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">Obrigatório</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {["Individual", "Casais"].map(mod => (
                        <button 
                             key={mod} 
                             type="button" 
                             onClick={() => toggleItem(mod, 'publicoAlvo')} 
                             className={`px-6 py-4 rounded-xl text-sm font-black border uppercase transition-all flex items-center justify-center gap-2 ${formData.publicoAlvo.includes(mod) ? 'bg-deep text-white border-deep shadow-lg scale-[1.02]' : 'bg-white text-slate-500 border-slate-200 hover:border-deep/30'}`}
                        >
                            {formData.publicoAlvo.includes(mod) && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            {mod}
                        </button>
                    ))}
                </div>
                {!formData.publicoAlvo.includes("Individual") && !formData.publicoAlvo.includes("Casais") && (
                     <p className="text-xs text-amber-600 font-bold text-center bg-amber-50 py-2 rounded-lg border border-amber-100">⚠ Selecione pelo menos uma opção acima.</p>
                )}
              </div>

              <div className="bg-slate-50 px-4 py-6 rounded-[2.5rem] border border-slate-100 space-y-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <label className="block text-lg font-black text-deep uppercase tracking-wide">PÚBLICO ALVO</label>
                  <span className="text-xs font-black text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full uppercase tracking-tighter shadow-sm">{formData.publicoAlvo.length} de 10 selecionados</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-3">
                  {LISTA_PUBLICO.map(p => (
                    <button key={p} type="button" onClick={() => toggleItem(p, 'publicoAlvo')} className={`px-4 py-3 rounded-xl text-xs md:text-sm font-black border uppercase transition-all ${formData.publicoAlvo.includes(p) ? 'bg-deep text-white border-deep shadow-md' : 'bg-white text-slate-600 border-slate-200'}`}>{p}</button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 px-4 py-6 rounded-[2.5rem] border border-slate-100 space-y-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <label className="block text-lg font-black text-deep uppercase tracking-wide">TEMAS E DEMANDAS</label>
                  <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1.5 rounded-full uppercase tracking-tighter shadow-sm">{formData.temas.length} de 5 selecionados</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-3">
                  {LISTA_TEMAS.map(t => (
                    <button key={t} type="button" onClick={() => toggleItem(t, 'temas')} className={`px-5 py-4 rounded-2xl text-xs md:text-sm font-black border uppercase transition-all duration-300 ${formData.temas.includes(t) ? 'bg-primary text-white border-primary shadow-xl scale-[1.02]' : 'bg-white text-slate-500 border-slate-200 hover:border-primary/30 hover:bg-slate-50'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* SEÇÃO 4: VALORES E DURAÇÃO */}
            <section className="space-y-6">
              <h2 className="text-2xl font-black text-deep border-b-2 border-slate-100 pb-3 flex items-center gap-3 uppercase">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-base font-black italic">4</span>
                Valores e Duração
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-base font-black text-slate-700 uppercase tracking-wide">Valor da Sessão Particular</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">R$</span>
                    <input required type="number" min="1" className="w-full border border-slate-200 rounded-xl p-4 pl-12 bg-slate-50 text-lg font-black text-deep" value={formData.preco} onChange={e => setFormData({...formData, preco: Number(e.target.value)})} />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-base font-black text-slate-700 uppercase tracking-wide">Duração da Sessão</label>
                  <div className="relative">
                    <input required type="number" min="1" className="w-full border border-slate-200 rounded-xl p-4 pr-20 bg-slate-50 text-lg font-black text-deep" value={formData.duracaoSessao} onChange={e => setFormData({...formData, duracaoSessao: Number(e.target.value)})} />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black uppercase">minutos</span>
                  </div>
                </div>
              </div>
            </section>

            {/* SEÇÃO 5: EXCLUSIVO DUO II (VÍDEO, REDES E AGENDA) - COMPONENTIZADO */}
            {formData.plano === "DUO_II" && (
                <DuoIISection formData={formData} setFormData={setFormData} />
            )}

            <button disabled={loading} type="submit" className="w-full bg-primary text-white font-black py-6 rounded-2xl shadow-xl hover:opacity-90 transition-all text-xl uppercase tracking-widest active:scale-[0.98]">
              {loading ? "Salvando informações..." : "Confirmar e Salvar Alterações"}
            </button>

            <button 
                type="button"
                onClick={() => setShowPreview(true)}
                className="w-full bg-white text-slate-900 border-2 border-slate-200 font-black py-6 rounded-2xl shadow-md hover:bg-slate-50 transition-all text-lg uppercase tracking-widest flex items-center justify-center gap-3"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                Ver Prévia em Tempo Real
            </button>

            <div className="text-center pt-4">
               <Link href="/painel" className="text-slate-400 font-bold hover:text-slate-600 transition underline decoration-2 underline-offset-4">
                  Cancelar e Voltar ao Painel
               </Link>
            </div>
          </form>
        </div>
      </div>

      {/* MODAL PRÉVIA */}
      {showPreview && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md overflow-y-auto">
              <div className="w-full max-w-sm relative py-8">
                  <button onClick={() => setShowPreview(false)} className="absolute top-4 right-0 z-50 text-white bg-red-600 rounded-full w-8 h-8 font-black">X</button>
                  <div className={`bg-white rounded-[2.5rem] p-5 sm:p-6 flex flex-col shadow-sm border transition-all duration-300 group relative ${
                      formData.plano === 'DUO_II' 
                      ? 'border-primary/20 shadow-[0_20px_60px_rgba(59,130,246,0.08)]' 
                      : 'border-slate-100'
                  }`}>
                      {/* --- HEADER: Foto + Name + CRP --- */}
                      <div className="flex items-center gap-4 sm:gap-5 mb-4">
                          <div className="relative shrink-0">
                              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.25rem] sm:rounded-[1.5rem] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-2 sm:border-[3px] border-white relative">
                                  {formData.foto ? (
                                      <div className="w-full h-full rounded-[1.1rem] sm:rounded-[1.3rem] overflow-hidden relative">
                                          <Image src={formData.foto} fill className="object-cover" alt="Foto" sizes="(max-width: 640px) 64px, 80px" />
                                      </div>
                                  ) : (
                                      <div className="w-full h-full rounded-[1.1rem] sm:rounded-[1.3rem] bg-mist flex items-center justify-center text-xl sm:text-2xl font-black text-primary">
                                          {formData.nome ? formData.nome.charAt(0) : "P"}
                                      </div>
                                  )}
                                  {formData.plano === 'DUO_II' && (
                                      <div className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 bg-primary text-white p-1 sm:p-1.5 rounded-lg shadow-lg ring-2 ring-white z-10">
                                          <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                      </div>
                                  )}
                              </div>
                          </div>

                          <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                  <h3 className="font-bold text-slate-800 text-base sm:text-lg tracking-tight leading-tight">{formData.nome || "Seu Nome Completo"}</h3>
                                  <button className="p-1.5 rounded-full text-slate-300">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                  </button>
                              </div>
                              <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">CRP 00/00000</p>
                          </div>
                      </div>

                      {/* --- WHATSAPP FAST CONTACT --- */}
                      <div className="mb-4">
                          <button 
                              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-50 text-green-600 border border-green-100 font-bold text-[10px] uppercase tracking-widest hover:bg-green-100 transition-colors"
                          >
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                              Contato via WhatsApp
                          </button>
                      </div>

                      {/* --- ABORDAGEM (BOX) --- */}
                          <div className="mb-4">
                              <div className="bg-blue-50/50 border border-blue-100/50 rounded-xl p-3 text-center">
                                  <span className="text-[9px] font-black text-blue-700 uppercase tracking-widest truncate block w-full px-2">
                                      {formData.abordagem || "Sua Abordagem Teórica"}
                                  </span>
                              </div>
                          </div>

                      {/* --- ESPECIALIDADES & TEMAS --- */}
                      <div className="space-y-3 mb-4 flex-1">
                          {/* Especialidades */}
                          {formData.especialidades && formData.especialidades.length > 0 && (
                              <div>
                                  <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Especialidade</p>
                                  <div className="flex flex-wrap gap-1.5">
                                      {formData.especialidades.map((esp: string) => (
                                          <span key={esp} className="text-[9px] text-blue-500 font-bold bg-blue-50/30 px-2.5 py-0.5 rounded-lg border border-blue-100/30">
                                              {esp}
                                          </span>
                                      ))}
                                  </div>
                              </div>
                          )}

                          {/* Temas */}
                          {formData.temas && formData.temas.length > 0 && (
                            <div>
                                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Temas</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {formData.temas.slice(0, 2).map((tema: string) => (
                                        <span key={tema} className="text-[9px] text-slate-500 font-bold bg-slate-50 px-2.5 py-0.5 rounded-lg border border-slate-100">
                                            {tema}
                                        </span>
                                    ))}
                                    {formData.temas.length > 2 && (
                                        <span className="text-[9px] text-slate-400 font-bold py-0.5 px-1">+{formData.temas.length - 2}</span>
                                    )}
                                </div>
                            </div>
                          )}

                          {/* Público Alvo */}
                          {formData.publicoAlvo && formData.publicoAlvo.length > 0 && (
                              <div>
                                  <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1 ">Acompanhamento</p>
                                  <div className="flex flex-wrap gap-1.5">
                                      {formData.publicoAlvo.map((p: string) => (
                                          <span key={p} className="text-[8px] text-slate-400 font-bold bg-white px-2 py-0.5 rounded-md border border-slate-100">
                                              {p}
                                          </span>
                                      ))}
                                  </div>
                              </div>
                          )}

                          {/* Bio Snippet */}
                          {formData.biografia && (
                              <div className="pt-2">
                                  <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Apresentação</p>
                                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 italic font-medium">
                                      "{formData.biografia}"
                                  </p>
                              </div>
                          )}
                      </div>

                      {/* --- FOOTER: Valor + Botão --- */}
                      <div className="pt-4 border-t border-slate-50 flex items-center justify-between gap-3">
                          <div className="shrink-0">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Sessão</p>
                              <div className="flex items-baseline gap-1 whitespace-nowrap">
                                  <span className="text-xl font-black text-green-500 tracking-tight leading-none">R$ {formData.preco}</span>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase opacity-60">/ {formData.duracaoSessao || 50}m</span>
                              </div>
                          </div>
                          
                          <button 
                              className="flex-1 bg-deep text-white px-5 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-deep/10 flex items-center justify-center gap-2 whitespace-nowrap"
                          >
                              Perfil Completo
                              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {showModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center space-y-6">
                   <h3 className="text-2xl font-black text-deep">Salvar Alterações?</h3>
                   <div className="flex gap-4">
                       <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-100 font-bold rounded-xl">Cancelar</button>
                       <button onClick={handleSubmit} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary/90">Confirmar</button>
                   </div>
               </div>
          </div>
      )}
    </main>
  );
}