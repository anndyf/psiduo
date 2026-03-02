"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { salvarEAtivarPerfilCompleto, buscarDadosPsicologo } from "@/app/perfil/actions";
import { validarStatusCRP } from "@/app/catalogo/actions";
import { useSession } from "next-auth/react";
import ProfileHealth from "./components/ProfileHealth";
import DuoIISection from "./components/DuoIISection";
import IdentitySection from "./components/IdentitySection";
import SpecialtiesSection from "./components/SpecialtiesSection";
import { PsicologoFormData } from "@/types/psicologo";
import { compressImage } from "@/utils/imageCompression";
import { uploadImage } from "@/lib/uploadHelper";
import { toast } from "sonner";
import { ArrowLeft, Save, User, Briefcase, Settings } from "lucide-react";

// LISTAS DE OPÇÕES
import { ESTADOS_BR } from "@/lib/profile-constants";

export default function EditarPerfilPainel() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [msg, setMsg] = useState({ tipo: "", texto: "" });
  const [showModal, setShowModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'perfil' | 'atuacao' | 'gestao'>('perfil');

  // CRP States
  const [verificandoCrp, setVerificandoCrp] = useState(false);
  const [crpEmUso, setCrpEmUso] = useState(false);
  const [crpValidado, setCrpValidado] = useState(false);

  const [formData, setFormData] = useState<PsicologoFormData>({
    foto: "", biografia: "", abordagem: "", whatsapp: "", crp: "", preco: 150, duracaoSessao: 50,
    especialidades: [], temas: [],
    idade: "", genero: "", etnia: "", sexualidade: "", religiao: "", estilo: "", diretividade: "", publicoAlvo: [],
    cidade: "", estado: "", videoApresentacao: "", 
    redesSociais: { instagram: "", linkedin: "", site: "" },
    agendaConfig: { Seg: [], Ter: [], Qua: [], Qui: [], Sex: [], Sab: [], Dom: [] },
    plano: "DUO_I",
    acessos: 0,
    nome: "",
    atendeOnline: true,
    atendePresencial: false
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
            whatsapp: valorFormatado,
            redesSociais: res.dados.redesSociais || { instagram: "", linkedin: "", site: "" },
            agendaConfig: agenda,
            plano: res.dados.plano || "DUO_I",
            atendeOnline: res.dados.atendeOnline ?? true,
            atendePresencial: res.dados.atendePresencial ?? false,
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
        let finalUrl = "";
        const publicUrl = await uploadImage(file, "profiles");
        
        if (publicUrl) {
            finalUrl = publicUrl;
            toast.success("Foto enviada para nuvem com sucesso!");
        } else {
            console.log("Storage não configurado ou erro. Usando compressão local.");
            finalUrl = await compressImage(file, 800, 800, 0.7);
        }

        setFormData(prev => ({ ...prev, foto: finalUrl }));
      } catch (error) {
        console.error("Erro ao processar imagem:", error);
        setMsg({ tipo: "erro", texto: "Não foi possível processar a imagem." });
      } finally {
        setLoading(false);
      }
    }
  };

  const formatarCRP = (valor: string) => {
    const limpo = valor.replace(/\D/g, "");
    return limpo.replace(/^(\d{2})(\d)/, "$1/$2").slice(0, 9);
  };

  const handleBlurCRP = async () => {
    if (formData.crp && formData.crp.length >= 7) {
        setVerificandoCrp(true);
        try {
            const resultado = await validarStatusCRP(formData.crp);
            
            if (!resultado.valido) {
                setMsg({ tipo: "erro", texto: resultado.mensagem || "CRP inválido." });
                if (resultado.mensagem?.includes("cadastrado")) {
                   setCrpEmUso(true); 
                }
            } else {
                setCrpEmUso(false);
                setCrpValidado(true);
                setMsg({ tipo: "", texto: "" });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setVerificandoCrp(false);
        }
    }
  };

  const handleSubmit = async () => {
    if (!userId) return;

    // VALIDATION: Modalidade Obrigatória
    const temModalidade = formData.publicoAlvo.includes("Individual") || formData.publicoAlvo.includes("Casais");
    if (!temModalidade) {
        setMsg({ tipo: "erro", texto: "Selecione pelo menos uma modalidade: Individual ou Casais." });
        setShowModal(false);
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
    <div className="flex flex-col items-center justify-center gap-6 h-96">
      <div className="w-16 h-16 border-4 border-slate-100 border-t-deep rounded-full animate-spin"></div>
      <p className="font-black text-deep text-lg uppercase tracking-[0.3em] animate-pulse">Carregando Perfil...</p>
    </div>
  );

  const tabs = [
    { id: 'perfil', label: 'Dados do Perfil', icon: User },
    { id: 'atuacao', label: 'Áreas de Atuação', icon: Briefcase },
    { id: 'gestao', label: 'Gestão de Consultório', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 md:pb-8">
      
      {/* HEADER FIXO - Estilo Patient Dashboard */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-30 px-4 md:px-8 py-3 md:py-4 transition-all">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3 md:gap-4">
                <button 
                    onClick={() => router.back()} 
                    className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                >
                    <ArrowLeft size={18} strokeWidth={2} />
                </button>
                <div>
                   <h1 className="text-lg md:text-2xl font-medium text-slate-900 tracking-tight leading-none">Minha Página Profissional</h1>
                   <div className="flex items-center gap-2 text-[10px] md:text-xs font-medium text-slate-400 mt-1 uppercase tracking-wide">
                       <span className="bg-slate-50 text-deep border border-slate-100 px-2 py-0.5 rounded-md">Psicólogo(a)</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span>{formData.nome || "Cadastre seu nome"}</span>
                   </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setShowModal(true)}
                    disabled={loading}
                    className="h-9 md:h-10 px-3 md:px-5 rounded-xl border flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0 text-xs font-bold uppercase tracking-wide shadow-lg bg-deep border-deep text-white hover:bg-slate-800 shadow-slate-900/20"
                >
                    <Save size={16} strokeWidth={2.5} />
                    <span className="hidden md:inline">{loading ? "Salvando..." : "Salvar"}</span>
                </button>
            </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-500">
        
        {/* Navegação de Abas - Estilo Flat Horizontal */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-5 flex items-center gap-8 md:gap-12 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`
                            text-sm font-semibold flex items-center gap-2.5 transition-all whitespace-nowrap shrink-0
                            ${isActive 
                                ? 'text-deep' 
                                : 'text-slate-400 hover:text-slate-800'}
                        `}
                    >
                        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                        <span className="capitalize">{tab.label.toLowerCase()}</span>
                    </button>
                )
            })}
        </div>

        {/* MENSAGEM */}
        {msg.texto && (
          <div className={`p-4 rounded-xl text-center font-bold text-sm lg:col-span-12 animate-in fade-in slide-in-from-top-2 duration-300 ${
            msg.tipo === 'sucesso' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
          }`}>
            {msg.texto}
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); setShowModal(true); }} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-10 space-y-8 min-h-[500px]">

            {activeTab === 'perfil' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-left-4 duration-300">

            {/* SEÇÃO 1: APRESENTAÇÃO E LOCALIZAÇÃO */}
            <section className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2.5">
                  <span className="bg-deep text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  Apresentação e Localização
                </h2>
                <p className="text-xs text-slate-400 mt-1 ml-8.5">Informações básicas do seu perfil profissional</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">

                {/* SIDE IMAGE UPLOAD */}
                <div className="shrink-0 flex flex-col items-center gap-2 w-full sm:w-auto">
                  <div 
                    onClick={() => fileInputRef.current?.click()} 
                    className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-slate-50 border border-dashed border-slate-300 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-deep/60 hover:bg-slate-100 transition group relative"
                  >
                    {formData.foto ? (
                      <Image src={formData.foto} fill className="object-cover" alt="Preview" />
                    ) : (
                      <div className="text-center text-slate-400">
                        <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                        <span className="text-[10px] font-medium">Foto</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-2xl">
                      <span className="text-white text-[10px] font-semibold">Trocar</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">JPG, PNG</span>
                  <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />
                </div>

                {/* MAIN FIELDS */}
                <div className="flex-1 w-full space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Nome Completo</label>
                    <input required type="text" placeholder="Seu nome profissional completo" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-sm text-slate-800 focus:border-deep/50 outline-none focus:ring-2 focus:ring-deep/20 transition placeholder:text-slate-300" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="relative">
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        CRP {verificandoCrp && <span className="text-deep animate-pulse normal-case tracking-normal font-normal">· verificando</span>}
                      </label>
                      <input 
                        type="text"
                        placeholder="00/00000"
                        className={`w-full border rounded-xl px-4 py-2.5 bg-white text-sm text-slate-800 outline-none focus:ring-2 focus:ring-deep/20 transition placeholder:text-slate-300 ${crpEmUso ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-deep/50'}`}
                        value={formData.crp || ""}
                        onChange={(e) => { setFormData({...formData, crp: formatarCRP(e.target.value)}); setCrpEmUso(false); }}
                        onBlur={handleBlurCRP}
                        maxLength={9}
                      />
                      {crpValidado && !crpEmUso && <span className="absolute right-3 top-9 text-green-500 text-sm">✓</span>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">WhatsApp</label>
                      <input required type="text" placeholder="(00) 9 0000-0000" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-sm text-slate-800 focus:border-deep/50 outline-none focus:ring-2 focus:ring-deep/20 transition placeholder:text-slate-300" value={formData.whatsapp} onChange={(e) => handleWhatsappChange(e.target.value)} />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Cidade</label>
                      <input required type="text" placeholder="São Paulo" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-sm text-slate-800 focus:border-deep/50 outline-none focus:ring-2 focus:ring-deep/20 transition placeholder:text-slate-300" value={formData.cidade} onChange={(e) => setFormData({...formData, cidade: e.target.value})} />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Estado</label>
                      <select required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-sm text-slate-800 outline-none focus:ring-2 focus:ring-deep/20 transition focus:border-deep/50" value={formData.estado} onChange={(e) => setFormData({...formData, estado: e.target.value})}>
                        <option value="">UF</option>
                        {ESTADOS_BR.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-6 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.atendeOnline} onChange={() => setFormData({ ...formData, atendeOnline: !formData.atendeOnline })} className="w-4 h-4 rounded accent-deep" />
                      <span className="text-sm text-slate-700">Atendimento Online</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.atendePresencial} onChange={() => setFormData({ ...formData, atendePresencial: !formData.atendePresencial })} className="w-4 h-4 rounded accent-deep" />
                      <span className="text-sm text-slate-700">Atendimento Presencial</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* BIO */}
              <div>
                <div className="flex justify-between items-baseline mb-1.5">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Biografia Profissional</label>
                  <span className={`text-xs font-medium ${formData.biografia.length < 50 ? "text-amber-500" : "text-green-500"}`}>{formData.biografia.length} / 300</span>
                </div>
                <textarea required rows={4} maxLength={300} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white text-sm text-slate-800 outline-none focus:ring-2 focus:ring-deep/20 focus:border-deep/50 transition leading-relaxed resize-none placeholder:text-slate-300" placeholder="Apresente sua atuação profissional de forma acolhedora e objetiva..." value={formData.biografia} onChange={e => setFormData({...formData, biografia: e.target.value})} />
                {formData.biografia.length < 50 && <p className="text-xs text-amber-500 mt-1">Mínimo de 50 caracteres.</p>}
              </div>
            </section>

            {/* SEÇÃO 2: IDENTIDADE PROFISSIONAL (Componentizado) */}
            <IdentitySection formData={formData} setFormData={setFormData} />
            </div>
            )}

            {activeTab === 'atuacao' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-300">
            <SpecialtiesSection formData={formData} setFormData={setFormData} />
            </div>
            )}

            {activeTab === 'gestao' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-300">
            <section className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Plano Atual</p>
                  <div className="flex items-center gap-1.5">
                    {formData.plano === 'DUO_II' && (
                      <svg className="w-4 h-4 text-deep" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    )}
                    <span className={`text-sm font-semibold ${formData.plano === 'DUO_II' ? 'text-deep' : 'text-slate-800'}`}>
                      {formData.plano === 'DUO_II' ? 'Duo II — Premium' : 'Duo I — Básico'}
                    </span>
                  </div>
                </div>
                <Link href="/cadastro/planos" className="text-xs font-semibold text-deep border border-slate-200 bg-slate-50 px-4 py-2 rounded-xl hover:bg-slate-100 transition whitespace-nowrap">
                   Mudar de Plano
                </Link>
            </section>

            {/* SEÇÃO 4: VALORES E DURAÇÃO */}
            <section className="space-y-4">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2.5">
                  <span className="bg-deep text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  Valores e Duração
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Valor da Sessão (R$)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
                    <input required type="number" min="1" className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 bg-white text-sm text-slate-800 outline-none focus:ring-2 focus:ring-deep/20 focus:border-deep/50 transition" value={formData.preco} onChange={e => setFormData({...formData, preco: Number(e.target.value)})} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Duração (minutos)</label>
                  <div className="relative">
                    <input required type="number" min="1" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 pr-20 bg-white text-sm text-slate-800 outline-none focus:ring-2 focus:ring-deep/20 focus:border-deep/50 transition" value={formData.duracaoSessao} onChange={e => setFormData({...formData, duracaoSessao: Number(e.target.value)})} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">min</span>
                  </div>
                </div>
              </div>
            </section>

            {/* SEÇÃO 5: EXCLUSIVO DUO II (VÍDEO, REDES E AGENDA) - COMPONENTIZADO */}
            {formData.plano === "DUO_II" && (
                <DuoIISection formData={formData} setFormData={setFormData} />
            )}
            </div>
            )}

            <div className="pt-8 border-t border-slate-100">
               <button 
                  disabled={loading} 
                  type="submit" 
                  className="w-full sm:w-auto sm:min-w-[200px] py-3 px-8 bg-deep text-white text-sm font-semibold rounded-xl shadow-md hover:bg-slate-800 transition-colors disabled:opacity-60"
               >
                 {loading ? "Salvando alterações..." : "Salvar Alterações"}
               </button>
            </div>
          </form>
      </main>

      {showModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center space-y-6">
                   <h3 className="text-2xl font-black text-deep">Salvar Alterações?</h3>
                   <div className="flex gap-4">
                       <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-100 font-bold rounded-xl">Cancelar</button>
                       <button onClick={handleSubmit} className="flex-1 py-3 bg-deep text-white font-bold rounded-xl shadow-lg hover:bg-slate-800">Confirmar</button>
                   </div>
               </div>
          </div>
      )}
    </div>
  );
}
