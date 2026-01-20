"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { cadastrarPsicologo, verificarCRP } from "../catalogo/actions";

// Lista com nomes amigáveis
const ABORDAGENS = [
  "Psicanálise Freudiana (Sigmund Freud)",
  "Psicologia Analítica / Jungiana (Carl Gustav Jung)",
  "Psicanálise Lacaniana (Jacques Lacan)",
  "Psicanálise Winnicottiana (Donald Winnicott)",
  "Análise do Comportamento",
  "TCC – Terapia Cognitivo-Comportamental",
  "Terapia Racional-Emotiva Comportamental (REBT)",
  "Terapia Cognitiva Construtivista",
  "ACT – Terapia de Aceitação e Compromisso",
  "DBT – Terapia Dialética Comportamental",
  "FAP – Psicoterapia Analítico-Funcional",
  "Terapia de Esquemas",
  "Psicologia Baseada em Evidências - PBE",
  "Psicoterapia Breve",
  "Terapia Comportamental Integrativa de Casais - IBCT",
  "Gestalt-Terapia",
  "Abordagem Centrada na Pessoa (ACP)",
  "Terapia Focada na Emoção (EFT)",
  "Psicoterapia Humanista-Existencial",
  "Fenomenológica/Existencial",
  "Logoterapia",
  "Daseinsanalyse",
  "Esquizoanálise",
  "Terapia Sistêmica",
  "Terapia Familiar Estrutural",
  "Terapia Familiar Estratégica",
  "Terapia Familiar de Bowen",
  "Terapia Narrativa",
  "Terapia Sistêmica Pós-Moderna",
  "Terapia de Casal Sistêmica",
  "Psicoterapia Construtivista",
  "Construcionismo Social",
  "Análise Bioenergética",
  "Psicoterapia Corporal",
  "Terapia Corporal Reichiana",
  "Psicologia Somática",
  "Psicodrama",
  "Psicodinâmica",
  "Neuropsicologia Clínica",
  "Reabilitação Neuropsicológica",
  "Psicoterapia Baseada em Neurociência",
  "Programação Neurolinguística - PNL",
  "Teoria do Apego (clínica)",
  "Psicologia Positiva Clínica",
  "Psicoterapia Baseada em Evidências",
  "Orientação Profissional e Vocacional"
];

