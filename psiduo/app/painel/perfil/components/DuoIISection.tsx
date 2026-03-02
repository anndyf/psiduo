import { PsicologoFormData } from "@/types/psicologo";

interface Props {
  formData: PsicologoFormData;
  setFormData: (data: PsicologoFormData) => void;
}

const labelClass = "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5";
const inputClass = "w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-sm text-slate-800 outline-none focus:ring-2 focus:ring-deep/20 focus:border-deep/50 transition placeholder:text-slate-300";

const DIAS_SEMANA = [
  { key: 'Seg', label: 'Segunda' },
  { key: 'Ter', label: 'Terça' },
  { key: 'Qua', label: 'Quarta' },
  { key: 'Qui', label: 'Quinta' },
  { key: 'Sex', label: 'Sexta' },
  { key: 'Sab', label: 'Sábado' },
  { key: 'Dom', label: 'Domingo' },
];

export default function DuoIISection({ formData, setFormData }: Props) {
  const handleAgendaChange = (dia: string, value: string) => {
    const horas = value.split(',').map(h => h.trim()).filter(h => h.length > 0);
    setFormData({
        ...formData,
        agendaConfig: {
            ...(formData.agendaConfig || {}),
            [dia]: horas
        }
    });
  };

  return (
    <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2.5">
          <span className="bg-deep text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">5</span>
          Exclusivo Duo II
        </h2>
        <p className="text-xs text-slate-400 mt-1 ml-8">Recursos adicionais disponíveis no plano premium</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* VÍDEO */}
        <div>
          <label className={labelClass}>Vídeo de Apresentação</label>
          <input
            type="url"
            placeholder="https://youtube.com/watch?v=..."
            className={inputClass}
            value={formData.videoApresentacao}
            onChange={e => setFormData({...formData, videoApresentacao: e.target.value})}
          />
          <p className="text-xs text-slate-400 mt-1.5">Cole o link completo do seu vídeo no YouTube.</p>
        </div>

        {/* REDES SOCIAIS */}
        <div className="space-y-3">
          <label className={labelClass}>Redes Sociais</label>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 uppercase w-20 text-right shrink-0">Instagram</span>
            <input
              type="text"
              placeholder="@seu.perfil"
              className={inputClass}
              value={formData.redesSociais?.instagram || ""}
              onChange={e => setFormData({...formData, redesSociais: { ...formData.redesSociais, instagram: e.target.value }})}
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 uppercase w-20 text-right shrink-0">LinkedIn</span>
            <input
              type="text"
              placeholder="Link do perfil"
              className={inputClass}
              value={formData.redesSociais?.linkedin || ""}
              onChange={e => setFormData({...formData, redesSociais: { ...formData.redesSociais, linkedin: e.target.value }})}
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 uppercase w-20 text-right shrink-0">Site</span>
            <input
              type="url"
              placeholder="https://seusite.com"
              className={inputClass}
              value={formData.redesSociais?.site || ""}
              onChange={e => setFormData({...formData, redesSociais: { ...formData.redesSociais, site: e.target.value }})}
            />
          </div>
        </div>
      </div>

      {/* HORÁRIOS DISPONÍVEIS */}
      <div className="mt-8 border border-slate-100 bg-slate-50/50 rounded-2xl p-6">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Horários Disponíveis na Agenda</h3>
          <p className="text-xs text-slate-500 mt-1">
             Informe os horários separados por vírgula (ex: <strong className="text-slate-700">08:00, 09:00, 14:00, 15:00</strong>). <br />
             Deixe em branco os dias que você não atende. Esses horários aparecerão em seu perfil público.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DIAS_SEMANA.map(dia => (
            <div key={dia.key} className="bg-white p-3 border border-slate-200 rounded-xl shadow-sm">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{dia.label}</label>
              <input
                type="text"
                placeholder="Ex: 08:00, 09:00"
                className="w-full border-none bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:ring-1 focus:ring-deep/20 transition placeholder:text-slate-300"
                value={formData.agendaConfig?.[dia.key]?.join(', ') || ""}
                onChange={e => handleAgendaChange(dia.key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
