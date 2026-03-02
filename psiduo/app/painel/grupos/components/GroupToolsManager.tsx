"use client";

import { useState, useEffect } from "react";
import { 
  X, ThermometerSun, Users, Target, 
  Plus, ChevronRight, Calendar, Clock, BarChart2, Edit2, Trash2
} from "lucide-react";
import CheckInCreatorModal from "./CheckInCreatorModal";
import CheckInResults from "./CheckInResults";
import ComunidadeFeed from "./ComunidadeFeed";
import MissaoCreatorModal from "./MissaoCreatorModal";
import MissaoProgressDashboard from "./MissaoProgressDashboard";

interface GroupToolsManagerProps {
  grupo: any;
  onClose: () => void;
}

type TabType = 'CHECKIN' | 'COMUNIDADE' | 'MISSOES';

export default function GroupToolsManager({ grupo, onClose }: GroupToolsManagerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('CHECKIN');
  
  // Sub-modais states
  const [showCheckInCreator, setShowCheckInCreator] = useState(false);
  const [selectedCheckInId, setSelectedCheckInId] = useState<string | null>(null);
  
  const [showMissaoCreator, setShowMissaoCreator] = useState(false);
  const [selectedMissao, setSelectedMissao] = useState<{id: string, titulo: string} | null>(null);
  const [missaoToEdit, setMissaoToEdit] = useState<any>(null);
  
  const [checkInToEdit, setCheckInToEdit] = useState<any>(null);

  // Data lists
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [missoes, setMissoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'CHECKIN') fetchCheckIns();
    if (activeTab === 'MISSOES') fetchMissoes();
  }, [activeTab, grupo.id]);

  const fetchCheckIns = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/grupo/${grupo.id}/checkin`);
      const data = await res.json();
      setCheckIns(data.checkIns || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMissoes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/grupo/${grupo.id}/missoes`);
      const data = await res.json();
      setMissoes(data.missoes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCheckIn = async (id: string) => {
    if(!confirm("Tem certeza que deseja excluir este check-in?")) return;
    try {
        const res = await fetch(`/api/grupo/${grupo.id}/checkin/${id}`, { method: 'DELETE' });
        if(res.ok) fetchCheckIns();
    } catch(e) { console.error(e); }
  };

  const handleEditCheckIn = (checkin: any) => {
    setCheckInToEdit(checkin);
    setShowCheckInCreator(true);
  };

  const handleDeleteMissao = async (id: string) => {
    if(!confirm("Tem certeza que deseja excluir esta missão?")) return;
    try {
        const res = await fetch(`/api/grupo/${grupo.id}/missoes/${id}`, { method: 'DELETE' });
        if(res.ok) fetchMissoes();
    } catch(e) { console.error(e); }
  };

  const handleEditMissao = (missao: any) => {
    setMissaoToEdit(missao);
    setShowMissaoCreator(true);
  };

  const totalMembrosReais = grupo.participantes?.length || 0;
  const uniqueRespondentsCheckIn = checkIns ? new Set(checkIns.flatMap((c: any) => c.respostas?.map((r: any) => r.pacienteId || r.paciente?.id) || [])).size : 0;
  const baseMembros = Math.max(totalMembrosReais, uniqueRespondentsCheckIn, 1);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-0 md:p-4 backdrop-blur-sm">
      <div className="bg-white md:rounded-[2rem] shadow-2xl w-full max-w-5xl h-full md:h-[90vh] flex flex-col md:flex-row overflow-hidden relative">
        
        {/* DESKTOP SIDEBAR */}
        <div className="hidden md:flex w-64 bg-slate-50 border-r border-slate-100 flex-col shrink-0 z-20">
          <div className="px-8 pt-8 pb-2">
             <span className="text-2xl font-bold tracking-tight text-slate-900">
                PsiDuo<span className="text-amber-500">.</span>
             </span>
          </div>
          <div className="px-8 pb-8 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-200 text-slate-600 font-bold text-sm">
              {grupo.titulo.charAt(0)}
            </div>
            <div>
              <h2 className="text-xs font-black text-slate-700 uppercase tracking-wide truncate max-w-[140px]">
                {grupo.titulo}
              </h2>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            <button 
              onClick={() => setActiveTab('CHECKIN')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'CHECKIN' ? 'bg-slate-100 text-deep' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <ThermometerSun size={20} />
              <span className="text-sm font-bold">Termômetro</span>
            </button>
            <button 
              onClick={() => setActiveTab('COMUNIDADE')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'COMUNIDADE' ? 'bg-slate-100 text-deep' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <Users size={20} />
              <span className="text-sm font-bold">Comunidade</span>
            </button>
            <button 
              onClick={() => setActiveTab('MISSOES')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'MISSOES' ? 'bg-slate-100 text-deep' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <Target size={20} />
              <span className="text-sm font-bold">Missões</span>
            </button>
          </nav>

          <div className="p-4">
            <button 
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            >
              <X size={20} />
              <span className="text-xs font-black uppercase tracking-widest">Fechar</span>
            </button>
          </div>
        </div>

        {/* MOBILE HEADER */}
        <div className="md:hidden w-full bg-white border-b border-slate-100 p-4 flex items-center justify-between shrink-0 z-30 relative">
             <div className="flex items-center gap-3">
                <span className="text-xl font-bold tracking-tight text-slate-900 mr-2">
                    PsiDuo<span className="text-amber-500">.</span>
                </span>
                <div className="h-4 w-px bg-slate-200"></div>
                <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                    {grupo.titulo.charAt(0)}
                </div>
                <h2 className="font-bold text-slate-800 text-sm truncate max-w-[150px]">{grupo.titulo}</h2>
             </div>
             <button onClick={onClose} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:bg-slate-100">
                <X size={20} />
             </button>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 bg-white overflow-hidden flex flex-col relative w-full pb-24 md:pb-0">
          
          {/* TAB CONTENT: CHECKINS */}
          {activeTab === 'CHECKIN' && (
            <div className="flex-1 flex flex-col h-full">
              <div className="p-5 md:p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50/50 gap-4">
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Termômetro Coletivo</h1>
                  <p className="text-slate-500 text-xs md:text-sm font-medium">Monitore o clima emocional do grupo antes das sessões.</p>
                </div>
                <button 
                  onClick={() => setShowCheckInCreator(true)}
                  className="w-full md:w-auto flex items-center justify-center gap-2 bg-deep text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-deep/20"
                >
                  <Plus size={18} />
                  Novo Check-in
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-8">
                 {/* CHECK-IN ENGAGEMENT BANNER */}
                 {checkIns.length > 0 && (
                    <div className="bg-gradient-to-r from-deep to-slate-800 rounded-[2rem] p-6 md:p-8 text-white shadow-lg shadow-deep/20 mb-8 overflow-hidden relative">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 w-full">
                            <div className="flex items-center gap-6">
                                <div className="relative w-20 h-20 flex items-center justify-center">
                                    <svg className="transform -rotate-90 w-20 h-20">
                                        <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/20" />
                                        <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white" 
                                            strokeDasharray={36 * 2 * Math.PI} 
                                            // Limita a 100% (Math.min)
                                            strokeDashoffset={36 * 2 * Math.PI - (Math.min(100, ( (checkIns.reduce((acc, c) => acc + c.respostas.length, 0)) / (checkIns.length * baseMembros || 1) ) * 100) / 100 * (36 * 2 * Math.PI))} 
                                            strokeLinecap="round" 
                                        />
                                    </svg>
                                    <span className="absolute text-lg font-black">
                                        {Math.min(100, Math.round(((checkIns.reduce((acc, c) => acc + c.respostas.length, 0)) / (checkIns.length * baseMembros || 1)) * 100))}%
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Adesão do Grupo</p>
                                    <h2 className="text-2xl font-black">
                                        {checkIns.reduce((acc, c) => acc + c.respostas.length, 0)}
                                        <span className="text-base opacity-80 font-medium ml-1">respostas</span>
                                    </h2>
                                </div>
                            </div>
                            
                             <div className="mt-6 md:mt-0 w-full md:w-auto flex justify-between md:justify-start gap-2 md:gap-4 bg-white/10 p-3 md:p-4 rounded-xl backdrop-blur-sm">
                                <div className="text-center px-2 md:px-4 border-r border-white/20 flex-1 md:flex-none">
                                    <p className="text-xl md:text-2xl font-black">{checkIns.length}</p>
                                    <p className="text-[10px] uppercase font-bold text-slate-300">Check-ins</p>
                                </div>
                                <div className="text-center px-2 md:px-4 border-r border-white/20 flex-1 md:flex-none">
                                    <p className="text-xl md:text-2xl font-black">{baseMembros}</p>
                                    <p className="text-[10px] uppercase font-bold text-slate-300">Membros</p>
                                </div>
                                <div className="text-center px-2 md:px-4 flex-1 md:flex-none">
                                    <p className="text-xl md:text-2xl font-black">
                                      {checkIns.length > 0 ? (checkIns.reduce((acc, c) => acc + c.respostas.length, 0) / checkIns.length).toFixed(1) : 0}
                                    </p>
                                    <p className="text-[10px] uppercase font-bold text-slate-300">Média</p>
                                </div>
                            </div>
                        </div>
                    </div>
                 )}
                {loading ? (
                  <div className="text-center py-10 text-slate-400">Carregando...</div>
                ) : checkIns.length === 0 ? (
                  <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                    <ThermometerSun size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-bold">Nenhum check-in criado ainda.</p>
                    <p className="text-slate-400 text-sm mt-1">Crie o primeiro para começar a monitorar o grupo.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {checkIns.map(checkin => (
                      <div
                        key={checkin.id}
                        onClick={() => setSelectedCheckInId(checkin.id)}
                        className="w-full text-left bg-white border border-slate-100 p-5 rounded-2xl hover:shadow-lg hover:border-deep/20 transition-all group relative cursor-pointer"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-slate-800 text-lg group-hover:text-deep transition-colors">
                              {checkin.titulo}
                            </h3>
                             <div className="mt-2 text-xs font-bold text-slate-400 uppercase tracking-widest space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center gap-1" title="Criado em">
                                      <Calendar size={14} />
                                      {new Date(checkin.dataEnvio).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                    <span className="text-slate-300">|</span>
                                    <span className="flex items-center gap-1 text-slate-500" title="Expira em">
                                      <Clock size={14} />
                                      Até: {new Date(checkin.dataExpira).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                                <div className="flex">
                                  {(() => {
                                      const isExpired = new Date(checkin.dataExpira) < new Date();
                                      const label = !checkin.ativo ? 'Arquivado' : isExpired ? 'Finalizado' : 'Ativo';
                                      const style = !checkin.ativo 
                                          ? 'bg-slate-100 text-slate-500' 
                                          : isExpired 
                                              ? 'bg-orange-100 text-orange-700' 
                                              : 'bg-green-100 text-green-700';
                                      return (
                                        <span className={`px-2 py-0.5 rounded ${style}`}>
                                          {label}
                                        </span>
                                      );
                                  })()}
                                </div>
                             </div>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 group-hover:text-deep transition-colors">
                            <BarChart2 size={20} />
                          </div>
                        </div>

                         {/* ACTION BUTTONS */}
                         <div className="absolute top-4 right-4 flex gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); handleEditCheckIn(checkin); }}
                                className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-deep transition"
                                title="Editar"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteCheckIn(checkin.id); }}
                                className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                                title="Excluir"
                            >
                                <Trash2 size={16} />
                            </button>
                         </div>
                        {/* Preview Stats */}
                        <div className="mt-4 pt-4 border-t border-slate-50">
                           <div className="flex justify-between items-center mb-2">
                              <div className="flex -space-x-2">
                                  {checkin.respostas.slice(0,5).map((r: any, i:number) => (
                                    <div key={i} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] text-deep font-bold" title={r.paciente?.nome}>
                                      {r.paciente?.nome?.charAt(0)}
                                    </div>
                                  ))}
                                  {checkin.respostas.length > 5 && (
                                     <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] text-slate-500 font-bold">
                                       +{checkin.respostas.length - 5}
                                     </div>
                                  )}
                              </div>
                              <span className="text-xs text-slate-400 font-bold">
                                {Math.min(100, Math.round((checkin.respostas.length / baseMembros) * 100))}% responderam
                              </span>
                           </div>
                           <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden w-full">
                             <div 
                               className="h-full bg-deep transition-all" 
                               style={{ width: `${Math.min(100, Math.round((checkin.respostas.length / baseMembros) * 100))}%` }} 
                             />
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB CONTENT: COMUNIDADE */}
          {activeTab === 'COMUNIDADE' && (
            <div className="flex-1 flex flex-col h-full bg-slate-50/50">
               <div className="p-8 border-b border-slate-50 bg-slate-50/80">
                 <h1 className="text-2xl font-black text-slate-800 tracking-tight">Comunidade do Grupo</h1>
                 <p className="text-slate-500 text-sm font-medium">Espaço de troca, apoio e interação entre os membros.</p>
               </div>
               
               <div className="flex-1 overflow-y-auto">
                 <ComunidadeFeed grupoId={grupo.id} isPsicologo={true} />
               </div>
            </div>
          )}

          {/* TAB CONTENT: MISSOES */}
          {activeTab === 'MISSOES' && (
             <div className="flex-1 flex flex-col h-full">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h1 className="text-2xl font-black text-slate-800 tracking-tight">Missões e Desafios</h1>
                  <p className="text-slate-500 text-sm font-medium">Engaje o grupo com desafios e tarefas terapêuticas.</p>
                </div>
                <button 
                  onClick={() => setShowMissaoCreator(true)}
                  className="flex items-center gap-2 bg-deep text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-deep/20"
                >
                  <Plus size={18} />
                  Novo Desafio
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                 {/* GROUP PERFORMANCE BANNER */}
                 {missoes.length > 0 && (
                    <div className="bg-gradient-to-r from-deep to-slate-800 rounded-[2rem] p-8 text-white shadow-lg shadow-deep/20 mb-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="relative w-20 h-20 flex items-center justify-center">
                                    <svg className="transform -rotate-90 w-20 h-20">
                                        <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/20" />
                                        <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white" 
                                            strokeDasharray={36 * 2 * Math.PI} 
                                            strokeDashoffset={36 * 2 * Math.PI - (( (missoes.reduce((acc, m) => acc + m.conclusoes.filter((c:any) => c.status === 'FEITO').length + (m.conclusoes.filter((c:any) => c.status === 'PARCIAL').length * 0.5), 0)) / (missoes.reduce((acc, m) => acc + m.conclusoes.length, 0) || 1) ) * 100) / 100 * (36 * 2 * Math.PI)} 
                                            strokeLinecap="round" 
                                        />
                                    </svg>
                                    <span className="absolute text-lg font-black">
                                        {Math.round(((missoes.reduce((acc, m) => acc + m.conclusoes.filter((c:any) => c.status === 'FEITO').length + (m.conclusoes.filter((c:any) => c.status === 'PARCIAL').length * 0.5), 0)) / (missoes.reduce((acc, m) => acc + m.conclusoes.length, 0) || 1)) * 100)}%
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Engajamento Total</p>
                                    <h2 className="text-2xl font-black">
                                        {Math.round(missoes.reduce((acc, m) => acc + m.conclusoes.filter((c:any) => c.status === 'FEITO').length + (m.conclusoes.filter((c:any) => c.status === 'PARCIAL').length * 0.5), 0))}
                                        <span className="text-base opacity-80 font-medium ml-1">/ {missoes.reduce((acc, m) => acc + m.conclusoes.length, 0)} pts</span>
                                    </h2>
                                </div>
                            </div>
                            
                            <div className="flex gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                                <div className="text-center px-4 border-r border-white/20">
                                    <p className="text-2xl font-black">{missoes.reduce((acc, m) => acc + m.conclusoes.filter((c:any) => c.status === 'FEITO').length, 0)}</p>
                                    <p className="text-[10px] uppercase font-bold text-slate-300">Feitas</p>
                                </div>
                                <div className="text-center px-4 border-r border-white/20">
                                    <p className="text-2xl font-black">{missoes.reduce((acc, m) => acc + m.conclusoes.filter((c:any) => c.status === 'PARCIAL').length, 0)}</p>
                                    <p className="text-[10px] uppercase font-bold text-slate-300">Parciais</p>
                                </div>
                                <div className="text-center px-4">
                                    <p className="text-2xl font-black">{missoes.reduce((acc, m) => acc + m.conclusoes.filter((c:any) => c.status === 'NAO_FEITO').length, 0)}</p>
                                    <p className="text-[10px] uppercase font-bold text-slate-300">A Fazer</p>
                                </div>
                            </div>
                        </div>
                    </div>
                 )}
                {loading ? (
                   <div className="text-center py-10 text-slate-400">Carregando...</div>
                ) : missoes.length === 0 ? (
                  <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                    <Target size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-bold">Nenhuma missão ativa.</p>
                    <p className="text-slate-400 text-sm mt-1">Crie desafios para manter o grupo engajado.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {missoes.map(missao => (
                      <div
                        key={missao.id}
                        onClick={() => setSelectedMissao({id: missao.id, titulo: missao.titulo})}
                        className="w-full text-left bg-white border border-slate-100 p-5 rounded-2xl hover:shadow-lg hover:border-deep/20 transition-all group relative cursor-pointer"
                      >
                         <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-slate-800 text-lg group-hover:text-deep transition-colors">
                              {missao.titulo}
                            </h3>
                            <div className="flex items-center gap-4 mt-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                Fim: {new Date(missao.dataFim).toLocaleDateString()}
                              </span>
                              <span className={`px-2 py-0.5 rounded ${missao.ativo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                {missao.ativo ? 'Ativa' : 'Encerrada'}
                              </span>
                            </div>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 group-hover:text-deep transition-colors">
                            <ChevronRight size={20} />
                          </div>
                        </div>

                         {/* ACTION BUTTONS */}
                         <div className="absolute top-4 right-4 flex gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); handleEditMissao(missao); }}
                                className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-deep transition"
                                title="Editar"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteMissao(missao.id); }}
                                className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                                title="Excluir"
                            >
                                <Trash2 size={16} />
                            </button>
                         </div>

                        {/* Progress Details */}
                         <div className="mt-4 pt-4 border-t border-slate-50 grid grid-cols-3 gap-2">
                           <div className="bg-green-50 rounded-lg p-2 text-center">
                             <p className="text-lg font-black text-green-600">{missao.conclusoes.filter((c:any) => c.status === 'FEITO').length}</p>
                             <p className="text-[10px] font-bold text-green-400 uppercase">Feitas</p>
                           </div>
                           <div className="bg-orange-50 rounded-lg p-2 text-center">
                             <p className="text-lg font-black text-orange-500">{missao.conclusoes.filter((c:any) => c.status === 'PARCIAL').length}</p>
                             <p className="text-[10px] font-bold text-orange-400 uppercase">Parciais</p>
                           </div>
                           <div className="bg-slate-50 rounded-lg p-2 text-center">
                              <p className="text-lg font-black text-slate-600">{missao.conclusoes.filter((c:any) => c.status === 'NAO_FEITO').length}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">A Fazer</p>
                           </div>
                         </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
      </div>
          )}

        </div>

        {/* MOBILE BOTTOM NAV */}
        <div className="md:hidden absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 flex justify-around items-center z-50 pb-6 pt-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <button onClick={() => setActiveTab('CHECKIN')} className={`flex flex-col items-center gap-1 w-20 ${activeTab==='CHECKIN' ? 'text-deep' : 'text-slate-400'}`}>
                <div className={`p-1.5 rounded-full ${activeTab==='CHECKIN' ? 'bg-slate-100' : ''}`}><ThermometerSun size={22}/></div>
                <span className="text-[10px] font-bold">Term.</span>
            </button>
            <button onClick={() => setActiveTab('COMUNIDADE')} className={`flex flex-col items-center gap-1 w-20 ${activeTab==='COMUNIDADE' ? 'text-deep' : 'text-slate-400'}`}>
                <div className={`p-1.5 rounded-full ${activeTab==='COMUNIDADE' ? 'bg-slate-100' : ''}`}><Users size={22}/></div>
                <span className="text-[10px] font-bold">Comun.</span>
            </button>
            <button onClick={() => setActiveTab('MISSOES')} className={`flex flex-col items-center gap-1 w-20 ${activeTab==='MISSOES' ? 'text-deep' : 'text-slate-400'}`}>
                <div className={`p-1.5 rounded-full ${activeTab==='MISSOES' ? 'bg-slate-100' : ''}`}><Target size={22}/></div>
                <span className="text-[10px] font-bold">Missões</span>
            </button>
            <button onClick={onClose} className="flex flex-col items-center gap-1 w-20 text-slate-400 hover:text-red-500">
                <div className="p-1.5 rounded-full hover:bg-red-50"><X size={22}/></div>
                <span className="text-[10px] font-bold">Voltar</span>
            </button>
        </div>
      </div>

      {/* OVERLAY MODALS */}
      {showCheckInCreator && (
        <CheckInCreatorModal 
          grupoId={grupo.id} 
          onClose={() => { setShowCheckInCreator(false); setCheckInToEdit(null); }}
          onSuccess={() => {
            fetchCheckIns();
            setShowCheckInCreator(false);
            setCheckInToEdit(null);
          }}
          editingCheckIn={checkInToEdit}
        />
      )}

      {selectedCheckInId && (
        <CheckInResults 
          grupoId={grupo.id}
          checkInId={selectedCheckInId}
          onClose={() => setSelectedCheckInId(null)}
        />
      )}

      {showMissaoCreator && (
         <MissaoCreatorModal 
           grupoId={grupo.id}
           onClose={() => setShowMissaoCreator(false)}
           onSuccess={() => {
             fetchMissoes();
             setShowMissaoCreator(false);
           }}
         />
      )}

      {selectedMissao && (
        <MissaoProgressDashboard 
          grupoId={grupo.id}
          missaoId={selectedMissao.id}
          missaoTitulo={selectedMissao.titulo}
          onClose={() => setSelectedMissao(null)}
        />
      )}

    </div>
  );
}
