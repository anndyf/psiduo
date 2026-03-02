import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Check, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  Layout,
  MoreVertical,
  Edit2,
  CheckCircle2,
  PlusCircle,
  BarChart3,
  CalendarDays,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  buscarMetasPaciente, 
  criarMeta, 
  atualizarMeta, 
  excluirMeta 
} from '@/app/metas/actions';

interface Meta {
  id: string;
  pacienteId: string;
  titulo: string;
  frequencia: 'DIARIO' | 'SEMANAL' | 'MENSAL' | 'UNICO';
  dataInicio: string | Date;
  dataFim?: string | Date;
  diasSemana: number[]; 
  diaMes?: number; 
  history?: { date: string, feito: boolean }[]; 
  registros?: { data: string | Date, feito: boolean }[];
}

// Helper para converter string 'YYYY-MM-DD' em data local sem deslocamento de fuso
const safeParseDate = (dateStr: string | Date) => {
    if (dateStr instanceof Date) return dateStr;
    if (typeof dateStr === 'string') {
        if (dateStr.includes('T')) {
            // Se for meia-noite UTC (como gerado pelos nossos server actions), 
            // forçamos para ser interpretado como o dia local pretendido
            if (dateStr.includes('T00:00:00')) {
                const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
                return new Date(year, month - 1, day);
            }
            return new Date(dateStr);
        }
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    }
    return new Date(dateStr);
};

