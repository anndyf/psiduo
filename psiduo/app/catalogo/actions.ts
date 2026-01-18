'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { hashPassword, validatePasswordStrength } from "@/lib/password";
import { signupRateLimit, checkRateLimit } from "@/lib/rate-limit";

// --- FUNÇÃO DE LEITURA (PAGINA INICIAL / DESTAQUE) ---
export async function getPsicologosDestaque() {
  const data = await prisma.psicologo.findMany({
    where: {
      status: "ATIVO" 
    },
    orderBy: [
      { plano: 'desc' }, // DUO_II antes de DUO_I
      { criadoEm: 'desc' }
    ],
    take: 10
  });
  
  return data.map(psi => ({
    ...psi,
    preco: psi.preco.toNumber(),
    criadoEm: psi.criadoEm.toISOString(),
    atualizadoEm: psi.atualizadoEm.toISOString(),
  }));
}

// --- FUNÇÃO DE LEITURA (CATALOGO COMPLETO) ---
export async function getPsicologos() {
  const data = await prisma.psicologo.findMany({
    where: {
      status: "ATIVO" 
    },
    orderBy: { criadoEm: 'desc' }
  });
  
  return data.map(psi => ({
    ...psi,
    preco: psi.preco.toNumber(),
    criadoEm: psi.criadoEm.toISOString(),
    atualizadoEm: psi.atualizadoEm.toISOString(),
  }));
}

export async function registrarCliqueWhatsapp(idOuSlug: string) {
  try {
    const psi = await (prisma.psicologo as any).findFirst({
      where: {
        OR: [{ id: idOuSlug }, { slug: idOuSlug }]
      },
      select: { id: true }
    });

    if (!psi) return { success: false, error: "Psicólogo não encontrado" };

    await (prisma.psicologo as any).update({
      where: { id: psi.id },
      data: {
        cliquesWhatsapp: { increment: 1 }
      }
    });

    revalidatePath("/painel");
    return { success: true };
  } catch (error) {
    console.error("Erro ao registrar clique no WhatsApp:", error);
    return { success: false };
  }
}

// --- HELPER: Gerar Slug Amigável ---
export async function gerarSlug(nome: string) {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

// --- FUNÇÃO DE CADASTRO (COM NEXTAUTH + BCRYPT + RATE LIMITING) ---
export async function cadastrarPsicologo(dados: any) {
  
  // 1. Rate Limiting por email
  const { success } = await checkRateLimit(dados.email, signupRateLimit);
  if (!success) {
    throw new Error("Muitas tentativas de cadastro. Tente novamente em 1 hora.");
  }

  // 2. Validação de força de senha
  const senhaValida = validatePasswordStrength(dados.senha);
  if (!senhaValida.isValid) {
    throw new Error(`Senha fraca: ${senhaValida.errors.join(", ")}`);
  }

  // 3. Validação de Limites
  if (dados.temas.length > 5) {
    throw new Error("O limite máximo são 5 temas de experiência.");
  }
  
  if (dados.especialidades.length > 2) {
    throw new Error("O limite máximo são 2 especialidades (formações).");
  }

  // 4. Tratamento de Dados
  const precoFormatado = parseFloat(dados.preco); 
  const duracaoFormatada = parseInt(dados.duracaoSessao) || 50; 

  // Gera slug
  let slug = await gerarSlug(dados.nome);
  
  // 5. Salvar no Banco com transação (User + Psicologo)
  try {
    // Hash da senha
    const senhaHash = await hashPassword(dados.senha);

    const resultado = await prisma.$transaction(async (tx) => {
      // Criar User primeiro
      const user = await tx.user.create({
        data: {
          email: dados.email,
          password: senhaHash,
        }
      });

      // Criar Psicologo vinculado ao User
      const novoPsicologo = await (tx.psicologo as any).create({
        data: {
          nome: dados.nome,
          slug: `${slug}-${Math.floor(1000 + Math.random() * 9000)}`,
          userId: user.id,
          crp: dados.crp,
          whatsapp: dados.whatsapp,
          abordagem: dados.abordagem,
          especialidades: dados.especialidades,
          temas: dados.temas,
          preco: precoFormatado,
          duracaoSessao: duracaoFormatada,
          status: "PENDENTE", 
          plano: "DUO_I",
          foto: dados.foto,
          biografia: dados.biografia,
        }
      });

      return { user, psicologo: novoPsicologo };
    });

    revalidatePath('/catalogo');
    return { success: true, id: resultado.psicologo.id, userId: resultado.user.id };

  } catch (error: any) {
    if (error.code === 'P2002') {
      if (error.meta?.target?.includes('crp')) {
        throw new Error("Este número de CRP já está cadastrado.");
      }
      if (error.meta?.target?.includes('email')) {
        throw new Error("Este e-mail já está em uso.");
      }
    }
    console.error("Erro ao cadastrar:", error);
    throw new Error("Erro interno ao cadastrar psicólogo.");
  }
}

export async function verificarCRP(crp: string) {
  const existe = await prisma.psicologo.findUnique({
    where: { crp: crp },
  });
  return !!existe;
}

export async function atualizarPlanoDuoII(id: string) {
  try {
    await prisma.psicologo.update({
      where: { id },
      data: {
        plano: "DUO_II",
      }
    });

    revalidatePath('/catalogo');
    revalidatePath("/painel");
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar plano:", error);
    throw new Error("Não foi possível atualizar seu plano.");
  }
}