
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

export default function IdentitySection({ formData, setFormData }: IdentitySectionProps) {
  return (
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
                onClick={() => setFormData(prev => ({...prev, estilo: opt.v}))}
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
                onClick={() => setFormData(prev => ({...prev, diretividade: opt.v}))}
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
  );
}
