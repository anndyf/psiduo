import { PsicologoFormData } from "@/types/psicologo";

interface Props {
  formData: PsicologoFormData;
}

export default function ProfileHealth({ formData }: Props) {
  const calcularSaudePerfil = () => {
    let score = 0;
    const faltantes = [];

    if (formData.foto) score += 20; else faltantes.push("Sua foto profissional");
    if (formData.biografia && formData.biografia.length >= 50) score += 20; else faltantes.push("Uma biografia de pelo menos 50 caracteres");
    if (formData.cidade && formData.estado) score += 15; else faltantes.push("Sua localização (Cidade e Estado)");
    if (formData.especialidades.length > 0) score += 15; else faltantes.push("Pelo menos uma especialidade");
    if (formData.temas.length > 0) score += 10; else faltantes.push("Temas e demandas");
    if (formData.publicoAlvo.length > 0) score += 10; else faltantes.push("Público alvo");
    if (formData.whatsapp && formData.whatsapp.length >= 10) score += 10; else faltantes.push("WhatsApp atualizado");

    return { score: Math.min(score, 100), faltantes };
  };

  const { score, faltantes } = calcularSaudePerfil();

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-4">
        <div className="text-center md:text-left">
          <h3 className="text-lg font-black text-deep uppercase tracking-tighter">Saúde do seu Perfil</h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Perfis completos aparecem 3x mais no catálogo.</p>
        </div>
        <div className="flex items-center gap-4">
          <span className={`text-4xl font-black italic tracking-tighter ${score === 100 ? 'text-green-500' : 'text-primary'}`}>
            {score}%
          </span>
        </div>
      </div>

      <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden shadow-inner">
        <div
          className={`h-full transition-all duration-1000 ease-out rounded-full ${
            score === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-primary to-blue-400'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>

      {faltantes.length > 0 && (
        <div className="mt-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Para chegar aos 100%, adicione:</p>
          <div className="flex flex-wrap gap-2">
            {faltantes.slice(0, 3).map((f, i) => (
              <span key={i} className="bg-white border border-slate-200 text-slate-500 text-[9px] font-black py-1.5 px-3 rounded-lg uppercase tracking-wider shadow-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary/30 rounded-full"></span>
                {f}
              </span>
            ))}
            {faltantes.length > 3 && (
              <span className="text-[9px] font-black text-slate-400 flex items-center">e mais {faltantes.length - 3}...</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
