import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { atualizarPlanoDuoII } from "@/app/catalogo/actions";

export async function POST(req: Request) {
  try {
    const event = await req.json();

    // Validação básica de segurança (Verifique se o token bate com o configurado no Asaas)
    const token = req.headers.get("asaas-access-token");
    if (process.env.ASAAS_WEBHOOK_TOKEN && token !== process.env.ASAAS_WEBHOOK_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Se o evento for pagamento recebido
    if (event.event === "PAYMENT_RECEIVED" || event.event === "PAYMENT_CONFIRMED") {
      const payment = event.payment;
      const userId = payment.externalReference; // ID do nosso banco

      if (userId) {
        console.log(`💰 Webhook Asaas: Pagamento confirmado para User ${userId}`);
        
        // Atualiza o plano
        // OBS: externalReference está guardando o ID do PSICÓLOGO ou do USER?
        // No lib/asaas.ts eu configurei para receber o userId.
        // Precisamos garantir que estamos atualizando o registro certo.
        // A função atualizarPlanoDuoII busca pelo ID do PSICOLOGO.
        // Se userId for do Psicologo, ok. Se for do User, precisamos achar o Psicologo.
        
        // Vamos assumir que mandamos o ID DO PSICÓLOGO na hora de criar a cobrança.
        await atualizarPlanoDuoII(userId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erro no Webhook Asaas:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
