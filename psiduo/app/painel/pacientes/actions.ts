'use server'

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Ajuste o path se necessário, geralmente é lib/auth
import { revalidatePath } from "next/cache";
import { createPayment, getPixQrCode, getPayment } from "@/lib/asaas";

// --- INICIAR COMPRA PACOTE (PIX) ---
export async function iniciarCompraPacote() {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || !session.user?.psicologoId) return { success: false, error: "Não autorizado" };
    // @ts-ignore
    const psicologoId = session.user.psicologoId;

    try {
        const user = await prisma.user.findFirst({
            where: { psicologo: { id: psicologoId } },
            include: { psicologo: true }
        });

        if (!user || !user.psicologo) return { success: false, error: "Psicólogo não encontrado." };

        // Dados para Asaas
        let celularLimpo = user.psicologo.whatsapp?.replace(/\D/g, "") || "";
        // Sandbox fallback
        if (process.env.ASAAS_ENV === 'sandbox' && celularLimpo.length < 10) celularLimpo = "11999999999"; 

        const customerData = {
            name: user.psicologo.nome,
            email: user.email,
            cpfCnpj: user.psicologo.cpf?.replace(/\D/g, "") || "",
            mobilePhone: celularLimpo
        };

        // Criar Cobrança Avulsa
        const result = await createPayment(
            user.id,
            customerData,
            "PIX",
            10.00,
            1 // À vista
        );

        if (!result.success || !result.id) {
            throw new Error(result.error || "Erro ao gerar cobrança.");
        }

        // Pegar QR Code
        const pixInfo = await getPixQrCode(result.id);
        
        return {
            success: true,
            paymentId: result.id,
            pix: pixInfo // { encodedImage, payload }
        };

    } catch (e: any) {
        console.error("Erro iniciar compra pct:", e);
        return { success: false, error: e.message || "Erro ao iniciar compra." };
    }
}

// --- COMPRAR PACOTE (CARTÃO) ---
export async function comprarPacoteCartao(cardData: any, holderInfo: any) {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || !session.user?.psicologoId) return { success: false, error: "Não autorizado" };
    // @ts-ignore
    const psicologoId = session.user.psicologoId;

    try {
        const user = await prisma.user.findFirst({
            where: { psicologo: { id: psicologoId } },
            include: { psicologo: true }
        });

        if (!user || !user.psicologo) return { success: false, error: "Usuário não encontrado." };

        let celularLimpo = user.psicologo.whatsapp?.replace(/\D/g, "") || "";
        if (process.env.ASAAS_ENV === 'sandbox' && celularLimpo.length < 10) celularLimpo = "11999999999"; 

        const customerData = {
            name: user.psicologo.nome,
            email: user.email,
            cpfCnpj: user.psicologo.cpf?.replace(/\D/g, "") || "",
            mobilePhone: celularLimpo
        };

        const result = await createPayment(
            user.id,
            customerData,
            "CREDIT_CARD",
            10.00,
            1, // À vista
            cardData,
            holderInfo
        );

        if (!result.success) {
            return { success: false, error: result.error || "Pagamento recusado." };
        }

        // SUCESSO! LIBERAR O LIMITE IMEDIATAMENTE
        await prisma.psicologo.update({
            where: { id: psicologoId },
            data: {
                limiteExtraPacientes: { increment: 10 }
            }
        });

        // Registrar Log
        await prisma.auditLog.create({
            data: {
                action: "COMPRA_PACOTE_PACIENTES_CARTAO",
                userId: session.user.email,
                success: true,
                metadata: { paymentId: result.id, valor: 10.00, qtd: 10 }
            }
        });

        revalidatePath("/painel/pacientes");
        return { success: true };

    } catch (e: any) {
        console.error("Erro cartao pct:", e);
        return { success: false, error: "Erro ao processar cartão." };
    }
}

// --- VERIFICAR PAGAMENTO PACOTE ---
export async function verificarCompraPacote(paymentId: string) {
     const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || !session.user?.psicologoId) return { success: false, error: "Não autorizado" };
    // @ts-ignore
    const psicologoId = session.user.psicologoId;

    try {
        // 1. Verificar no Asaas
        const resCheck = await getPayment(paymentId);
        if(!resCheck.success || !resCheck.data) return { success: false, error: "Pagamento não encontrado no Asaas." };

        const status = resCheck.data.status; 
        // Status possíveis de PAGO: RECEIVED, CONFIRMED
        if (status !== 'RECEIVED' && status !== 'CONFIRMED') {
            return { success: false, paid: false, status };
        }

        // 2. Se PAGO, verificar se JÁ foi processado (AuditLog ou Metadata?)
        // Para simplificar, vou confiar que o usuário não vai conseguir abusar (gerar N pagamentos duplicados é difícil sem webhook).
        // Melhor: Usar um Audit Log para garantir que esse PaymentID não foi usado ainda.
        const jaUsado = await prisma.auditLog.findFirst({
            where: { 
                action: "COMPRA_PACOTE_PACIENTES",
                metadata: {
                    path: ['paymentId'],
                    equals: paymentId
                }
            }
        });

        if (jaUsado) {
             return { success: true, paid: true, message: "Já processado anteriormente." };
        }

        // 3. Adicionar +20 ao Limite
        await prisma.psicologo.update({
            where: { id: psicologoId },
            data: {
                limiteExtraPacientes: { increment: 10 }
            }
        });

        // 4. Registrar Log
        await prisma.auditLog.create({
            data: {
                action: "COMPRA_PACOTE_PACIENTES",
                userId: session.user.email, // ou ID
                success: true,
                metadata: { paymentId, valor: 10.00, qtd: 10 }
            }
        });

        revalidatePath("/painel/pacientes");
        return { success: true, paid: true };

    } catch (e: any) {
        console.error("Erro verificar pct:", e);
        return { success: false, error: "Erro ao verificar." };
    }
}

