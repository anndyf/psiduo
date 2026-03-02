import Link from "next/link";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradePlanModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        
        {/* Background Effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100/50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="text-center relative z-10">
            <div className="w-20 h-20 bg-slate-50 text-deep rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-100">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>

            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">
                Exclusivo Plano Duo II
            </h2>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed px-4">
                As **Ferramentas de Grupo** (Check-in, Mural e Diário) são recursos avançados para potencializar a terapia coletiva.
            </p>

            <ul className="text-left space-y-4 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <li className="flex items-center gap-3 text-sm font-bold text-slate-700">
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                    Grupos Ilimitados
                </li>
                <li className="flex items-center gap-3 text-sm font-bold text-slate-700">
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                    Check-in Emocional dos Participantes
                </li>
                <li className="flex items-center gap-3 text-sm font-bold text-slate-700">
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                    Mural de Avisos da Comunidade
                </li>
            </ul>

            <Link href="/cadastro/planos" className="block w-full py-4 bg-deep text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-900 transition shadow-lg hover:shadow-xl active:scale-95 mb-3">
                Fazer Upgrade Agora
            </Link>
            
            <button onClick={onClose} className="text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-deep transition">
                Talvez Depois
            </button>
        </div>
      </div>
    </div>
  );
}
