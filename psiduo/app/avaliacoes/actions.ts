'use server';

import { prisma } from "@/lib/prisma";

export async function autenticarAvaliacao(cpf: string) {
    if (!cpf) return { success: false, error: "CPF obrigatório" };
    
    try {
        // Remove caracteres não numéricos
        const cpfLimpo = cpf.replace(/\D/g, "");
        
        // Busca paciente pelo CPF
        // Nota: Assumindo que CPF é único ou o primeiro serve.
        const paciente = await prisma.paciente.findFirst({
            where: { cpf: cpfLimpo },
            select: { id: true, nome: true }
        });

        if (!paciente) return { success: false, error: "Paciente não encontrado." };
        
        return { success: true, id: paciente.id, nome: paciente.nome };
    } catch (e) {
        console.error("Erro ao autenticar avaliação:", e);
        return { success: false, error: "Erro ao buscar paciente." };
    }
}
