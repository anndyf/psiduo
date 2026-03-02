"use client";

import { useState } from "react";

import { findMatches, QuizData } from "@/app/match/actions";
import { 
  OPCOES_GENERO, 
  OPCOES_SEXUALIDADE, 
  OPCOES_ETNIA, 
  DEMANDAS_INDIVIDUAL,
  EXPECTATIVAS_INDIVIDUAL,
  MODELOS_TERAPEUTA,
  ESTILOS_TERAPEUTA
} from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { OptionButton } from "@/components/quiz/OptionButton";
import { ResultsSection } from "@/components/quiz/ResultsSection";

const STEPS = [
  "Identificação",
  "Preferências",
  "Demanda",
  "Expectativa",
  "Modelo",
  "Estilo",
  "Finalização"
];

export default function QuizIndividual() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<QuizData>({
    tipoQuiz: 'INDIVIDUAL',
    genero: "",
    idade: "",
    sexualidade: "",
    etnia: "",
    pronomes: "",
    prefLgbt: false,
    statusRelacionamento: "",
    terapiaAntes: false,
    demanda: [],
    expectativa: [],
    modeloTerapeuta: "",
    estiloTerapeuta: "",
    preferenciasEspecificas: {
      homemMulher: "TANTO_FAZ",
      lgbtqia: false,
      mais45: false,
      naoReligioso: false,
      negros: false,
    },
  });

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleDemandaToggle = (item: string) => {
    setFormData(prev => ({
      ...prev,
      demanda: prev.demanda.includes(item)
        ? prev.demanda.filter(d => d !== item)
        : [...prev.demanda, item]
    }));
  };

  const handleExpectativaToggle = (item: string) => {
    setFormData(prev => ({
      ...prev,
      expectativa: prev.expectativa.includes(item)
        ? prev.expectativa.filter(d => d !== item)
        : [...prev.expectativa, item]
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const matches = await findMatches(formData);
      setResults(matches);
      setStep(8); 
    } catch (error) {
      alert("Erro ao buscar combinações. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 font-sans">

      <div className="w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 p-6 md:p-12 min-h-[600px] flex flex-col justify-center relative overflow-hidden">
        
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none opacity-50" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-50 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none opacity-50" />

        <div className="relative z-10">
            {step < 8 && (
            <div className="mb-10">
                <Progress 
                    value={(step / 7) * 100} 
                    step={step} 
                    totalSteps={7} 
                    label={STEPS[step-1]} 
                    className="h-2 bg-slate-100" 
                />
            </div>
            )}

            {/* STEP 1: IDENTIFICAÇÃO */}
            {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
                <div className="space-y-2">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">Vamos começar com você</h2>
                    <p className="text-slate-500 font-medium">Nos ajude a entender quem você é para encontrarmos o par perfeito.</p>
                </div>
                
                <div className="space-y-6">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1">Gênero</label>
                    <select
                        value={formData.genero}
                        onChange={(e) => setFormData({...formData, genero: e.target.value})}
                        className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl text-slate-900 font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all appearance-none cursor-pointer"
                    >
                         <option value="">Selecione...</option>
                         {OPCOES_GENERO.map(g => (
                            <option key={g} value={g}>{g}</option>
                         ))}
                    </select>
                </div>

                    <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1">Sua Idade</label>
                        <input 
                            type="number" 
                            value={formData.idade}
                            onChange={(e) => setFormData({...formData, idade: e.target.value})}
                            placeholder="Ex: 28"
                            className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl text-slate-900 font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-300"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1">Orientação</label>
                        <select 
                            value={formData.sexualidade}
                            onChange={(e) => setFormData({...formData, sexualidade: e.target.value})}
                            className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl text-slate-900 font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="">Selecione...</option>
                            {OPCOES_SEXUALIDADE.map(s => (
                            <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                    </div>

                    <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1">Etnia</label>
                    <select
                        value={formData.etnia}
                        onChange={(e) => setFormData({...formData, etnia: e.target.value})}
                        className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl text-slate-900 font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all appearance-none cursor-pointer"
                    >
                        <option value="">Selecione...</option>
                        {OPCOES_ETNIA.map(e => (
                             <option key={e} value={e}>{e}</option>
                        ))}
                    </select>
                </div>
              </div>

            <Button 
              disabled={!formData.genero || !formData.idade}
              onClick={nextStep}
// ...
            >
              Próximo Passo
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Button>
            </div>
            )}

            {/* STEP 2: PREFERÊNCIAS INICIAIS */}
            {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
                <div className="space-y-2">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">Sobre suas experiências</h2>
                    <p className="text-slate-500 font-medium">Histórico e contexto atual.</p>
                </div>
                
                <div className="space-y-6">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1">Já fez terapia antes?</label>
                    <div className="grid grid-cols-2 gap-4">
                    {[
                        { l: "Sim", v: true },
                        { l: "Não", v: false }
                    ].map(opt => (
                        <OptionButton
                        key={opt.l}
                        selected={formData.terapiaAntes === opt.v}
                        onClick={() => setFormData({...formData, terapiaAntes: opt.v})}
                        >
                        {opt.l}
                        </OptionButton>
                    ))}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1">Status de relacionamento</label>
                    <select
                        value={formData.statusRelacionamento}
                        onChange={(e) => setFormData({...formData, statusRelacionamento: e.target.value})}
                        className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl text-slate-900 font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all appearance-none cursor-pointer"
                    >
                         <option value="">Selecione...</option>
                         {["Solteiro(a)", "Namorando", "Casado(a)", "Divorciado(a)", "Viúvo(a)"].map(s => (
                            <option key={s} value={s}>{s}</option>
                         ))}
                    </select>
                </div>
                </div>

                <div className="flex gap-4">
                <Button onClick={prevStep} variant="ghost" className="w-16 h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </Button>
                <Button onClick={nextStep} variant="deep" size="xl" fullWidth className="rounded-2xl py-6 shadow-lg">
                    Próximo
                </Button>
                </div>
            </div>
            )}

            {/* STEP 3: DEMANDA */}
            {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
                <div className="space-y-2">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">O que te trouxe aqui?</h2>
                <p className="text-slate-500 font-medium text-sm">Selecione os temas que você deseja trabalhar. Você pode escolher vários.</p>
                </div>
                
                <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {DEMANDAS_INDIVIDUAL.map(d => (
                    <OptionButton
                    key={d}
                    selected={formData.demanda.includes(d)}
                    onClick={() => handleDemandaToggle(d)}
                    textAlign="left"
                    size="sm"
                    className="p-5 hover:bg-indigo-50"
                    >
                    {d}
                    </OptionButton>
                ))}
                </div>

                <div className="flex gap-4">
                <Button onClick={prevStep} variant="ghost" className="w-16 h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </Button>
                <Button 
                    disabled={formData.demanda.length === 0}
                    onClick={nextStep}
                    variant="deep"
                    size="xl"
                    fullWidth
                    className="rounded-2xl py-6 shadow-lg"
                >
                    Próximo
                </Button>
                </div>
            </div>
            )}

            {/* STEP 4: EXPECTATIVA */}
            {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
                <div className="space-y-2">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">Sua Expectativa</h2>
                <p className="text-slate-500 font-medium">Como você gostaria que o processo fosse conduzido?</p>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                {EXPECTATIVAS_INDIVIDUAL.map(e => (
                    <OptionButton
                    key={e}
                    selected={formData.expectativa.includes(e)}
                    onClick={() => handleExpectativaToggle(e)}
                    textAlign="left"
                    size="sm"
                    className="p-5 hover:bg-indigo-50"
                    >
                    {e}
                    </OptionButton>
                ))}
                </div>

                <div className="flex gap-4">
                <Button onClick={prevStep} variant="ghost" className="w-16 h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </Button>
                <Button onClick={nextStep} variant="deep" size="xl" fullWidth className="rounded-2xl py-6 shadow-lg">
                    Próximo
                </Button>
                </div>
            </div>
            )}

            {/* STEP 5: MODELO */}
            {step === 5 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
                <div className="space-y-2">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">Modelo de Terapeuta</h2>
                <p className="text-slate-500 font-medium">Qual o nível de direcionamento você prefere?</p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                {MODELOS_TERAPEUTA.map(opt => (
                    <OptionButton
                    key={opt.value}
                    selected={formData.modeloTerapeuta === opt.value}
                    onClick={() => setFormData({...formData, modeloTerapeuta: opt.value})}
                    textAlign="left"
                    size="lg"
                    className="hover:bg-indigo-50"
                    >
                    {opt.label}
                    </OptionButton>
                ))}
                </div>

                <div className="flex gap-4">
                <Button onClick={prevStep} variant="ghost" className="w-16 h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </Button>
                <Button 
                    disabled={!formData.modeloTerapeuta}
                    onClick={nextStep}
                    variant="deep"
                    size="xl"
                    fullWidth
                    className="rounded-2xl py-6 shadow-lg"
                >
                    Próximo
                </Button>
                </div>
            </div>
            )}

            {/* STEP 6: ESTILO */}
            {step === 6 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
                <div className="space-y-2">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">Clima da Sessão</h2>
                <p className="text-slate-500 font-medium">Você prefere uma postura mais formal ou casual?</p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                {ESTILOS_TERAPEUTA.map(opt => (
                    <OptionButton
                    key={opt.value}
                    selected={formData.estiloTerapeuta === opt.value}
                    onClick={() => setFormData({...formData, estiloTerapeuta: opt.value})}
                    textAlign="left"
                    size="lg"
                    className="hover:bg-indigo-50"
                    >
                    {opt.label}
                    </OptionButton>
                ))}
                </div>

                <div className="flex gap-4">
                <Button onClick={prevStep} variant="ghost" className="w-16 h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </Button>
                <Button 
                    disabled={!formData.estiloTerapeuta}
                    onClick={nextStep}
                    variant="deep"
                    size="xl"
                    fullWidth
                    className="rounded-2xl py-6 shadow-lg"
                >
                    Penúltimo Passo
                </Button>
                </div>
            </div>
            )}

            {/* STEP 7: PREFERÊNCIAS ESPECÍFICAS */}
            {step === 7 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
                <div className="space-y-2">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">Suas Preferências</h2>
                <p className="text-slate-500 font-medium">Existe algo específico que você busca no profissional?</p>
                </div>
                
                <div className="space-y-6">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1">Gênero do psicólogo</label>
                    <div className="grid grid-cols-2 gap-3">
                    {[
                        { l: "Homem", v: "MASCULINO" },
                        { l: "Mulher", v: "FEMININO" }
                    ].map(opt => (
                        <OptionButton
                        key={opt.v}
                        selected={formData.preferenciasEspecificas.homemMulher === opt.v}
                        onClick={() => setFormData({
                            ...formData, 
                            preferenciasEspecificas: { ...formData.preferenciasEspecificas, homemMulher: opt.v }
                        })}
                        size="sm"
                        className=""
                        >
                        {opt.l}
                        </OptionButton>
                    ))}
                    <div className="col-span-2">
                        <OptionButton
                            selected={formData.preferenciasEspecificas.homemMulher === "TANTO_FAZ"}
                            onClick={() => setFormData({
                                ...formData, 
                                preferenciasEspecificas: { ...formData.preferenciasEspecificas, homemMulher: "TANTO_FAZ" }
                            })}
                            size="sm"
                            className="w-full"
                        >
                            Sem preferência
                        </OptionButton>
                    </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100 mt-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 ml-1">Outras Características</label>
                    <div className="grid grid-cols-1 gap-3">
                    {[
                        { l: "Fazer parte da comunidade LGBTQIA+", k: "lgbtqia" },
                        { l: "Ter 45 anos ou mais", k: "mais45" },
                        { l: "Não ser religioso (Ateu/Agnóstico)", k: "naoReligioso" },
                        { l: "Ser um terapeuta negro (Preto/Pardo)", k: "negros" }
                    ].map(opt => (
                        <OptionButton
                        key={opt.k}
                        selected={(formData.preferenciasEspecificas as any)[opt.k]}
                        onClick={() => setFormData({
                            ...formData, 
                            preferenciasEspecificas: { 
                            ...formData.preferenciasEspecificas, 
                            [opt.k]: !(formData.preferenciasEspecificas as any)[opt.k] 
                            }
                        })}
                        textAlign="left"
                        size="sm"
                        className="p-5"
                        >
                        {opt.l}
                        </OptionButton>
                    ))}
                    
                    {/* Option: Sem preferência (Limpar todas) */}
                    <OptionButton
                        selected={
                        !formData.preferenciasEspecificas.lgbtqia && 
                        !formData.preferenciasEspecificas.mais45 && 
                        !formData.preferenciasEspecificas.naoReligioso && 
                        !formData.preferenciasEspecificas.negros
                        }
                        onClick={() => setFormData({
                        ...formData, 
                        preferenciasEspecificas: { 
                            ...formData.preferenciasEspecificas, 
                            lgbtqia: false,
                            mais45: false,
                            naoReligioso: false,
                            negros: false
                        }
                        })}
                        textAlign="center"
                        size="sm"
                        className="p-5 font-bold text-slate-500 hover:text-slate-800"
                    >
                        Sem preferência
                    </OptionButton>
                    </div>
                </div>
                </div>

                <div className="flex gap-4 pt-6">
                <Button onClick={prevStep} variant="ghost" className="w-16 h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </Button>
                <Button 
                    onClick={handleSubmit}
                    disabled={loading}
                    variant="primary"
                    size="xl"
                    fullWidth
                    className="gap-3 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 rounded-2xl"
                >
                    {loading ? "Calculando sua Conexão..." : "Ver Minhas Conexões"}
                </Button>
                </div>
            </div>
            )}

            {/* STEP 8: RESULTADOS */}
            {step === 8 && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
                <ResultsSection 
                    results={results} 
                    title="Seus psicólogos ideais" 
                    description="Com base nas suas respostas, estes são os especialistas que mais combinam com seu perfil."
                    onRedoQuiz={() => setStep(1)}
                />
            </div>
            )}
        </div>
      </div>

    </main>
  );
}
