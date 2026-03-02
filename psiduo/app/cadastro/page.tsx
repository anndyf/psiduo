"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { cadastrarPsicologo } from "../catalogo/actions";
import { ABORDAGENS } from "../../lib/constants";
import { ShieldCheck, Zap, Lock, Star, Check, ArrowRight, Info, HelpCircle } from "lucide-react";

export default function Cadastro() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [senhaFeedback, setSenhaFeedback] = useState<{msg: string, cor: string} | null>(null);
  const [confirmarEmail, setConfirmarEmail] = useState("");
  const [emailFeedback, setEmailFeedback] = useState<{msg: string, cor: string} | null>(null);
  
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
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
      setSenhaFeedback({ msg: "As senhas conferem", cor: "text-emerald-600" });
    } else {
      setSenhaFeedback({ msg: "As senhas não conferem", cor: "text-rose-500" });
    }
  }, [formData.senha, confirmarSenha]);

  useEffect(() => {
    if (!confirmarEmail) {
      setEmailFeedback(null);
      return;
    }
    if (formData.email === confirmarEmail) {
      setEmailFeedback({ msg: "Os e-mails conferem", cor: "text-emerald-600" });
    } else {
      setEmailFeedback({ msg: "Os e-mails não conferem", cor: "text-rose-500" });
    }
  }, [formData.email, confirmarEmail]);

  const validarEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const formatarWhatsapp = (valor: string) => {
    const limpo = valor.replace(/\D/g, "");
    return limpo
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 15);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;
    if (fieldErrors.includes(name)) {
        setFieldErrors(prev => prev.filter(f => f !== name));
    }
    if (name === "whatsapp") value = formatarWhatsapp(value);
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const emptyFields: string[] = [];
    if (!formData.nome) emptyFields.push("nome");
    if (!formData.email) emptyFields.push("email");
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

    const senhaForte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(formData.senha);

    if (!senhaForte || formData.senha !== confirmarSenha) {
      setError("A senha deve ser forte e as senhas devem conferir.");
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
        const loginResult = await signIn("credentials", {
          email: formData.email,
          password: formData.senha,
          redirect: false,
        });

        if (loginResult?.ok) {
          router.push("/cadastro/planos");
          router.refresh();
        } else {
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
    <main className="min-h-screen bg-white font-sans flex flex-col overflow-x-hidden">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-6 py-12 lg:py-24 relative bg-slate-50/50">
        {/* Subtle Decorative Backdrop */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[100px] opacity-60"></div>
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-slate-100 rounded-full blur-[120px] opacity-40"></div>
          <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>

        <div className="w-full max-w-6xl relative z-10 flex flex-col lg:flex-row gap-8 items-stretch">
          
          {/* LEFT: Information & Trust signals (Balanced Light Version) */}
          <div className="lg:w-[380px] flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 space-y-8 flex flex-col shadow-sm">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full text-blue-600">
                  <ShieldCheck className="w-3 h-3 text-blue-500" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em]">Clinical Workspace v2.0</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                  Inicie sua <br /> <span className="text-blue-600 italic">Jornada.</span>
                </h1>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Crie sua presença digital no ecossistema PsiDuo e acesse as ferramentas de ponta para sua clínica autônoma.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  { t: "Prontuário Digital", d: "Segurança total dos dados.", i: <Lock className="w-4 h-4" /> },
                  { t: "Instrumentos IA", d: "Análises e insights clínicos.", i: <Zap className="w-4 h-4" /> },
                  { t: "Agenda Digital", d: "Gestão inteligente de horários.", i: <Star className="w-4 h-4" /> }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-100">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                      {item.i}
                    </div>
                    <div>
                      <h3 className="text-[10px] font-black uppercase text-slate-900 tracking-widest leading-none">{item.t}</h3>
                      <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-tight">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3 text-emerald-600">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]"></div>
                  <span className="text-[9px] font-black uppercase tracking-widest">Protocolo de Segurança Ativo</span>
                </div>
              </div>
            </div>

            {/* Support Message */}
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
               <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
               <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-blue-400">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black uppercase tracking-tight">Precisa de Ajuda?</h3>
                    <p className="text-slate-400 text-xs font-medium leading-relaxed">Nosso time de compliance está disponível para suporte no cadastro.</p>
                  </div>
               </div>
               <a href="mailto:suporte@psiduo.com.br" className="flex items-center justify-between w-full h-12 px-6 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all group/btn">
                 Falar com Suporte <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
               </a>
            </div>
          </div>

          {/* RIGHT: Main Form Column (Clean & Spaced) */}
          <div className="flex-1 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-200/60 p-8 lg:p-14">
            <div className="max-w-3xl mx-auto">
              <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-50 pb-8">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-2">Inscrição de Psicólogo</div>
                  <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                    Dados do <span className="text-blue-600">Especialista.</span>
                  </h2>
                </div>
                <div className="bg-slate-50 px-4 py-2 rounded-full flex items-center gap-3">
                   <Info className="w-4 h-4 text-blue-400" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Tempo estimado: 2 min</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-10">
                {error && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-600 px-6 py-4 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                       <span className="text-lg">⚠️</span>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-tight">{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Nome Completo (Profissional)</label>
                    <input 
                      name="nome" required type="text" 
                      className={`w-full h-14 bg-slate-50/50 border rounded-2xl px-6 text-slate-900 font-bold outline-none transition-all placeholder:text-slate-300 ${fieldErrors.includes('nome') ? 'border-rose-400 ring-4 ring-rose-50' : 'border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50'}`}
                      placeholder="Ex: Dra. Juliana Silva Menezes"
                      value={formData.nome}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">E-mail de Trabalho</label>
                    <input 
                      name="email" required type="email" 
                      className={`w-full h-14 bg-slate-50/50 border rounded-2xl px-6 text-slate-900 font-bold outline-none transition-all placeholder:text-slate-300 ${fieldErrors.includes('email') ? 'border-rose-400 ring-4 ring-rose-50' : 'border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50'}`}
                      placeholder="juliana@exemplo.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1 flex justify-between">
                      Confirmar E-mail
                      {emailFeedback && <span className={`font-black ${emailFeedback.cor} text-[9px]`}>{emailFeedback.msg}</span>}
                    </label>
                    <input 
                      required type="email" 
                      className={`w-full h-14 bg-slate-50/50 border rounded-2xl px-6 text-slate-900 font-bold outline-none transition-all placeholder:text-slate-300 ${fieldErrors.includes('confirmarEmail') ? 'border-rose-400 ring-4 ring-rose-50' : 'border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50'}`}
                      placeholder="Repita o endereço"
                      value={confirmarEmail}
                      onChange={(e) => setConfirmarEmail(e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Número WhatsApp</label>
                    <input 
                      name="whatsapp" required type="tel" 
                      className={`w-full h-14 bg-slate-50/50 border rounded-2xl px-6 text-slate-900 font-bold outline-none transition-all placeholder:text-slate-300 ${fieldErrors.includes('whatsapp') ? 'border-rose-400 ring-4 ring-rose-50' : 'border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50'}`}
                      placeholder="(00) 00000-0000"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      maxLength={15}
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Preço Sugerido (R$)</label>
                    <input 
                      name="preco" required type="number" 
                      className={`w-full h-14 bg-slate-50/50 border rounded-2xl px-6 text-slate-900 font-bold outline-none transition-all placeholder:text-slate-300 ${fieldErrors.includes('preco') ? 'border-rose-400 ring-4 ring-rose-50' : 'border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50'}`}
                      placeholder="150"
                      value={formData.preco}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Abordagem Terapêutica</label>
                    <select 
                      name="abordagem" 
                      value={formData.abordagem}
                      onChange={handleChange} 
                      className="w-full h-14 bg-slate-50/50 border border-slate-100 rounded-2xl px-6 text-slate-900 font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 appearance-none cursor-pointer"
                    >
                      {ABORDAGENS.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-50">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Senha Segura</label>
                      <input 
                        name="senha" required type="password" 
                        className={`w-full h-14 bg-slate-50/50 border rounded-2xl px-6 text-slate-900 font-bold outline-none transition-all ${fieldErrors.includes('senha') ? 'border-rose-400 ring-4 ring-rose-50' : 'border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50'}`}
                        placeholder="********"
                        value={formData.senha}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1 flex justify-between">
                        Confirmar Senha
                        {senhaFeedback && <span className={`font-black ${senhaFeedback.cor} text-[9px]`}>{senhaFeedback.msg}</span>}
                      </label>
                      <input 
                        required type="password" 
                        className={`w-full h-14 bg-slate-50/50 border rounded-2xl px-6 text-slate-900 font-bold outline-none transition-all ${senhaFeedback?.cor === 'text-rose-500' ? 'border-rose-400 ring-4 ring-rose-50' : 'border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50'}`}
                        placeholder="********"
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                   {[
                      { l: "Min. 8 char", v: formData.senha.length >= 8 },
                      { l: "Maiúscula", v: /[A-Z]/.test(formData.senha) },
                      { l: "Número", v: /\d/.test(formData.senha) }
                   ].map((rule, i) => (
                     <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${rule.v ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                        <Check className={`w-3 h-3 ${rule.v ? 'opacity-100' : 'opacity-20'}`} strokeWidth={4} />
                        <span className="text-[9px] font-black uppercase tracking-widest">{rule.l}</span>
                     </div>
                   ))}
                </div>

                <div className="pt-6">
                  <button 
                    disabled={isLoading}
                    type="submit" 
                    className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-4 group"
                  >
                    {isLoading ? (
                       <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Inicializar Área Profissional <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                      </>
                    )}
                  </button>
                  
                  <div className="mt-10 pt-8 border-t border-slate-50 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Já possui credenciais? <Link href="/login" className="text-blue-600 hover:underline ml-2">Acessar Sistema</Link>
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}