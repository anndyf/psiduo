import { buscarDadosDashboard, buscarNotasClinicas } from "../actions";
import { buscarMetasPaciente } from "@/app/metas/actions";
import ClientDashboard from "./ClientDashboard";

export const dynamic = 'force-dynamic';

export default async function DashboardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const [dashboardRes, metasRes, notasRes] = await Promise.all([
        buscarDadosDashboard(id),
        buscarMetasPaciente(id),
        buscarNotasClinicas(id)
    ]);

    if (!dashboardRes.success) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center p-10 bg-red-50 rounded-3xl border border-red-100">
                    <h1 className="text-2xl font-black uppercase text-red-500 mb-2">Acesso Negado</h1>
                    <p className="text-slate-600 font-bold mb-4">{dashboardRes.error}</p>
                    <a href="/painel/pacientes" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 underline">Voltar para Lista</a>
                </div>
            </div>
        );
    }

    return <ClientDashboard 
        paciente={dashboardRes.paciente} 
        registrosIniciais={dashboardRes.registros ?? []}
        registrosCompletos={dashboardRes.registrosCompletos ?? []}
        metas={metasRes.metas ?? []}
        notasIniciais={notasRes.notas ?? []}
    />;
}
