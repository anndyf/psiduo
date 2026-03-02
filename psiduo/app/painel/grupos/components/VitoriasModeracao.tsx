"use client";

import { useEffect, useState } from "react";
import { X, Trophy, Check, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

interface VitoriasModeracao {
  grupoId: string;
  onClose: () => void;
}

interface Vitoria {
  id: string;
  texto: string;
  aprovado: boolean;
  criadoEm: string;
  paciente: {
    id: string;
    nome: string;
  };
}

export default function VitoriasModeracao({
  grupoId,
  onClose,
}: VitoriasModeracao) {
  const [loading, setLoading] = useState(true);
  const [vitorias, setVitorias] = useState<Vitoria[]>([]);
  const [processando, setProcessando] = useState<string | null>(null);

  useEffect(() => {
    fetchVitorias();
  }, []);

  const fetchVitorias = async () => {
    try {
      const response = await fetch(`/api/grupo/${grupoId}/vitorias`);
      const data = await response.json();
      setVitorias(data.vitorias || []);
    } catch (error) {
      console.error("Erro ao buscar vitórias:", error);
      toast.error("Erro ao carregar vitórias");
    } finally {
      setLoading(false);
    }
  };

  const handleAprovar = async (vitoriaId: string, aprovado: boolean) => {
    setProcessando(vitoriaId);

    try {
      const response = await fetch(`/api/grupo/${grupoId}/vitorias`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vitoriaId, aprovado }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          aprovado ? "Vitória aprovada!" : "Vitória rejeitada"
        );
        // Atualizar lista
        setVitorias((prev) =>
          prev.map((v) =>
            v.id === vitoriaId ? { ...v, aprovado } : v
          )
        );
      } else {
        toast.error(data.error || "Erro ao processar");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao processar vitória");
    } finally {
      setProcessando(null);
    }
  };

  const pendentes = vitorias.filter((v) => !v.aprovado);
  const aprovadas = vitorias.filter((v) => v.aprovado);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <Trophy size={24} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">
                Mural das Vitórias
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {pendentes.length} pendentes • {aprovadas.length} aprovadas
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
          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Carregando vitórias...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* PENDENTES */}
              {pendentes.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock size={16} className="text-amber-600" />
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                      Aguardando Aprovação ({pendentes.length})
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {pendentes.map((vitoria) => (
                      <div
                        key={vitoria.id}
                        className="p-5 bg-amber-50 border-2 border-amber-200 rounded-2xl"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-xs font-bold text-amber-800 mb-2">
                              {vitoria.paciente.nome}
                            </p>
                            <p className="text-sm text-slate-700 leading-relaxed">
                              {vitoria.texto}
                            </p>
                            <p className="text-xs text-slate-500 mt-2">
                              {new Date(vitoria.criadoEm).toLocaleDateString(
                                "pt-BR",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAprovar(vitoria.id, true)}
                              disabled={processando === vitoria.id}
                              className="w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-xl transition flex items-center justify-center disabled:opacity-50"
                              title="Aprovar"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={() => handleAprovar(vitoria.id, false)}
                              disabled={processando === vitoria.id}
                              className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-xl transition flex items-center justify-center disabled:opacity-50"
                              title="Rejeitar"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* APROVADAS */}
              {aprovadas.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Check size={16} className="text-green-600" />
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                      Aprovadas ({aprovadas.length})
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {aprovadas.map((vitoria) => (
                      <div
                        key={vitoria.id}
                        className="p-5 bg-green-50 border border-green-200 rounded-2xl"
                      >
                        <p className="text-xs font-bold text-green-800 mb-2">
                          {vitoria.paciente.nome}
                        </p>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {vitoria.texto}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">
                          {new Date(vitoria.criadoEm).toLocaleDateString(
                            "pt-BR",
                            {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* EMPTY STATE */}
              {vitorias.length === 0 && (
                <div className="text-center py-12">
                  <Trophy size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500 font-medium">
                    Nenhuma vitória postada ainda
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Os participantes podem compartilhar suas conquistas durante
                    a semana
                  </p>
                </div>
              )}
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
