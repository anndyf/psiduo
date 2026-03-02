import { validarToken, buscarHistorico } from "../actions";
import { buscarMetasPeloToken } from "@/app/metas/actions";
import ClientDiary from "./ClientDiary";

// O token vem da URL dinâmica
export default async function Page({ params }: { params: Promise<{ token: string }> }) {
    // Validar token no server
    const { token } = await params;
    const res = await validarToken(token);
    
    if (!res.success || !res.paciente) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <h1 className="text-6xl mb-4">🚫</h1>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest mb-2">Acesso Inválido</h2>
                    <p className="text-slate-500 font-bold">O link que você acessou não existe ou expirou. Peça um novo link ao seu psicólogo.</p>
                </div>
            </div>
        );
    }

    // Buscar histórico do mês atual e METAS
    // Sincronizar com horário de Brasília (UTC-3) para evitar saltos de dia à noite no servidor
    const agora = new Date();
    const hoje = new Date(agora.getTime() - (3 * 60 * 60 * 1000));
    
    const [historico, metasRes] = await Promise.all([
        buscarHistorico(token, hoje.getUTCFullYear(), hoje.getUTCMonth()),
        buscarMetasPeloToken(token)
    ]);

    // START: Verificação de Pausa
    if (!res.paciente.ativo) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 animate-in fade-in duration-500">
                <div className="w-full max-w-md bg-white p-8 rounded-[2rem] shadow-xl text-center border border-slate-100">
                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Diário Pausado</h2>
                    <p className="text-slate-500 font-bold mb-8 leading-relaxed">
                        O acesso ao seu diário foi temporariamente pausado pelo seu psicólogo.
                    </p>
                    <div className="bg-slate-50 p-4 rounded-xl mb-4">
                        <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-1">O que fazer?</p>
                        <p className="text-sm font-bold text-slate-700">Entre em contato com {res.paciente.psicologo.nome.split(" ")[0]} para verificar seu acesso.</p>
                    </div>
                </div>
            </div>
        );
    }
    // END: Verificação de Pausa

    return <ClientDiary 
        paciente={res.paciente} 
        token={token} 
        historicoInicial={historico} 
        dataInicio={res.paciente.dataInicio}
        metas={metasRes.metas ?? []}
    />;
}