export default function GoalManager({ pacienteId, readOnly = false, onManage }: { pacienteId: string; readOnly?: boolean; onManage?: () => void }) {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyDate, setHistoryDate] = useState(new Date());
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  
  // Ensure we start with the client's actual current date to avoid SSR mismatches
  useEffect(() => {
    setHistoryDate(new Date());
  }, []);
  
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [editingMeta, setEditingMeta] = useState<Meta | null>(null);
  const [newMeta, setNewMeta] = useState<Partial<Meta>>({
    titulo: '',
    frequencia: 'DIARIO',
    dataInicio: new Date().toISOString().split('T')[0],
    diasSemana: [1, 2, 3, 4, 5],
  });

  useEffect(() => {
    fetchMetas();
  }, [pacienteId]);

  const fetchMetas = async () => {
    setLoading(true);
    try {
      const res = await buscarMetasPaciente(pacienteId);
      if (res.success) {
        // Map registros to history objects
        const metasComHistory = res.metas.map((m: any) => ({
          ...m,
          history: m.registros?.map((r: any) => {
             const d = new Date(r.data);
             // Usar componentes UTC para registros de metas garantindo o dia exato salvo
             return {
                 date: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`,
                 feito: r.feito ?? true // Default true for legacy records
             };
          }) || []
        }));
        setMetas(metasComHistory);
      }
    } catch (error) {
      toast.error('Erro ao carregar metas');
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async () => {
    if (!newMeta.titulo) return toast.error('Dê um título para a meta');

    try {
      const res = editingMeta 
        ? await atualizarMeta(editingMeta.id, newMeta as any)
        : await criarMeta({ ...newMeta, pacienteId } as any);

      if (res.success) {
        toast.success(editingMeta ? 'Meta atualizada!' : 'Meta criada!');
        setIsAddingMode(false);
        setEditingMeta(null);
        setNewMeta({
          titulo: '',
          frequencia: 'DIARIO',
          dataInicio: new Date().toISOString().split('T')[0],
          diasSemana: [1, 2, 3, 4, 5],
        });
        fetchMetas();
      } else {
        toast.error(res.error || 'Erro ao salvar meta');
      }
    } catch (error) {
      toast.error('Ocorreu um erro ao salvar');
    }
  };

  const handleExcluirMeta = async (id: string) => {
    if (!confirm('Excluir esta meta permanentemente?')) return;
    try {
      const res = await excluirMeta(id);
      if (res.success) {
        toast.success('Meta removida');
        fetchMetas();
      } else {
        toast.error(res.error || 'Erro ao excluir');
      }
    } catch (error) {
      toast.error('Erro ao excluir');
    }
  };

  const handleStartEdit = (meta: Meta) => {
    setEditingMeta(meta);
    setNewMeta(meta);
    setIsAddingMode(true);
  };

  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  // Returns: 'DONE' | 'SKIPPED' | 'PENDING'
  const getStatus = (meta: Meta, day: number) => {
    if (!meta.history) return 'PENDING';
    const dateStr = `${historyDate.getFullYear()}-${String(historyDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const record = meta.history.find(h => h.date === dateStr);
    
    if (record) {
        return record.feito ? 'DONE' : 'SKIPPED';
    }
    return 'PENDING';
  };

  const calculateAderencia = () => {
    if (metas.length === 0) return 0;
    const days = getMonthDays(historyDate);
    let totalExpected = 0;
    let totalDone = 0;

    metas.forEach(meta => {
      days.forEach(day => {
        const d = new Date(historyDate.getFullYear(), historyDate.getMonth(), day);
        const start = safeParseDate(meta.dataInicio);
        const end = meta.dataFim ? safeParseDate(meta.dataFim) : null;
        
        if (d >= start && (!end || d <= end)) {
          let scheduled = false;
          if (meta.frequencia === 'DIARIO') scheduled = true;
          else if (meta.frequencia === 'SEMANAL') scheduled = meta.diasSemana.includes(d.getDay());
          else if (meta.frequencia === 'MENSAL') scheduled = meta.diaMes === d.getDate();
          else if (meta.frequencia === 'UNICO') scheduled = d.toDateString() === start.toDateString();

          if (scheduled) {
            totalExpected++;
            if (getStatus(meta, day) === 'DONE') totalDone++;
          }
        }
      });
    });

    return totalExpected === 0 ? 0 : Math.round((totalDone / totalExpected) * 100);
  };

  const monthDays = getMonthDays(historyDate);

  const [selectedGoalForModal, setSelectedGoalForModal] = useState<Meta | null>(null);

  // Helper for rendering cells
  const renderCell = (meta: Meta, day: number, isMobile = false) => {
      const status = getStatus(meta, day); // DONE, SKIPPED, PENDING
      const currentDate = new Date(historyDate.getFullYear(), historyDate.getMonth(), day);
      const start = safeParseDate(meta.dataInicio); start.setHours(0,0,0,0);
      const end = meta.dataFim ? safeParseDate(meta.dataFim) : null; if(end) end.setHours(23,59,59,999);
      const isValid = currentDate >= start && (!end || currentDate <= end);
      
      let isScheduled = false;
      if(isValid) {
          if(meta.frequencia === 'DIARIO') isScheduled = true;
          else if(meta.frequencia === 'SEMANAL') isScheduled = meta.diasSemana.includes(currentDate.getDay());
          else if(meta.frequencia === 'MENSAL') isScheduled = meta.diaMes === currentDate.getDate();
          else if(meta.frequencia === 'UNICO') isScheduled = currentDate.getTime() === start.getTime();
      }

      const today = new Date();
      const isToday = day === today.getDate() && 
                      historyDate.getMonth() === today.getMonth() && 
                      historyDate.getFullYear() === today.getFullYear();
      const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isPast = currentDate < todayZero;

      // Logic for Visuals
      // If DONE: Green
      // If SKIPPED: Red X
      // If PENDING: 
      //    If Scheduled & Past: Red Dot (Missed)
      //    If Scheduled & Future/Today: Gray Ring (Pending)
      //    If Not Scheduled: Empty

      if (!isValid) return isMobile ? <div key={day} className="aspect-square bg-slate-100/30 rounded-xl" /> : <div key={day} className="h-12 border-r border-slate-50/50"></div>;

      const baseClasses = isMobile 
        ? `aspect-square rounded-xl flex items-center justify-center text-[10px] font-bold relative transition-all ${isToday ? 'ring-2 ring-slate-900 ring-offset-2' : ''}`
        : "w-6 h-6 rounded flex items-center justify-center transition-all md:w-5 md:h-5";

      let content = null;
      let classes = "";

       if (status === 'DONE') {
          classes = "bg-green-500 text-white shadow-sm shadow-green-200";
          content = isMobile ? day : <Check size={isMobile ? 12 : 10} />;
      } else if (status === 'SKIPPED') {
          // Explicitly marked as Not Done -> Red with X
          classes = "bg-red-500 text-white shadow-sm shadow-red-200";
          content = isMobile ? day : <X size={isMobile ? 12 : 10} />;
      } else if (isScheduled) {
          if (isPast) {
              // Missed (Pending but Past) -> Red with Dot
              classes = "bg-red-50 text-red-400 border border-red-100";
              content = <div className="w-1.5 h-1.5 rounded-full bg-red-300"></div>;
          } else {
              // Future/Today Pending -> Gray Ring
              classes = isMobile 
                 ? "bg-white border-2 border-slate-100 text-slate-300 shadow-sm"
                 : "bg-white border-2 border-slate-100 text-slate-300";
              
              if(isMobile) {
                  content = day; 
              } else {
                   content = <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>;
              }
          }
      } else {
          // Valid date but not scheduled
          classes = isMobile ? "bg-slate-50 text-slate-200" : "bg-slate-50 text-slate-200";
          if(isMobile) content = day;
      }

      if(isMobile) {
          // Mobile Wrapper
           return (
              <div key={day} className={`${baseClasses} ${classes}`}>
                   {status === 'DONE' || status === 'SKIPPED' ? content : day}
                   {isScheduled && !['DONE', 'SKIPPED'].includes(status) && (
                        <div className={`absolute -bottom-1 w-1 h-1 rounded-full ${isPast ? 'bg-red-300' : 'bg-slate-200'}`}></div>
                   )}
              </div>
           )
      }

      // Desktop Wrapper
      return (
        <div 
            key={day} 
            onMouseEnter={() => setHoveredDay(day)}
            onMouseLeave={() => setHoveredDay(null)}
            className={`flex items-center justify-center h-12 border-r border-slate-100 last:border-r-0 transition-colors cursor-pointer ${hoveredDay === day ? 'bg-slate-100' : ''}`}
        >
             <div className={`${baseClasses} ${classes}`}>
                 {content}
             </div>
        </div>
      );
  };

  return (
    <section className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
      <div className="p-4 md:p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-deep">
            <CalendarDays size={20} />
          </div>
          <div>
            <h2 className="text-sm font-medium text-slate-800 uppercase tracking-widest">Plano de Ação (Metas)</h2>
            <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">Acompanhamento de hábitos e objetivos</p>
          </div>
        </div>
        
        {readOnly ? (
          // Modo leitura: botão para ir à aba de metas
          onManage && (
            <button
              onClick={onManage}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-medium uppercase tracking-wide bg-slate-50 text-deep hover:bg-slate-100 border border-slate-100 transition-colors whitespace-nowrap"
            >
              Gerenciar <ChevronRight size={13} />
            </button>
          )
        ) : (
          <button 
            onClick={() => {
              setIsAddingMode(!isAddingMode);
              if(isAddingMode) {
                  setEditingMeta(null);
                  setNewMeta({
                      titulo: '',
                      frequencia: 'DIARIO',
                      dataInicio: new Date().toISOString().split('T')[0],
                      diasSemana: [1, 2, 3, 4, 5],
                  });
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-medium uppercase tracking-wide transition-all whitespace-nowrap
              ${isAddingMode 
                ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' 
                : 'bg-deep text-white hover:bg-slate-800 shadow-lg shadow-deep/10'}`}
          >
            {isAddingMode ? <><X size={14} /> Cancelar</> : <><Plus size={14} /> <span className="hidden md:inline">Nova Meta</span><span className="md:hidden">Meta</span></>}
          </button>
        )}
      </div>

      <div className="p-4 md:p-8">
        {!readOnly && isAddingMode && (
          <div className="mb-8 p-6 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 animate-in fade-in slide-in-from-top-4 duration-300">
             <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                {editingMeta ? <Edit2 size={14}/> : <PlusCircle size={14}/>}
                {editingMeta ? 'Editar Meta' : 'Configurar Nova Meta'}
             </h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Título do Objetivo</label>
                        <input 
                            type="text"
                            placeholder="Ex: Beber 2L de água, Meditar, Exercício"
                            value={newMeta.titulo}
                            onChange={e => setNewMeta({...newMeta, titulo: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-100 text-sm focus:ring-2 focus:ring-deep/5 outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Data Início</label>
                            <input 
                                type="date"
                                value={newMeta.dataInicio ? new Date(newMeta.dataInicio).toISOString().split('T')[0] : ''}
                                onChange={e => setNewMeta({...newMeta, dataInicio: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-100 text-sm outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Data Fim (Opcional)</label>
                            <input 
                                type="date"
                                value={newMeta.dataFim ? new Date(newMeta.dataFim).toISOString().split('T')[0] : ''}
                                onChange={e => setNewMeta({...newMeta, dataFim: e.target.value || undefined})}
                                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-100 text-sm outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Frequência</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                           {['DIARIO', 'SEMANAL', 'MENSAL', 'UNICO'].map(f => (
                              <button
                                key={f}
                                onClick={() => setNewMeta({...newMeta, frequencia: f as any})}
                                className={`py-2 rounded-lg text-[9px] font-black uppercase transition-all
                                  ${newMeta.frequencia === f 
                                    ? 'bg-slate-800 text-white' 
                                    : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                              >
                                 {f}
                              </button>
                           ))}
                        </div>
                    </div>

                    {newMeta.frequencia === 'SEMANAL' && (
                       <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Dias da Semana</label>
                          <div className="flex gap-1.5 flex-wrap">
                             {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((d, i) => (
                                <button
                                  key={d}
                                  onClick={() => {
                                     const current = newMeta.diasSemana || [];
                                     const updated = current.includes(i) ? current.filter(x => x !== i) : [...current, i];
                                     setNewMeta({...newMeta, diasSemana: updated});
                                  }}
                                  className={`w-10 h-10 rounded-xl text-[10px] font-bold transition-all
                                    ${newMeta.diasSemana?.includes(i) 
                                      ? 'bg-deep text-white' 
                                      : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                                >
                                   {d}
                                </button>
                             ))}
                          </div>
                       </div>
                    )}

                    {newMeta.frequencia === 'MENSAL' && (
                       <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Dia do Mês</label>
                          <input 
                            type="number"
                            min="1" max="31"
                            value={newMeta.diaMes || 1}
                            onChange={e => setNewMeta({...newMeta, diaMes: parseInt(e.target.value)})}
                            className="w-24 px-4 py-3 rounded-xl bg-white border border-slate-100 text-sm outline-none"
                          />
                       </div>
                    )}
                </div>
             </div>

             <div className="mt-8 flex justify-end">
                <button 
                  onClick={handleSalvar}
                  className="px-8 py-3 bg-deep text-white rounded-2xl text-[11px] font-black uppercase shadow-lg shadow-deep/20 hover:translate-y-[-2px] transition-all"
                >
                   {editingMeta ? 'Atualizar Meta' : 'Criar Meta'}
                </button>
             </div>
          </div>
        )}

        {!loading ? (
           <>
              {/* Header de Aderência */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="md:col-span-2 p-6 bg-slate-50/50 rounded-3xl border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                              <BarChart3 className="text-deep" size={24} />
                          </div>
                          <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aderência Mensal</p>
                              <h3 className="text-3xl font-black text-slate-800">{calculateAderencia()}%</h3>
                          </div>
                      </div>
                  </div>

                  <div className="p-6 bg-white rounded-3xl border border-slate-100 flex items-center justify-between group">
                     <button onClick={() => setHistoryDate(new Date(historyDate.getFullYear(), historyDate.getMonth() - 1))} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-600">
                        <ChevronLeft size={20}/>
                     </button>
                     
                     <div className="text-center relative">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Mês de Referência</p>
                        <div className="relative inline-block px-2">
                            <h4 className="text-sm font-black text-slate-800 uppercase hover:text-deep transition-colors flex items-center justify-center gap-2 cursor-pointer">
                                {historyDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                                <Edit2 size={12} className="text-slate-300" />
                            </h4>
                            <input 
                                type="month" 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                value={historyDate.toISOString().slice(0, 7)}
                                onChange={(e) => {
                                    if(e.target.value) {
                                        const [y, m] = e.target.value.split('-');
                                        setHistoryDate(new Date(parseInt(y), parseInt(m)-1, 1));
                                    }
                                }}
                            />
                        </div>
                     </div>

                     <button onClick={() => setHistoryDate(new Date(historyDate.getFullYear(), historyDate.getMonth() + 1))} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-600">
                        <ChevronRight size={20}/>
                     </button>
                  </div>
              </div>

              {/* Grid de Metas */}
              
              {/* VERSÃO DESKTOP (STICKY LAYOUT) */}
              <div className="hidden md:block relative border border-slate-50 rounded-[2rem] overflow-hidden">
                 <div className="overflow-x-auto pb-4 custom-scrollbar">
                     <div className="min-w-fit">
                         {/* CABEÇALHO DOS DIAS */}
                         <div className="flex mb-2">
                             {/* Indicador Fixo */}
                             <div className="sticky left-0 z-30 bg-white w-[240px] min-w-[240px] flex-shrink-0 text-[10px] font-black text-slate-300 uppercase tracking-widest pb-3 px-6 flex items-end border-r border-slate-100 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                                 Meta
                             </div>
                             {/* Grade de Dias */}
                             <div className="grid flex-1 border-b border-slate-50" style={{ gridTemplateColumns: `repeat(${monthDays.length}, 45px)` }}>
                                 {monthDays.map(d => {
                                     const date = new Date(historyDate.getFullYear(), historyDate.getMonth(), d);
                                     const weekDay = date.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3).replace('.', '');
                                     
                                     return (
                                         <div 
                                            key={d} 
                                            onMouseEnter={() => setHoveredDay(d)}
                                            onMouseLeave={() => setHoveredDay(null)}
                                            className={`flex flex-col items-center justify-center py-2 border-r border-slate-100 last:border-r-0 transition-colors cursor-pointer ${hoveredDay === d ? 'bg-slate-100' : ''}`}
                                          >
                                             <span className="text-[8px] font-bold text-slate-300 uppercase mb-0.5">{weekDay}</span>
                                             <span className="text-[10px] font-black text-slate-400">{d}</span>
                                         </div>
                                     );
                                 })}
                             </div>
                         </div>
                         
                         <div className="space-y-3 pb-2">
                            {metas.map(meta => {
                                return (
                                   <div key={meta.id} className="flex group even:bg-slate-50/50 hover:bg-slate-100 transition-colors">
                                       {/* Label Fixo (Meta Info) */}
                                       <div className="sticky left-0 z-30 bg-white group-even:bg-slate-50/50 group-hover:bg-slate-100 w-[240px] min-w-[240px] flex-shrink-0 flex items-center justify-between gap-4 px-6 py-2 border-r border-slate-100 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)] transition-colors">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border transition-colors
                                                    ${meta.frequencia === 'DIARIO' ? 'bg-slate-50 border-slate-100 text-deep' : 
                                                    meta.frequencia === 'SEMANAL' ? 'bg-orange-50 border-orange-100 text-orange-500' :
                                                    'bg-purple-50 border-purple-100 text-purple-500'}`}
                                                >
                                                    <Clock size={14} />
                                                </div>
                                                <button 
                                                    onClick={() => setSelectedGoalForModal(meta)}
                                                    className="text-left truncate group/title"
                                                    title={`Clique para ver detalhes: ${meta.titulo}`}
                                                >
                                                   <span className="text-xs font-bold text-slate-700 block truncate leading-tight group-hover/title:text-deep transition-colors">{meta.titulo}</span>
                                                   <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{meta.frequencia}</span>
                                                </button>
                                            </div>
                                             {!readOnly && (
                                               <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                  <button onClick={() => handleStartEdit(meta)} className="p-1.5 hover:bg-slate-100 rounded text-slate-400"><Edit2 size={12}/></button>
                                                  <button onClick={() => handleExcluirMeta(meta.id)} className="p-1.5 hover:bg-red-50 rounded text-red-400"><Trash2 size={12}/></button>
                                               </div>
                                             )}
                                       </div>

                                       {/* Dados / Checkboxes */}
                                       <div className="grid flex-1" style={{ gridTemplateColumns: `repeat(${monthDays.length}, 45px)` }}>
                                           {monthDays.map(d => renderCell(meta, d, false))}
                                       </div>
                                   </div>
                                )
                            })}
                         </div>
                     </div>
                 </div>
              </div>

              {/* VERSÃO MOBILE (CARDS) - Modo Calendário */}
              <div className="md:hidden flex flex-col gap-6">
                  {metas.map(meta => (
                     <div key={meta.id} className="bg-white rounded-[2rem] p-6 border border-slate-100 flex flex-col shadow-sm">
                         {/* Header Compacto Mobile */}
                         <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3 min-w-0">
                               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0
                                     ${meta.frequencia === 'DIARIO' ? 'bg-slate-50 text-deep' : 
                                       meta.frequencia === 'SEMANAL' ? 'bg-orange-50 text-orange-500' :
                                       'bg-purple-50 text-purple-500'}`}
                               >
                                  <Clock size={20} />
                               </div>
                               <div>
                                  <h4 className="font-black text-slate-800 text-sm truncate uppercase tracking-tight leading-none mb-1">{meta.titulo}</h4>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{meta.frequencia}</span>
                               </div>
                            </div>
                             {!readOnly && (
                               <div className="flex gap-1">
                                  <button onClick={() => handleStartEdit(meta)} className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
                                     <Edit2 size={16} />
                                  </button>
                                  <button onClick={() => handleExcluirMeta(meta.id)} className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 transition-colors">
                                     <Trash2 size={16} />
                                  </button>
                               </div>
                             )}
                         </div>
                         
                         {/* Calendário Simplificado Mobile */}
                         <div className="bg-slate-50/30 p-4 rounded-3xl border border-slate-50">
                             <div className="grid grid-cols-7 gap-1.5 mb-2">
                                  {/* Dias da semana */}
                                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => <div key={i} className="text-center text-[10px] font-black text-slate-300 py-1">{d}</div>)}
                             </div>
                             
                             <div className="grid grid-cols-7 gap-1.5">
                                  {/* Espaços vazios do início do mês */}
                                  {Array.from({length: new Date(historyDate.getFullYear(), historyDate.getMonth(), 1).getDay()}).map((_, i) => <div key={`empty-${i}`} />)}

                                  {/* Dias */}
                                  {monthDays.map(d => renderCell(meta, d, true))}
                             </div>
                         </div>
                     </div>
                  ))}
              </div>

         <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-50 pt-4">
            <p className="text-[10px] text-slate-400 font-medium italic">
                * Acompanhe o progresso das suas metas. A consistência é a chave.
            </p>
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Cumprida</span>
                </div>
                 <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-white border-2 border-slate-200"></div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Agendada</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
                        <div className="w-1 h-1 rounded-full bg-red-300"></div>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Não Registrado</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-400 text-[6px] text-white flex items-center justify-center"><X size={6}/></div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Não Realizada</span>
                </div>
            </div>
         </div>
           </>
        ) : (
           <div className="py-12 text-center text-slate-300 text-xs italic">Carregando histórico...</div>
        )}
      </div>

      {/* MODAL DE DETALHES DA META */}
      {selectedGoalForModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-start">
                    <div className="flex gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg
                             ${selectedGoalForModal.frequencia === 'DIARIO' ? 'bg-deep text-white shadow-deep/20' : 
                               selectedGoalForModal.frequencia === 'SEMANAL' ? 'bg-orange-500 text-white shadow-orange-200' :
                               'bg-purple-600 text-white shadow-purple-200'}`}
                        >
                            <Target size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Detalhes do Objetivo</p>
                            <h3 className="text-xl font-black text-slate-800 leading-tight">{selectedGoalForModal.titulo}</h3>
                        </div>
                    </div>
                    <button onClick={() => setSelectedGoalForModal(null)} className="p-2 hover:bg-white rounded-full transition-all text-slate-400">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Periodicidade</p>
                            <p className="text-sm font-bold text-slate-700">{selectedGoalForModal.frequencia}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Início em</p>
                            <p className="text-sm font-bold text-slate-700">{new Date(selectedGoalForModal.dataInicio).toLocaleDateString('pt-BR')}</p>
                        </div>
                    </div>

                    {selectedGoalForModal.frequencia === 'SEMANAL' && selectedGoalForModal.diasSemana && (
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Dias Programados</p>
                            <div className="flex gap-1.5">
                                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                                    <div 
                                        key={i} 
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black
                                            ${selectedGoalForModal.diasSemana.includes(i) ? 'bg-slate-800 text-white' : 'bg-white text-slate-300 border border-slate-100'}`}
                                    >
                                        {d}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="pt-4 flex justify-end">
                        <button 
                            onClick={() => setSelectedGoalForModal(null)}
                            className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase shadow-lg shadow-slate-900/10 active:scale-95 transition-all"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </section>
  );
}
