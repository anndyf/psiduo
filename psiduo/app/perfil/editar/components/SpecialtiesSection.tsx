
import React from 'react';
import { PsicologoFormData } from "@/types/psicologo";
import { LISTA_ESPECIALIDADES, LISTA_PUBLICO, LISTA_TEMAS } from "@/lib/profile-constants";

interface SpecialtiesSectionProps {
  formData: PsicologoFormData;
  setFormData: React.Dispatch<React.SetStateAction<PsicologoFormData>>;
}

export default function SpecialtiesSection({ formData, setFormData }: SpecialtiesSectionProps) {

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

  return (
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
              if(e.target.value === "nenhuma") setFormData(prev => ({...prev, especialidades: []}));
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
  );
}
