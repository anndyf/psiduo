import { prisma } from "@/lib/prisma";

/**
 * Verifica o status da assinatura do usuário.
 * Se o plano for DUO_II mas a validade expirou, faz o downgrade automático para DUO_I.
 * Isso garante que usuários que cancelaram mas ainda têm tempo de ciclo mantenham o acesso
 * até o fim do período pago.
 */
export async function checkSubscriptionStatus(userId: string) {
  if (!userId) return null;

  try {
    const psi = await prisma.psicologo.findUnique({
      where: { userId },
      select: { id: true, plano: true, planoValidade: true }
    });

    if (!psi) return null;

    // Se é DUO_II e tem data de validade
    if (psi.plano === "DUO_II" && psi.planoValidade) {
        const now = new Date();
        const validade = new Date(psi.planoValidade);

        // Se a validade já passou
        if (validade < now) {
            console.log(`📉 Plano expirado para User ${userId}. Downgrading para DUO_I...`);
            
            await prisma.psicologo.update({
                where: { id: psi.id },
                data: {
                    plano: "DUO_I",
                    // Mantemos a data de validade histórica ou zeramos?
                    // Melhor manter como registro de quando expirou, ou limpar se quiser.
                    // Vamos manter para histórico.
                }
            });
            return "DUO_I";
        }
    }

    return psi.plano;

  } catch (error) {
    console.error("Erro ao verificar status assinatura:", error);
    return null;
  }
}
