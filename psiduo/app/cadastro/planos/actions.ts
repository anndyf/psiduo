"use server";

import { prisma } from "@/lib/prisma";
import { createSubscription, getPixQrCode } from "@/lib/asaas";

// PREÇOS
const PRICE_MONTHLY = 39.99;
const PRICE_YEARLY = 429.90;

export async function gerarAssinaturaPix(email: string, interval: "MONTHLY" | "YEARLY" = "MONTHLY", cpf: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { psicologo: true }
    });

    if (!user || !user.psicologo) {
      throw new Error("Usuário não encontrado.");
    }

    const userId = user.id;

    let celularLimpo = user.psicologo.whatsapp?.replace(/\D/g, "") || "";
    if (process.env.ASAAS_ENV === 'sandbox' && celularLimpo.length < 10) {
        celularLimpo = "11999999999"; 
    }

    const customerData = {
        name: user.psicologo.nome,
        email: user.email,
        cpfCnpj: cpf, 
        mobilePhone: celularLimpo 
    };

    // 30 DIAS DE TESTE GRÁTIS
    // A primeira cobrança será agendada para daqui a 30 dias
    const price = interval === "MONTHLY" ? PRICE_MONTHLY : PRICE_YEARLY;
    const now = new Date();
    const trialDate = new Date(now);
    trialDate.setDate(trialDate.getDate() + 30);
    const nextDueDate = trialDate.toISOString().split('T')[0];

    // Cria a assinatura com vencimento futuro
    // createSubscription params: userId, customerData, billingType, value, cycle, cardData, holderInfo, nextDueDate
    const result = await createSubscription(
        userId, 
        customerData, 
        "PIX", 
        price, 
        interval,
        undefined, // cardData
        undefined, // holderInfo
        nextDueDate
    );

    if (!result.success) {
        throw new Error(result.error || "Erro ao criar assinatura.");
    }

    // Calcular Validade do Acesso (30 dias de trial + 5 dias de carência para pagamento)
    const validadeAcesso = new Date(now);
    validadeAcesso.setDate(validadeAcesso.getDate() + 35); 

    // Salvar Dados
    await prisma.psicologo.update({
        where: { id: user.psicologo.id },
        data: { 
            plano: "DUO_II",
            cpf: cpf,
            subscriptionId: (result as any).subscriptionId || null, 
            planoValidade: validadeAcesso,
            ciclo: interval,
            dataInicioPlano: now
        }
    });

    // Se for PIX, precisamos do ID da primeira cobrança (paymentId retornado pelo createSubscription)
    const paymentId = (result as any).paymentId;

    if (!paymentId) {
        return { success: true, pix: null, message: "Assinatura criada! Verifique seu email." };
    }

    const pixQrCode = await getPixQrCode(paymentId);
    
    if (!pixQrCode) {
         return { success: true, pix: null, message: "Assinatura criada! Verifique seu email." };
    }

    return {
        success: true,
        pix: {
            copiaCola: pixQrCode.payload,
            imagem: pixQrCode.encodedImage
        }
    };

  } catch (error: any) {
    console.error("Erro Action PIX:", error);
    return { success: false, error: error.message };
  }
}

export async function gerarAssinaturaCartao(
    email: string, 
    cardData: any, 
    addressData: any, 
    interval: "MONTHLY" | "YEARLY" = "MONTHLY", 
    cpf: string,
    installments: number = 1
) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { psicologo: true }
    });

    if (!user || !user.psicologo) {
      throw new Error("Usuário não encontrado.");
    }

    let celularLimpo = user.psicologo.whatsapp?.replace(/\D/g, "") || "";
    if (process.env.ASAAS_ENV === 'sandbox' && celularLimpo.length < 10) {
        celularLimpo = "11999999999"; 
    }

    const customerData = {
        name: user.psicologo.nome,
        email: user.email,
        cpfCnpj: cpf, 
        mobilePhone: celularLimpo 
    };

    const holderInfo = {
        name: cardData.holderName,
        email: user.email,
        cpfCnpj: cpf,
        postalCode: addressData.postalCode,
        addressNumber: addressData.addressNumber,
        phone: celularLimpo,
        mobilePhone: celularLimpo
    };

    // 30 DIAS DE TESTE GRÁTIS
    const price = interval === "MONTHLY" ? PRICE_MONTHLY : PRICE_YEARLY;
    const now = new Date();
    const trialDate = new Date(now);
    trialDate.setDate(trialDate.getDate() + 30);
    const nextDueDate = trialDate.toISOString().split('T')[0];
    
    const result = await createSubscription(
        user.id, 
        customerData, 
        "CREDIT_CARD", 
        price, 
        interval, // "MONTHLY" ou "YEARLY"
        cardData, 
        holderInfo,
        nextDueDate
    );

    if (!result.success) {
        return { success: false, error: result.error };
    }

    // Calcular Validade do Acesso (30 dias de trial + 5 dias de carência)
    const validadeAcesso = new Date(now);
    validadeAcesso.setDate(validadeAcesso.getDate() + 35);

    // SUCESSO! LIBERAR O PLANO IMEDIATAMENTE + SALVAR DADOS
    await prisma.psicologo.update({
        where: { id: user.psicologo.id },
        data: { 
            plano: "DUO_II",
            cpf: cpf,
            subscriptionId: (result as any).subscriptionId || null,
            planoValidade: validadeAcesso,
            ciclo: interval,
            dataInicioPlano: now
        }
    });

    return { success: true, status: result.status };

  } catch (error: any) {
    console.error("Erro Action Cartao:", error);
    return { success: false, error: error.message };
  }
}
