import { useState } from "react";
import { PsicologoFormData } from "@/types/psicologo";

interface Props {
  formData: PsicologoFormData;
  setFormData: (data: any) => void; 
}

export default function DuoIISection({ formData, setFormData }: Props) {
  const [selectedDay, setSelectedDay] = useState("Seg");

  const replicarHorariosSegSex = () => {
    const horariosAtuais = formData.agendaConfig?.[selectedDay] || [];
    if (horariosAtuais.length === 0) return;

    const novaAgenda = { ...formData.agendaConfig };
    ["Seg", "Ter", "Qua", "Qui", "Sex"].forEach(dia => {
      novaAgenda[dia] = [...horariosAtuais];
    });

    setFormData({ ...formData, agendaConfig: novaAgenda });
    alert("Horários replicados para dias úteis!"); // Simples alert ou callback de msg
  };

  const adicionarHorario = () => {
    const input = document.getElementById(`time-input-${selectedDay}`) as HTMLInputElement;
    const novoHorario = input.value;
    if (!novoHorario) return;

    const horariosAtuais = formData.agendaConfig?.[selectedDay] || [];
    if (horariosAtuais.includes(novoHorario)) return;

    const novosHorarios = [...horariosAtuais, novoHorario].sort();
    setFormData({
        ...formData,
        agendaConfig: { ...formData.agendaConfig, [selectedDay]: novosHorarios }
    });
    input.value = "";
  };

  const removerHorario = (horario: string) => {
    const novosHorarios = formData.agendaConfig[selectedDay].filter((item) => item !== horario);
    setFormData({
        ...formData,
        agendaConfig: { ...formData.agendaConfig, [selectedDay]: novosHorarios }
    });
  };

  return (
    <section className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
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
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 outline-none focus:border-white transition font-medium"
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
                                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-white transition"
                                value={formData.redesSociais?.instagram || ""}
                                onChange={e => setFormData({...formData, redesSociais: { ...formData.redesSociais, instagram: e.target.value }})}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-slate-500 text-xs w-20 font-black uppercase text-right">LinkedIn</span>
                            <input 
                                type="text" 
                                placeholder="Link do perfil"
                                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-white transition"
                                value={formData.redesSociais?.linkedin || ""}
                                onChange={e => setFormData({...formData, redesSociais: { ...formData.redesSociais, linkedin: e.target.value }})}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-slate-500 text-xs w-20 font-black uppercase text-right">Site</span>
                            <input 
                                type="url" 
                                placeholder="https://seusite.com"
                                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-white transition"
                                value={formData.redesSociais?.site || ""}
                                onChange={e => setFormData({...formData, redesSociais: { ...formData.redesSociais, site: e.target.value }})}
                            />
                        </div>
                    </div>
                </div>

                {/* CONFIGURAÇÃO DE AGENDA POR DIA */}
                <div id="agenda" className="bg-slate-800/50 px-3 py-6 md:p-10 rounded-[2.5rem] border border-slate-700/50">
                    <label className="block text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Disponibilidade de Horários</label>
                    
                    <div className="space-y-10">
                        {/* SELEÇÃO DO DIA ATUAL */}
                        <div>
                            <span className="text-[10px] font-black text-slate-500 block mb-4 uppercase tracking-[0.2em]">1. Escolha o Dia da Semana</span>
                            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                                {["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"].map(dia => {
                                    const temHorario = formData.agendaConfig?.[dia]?.length > 0;
                                    return (
                                        <button 
                                            key={dia}
                                            type="button"
                                            onClick={() => setSelectedDay(dia)}
                                            className={`h-12 rounded-xl text-[10px] font-black transition-all border-2 relative ${
                                                selectedDay === dia
                                                ? "bg-white text-slate-900 border-white shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-105" 
                                                : temHorario
                                                  ? "bg-primary/20 text-primary border-primary/30" 
                                                  : "bg-slate-800 text-slate-500 border-slate-700/50 hover:bg-slate-700"
                                            }`}
                                        >
                                            {dia}
                                            {temHorario && selectedDay !== dia && (
                                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse shadow-sm shadow-primary"></span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ADICIONAR E LISTAR HORÁRIOS PARA O DIA SELECIONADO */}
                        <div className="px-3 py-6 sm:p-6 md:p-8 bg-slate-900/60 rounded-[1.5rem] border border-slate-700/40 relative">
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Configurando</span>
                                    <span className="text-sm md:text-base font-black text-white uppercase whitespace-nowrap">
                                        {selectedDay === "Seg" ? "Segunda-feira" : 
                                         selectedDay === "Ter" ? "Terça-feira" :
                                         selectedDay === "Qua" ? "Quarta-feira" :
                                         selectedDay === "Qui" ? "Quinta-feira" :
                                         selectedDay === "Sex" ? "Sexta-feira" :
                                         selectedDay === "Sab" ? "Sábado" : "Domingo"}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/50">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">
                                            <span className="text-white text-xs">{ (formData.agendaConfig?.[selectedDay] || []).length }</span> { (formData.agendaConfig?.[selectedDay] || []).length === 1 ? 'Horário' : 'Horários' }
                                        </p>
                                    </div>
                                    {["Seg", "Ter", "Qua", "Qui", "Sex"].includes(selectedDay) && (formData.agendaConfig?.[selectedDay] || []).length > 0 && (
                                        <button 
                                            type="button"
                                            onClick={replicarHorariosSegSex}
                                            className="bg-primary/20 hover:bg-primary/40 text-primary border border-primary/30 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"
                                        >
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.435 15.657a1 1 0 010-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414 0zM6.464 16.364a1 1 0 11-1.414-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707z" /></svg>
                                            Replicar para Seg a Sex
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 mb-8">
                                <div className="flex-1 relative">
                                    <input 
                                        id={`time-input-${selectedDay}`}
                                        type="time" 
                                        className="w-full bg-slate-800/50 border-2 border-slate-700/60 rounded-2xl p-4 text-white font-black text-2xl outline-none focus:border-primary transition shadow-inner text-center md:text-left"
                                    />
                                </div>
                                <button 
                                    type="button"
                                    onClick={adicionarHorario}
                                    className="bg-primary text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all shadow-xl active:scale-95 min-h-[64px] flex-none w-full md:w-auto flex items-center justify-center"
                                >
                                    Adicionar Horário
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2.5 min-h-[40px]">
                                {(formData.agendaConfig?.[selectedDay] || []).length === 0 ? (
                                    <div className="w-full py-10 text-center border-2 border-dashed border-slate-700/30 rounded-3xl">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-60">Nenhum horário cadastrado</p>
                                    </div>
                                ) : (
                                    (formData.agendaConfig?.[selectedDay] || []).map((h) => (
                                        <div key={h} className="bg-slate-800/80 flex items-center gap-4 pl-5 pr-1.5 py-2.5 rounded-2xl border border-slate-700/50 group hover:border-red-500/30 hover:bg-red-500/5 transition-all w-fit">
                                            <span className="text-white font-black text-sm tracking-tight">{h}</span>
                                            <button 
                                                type="button"
                                                onClick={() => removerHorario(h)}
                                                className="text-slate-500 hover:text-white w-8 h-8 rounded-xl flex items-center justify-center hover:bg-red-500/80 transition-all"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        
                        <div className="flex items-start gap-3 bg-slate-900/30 p-4 rounded-xl border border-slate-700/20">
                            <div className="w-2 h-2 bg-primary rounded-full mt-1.5 animate-pulse shrink-0"></div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight leading-relaxed">
                                Selecione um dia da semana para gerenciar seus horários. Os pacientes verão estes horários específicos como disponíveis para agendamento automático.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
}
