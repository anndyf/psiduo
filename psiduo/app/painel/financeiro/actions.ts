"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

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

// ── Balanço detalhado do mês ────────────────────────────────────────────────
export async function buscarFinanceiroDetalhado(ano: number, mes: number) {
    try {
        const psicologoId = await getPsicologoId();
        const inicio = startOfMonth(new Date(ano, mes - 1, 1));
        const fim    = endOfMonth(new Date(ano, mes - 1, 1));

        const sessoes = await prisma.agendamento.findMany({
            where: {
                psicologoId,
                data: { gte: inicio, lte: fim },
                tipo: { not: "BLOQUEADO" },
            },
            include: {
                paciente: { select: { id: true, nome: true } },
                grupo:    { select: { id: true, titulo: true } },
            },
            orderBy: { data: "desc" },
        });

        // ── Resumo geral ────────────────────────────────────────────────────
        let recebido = 0, previsto = 0, cancelado = 0, semValor = 0;
        for (const s of sessoes) {
            const v = s.valorSessao ? Number(s.valorSessao) : 0;
            if (!v) { semValor++; continue; }
            if (s.status === "REALIZADO")  recebido  += v;
            if (s.status === "AGENDADO" || s.status === "REMARCADO") previsto += v;
            if (s.status === "CANCELADO")  cancelado += v;
        }

        // ── Por paciente ────────────────────────────────────────────────────
        const porPacienteMap: Record<string, {
            nome: string; recebido: number; previsto: number;
            cancelado: number; total: number;
        }> = {};

        for (const s of sessoes) {
            const key  = s.paciente?.id ?? s.grupo?.id ?? "outros";
            const nome = s.paciente?.nome ?? s.grupo?.titulo ?? "Sem vínculo";
            if (!porPacienteMap[key]) {
                porPacienteMap[key] = { nome, recebido: 0, previsto: 0, cancelado: 0, total: 0 };
            }
            const v = s.valorSessao ? Number(s.valorSessao) : 0;
            porPacienteMap[key].total++;
            if (s.status === "REALIZADO")  porPacienteMap[key].recebido  += v;
            if (s.status === "AGENDADO" || s.status === "REMARCADO") porPacienteMap[key].previsto += v;
            if (s.status === "CANCELADO")  porPacienteMap[key].cancelado += v;
        }

        const porPaciente = Object.values(porPacienteMap)
            .sort((a, b) => (b.recebido + b.previsto) - (a.recebido + a.previsto));

        // ── Sessões serializadas ─────────────────────────────────────────────
        const lista = sessoes.map(s => ({
            id:          s.id,
            titulo:      s.titulo,
            data:        s.data.toISOString(),
            duracao:     s.duracao,
            status:      s.status,
            tipo:        s.tipo,
            valorSessao: s.valorSessao ? Number(s.valorSessao) : null,
            paciente:    s.paciente ?? null,
            grupo:       s.grupo ?? null,
        }));

        return {
            success: true,
            dados: {
                resumo: {
                    recebido, previsto, cancelado,
                    total: recebido + previsto,
                    sessoes: sessoes.length,
                    realizadas: sessoes.filter(s => s.status === "REALIZADO").length,
                    agendadas:  sessoes.filter(s => s.status === "AGENDADO" || s.status === "REMARCADO").length,
                    canceladas: sessoes.filter(s => s.status === "CANCELADO").length,
                    semValor,
                },
                porPaciente,
                lista,
            },
        };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// ── Evolução mensal (últimos 6 meses) ───────────────────────────────────────
export async function buscarEvolucaoMensal() {
    try {
        const psicologoId = await getPsicologoId();
        const meses: { label: string; recebido: number; previsto: number }[] = [];

        for (let i = 5; i >= 0; i--) {
            const ref   = subMonths(new Date(), i);
            const inicio = startOfMonth(ref);
            const fim    = endOfMonth(ref);

            const sessoes = await prisma.agendamento.findMany({
                where: {
                    psicologoId,
                    data: { gte: inicio, lte: fim },
                    tipo: { not: "BLOQUEADO" },
                },
                select: { status: true, valorSessao: true },
            });

            let recebido = 0, previsto = 0;
            for (const s of sessoes) {
                const v = s.valorSessao ? Number(s.valorSessao) : 0;
                if (s.status === "REALIZADO") recebido += v;
                if (s.status === "AGENDADO" || s.status === "REMARCADO") previsto += v;
            }

            meses.push({
                label: format(ref, "MMM/yy").replace(".", ""),
                recebido,
                previsto,
            });
        }

        return { success: true, dados: meses };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
