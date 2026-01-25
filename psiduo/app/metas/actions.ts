"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface CriarMetaDTO {
  pacienteId: string;
  titulo: string;
  frequencia: 'DIARIO' | 'SEMANAL' | 'MENSAL' | 'UNICO';
  descricao?: string;
  diasSemana?: number[];
  diaMes?: number;
  dataInicio?: Date;
  dataFim?: Date;
}

export async function criarMeta(data: CriarMetaDTO) {
  try {
    const inicio = data.dataInicio ? new Date(data.dataInicio) : new Date();
    const dataInicioUTC = new Date(Date.UTC(inicio.getUTCFullYear(), inicio.getUTCMonth(), inicio.getUTCDate(), 0, 0, 0));

    let dataFimUTC = undefined;
    if (data.dataFim) {
      const fim = new Date(data.dataFim);
      dataFimUTC = new Date(Date.UTC(fim.getUTCFullYear(), fim.getUTCMonth(), fim.getUTCDate(), 23, 59, 59, 999));
    }

    await prisma.meta.create({
      data: {
        pacienteId: data.pacienteId,
        titulo: data.titulo,
        frequencia: data.frequencia,
        descricao: data.descricao,
        diasSemana: data.diasSemana || [],
        diaMes: data.diaMes,
        dataInicio: dataInicioUTC,
        dataFim: dataFimUTC
      }
    });
    revalidatePath(`/painel/pacientes/${data.pacienteId}`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar meta:", error);
    return { success: false, error: "Falha ao criar meta" };
  }
}

export async function excluirMeta(metaId: string) {
  try {
    await prisma.meta.delete({
      where: { id: metaId }
    });
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir meta:", error);
    return { success: false, error: "Falha ao excluir" };
  }
}

export async function atualizarMeta(metaId: string, data: Partial<CriarMetaDTO>) {
  try {
    const updateData: any = {
      titulo: data.titulo,
      frequencia: data.frequencia,
      diasSemana: data.diasSemana,
      diaMes: data.diaMes,
    };

    if (data.dataInicio) {
      const inicio = new Date(data.dataInicio);
      updateData.dataInicio = new Date(Date.UTC(inicio.getUTCFullYear(), inicio.getUTCMonth(), inicio.getUTCDate(), 0, 0, 0));
    }

    if (data.dataFim) {
      const fim = new Date(data.dataFim);
      updateData.dataFim = new Date(Date.UTC(fim.getUTCFullYear(), fim.getUTCMonth(), fim.getUTCDate(), 23, 59, 59, 999));
    }

    await prisma.meta.update({
      where: { id: metaId },
      data: updateData
    });
    if (data.pacienteId) {
      revalidatePath(`/painel/pacientes/${data.pacienteId}`);
    }
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar meta:", error);
    return { success: false, error: "Falha ao atualizar meta" };
  }
}

export async function buscarMetasPaciente(pacienteId: string) {
  try {
    const metas = await prisma.meta.findMany({
      where: { pacienteId },
      include: {
        _count: {
          select: { registros: true }
        },
        registros: {
          orderBy: { data: 'desc' },
          // take: 14 // Removed limit to show full history
        }
      },
      orderBy: { criadoEm: 'desc' }
    });
    return { success: true, metas };
  } catch (error) {
    console.error("Erro ao buscar metas:", error);
    return { success: false, metas: [] };
  }
}

// Para o Paciente (Via Token) - Com Filtro de Frequência
export async function buscarMetasPeloToken(token: string, dateISO?: string) {
  try {
    const paciente = await prisma.paciente.findUnique({
      where: { tokenAcesso: token },
      select: { id: true }
    });

    if (!paciente) return { success: false, error: "Paciente não encontrado" };

    const [year, month, day] = dateISO ? dateISO.split('-').map(Number) : [new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()];
    const dataRef = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

    // 1. Buscar TODAS as metas ativas
    const todasMetas = await prisma.meta.findMany({
      where: { 
        pacienteId: paciente.id,
        ativa: true
      },
      orderBy: { criadoEm: 'desc' }
    });

    // 2. Filtrar Logic (Check if applies to Reference Date)
    const metasData = todasMetas.filter(meta => {
        // Validação de Período em UTC
        const dateInicio = new Date(meta.dataInicio);
        const inicio = new Date(Date.UTC(dateInicio.getUTCFullYear(), dateInicio.getUTCMonth(), dateInicio.getUTCDate(), 0, 0, 0));
        
        if (dataRef < inicio) return false;

        if (meta.dataFim) {
            const dateFim = new Date(meta.dataFim);
            const fim = new Date(Date.UTC(dateFim.getUTCFullYear(), dateFim.getUTCMonth(), dateFim.getUTCDate(), 23, 59, 59, 999));
            if (dataRef > fim) return false;
        }

        // Validação de Recorrência
        if (meta.frequencia === 'DIARIO') return true;
        
        if (meta.frequencia === 'SEMANAL') {
            const diaSemana = dataRef.getUTCDay(); // 0-6 (0 é Domingo) em UTC
            return meta.diasSemana.includes(diaSemana);
        }

        if (meta.frequencia === 'MENSAL') {
            const diaMes = dataRef.getUTCDate();
            return meta.diaMes === diaMes;
        }

        if (meta.frequencia === 'UNICO') {
             // Logic: UNICO applies only to the specific start date
             return inicio.getTime() === dataRef.getTime();
        }

        return false;
    });

    // 3. Buscar status de feito NA DATA SELECIONADA
    const registrosData = await prisma.metaRegistro.findMany({
      where: {
        metaId: { in: metasData.map(m => m.id) },
        data: dataRef
      }
    });

    const metasComStatus = metasData.map(m => ({
      ...m,
      feitoHoje: registrosData.find(r => r.metaId === m.id)?.feito
    }));

    return { success: true, metas: metasComStatus };
  } catch (error) {
    console.error("Erro ao buscar metas pelo token:", error);
    return { success: false, error: "Erro interno" };
  }
}

export async function marcarMeta(metaId: string, feito: boolean, dataISO?: string) {
  try {
    const [year, month, day] = dataISO ? dataISO.split('-').map(Number) : [new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()];
    const dataRef = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

    // Upsert para garantir status (True ou False)
    // Se feito=false, agora SALVAMOS como false (não realizado) em vez de deletar
    await prisma.metaRegistro.upsert({
        where: {
            metaId_data: {
                metaId,
                data: dataRef
            }
        },
        update: { feito },
        create: {
            metaId,
            data: dataRef,
            feito
        }
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao marcar meta:", error);
    return { success: false, error: "Erro ao atualizar meta" };
  }
}

export async function alternarMetaHistorico(metaId: string, dataISO: string | Date) {
  try {
    const d = typeof dataISO === 'string' ? dataISO.split('-').map(Number) : [dataISO.getFullYear(), dataISO.getMonth() + 1, dataISO.getDate()];
    const data = new Date(Date.UTC(d[0], d[1] - 1, d[2], 0, 0, 0, 0));

    // Check if exists
    const existing = await prisma.metaRegistro.findFirst({
        where: {
            metaId,
            data
        }
    });

    if (existing) {
        await prisma.metaRegistro.delete({ where: { id: existing.id } });
    } else {
        await prisma.metaRegistro.create({
            data: {
                metaId,
                data,
                feito: true
            }
        });
    }
    return { success: true };
  } catch (error) {
    console.error("Erro ao alternar histórico:", error);
    return { success: false, error: "Falha ao atualizar histórico" };
  }
}
