import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import GrupoPainelClient from "./page.client";

interface PageProps {
    params: Promise<{ grupoId: string }>;
    searchParams: Promise<{ token?: string }>;
}

export default async function GrupoPainelPage(props: PageProps) {
    const params = await props.params;
    const searchParams = await props.searchParams;

    const { grupoId } = params;
    const { token } = searchParams;

    if (!token) {
        redirect(`/grupo/${grupoId}`);
    }

    // Verificar token e buscar paciente
    const paciente = await prisma.paciente.findFirst({
        where: {
            tokenAcesso: token,
            grupoId,
            ativo: true
        },
        include: {
            grupo: {
                select: {
                    id: true,
                    titulo: true,
                    descricao: true,
                    diaSemana: true,
                    horario: true,
                    modalidade: true,
                    cidade: true,
                    estado: true,
                    ativo: true,
                    psicologo: {
                        select: {
                            nome: true,
                            foto: true
                        }
                    },
                    participantes: {
                        where: { ativo: true },
                        select: {
                            id: true,
                            nome: true
                        }
                    }
                }
            },
            registros: {
                orderBy: { data: 'desc' },
                take: 30
            }
        }
    });

    if (!paciente || !paciente.grupo || !paciente.grupo.ativo) {
        notFound();
    }

    // Verificar se existe Check-in ativo
    const checkInAtivo = await (prisma as any).checkInGrupo.findFirst({
        where: { 
            grupoId, 
            dataExpira: { gt: new Date() } 
        },
        select: { id: true }
    });

    let jaRespondeu = false;
    if (checkInAtivo) {
        const resposta = await (prisma as any).respostaCheckIn.findFirst({
            where: { 
                checkInId: checkInAtivo.id, 
                pacienteId: paciente.id 
            },
            select: { id: true }
        });
        jaRespondeu = !!resposta;
    }

    return <GrupoPainelClient paciente={paciente as any} temCheckInAtivo={!!checkInAtivo} jaRespondeu={jaRespondeu} />;
}
