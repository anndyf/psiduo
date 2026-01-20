'use server'

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Ajuste o path se necessário, geralmente é lib/auth
import { revalidatePath } from "next/cache";

// Helper para gerar token seguro
function generateToken(length = 12) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// --- CRIAR PACIENTE (DUO II EXCLUSIVE) ---
export async function cadastrarPaciente(nome: string, dataInicioISO?: string) {
  const session = await getServerSession(authOptions);
  
  // @ts-ignore
  if (!session || !session.user?.psicologoId) {
    return { success: false, error: "Não autorizado." };
  }
  // @ts-ignore
  const psicologoId = session.user.psicologoId;

  // Verificar Plano DUO II
  const psicologo = await prisma.psicologo.findUnique({
    where: { id: psicologoId },
    select: { plano: true }
  });

  if (psicologo?.plano !== 'DUO_II') {
    return { success: false, error: "Funcionalidade exclusiva do plano Duo II." };
  }

  try {
    let token = generateToken();
    let tokenExiste = true;
    
    while (tokenExiste) {
      const check = await prisma.paciente.findUnique({ where: { tokenAcesso: token } });
      if (!check) tokenExiste = false;
      else token = generateToken();
    }

    // Processar Data Início
    // Se vier string, converte. Se não, usa now().
    // Ajuste: Definir hora para meio-dia (12:00) para evitar problemas de fuso (UTC-3 vs UTC)
    // Se criar como "YYYY-MM-DD", vira UTC 00h -> Local anterior 21h.
    // Usando "YYYY-MM-DDT12:00:00", vira Local 12h -> UTC 15h. Mantém o dia correto.
    let dataInicio = new Date();
    if (dataInicioISO) {
        dataInicio = new Date(dataInicioISO + "T12:00:00");
    }

    const novoPaciente = await prisma.paciente.create({
      data: {
        nome,
        psicologoId,
        tokenAcesso: token,
        dataInicio
      }
    });

    revalidatePath("/painel/pacientes");
    return { success: true, data: novoPaciente };

  } catch (error: any) {
    console.error("Erro ao criar paciente:", error);
    return { success: false, error: "Erro: " + (error.message || "Erro interno ao criar paciente.") };
  }
}

// --- RENOMEAR PACIENTE ---
export async function renomearPaciente(id: string, novoNome: string) {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || !session.user?.psicologoId) return { success: false, error: "Não autorizado" };

    try {
        await prisma.paciente.update({
            where: { id },
            data: { nome: novoNome }
        });
        revalidatePath("/painel/pacientes");
        return { success: true };
    } catch (e) {
        return { success: false, error: "Erro ao renomear." };
    }
}

// --- LISTAR PACIENTES (TODOS: ATIVOS E PAUSADOS) ---
export async function listarPacientes() {
  const session = await getServerSession(authOptions);
  
  // @ts-ignore
  if (!session || !session.user?.psicologoId) {
    return [];
  }
  // @ts-ignore
  const psicologoId = session.user.psicologoId;

  const pacientes = await prisma.paciente.findMany({
    where: { 
        psicologoId
        // Removido 'ativo: true' para listar pausados também
    },
    orderBy: [
        { ativo: 'desc' }, // Ativos primeiro
        { criadoEm: 'desc' }
    ],
    include: {
        _count: {
            select: { registros: true }
        },
        registros: {
            orderBy: { data: 'desc' },
            take: 1, 
            select: { data: true, humor: true }
        }
    }
  });

  return pacientes;
}

// --- PAUSAR / REATIVAR PACIENTE ---
export async function alternarStatusPaciente(id: string, ativo: boolean) {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || !session.user?.psicologoId) return { success: false };

    try {
        await prisma.paciente.update({
            where: { id },
            data: { ativo }
        });
        revalidatePath("/painel/pacientes");
        return { success: true };
    } catch (e) {
        return { success: false, error: "Erro ao atualizar status." };
    }
}

// --- EXCLUIR PACIENTE (PERMANENTE) ---
export async function excluirPaciente(id: string) {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || !session.user?.psicologoId) return { success: false };

    try {
        await prisma.paciente.delete({
            where: { id }
        });
        revalidatePath("/painel/pacientes");
        return { success: true };
    } catch (e) {
        console.error("Erro ao excluir:", e);
        return { success: false, error: "Erro ao excluir." };
    }
}

// --- BUSCAR DADOS DASHBOARD (DETALHADO) ---
export async function buscarDadosDashboard(pacienteId: string) {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || !session.user?.psicologoId) return { success: false, error: "Não autorizado" };

    try {
        const paciente = await prisma.paciente.findUnique({
            where: { id: pacienteId },
            include: { 
                 _count: { select: { registros: true } }
            }
        });

        // @ts-ignore
        if (!paciente || paciente.psicologoId !== session.user.psicologoId) {
            return { success: false, error: "Paciente não encontrado ou sem permissão." };
        }

        // Buscar últimos 7 dias (Semana) para o Gráfico Inicial
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 7); 
        startDate.setHours(0,0,0,0); 

        const registros = await prisma.registroDiario.findMany({
            where: {
                pacienteId,
                data: { gte: startDate }
            },
            orderBy: { data: 'asc' }
        });

        // Buscar TODOS os registros para o Histórico Detalhado
        const registrosCompletos = await prisma.registroDiario.findMany({
            where: { pacienteId },
            orderBy: { data: 'asc' } // Ou desc, dependendo de como quer exibir
        });

        return { success: true, paciente, registros, registrosCompletos };

    } catch (error) {
        console.error("Erro dashboard:", error);
        return { success: false, error: "Erro interno." };
    }
}

// --- FILTRAR REGISTROS (NOVA ACTION) ---
export async function filtrarRegistros(pacienteId: string, periodo: '7d' | '30d' | '1y' | 'all') {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || !session.user?.psicologoId) return { success: false, error: "Não autorizado" };

    try {
        const whereClause: any = { pacienteId };
        const now = new Date();
        
        if (periodo === '7d') {
            const start = new Date();
            start.setDate(now.getDate() - 7);
            start.setHours(0,0,0,0);
            whereClause.data = { gte: start };
        } else if (periodo === '30d') {
            const start = new Date();
            start.setDate(now.getDate() - 30);
            start.setHours(0,0,0,0);
            whereClause.data = { gte: start };
        } else if (periodo === '1y') {
            const start = new Date();
            start.setFullYear(now.getFullYear() - 1);
            start.setHours(0,0,0,0);
            whereClause.data = { gte: start };
        }
        // 'all' não adiciona filtro de data, pega tudo

        const registros = await prisma.registroDiario.findMany({
            where: whereClause,
            orderBy: { data: 'asc' }
        });

        return { success: true, registros };

    } catch (e) {
        console.error("Erro ao filtrar:", e);
        return { success: false, error: "Erro ao filtrar registros." };
    }
}
