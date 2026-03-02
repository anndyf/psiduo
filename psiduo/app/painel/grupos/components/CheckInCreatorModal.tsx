"use client";

import { useState } from "react";
import { X, ThermometerSun, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";

interface CheckInCreatorModalProps {
  grupoId: string;
  onClose: () => void;
  onSuccess: () => void;
  editingCheckIn?: {
      id: string;
      titulo: string;
      descricao: string;
      dataExpira: string;
  };
}

export default function CheckInCreatorModal({
  grupoId,
  onClose,
  onSuccess,
  editingCheckIn,
}: CheckInCreatorModalProps) {
  const [loading, setLoading] = useState(false);
  const [titulo, setTitulo] = useState(editingCheckIn?.titulo || "Bateria Social");
  const [descricao, setDescricao] = useState(
    editingCheckIn?.descricao || "Como está sua bateria para interagir hoje?"
  );
  const [horasAntecedencia, setHorasAntecedencia] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Calcular data de expiração (X horas a partir de agora)
      const dataExpira = new Date();
      dataExpira.setHours(dataExpira.getHours() + horasAntecedencia);
      
      let response;
      if (editingCheckIn) {
         response = await fetch(`/api/grupo/${grupoId}/checkin/${editingCheckIn.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              titulo,
              descricao,
              dataExpira: dataExpira.toISOString(),
            }),
         });
      } else {
         response = await fetch(`/api/grupo/${grupoId}/checkin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              titulo,
              descricao,
              dataExpira: dataExpira.toISOString(),
            }),
         });
      }

      const data = await response.json();

      if (data.success) {
        toast.success("Check-in criado com sucesso!");
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || "Erro ao criar check-in");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao criar check-in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[250] p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
              <ThermometerSun size={24} className="text-deep" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">
                {editingCheckIn ? "Editar Check-in" : "Criar Check-in"}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Termômetro Coletivo
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
                Título do Check-in
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-deep focus:bg-white transition"
                placeholder="Ex: Check-in antes da sessão"
                required
              />
            </div>
 
            {/* Descrição */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                Descrição (Opcional)
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-deep focus:bg-white transition resize-none"
                placeholder="Ex: Como você está chegando para o grupo hoje?"
                rows={3}
              />
            </div>

            {/* Prazo */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                Prazo para Responder
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((horas) => (
                  <button
                    key={horas}
                    type="button"
                    onClick={() => setHorasAntecedencia(horas)}
                    className={`p-4 rounded-xl border-2 transition ${
                      horasAntecedencia === horas
                        ? "border-deep bg-slate-100"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <Clock
                      size={20}
                      className={`mx-auto mb-2 ${
                        horasAntecedencia === horas
                          ? "text-deep"
                          : "text-slate-400"
                      }`}
                    />
                    <p
                      className={`text-xs font-bold ${
                        horasAntecedencia === horas
                          ? "text-deep"
                          : "text-slate-600"
                      }`}
                    >
                      {horas} {horas === 1 ? "hora" : "horas"}
                    </p>
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2 ml-1">
                O check-in expirará em {horasAntecedencia}{" "}
                {horasAntecedencia === 1 ? "hora" : "horas"}
              </p>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-xs text-slate-800 font-bold mb-2">
                ℹ️ Como funciona:
              </p>
              <ul className="text-xs text-slate-600 space-y-1 ml-4 list-disc">
                <li>Os participantes receberão uma notificação</li>
                <li>
                  Eles respondem anonimamente sobre como estão se sentindo
                </li>
                <li>Você verá um gráfico com as emoções do grupo</li>
                <li>Use isso para ajustar a abordagem da sessão</li>
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
            disabled={loading || !titulo}
            className="flex-1 py-3 bg-deep text-white text-sm font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Salvando..." : (editingCheckIn ? "Salvar Alterações" : "Criar Check-in")}
          </button>
        </div>
      </div>
    </div>
  );
}
