"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function listarMeusGrupos() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return [];

    const psi = await prisma.psicologo.findFirst({
        where: { user: { email: session.user.email } },
        select: { id: true }
    });

    if (!psi) return [];

    const grupos = await prisma.grupoTerapeutico.findMany({
        where: { psicologoId: psi.id },
        include: {
            participantes: {
                select: { id: true, nome: true, ativo: true }
            }
        },
        orderBy: { criadoEm: 'desc' }
    });

    return grupos.map(g => ({
        ...g,
        precoMensal: g.precoMensal.toNumber(),
        criadoEm: g.criadoEm.toISOString(),
        atualizadoEm: g.atualizadoEm.toISOString()
    }));
}

export async function salvarGrupo(data: any) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { success: false, error: "Não autorizado" };

    const psi = await prisma.psicologo.findFirst({
        where: { user: { email: session.user.email } },
        select: { id: true, plano: true }
    });

    if (!psi) return { success: false, error: "Perfil de psicólogo não encontrado" };

    try {
        if (data.id) {
            // Atualizar
            await prisma.grupoTerapeutico.update({
                where: { id: data.id },
                data: {
                    titulo: data.titulo,
                    descricao: data.descricao,
                    temas: data.temas,
                    publicoAlvo: data.publicoAlvo,
                    precoMensal: data.precoMensal,
                    periodicidade: data.periodicidade,
                    diaSemana: data.diaSemana,
                    horario: data.horario,
                    duracaoSessao: parseInt(data.duracaoSessao),
                    vagasTotais: data.vagasTotais ? parseInt(data.vagasTotais) : null,
                    vagasOcupadas: data.vagasOcupadas ? parseInt(data.vagasOcupadas) : 0,
                    modalidade: data.modalidade,
                    cidade: data.cidade,
                    estado: data.estado,
                }
            });
        } else {
            // VALIDAR LIMITE DO PLANO
            if (psi.plano !== 'DUO_II') {
                const count = await prisma.grupoTerapeutico.count({
                    where: { psicologoId: psi.id }
                });
                if (count >= 1) {
                    return { success: false, error: "Plano DUO I permite apenas 1 grupo. Faça upgrade para DUO II." };
                }
            }

            // Criar
            await prisma.grupoTerapeutico.create({
                data: {
                    psicologoId: psi.id,
                    titulo: data.titulo,
                    descricao: data.descricao,
                    temas: data.temas,
                    publicoAlvo: data.publicoAlvo,
                    precoMensal: data.precoMensal,
                    periodicidade: data.periodicidade,
                    diaSemana: data.diaSemana,
                    horario: data.horario,
                    duracaoSessao: parseInt(data.duracaoSessao),
                    vagasTotais: data.vagasTotais ? parseInt(data.vagasTotais) : null,
                    modalidade: data.modalidade,
                    cidade: data.cidade,
                    estado: data.estado,
                }
            });
        }

        revalidatePath("/painel/grupos");
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Erro ao salvar grupo." };
    }
}

export async function excluirGrupo(id: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { success: false, error: "Não autorizado" };

    try {
        await prisma.grupoTerapeutico.delete({
            where: { id }
        });
        revalidatePath("/painel/grupos");
        return { success: true };
    } catch (e) {
        return { success: false, error: "Erro ao excluir grupo." };
    }
}

export async function toggleStatusGrupo(id: string, ativoAtual: boolean) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { success: false, error: "Não autorizado" };

    const psi = await prisma.psicologo.findFirst({
        where: { user: { email: session.user.email } },
        select: { id: true, publicoAlvo: true, plano: true }
    });

    if (!psi) return { success: false, error: "Perfil não encontrado" };

    // Se estiver tentando ATIVAR, verifica se tem a modalidade no perfil
    if (!ativoAtual) { 
        if (!psi.publicoAlvo || !psi.publicoAlvo.includes("Terapia em Grupo")) {
            return { success: false, error: "Ative a modalidade 'Terapia em Grupo' no seu perfil para ativar este grupo." };
        }

        // REGRA DE NEGÓCIO: DUO I só pode ter 1 grupo ATIVO
        if (psi.plano !== 'DUO_II') {
            const ativosCount = await prisma.grupoTerapeutico.count({
                where: { 
                    psicologoId: psi.id,
                    ativo: true,
                    // Exclui o próprio grupo da contagem para evitar falso positivo se algo estranho acontecer, 
                    // embora 'ativoAtual' sendo false signifique que ele ESTAVA inativo.
                    NOT: { id: id }
                }
            });

            if (ativosCount >= 1) {
                return { success: false, error: "Plano DUO I permite apenas 1 grupo ativo. Pause o outro grupo para ativar este." };
            }
        }
    }

    try {
        // Usa updateMany para garantir que só altera se pertencer ao psicólogo (segurança extra)
        const result = await prisma.grupoTerapeutico.updateMany({
            where: { 
                id: id,
                psicologoId: psi.id 
            },
            data: { ativo: !ativoAtual }
        });

        if (result.count === 0) return { success: false, error: "Grupo não encontrado ou não pertence a você." };

        revalidatePath("/painel/grupos");
        return { success: true };
    } catch (e) {
        return { success: false, error: "Erro ao alterar status." };
    }
}

export async function obterPlanoAtual() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return "DUO_I";

    const psi = await prisma.psicologo.findFirst({
        where: { user: { email: session.user.email } },
        select: { plano: true }
    });

    return psi?.plano || "DUO_I";
}
