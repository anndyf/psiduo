import { PsicologoFormData } from "@/types/psicologo";

interface Props {
  formData: PsicologoFormData;
  setFormData: (data: any) => void; 
}

export default function DuoIISection({ formData, setFormData }: Props) {
  
  return (
    <section className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-slate-800 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-deep rounded-full -mr-20 -mt-20 blur-3xl opacity-50"></div>
            
            <h2 className="text-3xl font-black mb-10 flex items-center gap-4 relative z-10 uppercase tracking-tight">
                <span className="bg-white text-slate-900 w-10 h-10 rounded-full flex items-center justify-center text-lg font-black italic">5</span>
                Exclusivo Duo II
            </h2>

            <div className="space-y-12 relative z-10">
                
                {/* VÍDEO E REDES */}
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Vídeo de Apresentação (YouTube)</label>
                        <input 
                            type="url" 
                            placeholder="https://youtube.com/watch?v=..." 
                            className="w-full bg-white border border-slate-200 rounded-xl p-4 text-slate-800 placeholder-slate-400 outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition font-medium shadow-sm"
                            value={formData.videoApresentacao}
                            onChange={e => setFormData({...formData, videoApresentacao: e.target.value})}
                        />
                        <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-wide">Cole o link completo do seu vídeo.</p>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-black text-slate-400 uppercase tracking-widest">Redes Sociais</label>
                        
                        <div className="flex items-center gap-3">
                            <span className="text-slate-500 text-xs w-20 font-black uppercase text-right">Instagram</span>
                            <input 
                                type="text" 
                                placeholder="@seu.perfil"
                                className="flex-1 bg-white border border-slate-200 rounded-xl p-3 text-slate-800 placeholder-slate-400 outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition shadow-sm"
                                value={formData.redesSociais?.instagram || ""}
                                onChange={e => setFormData({...formData, redesSociais: { ...formData.redesSociais, instagram: e.target.value }})}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-slate-500 text-xs w-20 font-black uppercase text-right">LinkedIn</span>
                            <input 
                                type="text" 
                                placeholder="Link do perfil"
                                className="flex-1 bg-white border border-slate-200 rounded-xl p-3 text-slate-800 placeholder-slate-400 outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition shadow-sm"
                                value={formData.redesSociais?.linkedin || ""}
                                onChange={e => setFormData({...formData, redesSociais: { ...formData.redesSociais, linkedin: e.target.value }})}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-slate-500 text-xs w-20 font-black uppercase text-right">Site</span>
                            <input 
                                type="url" 
                                placeholder="https://seusite.com"
                                className="flex-1 bg-white border border-slate-200 rounded-xl p-3 text-slate-800 placeholder-slate-400 outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition shadow-sm"
                                value={formData.redesSociais?.site || ""}
                                onChange={e => setFormData({...formData, redesSociais: { ...formData.redesSociais, site: e.target.value }})}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
}

