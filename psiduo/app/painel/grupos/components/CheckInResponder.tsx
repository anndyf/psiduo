"use client";

import { useState } from "react";
import { BatteryLow, BatteryMedium, Zap, Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface CheckInResponderProps {
  grupoId: string;
  checkInId: string;
  pacienteId: string; // ID do paciente que está respondendo
  titulo: string;
  descricao?: string;
  onSuccess: () => void;
  onClose: () => void;
}

const BATERIAS = [
  {
    value: "BATERIA_10",
    label: "10%",
    subLabel: "Só observo",
    icon: BatteryLow,
    color: "bg-red-500",
    hoverColor: "hover:bg-red-500",
    textColor: "text-red-600",
    borderColor: "border-red-200",
    bgLight: "bg-red-50",
  },
  {
    value: "BATERIA_50",
    label: "50%",
    subLabel: "Participo se chamarem",
    icon: BatteryMedium,
    color: "bg-amber-500",
    hoverColor: "hover:bg-amber-500",
    textColor: "text-amber-600",
    borderColor: "border-amber-200",
    bgLight: "bg-amber-50",
  },
  {
    value: "BATERIA_100",
    label: "100%",
    subLabel: "Quero falar!",
    icon: Zap,
    color: "bg-green-500",
    hoverColor: "hover:bg-green-500",
    textColor: "text-green-600",
    borderColor: "border-green-200",
    bgLight: "bg-green-50",
  },
];

export default function CheckInResponder({
  grupoId,
  checkInId,
  pacienteId,
  titulo,
  descricao,
  onSuccess,
  onClose,
}: CheckInResponderProps) {
  const [loading, setLoading] = useState(false);
  const [selectedBateria, setSelectedBateria] = useState<string | null>(null);
  const [comentario, setComentario] = useState("");

  const handleSubmit = async () => {
    if (!selectedBateria) {
      toast.error("Por favor, selecione seu nível de bateria");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/grupo/${grupoId}/checkin/${checkInId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pacienteId,
            emocao: selectedBateria,
            comentario,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Resposta enviada com sucesso!");
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || "Erro ao enviar resposta");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao enviar resposta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="p-8 pb-4 text-center">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">
            {titulo}
          </h2>
          <p className="text-slate-500 font-medium">
            {descricao || "Como está sua bateria para interagir hoje?"}
          </p>
        </div>

        {/* CONTENT */}
        <div className="p-8 pt-4 overflow-y-auto flex-1">
          {/* SELEÇÃO DE BATERIA */}
          <div className="grid gap-4 mb-8">
            {BATERIAS.map((bateria) => {
              const isSelected = selectedBateria === bateria.value;
              const Icon = bateria.icon;

              return (
                <button
                  key={bateria.value}
                  onClick={() => setSelectedBateria(bateria.value)}
                  className={`relative p-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 group ${
                    isSelected
                      ? `${bateria.borderColor} ${bateria.bgLight} shadow-md`
                      : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? `${bateria.color} text-white`
                        : `bg-slate-100 text-slate-400 group-hover:${bateria.textColor} group-hover:bg-white`
                    }`}
                  >
                    <Icon size={24} />
                  </div>
                  <div className="text-left flex-1">
                    <p
                      className={`text-lg font-black uppercase tracking-wide ${
                        isSelected ? bateria.textColor : "text-slate-700"
                      }`}
                    >
                      {bateria.label}
                    </p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {bateria.subLabel}
                    </p>
                  </div>
                  {isSelected && (
                    <div className={`w-4 h-4 rounded-full ${bateria.color}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* CAMPO DE TEXTO */}
          <div className="relative">
             <div className="absolute top-3 left-3 text-slate-400">
                <MessageSquare size={20} />
             </div>
             <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Quer compartilhar algo sobre como está se sentindo? (Opcional)"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 pl-10 h-32 text-sm font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:border-slate-300 transition-all resize-none"
             />
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !selectedBateria}
            className="flex-[2] py-4 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? "Enviando..." : (
               <>
                 Confirmar Check-in <Send size={14} />
               </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
