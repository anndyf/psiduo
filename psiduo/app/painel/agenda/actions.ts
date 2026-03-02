"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { addWeeks, addMonths, startOfMonth, endOfMonth } from "date-fns";

async function getPsicologoId() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Não autenticado");
    const psi = await prisma.psicologo.findFirst({
        where: { user: { email: session.user.email } },
        select: { id: true },
    });
    if (!psi) throw new Error("Psicólogo não encontrado");
    return psi.id;
}

function serializeAgendamento(a: any) {
    return {
        ...a,
        data: a.data instanceof Date ? a.data.toISOString() : a.data,
        criadoEm: a.criadoEm instanceof Date ? a.criadoEm.toISOString() : a.criadoEm,
        atualizadoEm: a.atualizadoEm instanceof Date ? a.atualizadoEm.toISOString() : a.atualizadoEm,
        valorSessao: a.valorSessao ? Number(a.valorSessao) : null,
    };
}

// ── Buscar agendamentos do mês ─────────────────────────────────────────────
export async function buscarAgendamentos(ano: number, mes: number) {
    try {
        const psicologoId = await getPsicologoId();
        const inicio = startOfMonth(new Date(ano, mes - 1, 1));
        const fim    = endOfMonth(new Date(ano, mes - 1, 1));

        const agendamentos = await prisma.agendamento.findMany({
            where: { psicologoId, data: { gte: inicio, lte: fim } },
            include: {
                paciente: { select: { id: true, nome: true } },
                grupo:    { select: { id: true, titulo: true } },
            },
            orderBy: { data: "asc" },
        });

        return { success: true, dados: agendamentos.map(serializeAgendamento) };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// ── Criar agendamento (com recorrência) ────────────────────────────────────
export async function criarAgendamento(dados: {
    titulo: string;
    data: string;
    duracao: number;
    tipo: string;
    pacienteId?: string;
    grupoId?: string;
    observacoes?: string;
    valorSessao?: number;
    recorrencia: string;
}) {
    try {
        const psicologoId = await getPsicologoId();
        const baseData = new Date(dados.data);
        const recorrenciaId = dados.recorrencia !== "NENHUMA" ? crypto.randomUUID() : null;

        // Gerar datas conforme recorrência (máx 3 meses à frente)
        const datas: Date[] = [baseData];

        if (dados.recorrencia !== "NENHUMA") {
            const limite = addMonths(baseData, 3);
            let proxima = baseData;
            while (true) {
                if (dados.recorrencia === "SEMANAL")     proxima = addWeeks(proxima, 1);
                else if (dados.recorrencia === "QUINZENAL") proxima = addWeeks(proxima, 2);
                else if (dados.recorrencia === "MENSAL")   proxima = addMonths(proxima, 1);
                if (proxima > limite) break;
                datas.push(new Date(proxima));
            }
        }

        // ── Verificar conflito de horário (apenas para não-GRUPO) ────────────
        if (dados.tipo !== "GRUPO") {
            for (const d of datas) {
                const inicioNovo = d;
                const fimNovo    = new Date(d.getTime() + dados.duracao * 60_000);

                const conflitos = await prisma.agendamento.findMany({
                    where: {
                        psicologoId,
                        tipo:   { not: "GRUPO" },
                        status: { notIn: ["CANCELADO"] },
                        AND: [
                            { data: { lt: fimNovo    } },   // existente começa antes do fim do novo
                            // existente termina depois do início do novo
                            // (aproximado: data + duracao > inicioNovo)
                            // Prisma não faz aritmética, então usamos:
                            { data: { gte: new Date(inicioNovo.getTime() - 4 * 60 * 60_000) } }, // janela até 4h antes
                        ],
                    },
                    include: { paciente: { select: { nome: true } } },
                });

                // Checar sobreposição real no JS em todos os possíveis conflitos da janela
                for (const conflito of conflitos) {
                    const fimConflito = new Date(new Date(conflito.data).getTime() + conflito.duracao * 60_000);
                    const hasSobreposicao =
                        new Date(conflito.data) < fimNovo && fimConflito > inicioNovo;

                    if (hasSobreposicao) {
                        const horario = new Date(conflito.data).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
                        const nome    = conflito.paciente?.nome ?? conflito.titulo;
                        return {
                            success: false,
                            error: `Conflito de horário: já existe uma sessão com ${nome} às ${horario} neste dia.`,
                        };
                    }
                }
            }
        }

        const criados = await prisma.$transaction(
            datas.map(d => prisma.agendamento.create({
                data: {
                    psicologoId,
                    pacienteId:   dados.tipo === "INDIVIDUAL" ? (dados.pacienteId || null) : null,
                    grupoId:      dados.tipo === "GRUPO" ? (dados.grupoId || null) : null,
                    titulo:       dados.titulo,
                    data:         d,
                    duracao:      dados.duracao,
                    tipo:         dados.tipo,
                    observacoes:  dados.observacoes || null,
                    valorSessao:  dados.valorSessao ?? null,
                    recorrencia:  dados.recorrencia,
                    recorrenciaId,
                    status:       "AGENDADO",
                },
                include: {
                    paciente: { select: { id: true, nome: true } },
                    grupo:    { select: { id: true, titulo: true } },
                },
            }))
        );

        revalidatePath("/painel/agenda");
        return { success: true, criados: criados.length, dados: serializeAgendamento(criados[0]) };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// ── Atualizar status ───────────────────────────────────────────────────────
export async function atualizarStatusAgendamento(id: string, status: string) {
    try {
        await getPsicologoId();
        await prisma.agendamento.update({ where: { id }, data: { status } });
        revalidatePath("/painel/agenda");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// ── Remarcar agendamento ───────────────────────────────────────────────────
export async function remarcarAgendamento(id: string, novaData: string) {
    try {
        const psicologoId = await getPsicologoId();

        // Buscar agendamento atual para saber o tipo e duração
        const atual = await prisma.agendamento.findUnique({
            where: { id },
            select: { tipo: true, duracao: true },
        });
        if (!atual) return { success: false, error: "Agendamento não encontrado." };

        if (atual.tipo !== "GRUPO") {
            const inicio = new Date(novaData);
            const fim    = new Date(inicio.getTime() + atual.duracao * 60_000);

            const conflitos = await prisma.agendamento.findMany({
                where: {
                    psicologoId,
                    id:     { not: id }, // excluir o próprio agendamento
                    tipo:   { not: "GRUPO" },
                    status: { notIn: ["CANCELADO"] },
                    AND: [
                        { data: { lt: fim } },
                        { data: { gte: new Date(inicio.getTime() - 4 * 60 * 60_000) } },
                    ],
                },
                include: { paciente: { select: { nome: true } } },
            });

            for (const conflito of conflitos) {
                const fimConflito = new Date(new Date(conflito.data).getTime() + conflito.duracao * 60_000);
                if (new Date(conflito.data) < fim && fimConflito > inicio) {
                    const horario = new Date(conflito.data).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
                    const nome    = conflito.paciente?.nome ?? conflito.titulo;
                    return {
                        success: false,
                        error: `Conflito de horário: já existe uma sessão com ${nome} às ${horario} nesse dia.`,
                    };
                }
            }
        }

        const updated = await prisma.agendamento.update({
            where: { id },
            data: { data: new Date(novaData), status: "REMARCADO" },
            include: { paciente: { select: { id: true, nome: true } } },
        });
        revalidatePath("/painel/agenda");
        return { success: true, dados: serializeAgendamento(updated) };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// ── Excluir (só este ou toda a série) ─────────────────────────────────────
export async function excluirAgendamento(id: string, todosDaSerie = false) {
    try {
        const psicologoId = await getPsicologoId();
        if (todosDaSerie) {
            const ag = await prisma.agendamento.findUnique({ where: { id }, select: { recorrenciaId: true } });
            if (ag?.recorrenciaId) {
                await prisma.agendamento.deleteMany({ where: { psicologoId, recorrenciaId: ag.recorrenciaId } });
            } else {
                await prisma.agendamento.delete({ where: { id } });
            }
        } else {
            await prisma.agendamento.delete({ where: { id } });
        }
        revalidatePath("/painel/agenda");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// ── Balanço financeiro ─────────────────────────────────────────────────────
export async function buscarBalancoFinanceiro(ano: number, mes: number) {
    try {
        const psicologoId = await getPsicologoId();
        const inicio = startOfMonth(new Date(ano, mes - 1, 1));
        const fim    = endOfMonth(new Date(ano, mes - 1, 1));

        const agendamentos = await prisma.agendamento.findMany({
            where: { psicologoId, data: { gte: inicio, lte: fim } },
            select: { status: true, valorSessao: true },
        });

        let recebido   = 0;
        let previsto   = 0;
        let cancelado  = 0;

        for (const a of agendamentos) {
            const v = a.valorSessao ? Number(a.valorSessao) : 0;
            if (a.status === "REALIZADO")  recebido  += v;
            if (a.status === "AGENDADO")   previsto  += v;
            if (a.status === "CANCELADO")  cancelado += v;
        }

        return {
            success: true,
            dados: {
                recebido,
                previsto,
                cancelado,
                total: agendamentos.length,
                realizados: agendamentos.filter(a => a.status === "REALIZADO").length,
                agendados:  agendamentos.filter(a => a.status === "AGENDADO").length,
                canceladas: agendamentos.filter(a => a.status === "CANCELADO").length,
                remarcadas: agendamentos.filter(a => a.status === "REMARCADO").length,
            },
        };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// ── Listar pacientes do psicólogo ──────────────────────────────────────────
export async function buscarPacientesParaAgenda() {
    try {
        const psicologoId = await getPsicologoId();
        const pacientes = await prisma.paciente.findMany({
            where: { psicologoId },
            select: { id: true, nome: true },
            orderBy: { nome: "asc" },
        });
        return { success: true, dados: pacientes };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// ── Listar grupos terapêuticos do psicólogo ────────────────────────────────
export async function buscarGruposParaAgenda() {
    try {
        const psicologoId = await getPsicologoId();
        const grupos = await prisma.grupoTerapeutico.findMany({
            where: { psicologoId, ativo: true },
            select: { id: true, titulo: true, horario: true, diaSemana: true, duracaoSessao: true },
            orderBy: { titulo: "asc" },
        });
        return { success: true, dados: grupos };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
