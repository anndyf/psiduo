import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ClientPage from "./ClientPage";

export const dynamic = 'force-dynamic';

// ─── Skeleton ─────────────────────────────────────────────────────────────
function PatientListSkeleton() {
    return (
        <div className="animate-pulse space-y-3 p-4 md:p-8">
            <div className="flex gap-3 mb-6">
                <div className="h-10 w-32 bg-slate-100 rounded-xl" />
                <div className="h-10 w-32 bg-slate-100 rounded-xl" />
                <div className="h-10 flex-1 bg-slate-100 rounded-xl ml-auto" />
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3.5 bg-slate-100 rounded-lg w-1/3" />
                        <div className="h-2.5 bg-slate-50 rounded-lg w-1/4" />
                    </div>
                    <div className="h-6 w-16 bg-slate-100 rounded-lg" />
                    <div className="h-6 w-20 bg-slate-50 rounded-lg" />
                    <div className="flex gap-2">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg" />
                        <div className="w-8 h-8 bg-slate-100 rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Busca sequencial (1 conexão por vez) ─────────────────────────────────
async function buscarDadosPacientes() {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    const psicologoId = session?.user?.psicologoId;
    if (!psicologoId) return { pacientes: [], grupos: [] };

    // Sequencial: pacientes primeiro, depois grupos
    const pacientes = await prisma.paciente.findMany({
        where: { psicologoId, tipo: 'INDIVIDUAL' },
        orderBy: [{ ativo: 'desc' }, { criadoEm: 'desc' }],
        include: {
            _count: { select: { registros: true } },
            registros: {
                orderBy: { data: 'desc' },
                take: 1,
                select: { data: true, humor: true }
            }
        }
    });

    const grupos = await prisma.grupoTerapeutico.findMany({
        where: { psicologoId },
        include: {
            participantes: {
                orderBy: { nome: 'asc' },
                select: {
                    id: true, nome: true, cpf: true, whatsapp: true,
                    tipo: true, grupoId: true,
                    registros: {
                        orderBy: { data: 'desc' },
                        take: 1,
                        select: { data: true, humor: true }
                    },
                    _count: { select: { registros: true } }
                }
            }
        },
        orderBy: { criadoEm: 'desc' }
    });

    // Serializar Decimal do Prisma
    const gruposSerializados = grupos.map(g => ({
        ...g,
        precoMensal: g.precoMensal.toNumber(),
        criadoEm: g.criadoEm.toISOString(),
        atualizadoEm: g.atualizadoEm.toISOString()
    }));

    return { pacientes, grupos: gruposSerializados };
}

// ─── Componente async ─────────────────────────────────────────────────────
async function PatientListData() {
    try {
        const { pacientes, grupos } = await buscarDadosPacientes();
        return <ClientPage initialPacientes={pacientes} initialGrupos={grupos} />;
    } catch (error) {
        console.error("Erro ao carregar pacientes:", error);
        return <ClientPage initialPacientes={[]} initialGrupos={[]} />;
    }
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function Page() {
    return (
        <Suspense fallback={<PatientListSkeleton />}>
            <PatientListData />
        </Suspense>
    );
}
