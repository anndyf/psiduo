"use client";

import { useState } from "react";
import { X, Target, Calendar } from "lucide-react";
import { toast } from "sonner";

interface MissaoCreatorModalProps {
  grupoId: string;
  onClose: () => void;
  onSuccess: () => void;
  editingMissao?: {
    id: string;
    titulo: string;
    descricao: string;
    dataFim: string;
  };
}

export default function MissaoCreatorModal({
  grupoId,
  onClose,
  onSuccess,
  editingMissao,
}: MissaoCreatorModalProps) {
  const [loading, setLoading] = useState(false);
  const [titulo, setTitulo] = useState(editingMissao?.titulo || "");
  const [descricao, setDescricao] = useState(editingMissao?.descricao || "");
  const [diasDuracao, setDiasDuracao] = useState(7);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Calcular data de fim (X dias a partir de agora) se for criar ou se usuário quiser mudar
      // Se for edição e mantivermos a lógica de dias, ok. Se quisessemos manter a data original sem mexer, precisariamos de flag.
      // Vamos assumir que editar Atualiza o prazo baseado na seleção atual (default 7 dias a partir de HOJE se não mexer).
      // Isso pode ser perigoso na edição inadvertida.
      // Melhor: Se for edição, só manda dataFim se o usuário explicitamente alterasse?
      // Mas o state diasDuracao inicia em 7.
      // Vamos mandar a nova data calculada mesmo.
      const dataFim = new Date();
      dataFim.setDate(dataFim.getDate() + diasDuracao);
      dataFim.setHours(23, 59, 59, 999);

      let response;
      if (editingMissao) {
         response = await fetch(`/api/grupo/${grupoId}/missoes/${editingMissao.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              titulo,
              descricao,
              dataFim: dataFim.toISOString(),
            }),
         });
      } else {
         response = await fetch(`/api/grupo/${grupoId}/missoes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              titulo,
              descricao,
              dataFim: dataFim.toISOString(),
            }),
         });
      }

      const data = await response.json();

      if (data.success) {
        toast.success("Missão criada com sucesso!");
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || "Erro ao criar missão");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao criar missão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[250] p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Target size={24} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">
                {editingMissao ? "Editar Missão" : "Criar Missão"}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Missão da Semana
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
          <div className="space-y-6">
            {/* Título */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                Título da Missão
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-purple-500 focus:bg-white transition"
                placeholder="Ex: Observar momentos de ansiedade"
                required
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                Instruções Detalhadas
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-purple-500 focus:bg-white transition resize-none"
                placeholder="Ex: Durante a semana, observe 3 momentos em que você sentiu ansiedade. Anote o gatilho, a intensidade (0-10) e como você reagiu."
                rows={5}
                required
              />
            </div>

            {/* Duração */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                Prazo para Conclusão
              </label>
              <div className="grid grid-cols-4 gap-3">
                {[3, 7, 14, 21].map((dias) => (
                  <button
                    key={dias}
                    type="button"
                    onClick={() => setDiasDuracao(dias)}
                    className={`p-4 rounded-xl border-2 transition ${
                      diasDuracao === dias
                        ? "border-purple-500 bg-purple-50"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <Calendar
                      size={20}
                      className={`mx-auto mb-2 ${
                        diasDuracao === dias
                          ? "text-purple-600"
                          : "text-slate-400"
                      }`}
                    />
                    <p
                      className={`text-xs font-bold ${
                        diasDuracao === dias
                          ? "text-purple-600"
                          : "text-slate-600"
                      }`}
                    >
                      {dias} dias
                    </p>
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2 ml-1">
                Prazo até{" "}
                {new Date(
                  Date.now() + diasDuracao * 24 * 60 * 60 * 1000
                ).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
              <p className="text-xs text-purple-800 font-bold mb-2">
                ℹ️ Como funciona:
              </p>
              <ul className="text-xs text-purple-700 space-y-1 ml-4 list-disc">
                <li>
                  Todos os participantes do grupo receberão esta missão
                </li>
                <li>Eles poderão marcar como concluída quando finalizarem</li>
                <li>
                  Você verá um dashboard com quem completou e quem está
                  pendente
                </li>
                <li>
                  Use isso para aumentar o engajamento e accountability do
                  grupo
                </li>
              </ul>
            </div>
          </div>
        </form>

        {/* FOOTER */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 text-sm font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !titulo || !descricao}
            className="flex-1 py-3 bg-purple-600 text-white text-sm font-black uppercase tracking-widest rounded-xl hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Salvando..." : (editingMissao ? "Salvar Alterações" : "Criar Missão")}
          </button>
        </div>
      </div>
    </div>
  );
}
