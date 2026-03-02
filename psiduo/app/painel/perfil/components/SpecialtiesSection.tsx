
import React from 'react';
import { PsicologoFormData } from "@/types/psicologo";
import { LISTA_ESPECIALIDADES, LISTA_PUBLICO, LISTA_TEMAS } from "@/lib/profile-constants";

interface SpecialtiesSectionProps {
  formData: PsicologoFormData;
  setFormData: React.Dispatch<React.SetStateAction<PsicologoFormData>>;
}

const MODALIDADES = ["Individual", "Casais", "Terapia em Grupo"];

export default function SpecialtiesSection({ formData, setFormData }: SpecialtiesSectionProps) {

  const toggleItem = (item: string, categoria: 'especialidades' | 'temas' | 'publicoAlvo') => {
    const LIMITES = { especialidades: 2, temas: 5, publicoAlvo: 10 };
    const limite = LIMITES[categoria];
    setFormData(prev => {
      const lista = prev[categoria] as string[];
      if (lista.includes(item)) return { ...prev, [categoria]: lista.filter(i => i !== item) };
      if (lista.length < limite) return { ...prev, [categoria]: [...lista, item] };
      return prev;
    });
  };

  const removeChip = (item: string, categoria: 'especialidades' | 'temas' | 'publicoAlvo') => {
    setFormData(prev => ({
      ...prev,
      [categoria]: (prev[categoria] as string[]).filter(i => i !== item)
    }));
  };

  const selectClass = "w-full border border-slate-200 rounded-xl p-3 bg-white text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-deep/20 transition";
  const chipClass = "flex items-center gap-2 bg-slate-50 text-deep border border-slate-100 px-3 py-1.5 rounded-lg text-xs font-bold";
  const removeClass = "hover:text-red-500 transition-colors ml-1 font-black";

  return (
    <section className="space-y-8">
      <h2 className="text-xl font-black text-deep border-b-2 border-slate-100 pb-3 flex items-center gap-3 uppercase">
        <span className="bg-deep text-white w-8 h-8 rounded-full flex items-center justify-center text-base font-black italic">3</span>
        Especialidade e Público
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ESPECIALIZAÇÃO */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-black text-slate-700 uppercase">Especialização Profissional</label>
            <span className="text-xs font-bold text-slate-400">{formData.especialidades.length}/2</span>
          </div>
          <select
            className={selectClass}
            value=""
            onChange={(e) => {
              if (e.target.value === "nenhuma") setFormData(prev => ({ ...prev, especialidades: [] }));
              else if (e.target.value) toggleItem(e.target.value, 'especialidades');
            }}
          >
            <option value="">Selecionar especialização...</option>
            <option value="nenhuma" className="text-amber-600">— Nenhuma especialização —</option>
            {LISTA_ESPECIALIDADES.map(esp => (
              <option key={esp} value={esp} disabled={formData.especialidades.includes(esp)}>{esp}</option>
            ))}
          </select>
          {formData.especialidades.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.especialidades.map(esp => (
                <span key={esp} className={chipClass}>
                  {esp}
                  <button type="button" onClick={() => removeChip(esp, 'especialidades')} className={removeClass}>✕</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* MODALIDADE */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-black text-slate-700 uppercase">Modalidade de Atendimento</label>
            <span className="text-xs font-bold text-red-400 uppercase">Obrigatório</span>
          </div>
          <select
            className={selectClass}
            value=""
            onChange={(e) => { if (e.target.value) toggleItem(e.target.value, 'publicoAlvo'); }}
          >
            <option value="">Selecionar modalidade...</option>
            {MODALIDADES.map(mod => (
              <option key={mod} value={mod} disabled={formData.publicoAlvo.includes(mod)}>{mod}</option>
            ))}
          </select>
          {formData.publicoAlvo.filter(p => MODALIDADES.includes(p)).length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.publicoAlvo.filter(p => MODALIDADES.includes(p)).map(mod => (
                <span key={mod} className={chipClass}>
                  {mod}
                  <button type="button" onClick={() => removeChip(mod, 'publicoAlvo')} className={removeClass}>✕</button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-amber-600 font-bold mt-2">⚠ Selecione pelo menos Individual ou Casais.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PÚBLICO ALVO */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-black text-slate-700 uppercase">Público Alvo</label>
            <span className="text-xs font-bold text-slate-400">{formData.publicoAlvo.filter(p => !MODALIDADES.includes(p)).length}/10</span>
          </div>
          <select
            className={selectClass}
            value=""
            onChange={(e) => { if (e.target.value) toggleItem(e.target.value, 'publicoAlvo'); }}
          >
            <option value="">Selecionar público...</option>
            {LISTA_PUBLICO.filter(p => !MODALIDADES.includes(p)).map(p => (
              <option key={p} value={p} disabled={formData.publicoAlvo.includes(p)}>{p}</option>
            ))}
          </select>
          {formData.publicoAlvo.filter(p => !MODALIDADES.includes(p)).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.publicoAlvo.filter(p => !MODALIDADES.includes(p)).map(p => (
                <span key={p} className={chipClass}>
                  {p}
                  <button type="button" onClick={() => removeChip(p, 'publicoAlvo')} className={removeClass}>✕</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* TEMAS E DEMANDAS */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-black text-slate-700 uppercase">Temas e Demandas</label>
            <span className="text-xs font-bold text-slate-400">{formData.temas.length}/5</span>
          </div>
          <select
            className={selectClass}
            value=""
            onChange={(e) => { if (e.target.value) toggleItem(e.target.value, 'temas'); }}
          >
            <option value="">Selecionar tema...</option>
            {LISTA_TEMAS.map(t => (
              <option key={t} value={t} disabled={formData.temas.includes(t)}>{t}</option>
            ))}
          </select>
          {formData.temas.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.temas.map(t => (
                <span key={t} className={chipClass}>
                  {t}
                  <button type="button" onClick={() => removeChip(t, 'temas')} className={removeClass}>✕</button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
