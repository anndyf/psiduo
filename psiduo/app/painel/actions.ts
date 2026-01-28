'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

/**
 * BUSCA DADOS DO PAINEL DO PSICÓLOGO LOGADO
 * Usa requireAuth para garantir autenticação
 */
export async function buscarDadosPainel() {
  const user = (await requireAuth()) as { id: string; email: string; name?: string };
  
  try {
    const psicologo = await prisma.psicologo.findUnique({
      where: { userId: user.id },
      include: {
        user: {
          select: {
            email: true,
          }
        }
      }
    });

    if (!psicologo) {
      return { error: "Perfil não encontrado." };
    }

    return {
      success: true,
      dados: {
        id: psicologo.id,
        nome: psicologo.nome,
        email: psicologo.user.email,
        slug: psicologo.slug,
        crp: psicologo.crp,
        foto: psicologo.foto,
        biografia: psicologo.biografia,
        whatsapp: psicologo.whatsapp,
        plano: psicologo.plano,
        status: psicologo.status,
        acessos: psicologo.acessos,
        cliquesWhatsapp: psicologo.cliquesWhatsapp,
        videoApresentacao: psicologo.videoApresentacao,
        redesSociais: psicologo.redesSociais,
        agendaConfig: psicologo.agendaConfig,
      }
    };
  } catch (error) {
    console.error("Erro ao buscar dados do painel:", error);
    return { error: "Erro ao buscar dados." };
  }
}

/**
 * ATUALIZAR CREDENCIAIS (EMAIL E/OU SENHA)
 * Requer autenticação e atualiza tanto User quanto Psicologo
 */
export async function atualizarCredenciais(dados: {
  emailNovo?: string;
  senhaAtual?: string;
  senhaNova?: string;
}) {
  const user = (await requireAuth()) as { id: string; email: string; name?: string };

  try {
    const updateData: any = {};

    // Se está atualizando email
    if (dados.emailNovo && dados.emailNovo !== user.email) {
      // Verificar se email já existe
      const emailExiste = await prisma.user.findUnique({
        where: { email: dados.emailNovo }
      });

      if (emailExiste) {
        return { error: "Este e-mail já está em uso." };
      }

      updateData.email = dados.emailNovo;
    }

    // Se está atualizando senha
    if (dados.senhaNova) {
      if (!dados.senhaAtual) {
        return { error: "Senha atual é obrigatória para alterar a senha." };
      }

      // Verificar senha atual
      const userComSenha = await prisma.user.findUnique({
        where: { id: user.id }
      });

      if (!userComSenha?.password) {
        return { error: "Usuário sem senha cadastrada." };
      }

      const { verifyPassword } = await import("@/lib/password");
      const senhaValida = await verifyPassword(dados.senhaAtual, userComSenha.password);

      if (!senhaValida) {
        return { error: "Senha atual incorreta." };
      }

      // Hash da nova senha
      updateData.password = await hashPassword(dados.senhaNova);
    }

    if (Object.keys(updateData).length === 0) {
      return { error: "Nenhuma alteração solicitada." };
    }

    // Atualizar User
    await prisma.user.update({
      where: { id: user.id },
      data: updateData
    });

    revalidatePath("/painel");
    return { success: true, message: "Credenciais atualizadas com sucesso!" };

  } catch (error) {
    console.error("Erro ao atualizar credenciais:", error);
    return { error: "Erro ao atualizar credenciais." };
  }
}
