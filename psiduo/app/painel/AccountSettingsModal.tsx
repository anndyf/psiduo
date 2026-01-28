import { useState } from "react";
import { atualizarCredenciais } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
  onUpdateEmail: (email: string) => void;
}

export default function AccountSettingsModal({ isOpen, onClose, currentEmail, onUpdateEmail }: Props) {
  const [editandoEmail, setEditandoEmail] = useState(false);
  const [novoEmail, setNovoEmail] = useState(currentEmail);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");
  const [statusEnvio, setStatusEnvio] = useState({ tipo: "", texto: "" });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSalvarCredenciais = async () => {
    setStatusEnvio({ tipo: "", texto: "" });

    // Validações de Senha
    if (novaSenha) {
        if (!senhaAtual) {
            setStatusEnvio({ tipo: "erro", texto: "Digite sua senha atual para confirmar a troca." });
            return;
        }
        if (novaSenha !== confirmarNovaSenha) {
            setStatusEnvio({ tipo: "erro", texto: "A nova senha e a confirmação não conferem." });
            return;
        }
        if (novaSenha.length < 6) {
             setStatusEnvio({ tipo: "erro", texto: "A nova senha deve ter pelo menos 6 caracteres." });
             return;
        }
    }

    setLoading(true);
    const res = await atualizarCredenciais({
      emailNovo: editandoEmail ? novoEmail : undefined,
      senhaNova: novaSenha || undefined,
      senhaAtual: senhaAtual || undefined
    });

    if (res.success) {
      setStatusEnvio({ tipo: "sucesso", texto: res.message });
      if (editandoEmail) onUpdateEmail(novoEmail);
      setEditandoEmail(false);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarNovaSenha("");
      setTimeout(() => onClose(), 2000);
    } else {
      setStatusEnvio({ tipo: "erro", texto: res.error || "Erro ao atualizar." });
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-none border-t-8 border-deep shadow-2xl p-10 md:p-12 max-h-[90vh] overflow-y-auto">
        <header className="mb-10 flex justify-between items-start">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-widest mb-2">SISTEMA</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Configurações de Acesso</p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-red-600 transition-colors text-3xl">✕</button>
        </header>
        
        {statusEnvio.texto && (
          <div className={`mb-6 p-4 text-[10px] font-black uppercase tracking-widest text-center ${statusEnvio.tipo === 'sucesso' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {statusEnvio.texto}
          </div>
        )}

        <div className="space-y-8">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">E-mail de Acesso</label>
              <button onClick={() => setEditandoEmail(!editandoEmail)} className="text-[10px] font-black text-deep uppercase hover:underline">Alterar</button>
            </div>
            <Input 
              disabled={!editandoEmail}
              type="email" 
              value={editandoEmail ? novoEmail : currentEmail}
              onChange={(e) => setNovoEmail(e.target.value)}
            />
          </div>

          <div>
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Alterar Senha</label>
             <div className="space-y-3">
                <Input 
                  type="password" 
                  placeholder="Senha Atual (Obrigatório)"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                />
                <Input 
                  type="password" 
                  placeholder="Nova Senha"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                />
                <Input 
                  type="password" 
                  placeholder="Confirmar Nova Senha"
                  value={confirmarNovaSenha}
                  onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                />
             </div>
          </div>

          <div className="pt-4 space-y-4">
            <Button 
              onClick={handleSalvarCredenciais}
              disabled={loading}
              variant="deep"
              size="xl"
              fullWidth
              className="shadow-xl"
            >
              {loading ? "Processando..." : "Confirmar Alterações"}
            </Button>
            <Button 
              onClick={onClose} 
              variant="outline"
              size="xl"
              fullWidth
            >
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
