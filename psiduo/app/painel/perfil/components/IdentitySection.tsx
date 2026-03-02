
import React from 'react';
import { PsicologoFormData } from "@/types/psicologo";
import { 
  OPCOES_GENERO, OPCOES_ETNIA, OPCOES_SEXUALIDADE, 
  OPCOES_RELIGIAO, OPCOES_ESTILO, OPCOES_DIRETIVIDADE, ABORDAGENS 
} from "@/lib/profile-constants";

interface IdentitySectionProps {
  formData: PsicologoFormData;
  setFormData: React.Dispatch<React.SetStateAction<PsicologoFormData>>;
}

const labelClass = "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5";
const selectClass = "w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-sm text-slate-800 outline-none focus:ring-2 focus:ring-deep/20 focus:border-deep/50 transition";
const inputClass = "w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-sm text-slate-800 outline-none focus:ring-2 focus:ring-deep/20 focus:border-deep/50 transition placeholder:text-slate-300";

export default function IdentitySection({ formData, setFormData }: IdentitySectionProps) {
  return (
    <section className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2.5">
          <span className="bg-deep text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
          Identidade Profissional
        </h2>
        <p className="text-xs text-slate-400 mt-1 ml-8">Informações sobre a sua identidade como profissional</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div>
          <label className={labelClass}>Idade</label>
          <input required type="number" className={inputClass} placeholder="—" value={formData.idade} onChange={e => setFormData({...formData, idade: e.target.value})} />
        </div>
        <div>
          <label className={labelClass}>Gênero</label>
          <select required className={selectClass} value={formData.genero} onChange={e => setFormData({...formData, genero: e.target.value})}>
            <option value="">Selecione</option>
            {OPCOES_GENERO.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Etnia</label>
          <select required className={selectClass} value={formData.etnia} onChange={e => setFormData({...formData, etnia: e.target.value})}>
            <option value="">Selecione</option>
            {OPCOES_ETNIA.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Sexualidade</label>
          <select required className={selectClass} value={formData.sexualidade} onChange={e => setFormData({...formData, sexualidade: e.target.value})}>
            <option value="">Selecione</option>
            {OPCOES_SEXUALIDADE.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Religião</label>
          <select required className={selectClass} value={formData.religiao} onChange={e => setFormData({...formData, religiao: e.target.value})}>
            <option value="">Selecione</option>
            {OPCOES_RELIGIAO.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Estilo de Atendimento</label>
          <select
            className={selectClass}
            value={formData.estilo}
            onChange={e => setFormData(prev => ({...prev, estilo: e.target.value}))}
          >
            <option value="">Selecione</option>
            {OPCOES_ESTILO.map(opt => (
              <option key={opt.v} value={opt.v}>{opt.l}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Nível de Diretividade</label>
          <select
            className={selectClass}
            value={formData.diretividade}
            onChange={e => setFormData(prev => ({...prev, diretividade: e.target.value}))}
          >
            <option value="">Selecione</option>
            {OPCOES_DIRETIVIDADE.map(opt => (
              <option key={opt.v} value={opt.v}>{opt.l}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Abordagem Teórica Principal</label>
          <select required className={selectClass} value={formData.abordagem} onChange={e => setFormData({...formData, abordagem: e.target.value})}>
            <option value="">Selecione sua abordagem...</option>
            {ABORDAGENS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>
    </section>
  );
}