export default function Cadastro() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [senhaFeedback, setSenhaFeedback] = useState<{msg: string, cor: string} | null>(null);
  const [confirmarEmail, setConfirmarEmail] = useState("");
  const [emailFeedback, setEmailFeedback] = useState<{msg: string, cor: string} | null>(null);
  
  // Estado para validação de CRP em tempo real
  const [crpEmUso, setCrpEmUso] = useState(false);
  const [verificandoCrp, setVerificandoCrp] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    crp: "",
    whatsapp: "",
    abordagem: "Terapia Cognitivo-Comportamental (TCC)",
    especialidades: [] as string[],
    temas: [] as string[],
    preco: 150,
    duracaoSessao: 50
  });

  const [fieldErrors, setFieldErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!confirmarSenha) {
      setSenhaFeedback(null);
      return;
    }
    if (formData.senha === confirmarSenha) {
      setSenhaFeedback({ msg: "As senhas conferem", cor: "text-green-600" });
    } else {
      setSenhaFeedback({ msg: "As senhas não conferem", cor: "text-red-500" });
    }
  }, [formData.senha, confirmarSenha]);

  // --- VALIDAÇÃO DE EMAIL EM TEMPO REAL ---
  useEffect(() => {
    if (!confirmarEmail) {
      setEmailFeedback(null);
      return;
    }
    if (formData.email === confirmarEmail) {
      setEmailFeedback({ msg: "Os e-mails conferem", cor: "text-green-600" });
    } else {
      setEmailFeedback({ msg: "Os e-mails não conferem", cor: "text-red-500" });
    }
  }, [formData.email, confirmarEmail]);

  // --- FUNÇÕES DE MÁSCARA ---
  const validarEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const formatarCRP = (valor: string) => {
    const limpo = valor.replace(/\D/g, "");
    return limpo.replace(/^(\d{2})(\d)/, "$1/$2").slice(0, 9);
  };

  const formatarWhatsapp = (valor: string) => {
    const limpo = valor.replace(/\D/g, "");
    return limpo
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 15);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;
    
    // Remove erro visual ao digitar
    if (fieldErrors.includes(name)) {
        setFieldErrors(prev => prev.filter(f => f !== name));
    }

    if (name === "crp") {
        value = formatarCRP(value);
        setCrpEmUso(false);
    }
    if (name === "whatsapp") value = formatarWhatsapp(value);
    setFormData({ ...formData, [name]: value });
  };

  // --- VERIFICAÇÃO DE CRP (QUANDO SAI DO CAMPO) ---
  const handleBlurCRP = async () => {
    if (formData.crp.length >= 7) {
      setVerificandoCrp(true);
      try {
        const jaExiste = await verificarCRP(formData.crp);
        if (jaExiste) {
          setCrpEmUso(true);
        }
      } catch (err) {
        console.error("Erro ao verificar CRP", err);
      } finally {
        setVerificandoCrp(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (crpEmUso) {
        setError("Este CRP já está cadastrado. Tente fazer login.");
        setIsLoading(false);
        return;
    }

    // Validação de Campos Vazios
    const emptyFields: string[] = [];
    if (!formData.nome) emptyFields.push("nome");
    if (!formData.email) emptyFields.push("email");
    if (!formData.crp) emptyFields.push("crp");
    if (!formData.whatsapp) emptyFields.push("whatsapp");
    if (!formData.senha) emptyFields.push("senha");
    if (!formData.preco) emptyFields.push("preco");
    if (!confirmarEmail) emptyFields.push("confirmarEmail");
    if (!confirmarSenha) emptyFields.push("confirmarSenha");

    if (emptyFields.length > 0) {
        setFieldErrors(emptyFields);
        setError("Por favor, preencha todos os campos obrigatórios.");
        setIsLoading(false);
        return;
    }

    if (!validarEmail(formData.email)) {
        setError("Por favor, digite um e-mail válido.");
        setIsLoading(false);
        return;
    }

    if (formData.email !== confirmarEmail) {
        setError("Os e-mails digitados não conferem.");
        setIsLoading(false);
        return;
    }

    // Critérios de Senha Forte
    const senhaForte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(formData.senha);

    if (!senhaForte || formData.senha !== confirmarSenha) {
      setError("A senha deve ter no mínimo 8 caracteres, uma letra maiúscula, uma minúscula e um número.");
      setIsLoading(false);
      return;
    }

    if (formData.crp.length < 7) { 
        setError("CRP incompleto.");
        setIsLoading(false);
        return;
    }

    try {
      const whatsappLimpo = "55" + formData.whatsapp.replace(/\D/g, "");

      const res = await cadastrarPsicologo({
        ...formData,
        whatsapp: whatsappLimpo,
        especialidades: ["Psicologia Clínica"],
        temas: ["Ansiedade"],
        preco: Number(formData.preco)
      });

      if (res.success && res.id) {
        // Fazer login automático com NextAuth
        const loginResult = await signIn("credentials", {
          email: formData.email,
          password: formData.senha,
          redirect: false,
        });

        if (loginResult?.ok) {
          router.push("/cadastro/planos");
          router.refresh();
        } else {
          // Se login falhar, redireciona para página de login manual
          setError("Conta criada! Faça login para continuar.");
          setTimeout(() => router.push("/login"), 2000);
        }
      }
      
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao cadastrar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-mist font-sans flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 py-10 md:py-20">
        {/* LARGURA AUMENTADA: max-w-4xl para Desktop */}
        <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row">
          
          {/* COLUNA ESQUERDA (SAÚDE DOS PLANOS) */}
          <div className="bg-deep p-8 md:w-1/3 flex flex-col text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-black text-white mb-6 uppercase tracking-tight">Cresça com a PsiDuo</h1>
            
            <div className="space-y-8 mt-4">
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                <span className="text-[10px] font-black uppercase text-blue-300 tracking-[0.2em] block mb-2">Plano Duo I</span>
                <p className="text-sm text-blue-100 font-bold leading-relaxed">Sua porta de entrada para o digital. Visibilidade no catálogo e contato direto via WhatsApp. Totalmente grátis.</p>
              </div>

              <div className="bg-primary/20 border-2 border-primary/30 p-5 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-primary text-white text-[8px] font-black px-2 py-1 rounded-bl-lg uppercase">Destaque</div>
                <span className="text-[10px] font-black uppercase text-white tracking-[0.2em] block mb-2 flex items-center gap-2">
                  Plano Duo II 
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                </span>
                <p className="text-sm text-white font-bold leading-relaxed">Assuma o controle total com agenda integrada, vídeo de apresentação e métricas de acesso. Apareça no topo das buscas.</p>
              </div>
            </div>

            <div className="mt-auto">
              <div className="hidden md:block text-blue-200/40 text-[10px] font-bold uppercase tracking-widest">
                PsiDuo &copy; 2026
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA (FORMULÁRIO ESPAÇOSO) */}
          <div className="p-6 md:p-10 md:w-2/3">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-8 flex items-center gap-4 text-blue-700">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-xl">
                   <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="text-[11px] font-black uppercase tracking-tight leading-relaxed">
                   Falta pouco! Crie sua conta abaixo e no próximo passo você poderá escolher entre os planos <span className="text-primary underline">Duo I (Grátis)</span> ou <span className="text-primary underline">Duo II (Premium)</span>.
                </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                
                {error && (
                <div className="bg-red-50 text-red-600 text-sm font-medium p-4 rounded-xl border border-red-100 flex items-center gap-3 animate-pulse">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    {error}
                </div>
                )}

                {/* Grid Superior: Nome e Email (Mais espaço) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Nome Completo</label>
                        <input 
                            name="nome" required type="text" 
                            className={`w-full border rounded-xl p-4 text-slate-700 outline-none transition ${fieldErrors.includes('nome') ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary'}`}
                            placeholder="Ex: Dra. Ana Silva"
                            value={formData.nome}
                            onChange={handleChange}
                        />
                    </div>
                    
                    <div className="md:col-span-1">
                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">E-mail Profissional</label>
                        <input 
                            name="email" required type="email" 
                            className={`w-full border rounded-xl p-4 text-slate-700 outline-none transition ${fieldErrors.includes('email') ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary'}`}
                            placeholder="seu@email.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="md:col-span-1">
                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1 flex justify-between items-center h-5">
                            Confirmar E-mail
                            {emailFeedback && (
                                <div className={`flex items-center gap-1 text-[10px] font-black uppercase ${emailFeedback.cor}`}>
                                    {emailFeedback.msg === "Os e-mails conferem" ? (
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                    ) : (
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                                    )}
                                    {emailFeedback.msg}
                                </div>
                            )}
                        </label>
                        <input 
                            required type="email" 
                            className={`w-full border rounded-xl p-4 text-slate-700 outline-none transition ${fieldErrors.includes('confirmarEmail') ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary'}`}
                            placeholder="Confirme seu e-mail"
                            value={confirmarEmail}
                            onChange={(e) => {
                                setConfirmarEmail(e.target.value);
                                if (fieldErrors.includes("confirmarEmail")) setFieldErrors(prev => prev.filter(f => f !== "confirmarEmail"));
                            }}
                        />
                    </div>
                </div>

                {/* Grid Central: CRP e Zap */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1 flex justify-between">
                            <span>CRP</span>
                            {verificandoCrp && <span className="text-blue-500 text-xs font-normal animate-pulse">Verificando...</span>}
                        </label>
                        <input 
                            name="crp" required type="text" 
                            className={`w-full border rounded-xl p-4 text-slate-700 outline-none transition ${crpEmUso || fieldErrors.includes('crp') ? 'border-red-500 bg-red-50 ring-red-100' : 'border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary'}`}
                            placeholder="Ex: 06/12345"
                            value={formData.crp}
                            onChange={handleChange}
                            onBlur={handleBlurCRP} // DISPARA A VALIDAÇÃO
                            maxLength={9}
                        />
                        {crpEmUso && (
                            <span className="text-xs text-red-500 font-bold absolute -bottom-5 left-1">Este CRP já está em uso.</span>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">WhatsApp</label>
                        <input 
                            name="whatsapp" required type="tel" 
                            className={`w-full border rounded-xl p-4 text-slate-700 outline-none transition ${fieldErrors.includes('whatsapp') ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary'}`}
                            placeholder="(00) 90000-0000"
                            value={formData.whatsapp}
                            onChange={handleChange}
                            maxLength={15}
                        />
                    </div>
                </div>

                {/* Grid Senhas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Senha</label>
                        <input 
                            name="senha" required type="password" 
                            className={`w-full border rounded-xl p-4 text-slate-700 outline-none transition ${fieldErrors.includes('senha') ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary'}`}
                            placeholder="Crie uma senha forte"
                            value={formData.senha}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1 flex justify-between items-center h-5">
                            Confirmar Senha
                            {senhaFeedback && (
                                <div className={`flex items-center gap-1 text-[10px] font-black uppercase ${senhaFeedback.cor}`}>
                                    {senhaFeedback.msg === "As senhas conferem" ? (
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                    ) : (
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                                    )}
                                    {senhaFeedback.msg}
                                </div>
                            )}
                        </label>
                        <input 
                            name="confirmarSenha" required type="password" 
                            className={`w-full border rounded-xl p-4 text-slate-700 outline-none transition ${(senhaFeedback?.cor === 'text-red-500' || fieldErrors.includes('confirmarSenha')) ? 'border-red-500 bg-red-50 ring-red-100' : 'border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary'}`}
                            placeholder="Repita a senha"
                            value={confirmarSenha}
                            onChange={(e) => {
                                setConfirmarSenha(e.target.value);
                                if (fieldErrors.includes("confirmarSenha")) setFieldErrors(prev => prev.filter(f => f !== "confirmarSenha"));
                            }}
                        />
                    </div>
                </div>

                {/* Indicadores de Força da Senha - Horizontal e Equilibrado */}
                <div className="flex flex-wrap gap-x-6 gap-y-2 pl-1">
                    {[
                        { label: "Mínimo 8 caracteres", valid: formData.senha.length >= 8 },
                        { label: "Letra maiúscula", valid: /[A-Z]/.test(formData.senha) },
                        { label: "Letra minúscula", valid: /[a-z]/.test(formData.senha) },
                        { label: "Pelo menos um número", valid: /\d/.test(formData.senha) },
                    ].map((rule, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${rule.valid ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-300'}`}>
                                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className={`text-xs font-medium transition-colors ${rule.valid ? 'text-green-600' : 'text-slate-400'}`}>
                                {rule.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Grid Inferior: Abordagem e Preço */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Abordagem Principal</label>
                        <div className="relative">
                            <select 
                                name="abordagem" 
                                value={formData.abordagem}
                                onChange={handleChange} 
                                className="w-full border border-slate-200 rounded-xl p-4 text-slate-700 bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                            >
                                {ABORDAGENS.map((item) => (
                                    <option key={item} value={item}>{item}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Valor Sessão (R$)</label>
                        <input 
                            name="preco" required type="number" 
                            className={`w-full border rounded-xl p-4 text-slate-700 outline-none transition ${fieldErrors.includes('preco') ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary'}`}
                            placeholder="150"
                            value={formData.preco}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button 
                        disabled={isLoading || crpEmUso}
                        type="submit" 
                        className="w-full bg-deep text-white font-bold py-4 rounded-xl shadow-lg hover:bg-primary transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
                    >
                        {isLoading ? "Validando..." : "Criar Conta Profissional"}
                    </button>
                    
                    <p className="text-center text-sm text-slate-500 mt-6">
                        Já tem conta? <Link href="/login" className="text-primary font-bold hover:underline">Fazer Login</Link>
                    </p>
                </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}