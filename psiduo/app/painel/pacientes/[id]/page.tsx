import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { buscarDadosDashboard } from "../actions";
import ClientDashboard from "./ClientDashboard";

export const dynamic = 'force-dynamic';

// ─── Skeleton ─────────────────────────────────────────────────────────────
function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-slate-50/50 animate-pulse">
            <div className="bg-white border-b border-slate-100 px-4 md:px-8 py-4 sticky top-0 z-30">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100" />
                        <div className="space-y-2">
                            <div className="h-5 w-40 bg-slate-100 rounded-lg" />
                            <div className="h-3 w-24 bg-slate-50 rounded-lg" />
                        </div>
                    </div>
                    <div className="h-9 w-32 bg-slate-100 rounded-xl" />
                </div>
            </div>
            <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-6">
                <div className="flex gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className={`h-10 rounded-xl bg-slate-100 ${i === 0 ? 'w-32' : 'w-24'}`} />
                    ))}
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 shrink-0" />
                            <div className="space-y-2 flex-1">
                                <div className="h-6 w-12 bg-slate-100 rounded-lg" />
                                <div className="h-2.5 w-20 bg-slate-50 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="bg-white rounded-[1.5rem] border border-slate-200 p-6 h-[380px]">
                    <div className="h-5 w-36 bg-slate-100 rounded-lg mb-2" />
                    <div className="h-3 w-24 bg-slate-50 rounded-lg mb-8" />
                    <div className="h-64 bg-slate-50 rounded-2xl" />
                </div>
            </div>
        </div>
    );
}

// ─── Componente async ─────────────────────────────────────────────────────
async function DashboardData({ id }: { id: string }) {
    const res = await buscarDadosDashboard(id);

    if (!res.success || !res.paciente) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center p-10 bg-red-50 rounded-3xl border border-red-100">
                    <h1 className="text-xl font-medium text-red-500 mb-2">Acesso Negado</h1>
                    <p className="text-slate-600 font-normal mb-4 text-sm">{res.error || "Paciente não encontrado ou sem permissão."}</p>
                    <a href="/painel/pacientes" className="text-xs font-medium text-slate-400 hover:text-slate-900 underline">
                        Voltar para Lista
                    </a>
                </div>
            </div>
        );
    }

    return (
        <ClientDashboard
            paciente={res.paciente}
            registrosIniciais={res.registros}
            registrosCompletos={res.registrosCompletos}
            metas={res.metas}
            notasIniciais={res.notas}
            dadosCadastrais={res.dadosCadastrais}
            anamneseInicial={res.anamnese}
            prontuarioInicial={res.prontuario}
            instrumentos={res.instrumentos || []}
            solicitacoesPendente={res.paciente.solicitacoesInstrumento || []}
            psicologoLogado={res.psicologoLogado}
        />
    );
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default async function DashboardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <DashboardData id={id} />
        </Suspense>
    );
}
