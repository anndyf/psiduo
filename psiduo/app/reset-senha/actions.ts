"use server";

import { prisma } from "@/lib/prisma";
import { enviarEmailRecuperacao } from "@/lib/mail";
import { randomBytes } from "crypto";
import { hashPassword } from "@/lib/password";

// 1. SOLICITAR (GERAR TOKEN)
export async function solicitarResetSenha(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    // Por segurança, não avisamos se o email não existe (evita enumeração)
    if (!user) return { success: true }; 

    // O Prisma Adapter padrão usa tabela VerificationToken, mas para facilitar
    // e não depender de adaptações complexas agora, vamos usar um campo na tabela User 
    // ou simplesmente a tabela VerificationToken padrão do NextAuth se ela existir.
    // Como não sei se ela existe no schema, vou usar a tabela User se tiver campos,
    // SE NÃO, vou criar verificationToken na mão via Prisma.
    
    // Melhor abordagem rápida: Tabela VerificationToken do Prisma (padrão NextAuth)
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600 * 1000); // 1 hora

    // Upsert garante que se já tiver token para esse email, atualiza
    await prisma.verificationToken.upsert({
      where: { identifier_token: { identifier: email, token: "reset-password" } }, // Hack para usar unique constraint composta se existir, ou criar novo
      // O Adapter padrão usa composite ID (identifier, token)
      // Vamos tentar criar direto, se der erro tratamos.
      create: {
        identifier: email,
        token: token,
        expires: expires
      },
      update: {
        token: token,
        expires: expires
      }
    });
    
    // Envia o email
    await enviarEmailRecuperacao(email, token);

    return { success: true };
  } catch (error) {
    console.error("Erro reset senha:", error);
    // Tenta fallback: se a unique constraint for diferente
    try {
        const token = randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 3600 * 1000);
        await prisma.verificationToken.create({
            data: {
                identifier: email,
                token: token,
                expires: expires
            }
        });
        await enviarEmailRecuperacao(email, token);
        return { success: true };
    } catch(e) {
         console.error("Erro fatal reset:", e);
         return { success: false, error: "Erro ao processar solicitação." };
    }
  }
}

// 2. CONFIRMAR (TROCAR A SENHA)
// 2. VALIDAR TOKEN
export async function validarTokenReset(token: string) {
  try {
    const registro = await prisma.verificationToken.findFirst({
        where: {
            token: token,
            expires: { gt: new Date() }
        }
    });

    if (!registro) {
        return { valid: false, error: "Token inválido ou expirado." };
    }
    
    return { valid: true, email: registro.identifier };
  } catch (e) {
      console.error("Erro validar token:", e);
      return { valid: false, error: "Erro ao validar token." };
  }
}

// 3. CONFIRMAR (TROCAR A SENHA)
export async function resetarSenha(token: string, novaSenha: string) {
  try {
    // Busca token válido
    const registro = await prisma.verificationToken.findFirst({
      where: {
        token: token,
        expires: { gt: new Date() }
      }
    });

    if (!registro) {
      return { success: false, error: "Link inválido ou expirado." };
    }

    const email = registro.identifier;
    const hashedPassword = await hashPassword(novaSenha);

    // Atualiza senha do usuário
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    // Deleta o token usado (para não usar 2x)
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao trocar senha:", error);
    return { success: false, error: "Erro ao redefinir a senha." };
  }
}
