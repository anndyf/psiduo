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
        // 2. Normalizar Data (UTC Noon) Manually to avoid Timezone shifts (Midnight vs Previous Day)
        // O input dataISO deve vir como YYYY-MM-DD
        const [ano, mes, dia] = dataISO.split('-').map(Number);
        
        // Ranges para busca (O dia inteiro em UTC)
        const startOfDay = new Date(Date.UTC(ano, mes - 1, dia, 0, 0, 0));
        const endOfDay = new Date(Date.UTC(ano, mes - 1, dia, 23, 59, 59, 999));

        // Data Alvo para Salvar (Meio-dia UTC)
        // Isso garante que mesmo com shifts de timezone (-3, +3), continue no mesmo dia
        const dataSalvar = new Date(Date.UTC(ano, mes - 1, dia, 12, 0, 0));

        // 3. Buscar se já existe registro nesse dia para esse paciente
        const registroExistente = await prisma.registroDiario.findFirst({
            where: {
                pacienteId: check.id,
                data: {
                    gte: startOfDay,
                    lte: endOfDay
                }
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
                    data: dataSalvar // Atualiza para Noon UTC se não estiver
                }
            });
        } else {
            // Create
            await prisma.registroDiario.create({
                data: {
                    pacienteId: check.id,
                    data: dataSalvar,
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

    const inicio = new Date(Date.UTC(ano, mes, 1, 0, 0, 0));
    const fim = new Date(Date.UTC(ano, mes + 1, 0, 23, 59, 59, 999)); // Último dia do mês (Noite)

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
