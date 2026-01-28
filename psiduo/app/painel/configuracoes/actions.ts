"use server";

import { prisma } from "@/lib/prisma";
import { cancelSubscription, getSubscription, updateSubscriptionCard } from "@/lib/asaas";
import { revalidatePath } from "next/cache";

// ... (existing code)

export async function atualizarCartaoAssinatura(email: string, cardData: any) {
    try {
         const user = await prisma.user.findUnique({
            where: { email },
            include: { psicologo: true }
        });

        if (!user || !user.psicologo || !user.psicologo.subscriptionId) {
            return { success: false, error: "Assinatura não encontrada." };
        }

        const holderInfo = {
            name: cardData.holderName,
            email: user.email,
            cpfCnpj: user.psicologo.cpf || "", 
            phone: user.psicologo.whatsapp,
            mobilePhone: user.psicologo.whatsapp
        };

        const res = await updateSubscriptionCard(user.psicologo.subscriptionId, cardData, holderInfo);
        
        if (res.success) {
            revalidatePath("/painel/configuracoes");
            return { success: true };
        } else {
            return { success: false, error: res.error };
        }

    } catch (e) {
        return { success: false, error: "Erro ao atualizar cartão." };
    }
}

export async function cancelarAssinatura(email: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { psicologo: true }
        });

        if (!user || !user.psicologo) {
            return { success: false, error: "Usuário não encontrado" };
        }

        const subId = user.psicologo.subscriptionId;

        if (subId) {
             // Tentar cancelar no Asaas
             const res = await cancelSubscription(subId);
             if (!res.success) {
                 return { success: false, error: res.error };
             }
        }
        
        // Atualizar Banco (Remove vínculo de recorrência)
        await prisma.psicologo.update({
            where: { id: user.psicologo.id },
            data: {
                subscriptionId: null, 
            }
        });

        revalidatePath("/painel/configuracoes");
        return { success: true };

    } catch (e: any) {
        console.error("Erro Action Cancelar:", e);
        return { success: false, error: "Erro interno ao cancelar." };
    }
}

export async function buscarConfiguracoes(email: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { psicologo: true }
        });

        if (!user || !user.psicologo) {
            return { success: false, error: "Usuário não encontrado" };
        }

        let asaasData = null;
        if (user.psicologo.subscriptionId) {
            const subRes = await getSubscription(user.psicologo.subscriptionId);
            if (subRes.success && subRes.data) {
                asaasData = {
                    status: subRes.data.status,
                    nextDueDate: subRes.data.nextDueDate,
                    billingType: subRes.data.billingType,
                    creditCard: subRes.data.creditCard ? {
                        last4: subRes.data.creditCard.creditCardNumber ? subRes.data.creditCard.creditCardNumber.slice(-4) : "xxxx",
                        brand: subRes.data.creditCard.creditCardBrand
                    } : null
                };
            }
        }

        // Buscar Histórico de Compras (AuditLog)
        const historicoCompras = await prisma.auditLog.findMany({
            where: {
                userId: email, // AuditLog usa email como ID baseado nos actions anteriores
                action: { in: ["COMPRA_PACOTE_PACIENTES", "COMPRA_PACOTE_PACIENTES_CARTAO"] },
                success: true
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        // Contar Pacientes Atuais
        const totalPacientes = await prisma.paciente.count({
            where: { psicologoId: user.psicologo.id }
        });

        const limitePlano = user.psicologo.plano === 'DUO_II' ? 10 : 1;

        return {
            success: true,
            dados: {
                nome: user.psicologo.nome,
                plano: user.psicologo.plano,
                planoValidade: user.psicologo.planoValidade,
                subscriptionId: user.psicologo.subscriptionId,
                limiteExtraPacientes: user.psicologo.limiteExtraPacientes,
                totalPacientes,
                limitePlano,
                asaas: asaasData,
                historicoCompras
            }
        };

    } catch (e) {
        return { success: false, error: "Erro ao buscar dados." };
    }
}
