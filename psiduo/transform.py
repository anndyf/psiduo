import re

with open("app/painel/perfil/page.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Imports
text = text.replace('import { ArrowLeft, Eye, Save, User, Briefcase, Settings } from "lucide-react";', 'import { ArrowLeft, Save, User, Briefcase, Settings } from "lucide-react";')

# 2. state
text = text.replace('  const [showPreview, setShowPreview] = useState(false);\n', '')

# 3. View preview header button
header_preview_btn = """                <button 
                    onClick={() => setShowPreview(true)}
                    className="h-9 md:h-10 w-9 md:w-10 md:w-auto md:px-5 rounded-xl border flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0 text-xs font-bold uppercase tracking-wide shadow-sm bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                    title="Ver Prévia"
                >
                    <Eye size={18} strokeWidth={2} />
                    <span className="hidden md:inline">Ver Prévia</span>
                </button>
"""
text = text.replace(header_preview_btn, '')

# 4. Form Layout Grid removing
grid_old = """        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-6">
            <form"""
grid_new = """        <div>
          <div className="space-y-6">
            <form"""
text = text.replace(grid_old, grid_new)

# 5. Bottom form buttons and preview removal
footer_old = """            <div className="flex flex-col sm:flex-row gap-4 pt-10">
               <button 
                  disabled={loading} 
                  type="submit" 
                  className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl shadow-lg hover:opacity-90 transition-opacity"
               >
                 {loading ? "Salvando..." : "Salvar Alterações"}
               </button>
            </div>

            <button 
                type="button"
                onClick={() => setShowPreview(true)}
                className="w-full lg:hidden bg-blue-50 text-primary font-bold py-4 rounded-2xl mt-4 flex items-center justify-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                Ver Prévia
            </button>
          </form>
        </div>

        {/* RIGHT PANEL: LIVE PREVIEW (Desktop) / MODAL (Mobile) */}
        <div className={`lg:col-span-5 xl:col-span-4 lg:bg-slate-50 lg:rounded-3xl lg:p-8 lg:sticky lg:top-8 ${showPreview ? 'fixed inset-0 z-50 bg-slate-900/80 p-4 flex flex-col items-center justify-center overflow-y-auto' : 'hidden lg:block'}`}>
            
            <div className="w-full max-w-sm mx-auto relative lg:mt-4">
                <div className="flex justify-between items-center mb-8 hidden lg:flex">
                    <h2 className="text-2xl font-bold text-slate-900">Prévia do App</h2>
                    <div className="flex gap-2 text-primary">
                        <span className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 flex items-center justify-center">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        </span>
                    </div>
                </div>

                {showPreview && (
                   <button onClick={() => setShowPreview(false)} className="lg:hidden absolute -top-12 right-0 z-50 text-white bg-slate-800 rounded-full w-10 h-10 font-bold flex items-center justify-center">✕</button>
                )}

                <div className={`bg-white rounded-[2rem] p-6 lg:p-7 flex flex-col shadow-xl lg:shadow-[0_10px_40px_rgba(0,0,0,0.06)] border transition-all duration-300 relative ${
                    formData.plano === 'DUO_II' 
                    ? 'border-primary/20 shadow-[0_20px_60px_rgba(59,130,246,0.08)]' 
                    : 'border-slate-100'
                }`}>
                      {/* --- HEADER: Foto + Name + CRP --- */}
                      <div className="flex items-center gap-4 sm:gap-5 mb-4">
                          <div className="relative shrink-0">
                              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.25rem] sm:rounded-[1.5rem] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-2 sm:border-[3px] border-white relative">
                                  {formData.foto ? (
                                      <div className="w-full h-full rounded-[1.1rem] sm:rounded-[1.3rem] overflow-hidden relative">
                                          <Image src={formData.foto} fill className="object-cover" alt="Foto" sizes="(max-width: 640px) 64px, 80px" />
                                      </div>
                                  ) : (
                                      <div className="w-full h-full rounded-[1.1rem] sm:rounded-[1.3rem] bg-mist flex items-center justify-center text-xl sm:text-2xl font-black text-primary">
                                          {formData.nome ? formData.nome.charAt(0) : "P"}
                                      </div>
                                  )}
                                  {formData.plano === 'DUO_II' && (
                                      <div className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 bg-primary text-white p-1 sm:p-1.5 rounded-lg shadow-lg ring-2 ring-white z-10">
                                          <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                      </div>
                                  )}
                              </div>
                          </div>

                          <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                  <h3 className="font-bold text-slate-800 text-base sm:text-lg tracking-tight leading-tight">{formData.nome || "Seu Nome Completo"}</h3>
                                  <button className="p-1.5 rounded-full text-slate-500">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                  </button>
                              </div>
                              <p className="text-[9px] sm:text-[10px] font-black text-slate-600 uppercase tracking-widest mt-0.5">CRP 00/00000</p>
                          </div>
                      </div>

                      {/* --- WHATSAPP FAST CONTACT --- */}
                      <div className="mb-4">
                          <button 
                              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-50 text-green-600 border border-green-100 font-bold text-[10px] uppercase tracking-widest hover:bg-green-100 transition-colors"
                          >
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                              Contato via WhatsApp
                          </button>
                      </div>

                      {/* --- ABORDAGEM (BOX) --- */}
                          <div className="mb-4">
                              <div className="bg-blue-50/50 border border-blue-100/50 rounded-xl p-3 text-center">
                                  <span className="text-[9px] font-black text-blue-700 uppercase tracking-widest truncate block w-full px-2">
                                      {formData.abordagem || "Sua Abordagem Teórica"}
                                  </span>
                              </div>
                          </div>

                      {/* --- ESPECIALIDADES & TEMAS --- */}
                      <div className="space-y-3 mb-4 flex-1">
                          {/* Especialidades */}
                          {formData.especialidades && formData.especialidades.length > 0 && (
                              <div>
                                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Especialidade</p>
                                  <div className="flex flex-wrap gap-1.5">
                                      {formData.especialidades.map((esp: string) => (
                                          <span key={esp} className="text-[9px] text-blue-500 font-bold bg-blue-50/30 px-2.5 py-0.5 rounded-lg border border-blue-100/30">
                                              {esp}
                                          </span>
                                      ))}
                                  </div>
                              </div>
                          )}

                          {/* Temas */}
                          {formData.temas && formData.temas.length > 0 && (
                            <div>
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Temas</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {formData.temas.slice(0, 2).map((tema: string) => (
                                        <span key={tema} className="text-[9px] text-slate-800 font-bold bg-slate-50 px-2.5 py-0.5 rounded-lg border border-slate-100">
                                            {tema}
                                        </span>
                                    ))}
                                    {formData.temas.length > 2 && (
                                        <span className="text-[9px] text-slate-600 font-bold py-0.5 px-1">+{formData.temas.length - 2}</span>
                                    )}
                                </div>
                            </div>
                          )}

                          {/* Público Alvo */}
                          {formData.publicoAlvo && formData.publicoAlvo.length > 0 && (
                              <div>
                                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 ">Acompanhamento</p>
                                  <div className="flex flex-wrap gap-1.5">
                                      {formData.publicoAlvo.map((p: string) => (
                                          <span key={p} className="text-[8px] text-slate-600 font-bold bg-white px-2 py-0.5 rounded-md border border-slate-100">
                                              {p}
                                          </span>
                                      ))}
                                  </div>
                              </div>
                          )}

                          {/* Bio Snippet */}
                          {formData.biografia && (
                              <div className="pt-2">
                                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Apresentação</p>
                                  <p className="text-[11px] text-slate-800 leading-relaxed line-clamp-2 italic font-medium">
                                      "{formData.biografia}"
                                  </p>
                              </div>
                          )}
                      </div>

                      {/* --- FOOTER: Valor + Botão --- */}
                      <div className="pt-4 border-t border-slate-50 flex items-center justify-between gap-3">
                          <div className="shrink-0">
                              <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] mb-0.5">Sessão</p>
                              <div className="flex items-baseline gap-1 whitespace-nowrap">
                                  <span className="text-xl font-black text-green-500 tracking-tight leading-none">R$ {formData.preco}</span>
                                  <span className="text-[10px] text-slate-600 font-bold uppercase opacity-60">/ {formData.duracaoSessao || 50}m</span>
                              </div>
                          </div>
                          
                          <button 
                              className="flex-1 bg-deep text-white px-5 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-deep/10 flex items-center justify-center gap-2 whitespace-nowrap"
                          >
                              Perfil Completo
                              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                          </button>
                      </div>
                  </div>
              </div>
          </div>
        </div>"""
footer_new = """            <div className="flex flex-col sm:flex-row gap-4 pt-10">
               <button 
                  disabled={loading} 
                  type="submit" 
                  className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl shadow-lg hover:opacity-90 transition-opacity"
               >
                 {loading ? "Salvando..." : "Salvar Alterações"}
               </button>
            </div>
          </form>
        </div>"""
text = text.replace(footer_old, footer_new)

with open("app/painel/perfil/page.tsx", "w", encoding="utf-8") as f:
    f.write(text)

