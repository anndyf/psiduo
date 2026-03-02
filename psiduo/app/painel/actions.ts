'use server'


import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";

/**
 * BUSCA DADOS DO PAINEL DO PSICÓLOGO LOGADO
 * Usa requireAuth para garantir autenticação
 */
export async function buscarDadosPainel() {
  try {
    const user = (await requireAuth()) as { id: string; email: string; name?: string };
    
    if (!user?.id) {
        return { success: false, error: "Sessão inválida. Por favor, faça login novamente." };
    }

    const psicologo = await prisma.psicologo.findUnique({
      where: { userId: user.id },
      include: {
        user: {
          select: { email: true }
        }
      }
    });

    if (!psicologo) {
      console.error("DEBUG: Psicólogo não encontrado para User ID:", user.id);
      return { success: false, error: "Perfil profissional não encontrado. Entre em contato com o suporte." };
    }

    // --- AUTO-CORREÇÃO DE SLUG (Importante para a navegação do painel) ---
    let slugFinal = psicologo.slug;
    if (!psicologo.slug) {
        const { gerarSlug } = await import("../catalogo/actions");
        slugFinal = `${await gerarSlug(psicologo.nome)}-${Math.floor(1000 + Math.random() * 9000)}`;
        await prisma.psicologo.update({
            where: { id: psicologo.id },
            data: { slug: slugFinal }
        });
    }

    const hoje = new Date();
    const inicioMes = startOfMonth(hoje);
    const fimMes = endOfMonth(hoje);

    const [agendamentosHoje, totalPacientes, totalGrupos, sessoesMes] = await Promise.all([
        prisma.agendamento.findMany({
            where: {
                psicologoId: psicologo.id,
                data: { gte: startOfDay(hoje), lte: endOfDay(hoje) },
                status: { not: "CANCELADO" },
                tipo: { not: "BLOQUEADO" }
            },
            include: { 
                paciente: { select: { nome: true } }, 
                grupo: { select: { titulo: true } } 
            },
            orderBy: { data: "asc" }
        }).catch(() => []),
        prisma.paciente.count({ where: { psicologoId: psicologo.id, ativo: true } }).catch(() => 0),
        prisma.grupoTerapeutico.count({ where: { psicologoId: psicologo.id, ativo: true } }).catch(() => 0),
        prisma.agendamento.count({ 
            where: { 
                psicologoId: psicologo.id, 
                data: { gte: inicioMes, lte: fimMes },
                status: { not: "CANCELADO" },
                tipo: { not: "BLOQUEADO" }
            } 
        }).catch(() => 0)
    ]);

    return {
      success: true,
      dados: {
          id: psicologo.id,
          nome: psicologo.nome,
          email: psicologo.user?.email || psicologo.whatsapp,
          slug: slugFinal,
          crp: psicologo.crp,
          foto: psicologo.foto,
          biografia: psicologo.biografia,
          whatsapp: psicologo.whatsapp,
          plano: psicologo.plano,
          status: psicologo.status,
          acessos: psicologo.acessos,
          cliquesWhatsapp: psicologo.cliquesWhatsapp,
          especialidades: psicologo.especialidades || [],
          publicoAlvo: psicologo.publicoAlvo || [],
          kpis: {
              totalPacientes,
              totalGrupos,
              sessoesMes
          },
          agendamentosHoje: (agendamentosHoje || []).map(a => ({
              id: a.id,
              titulo: a.titulo,
              hora: a.data.toISOString(),
              status: a.status,
              tipo: a.tipo,
              duracao: a.duracao
          }))
      }
    };
  } catch (error: any) {
    console.error("Erro crítico ao buscar dados do painel:", error);
    return { success: false, error: "Houve um erro interno ao carregar seu painel." };
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

export async function buscarMensagensAdmin() {
    const user = (await requireAuth()) as { id: string };
    try {
        const psicologo = await prisma.psicologo.findUnique({
            where: { userId: user.id },
            select: { id: true }
        });
        if (!psicologo) return [];

        return await (prisma as any).internalMessage.findMany({
            where: { psicologoId: psicologo.id, remetente: "ADMIN" },
            orderBy: { criadoEm: 'desc' }
        });
    } catch (error: any) {
        console.error("Erro ao buscar mensagens:", error);
        return [];
    }
}

export async function marcarMensagemComoLida(id: string) {
    await requireAuth();
    try {
        await (prisma as any).internalMessage.update({
            where: { id },
            data: { lida: true }
        });
        return { success: true };
    } catch (error: any) {
        console.error("Erro ao marcar como lida:", error);
        return { success: false };
    }
}

export async function enviarPedidoSuporte(conteudo: string) {
    const user = (await requireAuth()) as { id: string };
    
    try {
        const psicologo = await prisma.psicologo.findUnique({
            where: { userId: user.id },
            select: { id: true }
        });
        
        if (!psicologo) {
            return { success: false, error: "Psicólogo não encontrado." };
        }

        const model = (prisma as any).internalMessage;
        
        if (!model) {
            console.error("ERRO_PRISMA_INSTANCIA: Propriedade 'internalMessage' não encontrada. Chaves disponíveis:", 
                Object.keys(prisma).filter(k => !k.startsWith('_'))
            );
            return { success: false, error: "Sistema de suporte temporariamente indisponível (Erro de Instância)." };
        }

        await model.create({
            data: {
                psicologoId: psicologo.id,
                conteudo,
                remetente: "PSICOLOGO"
            }
        });
        
        revalidatePath("/admin");
        revalidatePath("/painel");
        return { success: true };
    } catch (error: any) {
        console.error("ERRO_AO_ENVIAR_SUPORTE:", error);
        return { 
            success: false, 
            error: "Erro de conexão com o banco. Tente novamente." 
        };
    }
}

export async function getMensagensSuporte() {
    const user = (await requireAuth()) as { id: string };
    try {
        const psicologo = await prisma.psicologo.findUnique({
            where: { userId: user.id },
            select: { id: true }
        });
        
        if (!psicologo) return [];

        const msgs = await (prisma as any).internalMessage.findMany({
            where: { psicologoId: psicologo.id },
            orderBy: { criadoEm: 'desc' },
            take: 20
        });

        return JSON.parse(JSON.stringify(msgs));
    } catch (error) {
        console.error("Erro ao buscar histórico de suporte:", error);
        return [];
    }
}
