"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { findMatches, QuizData } from "@/app/match/actions";
import { 
  DEMANDAS_CASAL,
  EXPECTATIVAS_CASAL,
  MODELOS_TERAPEUTA,
  ESTILOS_TERAPEUTA
} from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { OptionButton } from "@/components/quiz/OptionButton";
import { ResultsSection } from "@/components/quiz/ResultsSection";

const STEPS = [
  "O Casal",
  "Demanda",
  "Histórico",
  "Expectativa",
  "Modelo",
  "Estilo",
  "Preferências"
];

export default function QuizCasal() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<QuizData>({
    tipoQuiz: 'CASAL',
    genero: "",
    idade: "",
    sexualidade: "",
    etnia: "",
    pronomes: "",
    prefLgbt: false,
    statusRelacionamento: "Casal", // Default para casal
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
      alert("Erro ao buscar combinações.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-mist font-sans flex flex-col overflow-x-hidden">
      <Navbar />

      <div className="flex-1 container mx-auto max-w-2xl px-6 py-12 lg:py-24">
        
        {step < 8 && (
          <Progress 
            value={(step / 7) * 100} 
            step={step} 
            totalSteps={7} 
            label={STEPS[step-1]} 
            className="mb-12" 
          />
        )}

        {/* STEP 1: COMPOSIÇÃO DO CASAL */}
        {step === 1 && (
          <div className="animate-fadeIn space-y-8">
            <h2 className="text-3xl font-black text-deep uppercase tracking-tighter">Sobre o Casal</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Como vocês se identificam?</label>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    "Casal Heterossexual", 
                    "Casal Homoafetivo Feminino", 
                    "Casal Homoafetivo Masculino", 
                    "Relacionamento Não-monogâmico",
                    "Outra configuração"
                  ].map(g => (
                    <OptionButton
                      key={g}
                      selected={formData.sexualidade === g}
                      onClick={() => setFormData({...formData, sexualidade: g})}
                      textAlign="left"
                    >
                      {g}
                    </OptionButton>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Tempo de relacionamento (aprox)</label>
                <select 
                  onChange={(e) => setFormData({...formData, statusRelacionamento: e.target.value})}
                  className="w-full bg-white border-2 border-slate-100 p-4 rounded-xl text-deep font-bold focus:border-primary outline-none transition appearance-none"
                >
                  <option value="">Selecione...</option>
                  <option value="Menos de 1 ano">Menos de 1 ano</option>
                  <option value="1 a 3 anos">1 a 3 anos</option>
                  <option value="3 a 10 anos">3 a 10 anos</option>
                  <option value="Mais de 10 anos">Mais de 10 anos</option>
                </select>
              </div>
            </div>

            <Button 
              disabled={!formData.sexualidade}
              onClick={nextStep}
              variant="deep"
              size="xl"
              fullWidth
            >
              Continuar
            </Button>
          </div>
        )}

        {/* STEP 2: DEMANDA DE CASAL */}
        {step === 2 && (
          <div className="animate-fadeIn space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-deep uppercase tracking-tighter">Qual o principal desafio?</h2>
              <p className="text-slate-500 font-medium text-sm">O que motivou a busca pela terapia neste momento?</p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {DEMANDAS_CASAL.map(d => (
                <OptionButton
                  key={d}
                  selected={formData.demanda.includes(d)}
                  onClick={() => handleDemandaToggle(d)}
                  textAlign="left"
                  size="sm"
                  className="p-5"
                >
                  {d}
                </OptionButton>
              ))}
            </div>

            <div className="flex gap-4">
              <Button onClick={prevStep} variant="outline" className="w-20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </Button>
              <Button 
                disabled={formData.demanda.length === 0}
                onClick={nextStep}
                variant="deep"
                size="xl"
                fullWidth
              >
                Próximo
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: HISTÓRICO */}
        {step === 3 && (
          <div className="animate-fadeIn space-y-8">
            <h2 className="text-3xl font-black text-deep uppercase tracking-tighter">Histórico do Casal</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Já fizeram terapia de casal antes?</label>
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
            </div>

            <div className="flex gap-4">
              <Button onClick={prevStep} variant="outline" className="w-20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </Button>
              <Button onClick={nextStep} variant="deep" size="xl" fullWidth>
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: EXPECTATIVA */}
        {step === 4 && (
          <div className="animate-fadeIn space-y-8">
            <h2 className="text-3xl font-black text-deep uppercase tracking-tighter">O que vocês buscam?</h2>
            
            <div className="grid grid-cols-1 gap-3">
              {EXPECTATIVAS_CASAL.map(e => (
                <OptionButton
                  key={e}
                  selected={formData.expectativa.includes(e)}
                  onClick={() => handleExpectativaToggle(e)}
                  textAlign="left"
                  size="sm"
                  className="p-5"
                >
                  {e}
                </OptionButton>
              ))}
            </div>

            <div className="flex gap-4">
              <Button onClick={prevStep} variant="outline" className="w-20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </Button>
              <Button onClick={nextStep} variant="deep" size="xl" fullWidth>
                Próximo
              </Button>
            </div>
          </div>
        )}

        {/* STEP 5: MODELO */}
        {step === 5 && (
          <div className="animate-fadeIn space-y-8">
            <h2 className="text-3xl font-black text-deep uppercase tracking-tighter">Modelo de Terapia</h2>
            <div className="grid grid-cols-1 gap-4">
              {MODELOS_TERAPEUTA.map(opt => (
                <OptionButton
                  key={opt.value}
                  selected={formData.modeloTerapeuta === opt.value}
                  onClick={() => setFormData({...formData, modeloTerapeuta: opt.value})}
                  textAlign="left"
                  size="lg"
                >
                  {opt.label}
                </OptionButton>
              ))}
            </div>

            <div className="flex gap-4">
              <Button onClick={prevStep} variant="outline" className="w-20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </Button>
              <Button 
                disabled={!formData.modeloTerapeuta} 
                onClick={nextStep} 
                variant="deep"
                size="xl"
                fullWidth
              >
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* STEP 6: ESTILO */}
        {step === 6 && (
          <div className="animate-fadeIn space-y-8">
            <h2 className="text-3xl font-black text-deep uppercase tracking-tighter">Clima da Sessão</h2>
            <div className="grid grid-cols-1 gap-4">
              {ESTILOS_TERAPEUTA.map(opt => (
                <OptionButton
                  key={opt.value}
                  selected={formData.estiloTerapeuta === opt.value}
                  onClick={() => setFormData({...formData, estiloTerapeuta: opt.value})}
                  textAlign="left"
                  size="lg"
                >
                  {opt.label}
                </OptionButton>
              ))}
            </div>

            <div className="flex gap-4">
              <Button onClick={prevStep} variant="outline" className="w-20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </Button>
              <Button 
                disabled={!formData.estiloTerapeuta} 
                onClick={nextStep} 
                variant="deep"
                size="xl"
                fullWidth
              >
                Penúltimo Passo
              </Button>
            </div>
          </div>
        )}

        {/* STEP 7: PREFERÊNCIAS */}
        {step === 7 && (
          <div className="animate-fadeIn space-y-8">
            <h2 className="text-3xl font-black text-deep uppercase tracking-tighter">Preferências Finais</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Gênero do psicólogo</label>
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

              <div className="pt-6 border-t border-slate-200 mt-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Outras Características</label>
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
                    className="p-5 font-black text-slate-400"
                  >
                    Sem preferência
                  </OptionButton>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button onClick={prevStep} variant="outline" className="w-20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={loading} 
                variant="primary"
                size="xl"
                fullWidth
              >
                {loading ? "Calculando Conexão..." : "Ver Minhas Conexões"}
              </Button>
            </div>
          </div>
        )}

        {/* RESULTADOS */}
        {step === 8 && (
          <ResultsSection 
            results={results}
            title="Seus especialistas em Casal"
            description="Estes profissionais são especialistas em mediar e fortalecer relacionamentos."
            onRedoQuiz={() => setStep(1)}
            catalogText="Explorar Catálogo de Casais"
          />
        )}
      </div>

      <Footer />
    </main>
  );
}
