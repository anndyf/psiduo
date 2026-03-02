"use client";

import { useState, useEffect } from "react";
import { X, Clock, Calendar, Check, AlertCircle, Plus, Copy } from "lucide-react";
import { buscarDadosPsicologo, salvarAgendaPsicologo } from "@/app/perfil/actions";
import { toast } from "sonner";

interface AgendaConfig {
  [dia: string]: string[];
}

interface AgendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function AgendaModal({ isOpen, onClose, userId }: AgendaModalProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [agenda, setAgenda] = useState<AgendaConfig>({
    Seg: [], Ter: [], Qua: [], Qui: [], Sex: [], Sab: [], Dom: []
  });
  const [selectedDay, setSelectedDay] = useState("Seg");

  useEffect(() => {
    if (isOpen && userId) {
      loadAgenda();
    }
  }, [isOpen, userId]);

  async function loadAgenda() {
    setLoading(true);
    const res = await buscarDadosPsicologo(userId);
    if (res.success && res.dados) {
        let savedAgenda = res.dados.agendaConfig as any;
        if (!savedAgenda || typeof savedAgenda !== 'object') {
            savedAgenda = { Seg: [], Ter: [], Qua: [], Qui: [], Sex: [], Sab: [], Dom: [] };
        }
        setAgenda(savedAgenda);
    }
    setLoading(false);
  }

  const replicarHorariosSegSex = () => {
    const horariosAtuais = agenda[selectedDay] || [];
    if (horariosAtuais.length === 0) return;

    const novaAgenda = { ...agenda };
    ["Seg", "Ter", "Qua", "Qui", "Sex"].forEach(dia => {
      novaAgenda[dia] = [...horariosAtuais];
    });

    setAgenda(novaAgenda);
    toast.success("Horários replicados para dias úteis!");
  };

  const adicionarHorario = () => {
    const input = document.getElementById(`time-input-modal-${selectedDay}`) as HTMLInputElement;
    const novoHorario = input.value;
    if (!novoHorario) return;

    const horariosAtuais = agenda[selectedDay] || [];
    if (horariosAtuais.includes(novoHorario)) return;

    const novosHorarios = [...horariosAtuais, novoHorario].sort();
    setAgenda({
        ...agenda,
        [selectedDay]: novosHorarios 
    });
    input.value = "";
    input.focus();
  };

  const removerHorario = (horario: string) => {
    const novosHorarios = agenda[selectedDay].filter((item) => item !== horario);
    setAgenda({
        ...agenda,
        [selectedDay]: novosHorarios
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await salvarAgendaPsicologo(userId, agenda);
    if (res.success) {
        toast.success("Agenda salva com sucesso!");
        onClose();
    } else {
        toast.error("Erro ao salvar agenda.");
    }
    setSaving(false);
  };

  if (!isOpen) return null;

  const diaExtenso = {
      "Seg": "Segunda", "Ter": "Terça", "Qua": "Quarta", "Qui": "Quinta", 
      "Sex": "Sexta", "Sab": "Sábado", "Dom": "Domingo"
  }[selectedDay];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-[600px] rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
        
        {/* HEADER COMPACTO */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-amber-500 shadow-md shadow-slate-900/10">
                    <Calendar size={16} strokeWidth={2.5} />
                </div>
                <div>
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none">Configurar Agenda</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Defina seus horários de atendimento</p>
                </div>
            </div>
            <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
            >
                <X size={18} />
            </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50">
            {loading ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                    <div className="w-8 h-8 border-2 border-slate-200 border-t-amber-500 rounded-full animate-spin"></div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Carregando...</p>
                </div>
            ) : (
                <div className="p-6 space-y-6">
                    
                    {/* SELETOR DE DIAS (Slim Tabs) */}
                    <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
                        {["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"].map(dia => {
                            const temHorario = agenda[dia]?.length > 0;
                            const isSelected = selectedDay === dia;
                            return (
                                <button 
                                    key={dia}
                                    onClick={() => setSelectedDay(dia)}
                                    className={`flex-1 min-w-[50px] py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all relative flex flex-col items-center gap-1 ${
                                        isSelected
                                        ? "bg-slate-900 text-white shadow-md shadow-slate-900/10" 
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                                >
                                    {dia}
                                    {temHorario && !isSelected && (
                                        <span className="w-1 h-1 rounded-full bg-amber-500"></span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* CARD PRINCIPAL COMPACTO */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 relative overflow-hidden group hover:border-slate-300 transition-colors">
                        
                        {/* Header do Card (Dia + Replicar) */}
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{diaExtenso}</h3>
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">
                                    {agenda[selectedDay]?.length || 0} Horários
                                </span>
                            </div>

                            {["Seg", "Ter", "Qua", "Qui", "Sex"].includes(selectedDay) && agenda[selectedDay]?.length > 0 && (
                                <button 
                                    onClick={replicarHorariosSegSex}
                                    className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 hover:text-amber-600 bg-slate-50 hover:bg-amber-50 px-2.5 py-1.5 rounded-lg border border-slate-100 hover:border-amber-200 transition-all uppercase tracking-wide"
                                    title="Copiar horários para Seg-Sex"
                                >
                                    <Copy size={12} />
                                    Replicar Dias Úteis
                                </button>
                            )}
                        </div>

                        {/* Input Integrado */}
                        <div className="flex gap-2 mb-5">
                            <input 
                                id={`time-input-modal-${selectedDay}`}
                                type="time" 
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 text-center text-slate-900 font-bold text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition h-10 appearance-none"
                                onKeyDown={(e) => e.key === 'Enter' && adicionarHorario()}
                            />
                            <button 
                                onClick={adicionarHorario}
                                className="h-10 px-4 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow active:scale-95"
                            >
                                <Plus size={14} className="text-amber-500" strokeWidth={3} />
                                Adicionar
                            </button>
                        </div>

                        {/* Lista de Horários (Grid Denso) */}
                        <div className="min-h-[60px]">
                            {agenda[selectedDay]?.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-6 border border-dashed border-slate-100 rounded-lg bg-slate-50/50">
                                    <Clock size={16} className="text-slate-300 mb-2" />
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Sem horários</p>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    {agenda[selectedDay]?.map((h) => (
                                        <div key={h} className="group relative bg-white flex items-center pl-3 pr-1 py-1.5 rounded-lg border border-slate-200 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm hover:shadow-none">
                                            <span className="text-slate-700 font-bold text-xs tracking-tight group-hover:text-red-700 mr-2">{h}</span>
                                            <button 
                                                onClick={() => removerHorario(h)}
                                                className="w-5 h-5 flex items-center justify-center rounded-md text-slate-300 hover:bg-red-100 hover:text-red-500 transition-colors"
                                            >
                                                <X size={12} strokeWidth={3} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Aviso */}
                    <div className="flex gap-2 items-start px-3 py-2 bg-amber-50/50 rounded-lg border border-amber-100/50">
                        <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-[10px] text-amber-800/70 font-medium leading-relaxed">
                            As alterações são salvas apenas ao confirmar abaixo.
                        </p>
                    </div>
                </div>
            )}
        </div>

        {/* FOOTER COMPACTO */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
            <button 
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-[10px] font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors uppercase tracking-wider"
                disabled={saving}
            >
                Cancelar
            </button>
            <button 
                onClick={handleSave}
                disabled={saving || loading}
                className="h-9 px-5 bg-slate-900 text-white rounded-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
                {saving ? (
                    <>
                        <div className="w-3 h-3 border-2 border-white/30 border-t-amber-500 rounded-full animate-spin"></div>
                        Salvando...
                    </>
                ) : (
                    <>
                        <Check size={14} className="text-amber-500 group-hover:text-amber-400 transition-colors" strokeWidth={3} />
                        Confirmar
                    </>
                )}
            </button>
        </div>

      </div>
    </div>
  );
}
