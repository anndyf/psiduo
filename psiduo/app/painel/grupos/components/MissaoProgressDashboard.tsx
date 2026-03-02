"use client";

import { useEffect, useState } from "react";
import { X, Target, CheckCircle, Circle, TrendingUp, PieChart } from "lucide-react";

interface MissaoProgressDashboardProps {
  grupoId: string;
  missaoId: string;
  missaoTitulo: string;
  onClose: () => void;
}

interface Conclusao {
  id: string;
  status: 'FEITO' | 'PARCIAL' | 'NAO_FEITO';
  dataConclusao: string | null;
  paciente: {
    id: string;
    nome: string;
  };
}

interface ProgressData {
  conclusoes: Conclusao[];
  totalParticipantes: number;
  totalConcluidos: number;
  taxaConclusao: number;
}

export default function MissaoProgressDashboard({
  grupoId,
  missaoId,
  missaoTitulo,
  onClose,
}: MissaoProgressDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProgressData | null>(null);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await fetch(
        `/api/grupo/${grupoId}/missoes/${missaoId}/conclusao`
      );
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Erro ao buscar progresso:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[250]">
        <div className="bg-white rounded-3xl p-8">
          <p className="text-slate-600">Carregando progresso...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const feitos = data.conclusoes.filter((c) => c.status === 'FEITO');
  const parciais = data.conclusoes.filter((c) => c.status === 'PARCIAL');
  const pendentes = data.conclusoes.filter((c) => c.status === 'NAO_FEITO');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[250] p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Target size={24} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">
                {missaoTitulo}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {data.totalConcluidos} de {data.totalParticipantes} completaram
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-white/50 transition flex items-center justify-center"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Taxa de Conclusão */}
          <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp size={20} className="text-purple-600" />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                Taxa de Conclusão
              </h3>
            </div>
            <div className="flex items-end gap-4">
              <div className="text-4xl font-black text-purple-600">
                {data.taxaConclusao}%
              </div>
              <div className="text-sm text-slate-600 mb-2">
                {data.totalConcluidos} de {data.totalParticipantes}{" "}
                participantes
              </div>
            </div>
            {/* Barra de progresso */}
            <div className="mt-4 h-3 bg-purple-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 transition-all duration-500"
                style={{ width: `${data.taxaConclusao}%` }}
              />
            </div>
          </div>

          {/* Lista de Participantes */}
          <div className="grid grid-cols-1 gap-6">
            
            {/* FEITOS */}
            {feitos.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle size={16} className="text-green-600" />
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                    Concluídos ({feitos.length})
                  </h3>
                </div>

                <div className="space-y-2">
                  {feitos.map((conclusao) => (
                    <div
                      key={conclusao.id}
                      className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
                    >
                      <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">
                          {conclusao.paciente.nome}
                        </p>
                        {conclusao.dataConclusao && (
                          <p className="text-xs text-green-700">
                            {new Date(
                              conclusao.dataConclusao
                            ).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PARCIAIS */}
            {parciais.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <PieChart size={16} className="text-orange-500" />
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                    Parcialmente Feito ({parciais.length})
                  </h3>
                </div>

                <div className="space-y-2">
                  {parciais.map((conclusao) => (
                    <div
                      key={conclusao.id}
                      className="p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-3"
                    >
                      <Circle size={20} className="text-orange-500 flex-shrink-0 fill-orange-200" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">
                          {conclusao.paciente.nome}
                        </p>
                        {conclusao.dataConclusao && (
                          <p className="text-xs text-orange-700">
                             Última atualização: {new Date(conclusao.dataConclusao).toLocaleDateString("pt-BR", { day: '2-digit', month: 'short' })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PENDENTES */}
            {pendentes.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Circle size={16} className="text-slate-400" />
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                    Pendentes ({pendentes.length})
                  </h3>
                </div>

                <div className="space-y-2">
                  {pendentes.map((conclusao) => (
                    <div
                      key={conclusao.id}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3"
                    >
                      <Circle size={20} className="text-slate-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-600 truncate">
                          {conclusao.paciente.nome}
                        </p>
                        <p className="text-xs text-slate-500">
                          Ainda não completou
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Insights */}
          {data.totalParticipantes > 0 && (
            <div className="mt-8 p-6 bg-slate-50 border border-slate-100 rounded-2xl">
              <h3 className="text-sm font-black text-deep uppercase tracking-wider mb-3">
                💡 Insights
              </h3>
              <div className="space-y-2 text-sm text-slate-600">
                {(() => {
                  const insights = [];

                  if (data.taxaConclusao === 100) {
                    insights.push(
                      "🎉 Parabéns! Todos os participantes completaram a missão!"
                    );
                  } else if (data.taxaConclusao >= 75) {
                    insights.push(
                      "✨ Ótimo engajamento! A maioria do grupo está participando ativamente."
                    );
                  } else if (data.taxaConclusao >= 50) {
                    insights.push(
                      "📊 Metade do grupo completou. Considere enviar um lembrete aos pendentes."
                    );
                  } else if (data.taxaConclusao > 0) {
                    insights.push(
                      "⚠️ Baixo engajamento. Talvez a missão precise ser simplificada ou o prazo estendido."
                    );
                  } else {
                    insights.push(
                      "❗ Nenhum participante completou ainda. Verifique se a missão está clara e acessível."
                    );
                  }

                  if (pendentes.length > 0 && pendentes.length <= 3) {
                    insights.push(
                      `📱 Considere entrar em contato individualmente com: ${pendentes
                        .map((p) => p.paciente.nome)
                        .join(", ")}`
                    );
                  }

                  return insights.map((insight, i) => <p key={i}>{insight}</p>);
                })()}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-900 text-white text-sm font-black uppercase tracking-widest rounded-xl hover:bg-black transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
