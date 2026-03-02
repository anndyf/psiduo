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
        
        // Buscar o Psicologo através do User ID
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { psicologo: true }
        });

        if (user && user.psicologo) {
             // Calcular nova validade (30 dias a partir de agora)
             const novaValidade = new Date();
             novaValidade.setDate(novaValidade.getDate() + 30); // Adiciona 30 dias

             await atualizarPlanoDuoII(user.psicologo.id, novaValidade);
        } else {
             console.error(`Webhook Erro: Usuário ${userId} não encontrado ou sem perfil de psicólogo.`);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erro no Webhook Asaas:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