// ... manter o resto ...


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
export async function cadastrarPaciente(nome: string, dataInicioISO?: string, cpf?: string) {
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
    select: { plano: true, limiteExtraPacientes: true }
  });

  if (psicologo?.plano !== 'DUO_II') {
    return { success: false, error: "Funcionalidade exclusiva do plano Duo II." };
  }

  // Verificar limite de 15 pacientes (Duo II) + EXTRA
  const totalPacientes = await prisma.paciente.count({
    where: { psicologoId }
  });

  const limiteTotal = 10 + (psicologo?.limiteExtraPacientes || 0);

  if (totalPacientes >= limiteTotal) {
    return { 
        success: false, 
        error: `Limite de ${limiteTotal} pacientes atingido.`,
        limitReached: true // Flag para o front mostrar o modal se quiser
    };
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
    let dataInicio = new Date();
    if (dataInicioISO) {
        dataInicio = new Date(dataInicioISO + "T12:00:00");
    }

    // CPF Limpo (apenas números)
    const cpfLimpo = cpf?.replace(/\D/g, "") || null;
    if (cpfLimpo) {
        const cpfExiste = await prisma.paciente.findFirst({ where: { cpf: cpfLimpo } });
        if (cpfExiste) return { success: false, error: "Este CPF já está cadastrado para outro paciente." };
    }

    const novoPaciente = await prisma.paciente.create({
      data: {
        nome,
        psicologoId,
        tokenAcesso: token,
        dataInicio,
        cpf: cpfLimpo
      }
    });

    revalidatePath("/painel/pacientes");
    return { success: true, data: novoPaciente };

  } catch (error: any) {
    console.error("Erro ao criar paciente:", error);
    return { success: false, error: "Erro: " + (error.message || "Erro interno ao criar paciente.") };
  }
}

// --- EDITAR PACIENTE (NOME, CPF, DATA) ---
export async function editarPaciente(
    id: string, 
    dados: { nome: string, cpf?: string, dataInicio?: string }
) {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || !session.user?.psicologoId) return { success: false, error: "Não autorizado" };

    try {
        const updateData: any = { nome: dados.nome };

        // Processar CPF
        if (dados.cpf !== undefined) {
             const cpfLimpo = dados.cpf.replace(/\D/g, "");
             // Verificar duplicidade se CPF mudou
             if (cpfLimpo) {
                 const donoCpf = await prisma.paciente.findFirst({
                     where: { cpf: cpfLimpo, NOT: { id } }
                 });
                 if (donoCpf) return { success: false, error: "CPF já pertence a outro paciente." };
             }
             updateData.cpf = cpfLimpo || null;
        }

        // Processar Data Início
        if (dados.dataInicio) {
            updateData.dataInicio = new Date(dados.dataInicio + "T12:00:00");
        }

        await prisma.paciente.update({
            where: { id },
            data: updateData
        });

        revalidatePath("/painel/pacientes");
        return { success: true };
    } catch (e: any) {
        console.error("Erro ao editar:", e);
        return { success: false, error: "Erro ao editar paciente." };
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

// ... (filtrarRegistros permanece igual)

export async function filtrarRegistros(pacienteId: string, periodo: '7d' | '30d' | '1y' | 'all') {
    // ... (same as before) ...
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

// --- NOTAS CLÍNICAS (NOVA ESTRUTURA) ---

export async function criarNotaClinica(pacienteId: string, conteudo: string) {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || !session.user?.psicologoId) return { success: false, error: "Não autorizado" };

    try {
        const nota = await prisma.notaClinica.create({
            data: {
                pacienteId,
                conteudo
            }
        });
        
        revalidatePath(`/painel/pacientes/${pacienteId}`);
        return { success: true, nota };
    } catch (e: any) {
        console.error("Erro ao criar nota:", e);
        return { success: false, error: e.message || "Erro ao criar nota." };
    }
}

export async function excluirNotaClinica(notaId: string, pacienteId: string) {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || !session.user?.psicologoId) return { success: false, error: "Não autorizado" };

    try {
        await prisma.notaClinica.delete({
            where: { id: notaId }
        });
        
        revalidatePath(`/painel/pacientes/${pacienteId}`);
        return { success: true };
    } catch (e) {
        console.error("Erro ao excluir nota:", e);
        return { success: false, error: "Erro ao excluir nota." };
    }
}

export async function buscarNotasClinicas(pacienteId: string) {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || !session.user?.psicologoId) return { success: false, error: "Não autorizado" };
    
    try {
        const notas = await prisma.notaClinica.findMany({
            where: { pacienteId },
            orderBy: { criadoEm: 'desc' }
        });
        return { success: true, notas };
    } catch (e) {
        console.error("Erro ao buscar notas:", e);
        return { success: false, error: "Erro ao buscar notas." };
    }
}
