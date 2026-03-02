"use client";

import { useEffect, useState } from "react";
import { X, Users, BatteryLow, BatteryMedium, Zap, MessageSquare } from "lucide-react";

interface CheckInResultsProps {
  grupoId: string;
  checkInId: string;
  onClose: () => void;
}

interface EmocaoData {
  emocao: string;
  _count: number;
}

interface ComentarioData {
  id: string;
  comentario: string;
  emocao: string;
  paciente: { nome: string };
}

interface ResultsData {
  respostas: EmocaoData[];
  totalParticipantes: number;
  totalRespostas: number;
  taxaResposta: number;
  comentarios: ComentarioData[];
  respostasDetalhadas?: ComentarioData[];
}

// Configuração atualizada para Bateria Social
const EMOCOES_CONFIG: any = {
  BATERIA_10: {
    label: "10% - Só observo",
    icon: BatteryLow,
    color: "bg-red-500",
    lightColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-700",
    description: "Participantes preferem ouvir hoje."
  },
  BATERIA_50: {
    label: "50% - Participo se chamarem",
    icon: BatteryMedium,
    color: "bg-deep",
    lightColor: "bg-slate-50",
    borderColor: "border-slate-200",
    textColor: "text-deep",
    description: "Estão abertos, mas precisam de um incentivo."
  },
  BATERIA_100: {
    label: "100% - Quero falar!",
    icon: Zap,
    color: "bg-green-500",
    lightColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-700",
    description: "Energia alta! Podem puxar a conversa."
  },
};

// Mapeamento de possíveis valores salvos no banco para cada categoria
const MATCHERS: Record<string, string[]> = {
    'BATERIA_10': ['BATERIA_10', '10', 'BAIXA', 'LOW', 'OBSERVAR', 'SO_OBSERVO'],
    'BATERIA_50': ['BATERIA_50', '50', 'MEDIA', 'MEDIUM', 'PARTICIPAR', 'PARTICIPO_SE_CHAMAREM'],
    'BATERIA_100': ['BATERIA_100', '100', 'ALTA', 'HIGH', 'FALAR', 'QUERO_FALAR']
};

// Helper para normalizar contagem com dados legados
const normalizeCount = (respostas: EmocaoData[], key: string) => {
  let total = 0;
  const validKeys = MATCHERS[key] || [key];
  
  respostas.forEach(r => {
      if (!r.emocao) return;
      const emocaoNormalized = r.emocao.toUpperCase().trim();
      // Verifica match exato ou parcial
      if (validKeys.some(k => emocaoNormalized === k || emocaoNormalized.includes(k))) {
          total += r._count;
      }
  });
  return total;
};

const getMatchingResponses = (respostas: ComentarioData[], key: string) => {
  if (!respostas) return [];
  const validKeys = MATCHERS[key] || [key];
  return respostas.filter(r => {
      if(!r.emocao) return false;
      const emocaoNormalized = r.emocao.toUpperCase().trim();
      return validKeys.some(k => emocaoNormalized === k || emocaoNormalized.includes(k));
  });
};

