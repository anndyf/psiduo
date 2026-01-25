'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- VALIDAR TOKEN ---
export async function validarToken(token: string) {
    if (!token) return { success: false };

    try {
        const paciente = await prisma.paciente.findUnique({
            where: { tokenAcesso: token },
            select: { 
                id: true, 
                nome: true, 
                dataInicio: true, 
                ativo: true, // Added field
                psicologo: { select: { nome: true } } 
            }
        });

        if (!paciente) return { success: false, error: "Token inválido" };
        
        return { success: true, paciente };
    } catch (e) {
        return { success: false, error: "Erro ao validar" };
    }
}


// --- AUTENTICAR VIA CPF ---
export async function autenticarPaciente(cpf: string) {
    if (!cpf) return { success: false, error: "CPF obrigatório" };
    
    try {
        const cpfLimpo = cpf.replace(/\D/g, "");
        const paciente = await prisma.paciente.findFirst({
            where: { cpf: cpfLimpo },
            select: { tokenAcesso: true }
        });

        if (!paciente) return { success: false, error: "CPF não encontrado." };
        
        return { success: true, token: paciente.tokenAcesso };
    } catch (e) {
        console.error("Erro ao autenticar:", e);
        return { success: false, error: "Erro ao buscar paciente." };
    }
}

// --- SALVAR REGISTRO (UPSERT MANUAL) ---
export async function salvarRegistro(token: string, dataISO: string, dados: {
    humor: number,
    sono: number,
    tags: string[],
    notas: string
}) {
    // 1. Validar Paciente
    const check = await validatingTokenInternal(token);
    if (!check) return { success: false, error: "Token inválido" };

    try {
        // 2. Normalizar Data (UTC Midnight) Manually
        // O input dataISO deve vir como YYYY-MM-DD
        const [ano, mes, dia] = dataISO.split('-').map(Number);
        
        // Criar data UTC pura direto dos componentes
        // Note: mes no Date.UTC é 0-indexado (0 = Janeiro)
        const dataAlvo = new Date(Date.UTC(ano, mes - 1, dia));

        // 3. Buscar se já existe registro nesse dia para esse paciente
        // Como DateTime no banco tem hora, precisamos buscar por range do dia OU confiar na normalização exata
        // Melhor buscar exato, assumindo que sempre salvaremos normalizado zerado.
        
        const registroExistente = await prisma.registroDiario.findFirst({
            where: {
                pacienteId: check.id,
                data: dataAlvo // Prisma compara exato se passar Date object
            }
        });

        if (registroExistente) {
            // Update
            await prisma.registroDiario.update({
                where: { id: registroExistente.id },
                data: {
                    humor: dados.humor,
                    sono: dados.sono,
                    tags: dados.tags,
                    notas: dados.notas,
                }
            });
        } else {
            // Create
            await prisma.registroDiario.create({
                data: {
                    pacienteId: check.id,
                    data: dataAlvo,
                    humor: dados.humor,
                    sono: dados.sono,
                    tags: dados.tags,
                    notas: dados.notas,
                }
            });
        }

        revalidatePath(`/diario/${token}`);
        return { success: true };

    } catch (error) {
        console.error("Erro ao salvar diário:", error);
        return { success: false, error: "Erro ao salvar." };
    }
}

// --- BUSCAR HISTÓRICO MENSAL ---
export async function buscarHistorico(token: string, ano: number, mes: number) { // mes 0-11
    const check = await validatingTokenInternal(token);
    if (!check) return [];

    const inicio = new Date(Date.UTC(ano, mes, 1));
    const fim = new Date(Date.UTC(ano, mes + 1, 0)); // Último dia do mês

    const registros = await prisma.registroDiario.findMany({
        where: {
            pacienteId: check.id,
            data: {
                gte: inicio,
                lte: fim
            }
        },
        orderBy: { data: 'asc' }
    });
    
    // Retornamos datas formatadas para facilitar front
    return registros.map(r => ({
        ...r,
        dia: r.data.getUTCDate()
    }));
}

// Helper interno para não expor server action desnecessária
async function validatingTokenInternal(token: string) {
    return await prisma.paciente.findUnique({
        where: { tokenAcesso: token },
        select: { id: true }
    });
}
