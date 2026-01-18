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
  "Psicologia Clínica", "Psicoterapia", "Psicanálise (clínica psicanalítica)", "Terapias Cognitivo-Comportamentais (TCC)",
  "Terapias Contextuais / 3ª Geração (ACT, DBT, FAP)", "Gestalt-terapia", "Terapia Sistêmica e Familiar", "Terapia de Casal e Família",
  "Psicodrama", "Terapia Humanista/Existencial", "Clínica com Adultos e Idosos", "Psicologia do Trauma e Luto",
  "Neuropsicologia Clínica", "Psicologia Organizacional e do Trabalho", "Saúde Mental e Qualidade de Vida no Trabalho",
  "Avaliação Psicológica", "Avaliação Neuropsicológica"
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
const LISTA_PUBLICO = ["Individual", "Casais","Adultos", "Idosos","Público LGBTQIA+", "Mulheres", "Homens", "Público Negro", "Público Indígena", "Refugiados"];

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, foto: reader.result as string });
      reader.readAsDataURL(file);
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
                  <div className="bg-white rounded-3xl overflow-hidden shadow-2xl scale-90 origin-top">
                     {/* Preview simplificado */}
                      <div className="p-4 bg-deep text-white text-center">
                          <p className="font-bold">Prévia do Card</p>
                      </div>
                      <div className="p-8 text-center space-y-4">
                          <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto relative overflow-hidden">
                              {formData.foto && <Image src={formData.foto} fill className="object-cover" alt="" />}
                          </div>
                          <h2 className="text-xl font-black text-deep">{formData.nome || "Seu Nome"}</h2>
                          <p className="text-sm text-slate-500">{formData.especialidades.join(", ") || "Suas especialidades"}</p>
                          <div className="border-t pt-4">
                             <p className="text-green-600 font-black text-lg">R$ {formData.preco}</p>
                          </div>
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