export default function CheckInResults({
  grupoId,
  checkInId,
  onClose,
}: CheckInResultsProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ResultsData | null>(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await fetch(
        `/api/grupo/${grupoId}/checkin/${checkInId}`
      );
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Erro ao buscar resultados:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[250]">
        <div className="bg-white rounded-3xl p-8">
          <p className="text-slate-600 font-bold">Carregando bateria do grupo...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[250] p-4 transition-all animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
              Energia do Grupo
            </h2>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Bateria social dos participantes para hoje
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 transition flex items-center justify-center"
          >
            <X size={24} className="text-slate-400 hover:text-slate-900" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-8 overflow-y-auto flex-1 bg-slate-50/50">
          
          {/* Taxa de Resposta */}
          <div className="mb-10 flex items-center gap-6">
             <div className="flex-1">
                 <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Participação</span>
                    <span className="text-lg font-black text-slate-800">{data.taxaResposta}%</span>
                 </div>
                 <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-slate-800 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${data.taxaResposta}%` }}
                    />
                 </div>
             </div>
             <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm">
                <Users size={18} className="text-slate-400" />
                <span className="text-sm font-bold text-slate-600">
                    {data.totalRespostas}/{data.totalParticipantes}
                </span>
             </div>
          </div>

          {/* Cards de Bateria */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
             {Object.entries(EMOCOES_CONFIG).map(([key, config]: [string, any]) => {
               const count = normalizeCount(data.respostas, key);
              const percentage =
                data.totalRespostas > 0
                  ? Math.round((count / data.totalRespostas) * 100)
                  : 0;
              const Icon = config.icon;

              return (
                <div
                  key={key}
                  className={`p-6 rounded-[2rem] border-2 transition-all ${
                    count > 0
                      ? `bg-white ${config.borderColor} shadow-lg shadow-slate-100`
                      : "bg-slate-50 border-transparent opacity-60"
                  }`}
                >
                  <div className="flex flex-col h-full justify-between">
                    <div>
                        <div className={`w-16 h-16 rounded-2xl ${config.lightColor} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                            <Icon size={32} className={config.textColor} />
                        </div>
                        <h3 className="text-3xl font-black text-slate-800 mb-1">{count}</h3>
                        <p className={`text-sm font-bold ${config.textColor} uppercase tracking-wide`}>
                            {config.label}
                        </p>
                        
                        <div className="mt-4 flex flex-wrap gap-1.5">
                            {getMatchingResponses(data.respostasDetalhadas || [], key).map(r => (
                                <span key={r.id} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white/60 text-slate-600 border border-slate-200/50 shadow-sm" title={r.paciente.nome}>
                                   {r.paciente.nome.split(' ')[0]}
                                </span>
                            ))}
                        </div>
                    </div>
                    
                    <div className="mt-6">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
                            <span>Do Grupo</span>
                            <span>{percentage}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                            className={`h-full ${config.color} transition-all duration-1000`}
                            style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Smart Insights (A Mágica) */}
          {data.totalRespostas > 0 && (
            <div className="p-8 bg-black rounded-[2rem] text-white shadow-xl shadow-slate-200">
              <h3 className="text-sm font-black uppercase tracking-widest opacity-80 mb-4 flex items-center gap-2">
                 <Zap size={16} />
                 Estratégia para Sessão
              </h3>
              
              <div className="space-y-4 text-lg font-medium leading-relaxed">
                {(() => {
                  const bateria10 = normalizeCount(data.respostas, "BATERIA_10");
                  const bateria50 = normalizeCount(data.respostas, "BATERIA_50");
                  const bateria100 = normalizeCount(data.respostas, "BATERIA_100");

                     // Lógica específica pedida pelo usuário e aprimorada
                   return (
                     <>
                        <div className="mb-4 text-white/90">
                            Hoje temos:
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li><strong>{bateria10}</strong> só observando (Bateria Baixa)</li>
                                <li><strong>{bateria50}</strong> participam se chamados (Bateria Média)</li>
                                <li><strong>{bateria100}</strong> querem falar (Bateria Alta)</li>
                            </ul>
                        </div>
                        
                        {/* Dica Principal baseada na Energia Dominante */}
                        {bateria100 >= bateria10 && bateria100 >= bateria50 ? (
                             <p className="bg-green-500/20 p-4 rounded-xl mt-4 border border-green-400/30">
                              ⚡ <strong>Energia Alta:</strong> O grupo está disposto! Aproveite para trabalhar temas complexos ou dinâmicas que exigem proatividade. Deixe o fluxo correr.
                            </p>
                        ) : bateria10 >= bateria100 && bateria10 >= bateria50 ? (
                            <p className="bg-red-500/20 p-4 rounded-xl mt-4 border border-red-400/30">
                              🛡️ <strong>Energia Baixa:</strong> Respeite o silêncio. Comece com algo leve (música, respiração) e não force a participação. O acolhimento é a prioridade hoje.
                            </p>
                        ) : (
                            <p className="bg-slate-800/40 p-4 rounded-xl mt-4 border border-slate-700/30">
                              ⚖️ <strong>Energia Equilibrada:</strong> O grupo está morno. O papel do mediador será essencial para aquecer e conectar os participantes.
                            </p>
                        )}

                        {/* Dica Específica para "Participo se chamarem" */}
                        {bateria50 > 0 && (
                            <p className="bg-slate-900/60 p-4 rounded-xl mt-2 border border-slate-700/30">
                              👉 <strong>Estratégia para os "Se Chamarem":</strong> Você tem {bateria50} pessoa(s) abertas, mas passivas. <strong>Chame-as pelo nome</strong> ou faça rodadas estruturadas onde todos têm a vez. Elas precisam desse "empurrãozinho" para se engajar.
                            </p>
                        )}
                     </>
                   );
                })()}
              </div>
            </div>
          )}
          
          {/* COMENTÁRIOS PRIVADOS */}
          {data.comentarios && data.comentarios.length > 0 && (
             <div className="mt-10 pt-10 border-t border-slate-200/50">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <MessageSquare size={16} />
                    Notas Privadas ({data.comentarios.length})
                </h3>
                <div className="grid gap-4">
                   {data.comentarios.map(c => (
                      <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-xs font-black text-slate-600">
                                    {c.paciente.nome.charAt(0)}
                                 </div>
                                 <div>
                                     <p className="text-sm font-bold text-slate-800 leading-none">{c.paciente.nome}</p>
                                     <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                                        Energia: {c.emocao.includes('100') || c.emocao === 'ALTA' ? 'Total' : c.emocao.includes('50') || c.emocao === 'MEDIA' ? 'Média' : 'Baixa'}
                                     </p>
                                 </div>
                              </div>
                              
                              <div className={`w-3 h-3 rounded-full 
                                  ${c.emocao.includes('100') || c.emocao === 'ALTA' ? 'bg-green-500' : 
                                    c.emocao.includes('50') || c.emocao === 'MEDIA' ? 'bg-deep' : 'bg-red-500'}
                              `} title="Nível de Bateria" />
                          </div>
                          
                          <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-600 font-medium leading-relaxed relative">
                             "{c.comentario}"
                          </div>
                      </div>
                   ))}
                </div>
             </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-8 border-t border-slate-100 bg-white">
          <button
            onClick={onClose}
            className="w-full py-4 bg-slate-900 text-white text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-black transition shadow-lg shadow-slate-200"
          >
            Fechar Análise
          </button>
        </div>
      </div>
    </div>
  );
}
