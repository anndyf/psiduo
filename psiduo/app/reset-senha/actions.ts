'use server'

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import crypto from "crypto";

/**
 * SOLICITAR RESET DE SENHA
 * Gera token e retorna link (em produção, enviaria email)
 */
export async function solicitarResetSenha(email: string) {
  try {
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
      include: { psicologo: true }
    });

    if (!user) {
      // Por segurança, não revelar se email existe
      return { 
        success: true, 
        message: "Se o email existir, você receberá instruções para resetar sua senha." 
      };
    }

    // Gerar token único
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hora

    // Salvar token no banco
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: token,
        expires: expires,
      }
    });

    // Em produção, enviar email aqui
    // Por enquanto, retornar o link
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-senha/${token}`;

    return {
      success: true,
      message: "Se o email existir, você receberá instruções para resetar sua senha.",
      // Apenas para desenvolvimento - remover em produção
      resetLink: process.env.NODE_ENV === 'development' ? resetLink : undefined,
    };

  } catch (error) {
    console.error("Erro ao solicitar reset:", error);
    return { 
      success: false, 
      error: "Erro ao processar solicitação." 
    };
  }
}

/**
 * VALIDAR TOKEN DE RESET
 */
export async function validarTokenReset(token: string) {
  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return { valid: false, error: "Token inválido ou expirado." };
    }

    if (verificationToken.expires < new Date()) {
      // Token expirado - deletar
      await prisma.verificationToken.delete({
        where: { token }
      });
      return { valid: false, error: "Token expirado." };
    }

    return { 
      valid: true, 
      email: verificationToken.identifier 
    };

  } catch (error) {
    console.error("Erro ao validar token:", error);
    return { valid: false, error: "Erro ao validar token." };
  }
}

/**
 * RESETAR SENHA
 */
export async function resetarSenha(token: string, novaSenha: string) {
  try {
    // Validar token
    const validation = await validarTokenReset(token);
    if (!validation.valid || !validation.email) {
      return { success: false, error: validation.error };
    }

    // Validar força da senha
    const { validatePasswordStrength } = await import("@/lib/password");
    const senhaValida = validatePasswordStrength(novaSenha);
    
    if (!senhaValida.isValid) {
      return { 
        success: false, 
        error: `Senha fraca: ${senhaValida.errors.join(", ")}` 
      };
    }

    // Hash da nova senha
    const senhaHash = await hashPassword(novaSenha);

    // Atualizar senha do usuário
    await prisma.user.update({
      where: { email: validation.email },
      data: { password: senhaHash }
    });

    // Deletar token usado
    await prisma.verificationToken.delete({
      where: { token }
    });

    return { 
      success: true, 
      message: "Senha alterada com sucesso! Faça login com sua nova senha." 
    };

  } catch (error) {
    console.error("Erro ao resetar senha:", error);
    return { 
      success: false, 
      error: "Erro ao resetar senha." 
    };
  }
}
