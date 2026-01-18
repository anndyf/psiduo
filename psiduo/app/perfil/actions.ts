'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { gerarSlug } from "../catalogo/actions";

/**
 * BUSCA DADOS COMPLETOS PARA EDIÇÃO E PERFIL PÚBLICO
 * Atualizada para incluir Cidade e Estado
 */
export async function buscarDadosPsicologo(idOuSlug: string) {
  if (!idOuSlug || idOuSlug === "undefined") return { error: "Identificador de busca inválido." };

  try {
    // Tenta buscar primeiro pelo ID (UUID) e depois pelo Slug
    const psicologo = await (prisma.psicologo as any).findFirst({
      where: {
        OR: [
          { id: idOuSlug },
          { slug: idOuSlug }
        ]
      },
    });

    if (!psicologo) return { error: "Perfil não encontrado." };

    let slugFinal = psicologo.slug;

    // --- AUTO-CORREÇÃO DE SLUG (Caso acesse pelo ID e não tenha slug ainda) ---
    if (!psicologo.slug) {
      slugFinal = `${await gerarSlug(psicologo.nome)}-${Math.floor(1000 + Math.random() * 9000)}`;
      await (prisma.psicologo as any).update({
        where: { id: psicologo.id },
        data: { slug: slugFinal }
      });
    }

    return {
      success: true,
      dados: {
        id: psicologo.id,
        nome: psicologo.nome || "",
        slug: slugFinal || "",
        // --- CRP ---
        crp: psicologo.crp || "", 
        foto: psicologo.foto || "",
        biografia: psicologo.biografia || "",
        abordagem: psicologo.abordagem || "",
        whatsapp: psicologo.whatsapp || "",
        preco: psicologo.preco ? Number(psicologo.preco) : 150,
        duracaoSessao: psicologo.duracaoSessao || 50,
        idade: psicologo.idade?.toString() || "",
        genero: psicologo.genero || "",
        etnia: psicologo.etnia || "",
        sexualidade: psicologo.sexualidade || "",
        cidade: psicologo.cidade || "",
        estado: psicologo.estado || "",
        religiao: psicologo.religiao || "",
        estilo: psicologo.estilo || "",
        diretividade: psicologo.diretividade || "",
        especialidades: psicologo.especialidades || [],
        temas: psicologo.temas || [],
        publicoAlvo: psicologo.publicoAlvo || [],
        videoApresentacao: psicologo.videoApresentacao || "",
        redesSociais: psicologo.redesSociais || null,
        agendaConfig: psicologo.agendaConfig || null,
        acessos: psicologo.acessos || 0,
        plano: psicologo.plano || "DUO_I" 
      }
    };
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    return { success: false, error: "Erro ao buscar dados no banco." };
  }
}

/**
 * REGISTRA VISUALIZAÇÃO DE PERFIL
 */
export async function registrarAcessoPerfil(idOuSlug: string) {
  if (!idOuSlug || idOuSlug === "undefined") return;

  try {
    const psi = await (prisma.psicologo as any).findFirst({
      where: {
        OR: [{ id: idOuSlug }, { slug: idOuSlug }]
      },
      select: { id: true }
    });

    if (!psi) return;

    await (prisma.psicologo as any).update({
      where: { id: psi.id },
      data: {
        acessos: {
          increment: 1
        }
      }
    });

    revalidatePath("/painel");
  } catch (error) {
    console.error("Erro ao registrar acesso:", error);
  }
}

/**
 * SALVA E ATIVA PERFIL PROFISSIONAL
 */
export async function salvarEAtivarPerfilCompleto(id: string, dados: any) {
  if (!id || id === "undefined") return { error: "ID inválido para atualização." };

  const whatsappLimpo = dados.whatsapp.replace(/\D/g, "");
  const precoSessao = Number(dados.preco);

  const estaCompleto = 
    dados.foto?.length > 0 && 
    (dados.biografia || dados.bio)?.trim().length >= 50 && 
    dados.especialidades?.length > 0 && 
    whatsappLimpo.length >= 10 &&
    dados.cidade?.trim().length > 0 &&
    dados.estado?.trim().length > 0;

  const novoStatus = estaCompleto ? "ATIVO" : "PENDENTE";

  try {
    const perfilAtual = await (prisma.psicologo as any).findUnique({ 
      where: { id }, 
      select: { plano: true, slug: true } 
    });

    const dataUpdate: any = {
      foto: dados.foto,       
      biografia: dados.biografia || dados.bio,      
      abordagem: dados.abordagem,
      whatsapp: whatsappLimpo,
      preco: precoSessao,
      duracaoSessao: Number(dados.duracaoSessao),
      idade: dados.idade ? Number(dados.idade) : null,
      genero: dados.genero,
      etnia: dados.etnia,
      sexualidade: dados.sexualidade,
      religiao: dados.religiao,
      estilo: dados.estilo,
      diretividade: dados.diretividade,
      cidade: dados.cidade,
      estado: dados.estado,
      publicoAlvo: dados.publicoAlvo,
      especialidades: dados.especialidades,
      temas: dados.temas,
      status: novoStatus,
    };

    // --- AUTO-CORREÇÃO DE SLUG (Se ainda não tiver) ---
    if (!perfilAtual?.slug) {
      dataUpdate.slug = `${await gerarSlug(dados.nome)}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    if (perfilAtual?.plano === "DUO_II") {
      dataUpdate.videoApresentacao = dados.videoApresentacao;
      dataUpdate.redesSociais = dados.redesSociais;
      dataUpdate.agendaConfig = dados.agendaConfig;
    }

    const atualizado = await (prisma.psicologo as any).update({
      where: { id },
      data: dataUpdate,
    });

    revalidatePath("/catalogo");
    revalidatePath(`/perfil/${id}`);
    revalidatePath("/painel"); 

    return { 
      success: true, 
      status: atualizado.status,
      message: "Perfil atualizado com sucesso!" 
    };
  } catch (error) {
    console.error("Erro ao salvar:", error);
    return { error: "Não foi possível atualizar o perfil." };
  }
}

/**
 * BUSCA DADOS PARA O DASHBOARD (PAINEL)
 */
export async function buscarDadosPainel(id: string) {
  console.log("Servidor: buscarDadosPainel iniciada para ID:", id);
  if (!id || id === "undefined") {
    console.warn("Servidor: ID inválido recebido");
    return { success: false, error: "Sessão inválida ou expirada." };
  }

  try {
    const psicologo = await (prisma.psicologo as any).findUnique({
      where: { id },
      select: {
        nome: true,
        slug: true,
        crp: true,
        status: true,
        email: true,
        plano: true,   
        acessos: true,
        cidade: true,
        estado: true,
        foto: true,
        biografia: true,
        especialidades: true,
        whatsapp: true,
        cliquesWhatsapp: true
      }
    });

    if (!psicologo) {
      console.error("Servidor: Psicólogo não encontrado para o ID:", id);
      return { success: false, error: "Conta não encontrada. Tente sair e entrar novamente." };
    }

    // --- LOGICA DE VERIFICAÇÃO DE INTEGRIDADE ---
    const whatsappLimpo = psicologo.whatsapp?.replace(/\D/g, "") || "";
    const estaRealmenteCompleto = 
      psicologo.foto && psicologo.foto.length > 0 && 
      psicologo.biografia && psicologo.biografia.trim().length >= 50 && 
      psicologo.especialidades && psicologo.especialidades.length > 0 && 
      whatsappLimpo.length >= 10 &&
      psicologo.cidade && psicologo.cidade.trim().length > 0 &&
      psicologo.estado && psicologo.estado.trim().length > 0;

    let statusFinal = psicologo.status;
    let slugFinal = psicologo.slug;

    // --- AUTO-CORREÇÃO DE SLUG (Para quem cadastrou antes da atualização) ---
    if (!psicologo.slug) {
      slugFinal = `${await gerarSlug(psicologo.nome)}-${Math.floor(1000 + Math.random() * 9000)}`;
      await (prisma.psicologo as any).update({
        where: { id },
        data: { slug: slugFinal }
      });
    }

    // Se estiver ATIVO mas estiver incompleto, corrige no banco
    if (psicologo.status === "ATIVO" && !estaRealmenteCompleto) {
      await (prisma.psicologo as any).update({
        where: { id },
        data: { status: "PENDENTE" }
      });
      statusFinal = "PENDENTE";
      revalidatePath("/catalogo");
    }

    return {
      success: true,
      nome: psicologo.nome || "Profissional",
      slug: slugFinal || "",
      status: statusFinal || "PENDENTE",
      email: psicologo.email || "",
      plano: psicologo.plano || "DUO_I",
      acessos: psicologo.acessos || 0,
      cliquesWhatsapp: psicologo.cliquesWhatsapp || 0,
      cidade: psicologo.cidade || "",
      estado: psicologo.estado || ""
    };
  } catch (error: any) {
    console.error("Erro crítico no buscarDadosPainel:", error);
    return { success: false, error: `Erro no servidor: ${error.message || "Tente novamente"}` };
  }
}

/**
 * ATUALIZA CREDENCIAIS DE ACESSO
 */
export async function atualizarCredenciais(id: string, dados: { email?: string, senha?: string }) {
  if (!id || id === "undefined") return { error: "ID inválido." };

  try {
    const updateData: any = {};
    if (dados.email) updateData.email = dados.email.toLowerCase().trim();
    if (dados.senha) updateData.senha = dados.senha; 

    await prisma.psicologo.update({
      where: { id },
      data: updateData
    });

    revalidatePath("/painel");
    return { success: true, message: "Dados de acesso atualizados!" };
  } catch (error: any) {
    return { error: "Erro ao atualizar credenciais." };
  }
}

/**
 * BUSCA AVALIAÇÕES PARA O PERFIL
 */
export async function buscarAvaliacoes(id: string) {
  if (!id || id === "undefined") return { success: false, avaliacoes: [], total: 0, media: "0.0" };

  try {
    const avaliacoes = await prisma.avaliacao.findMany({
      where: { psicologoId: id }, 
      orderBy: { data: 'desc' }
    });

    const total = avaliacoes.length;
    const media = total > 0 
      ? avaliacoes.reduce((acc, curr) => acc + curr.nota, 0) / total 
      : 0;

    return {
      success: true,
      avaliacoes,
      total,
      media: media.toFixed(1)
    };
  } catch (error) {
    return { error: "Erro ao buscar avaliações." };
  }
}

/**
 * ENVIA UMA NOVA AVALIAÇÃO
 */
export async function enviarAvaliacao(psicologoId: string, nota: number, comentario: string, localizacao?: string) {
  if (!psicologoId || psicologoId === "undefined") return { error: "Psicólogo não identificado." };
  
  try {
    // Log para depuração
    console.log("Tentando salvar avaliação:", { psicologoId, nota, localizacao });

    const res = await (prisma.avaliacao as any).create({
      data: {
        psicologoId,
        nota: Number(nota),
        comentario: comentario?.trim() || "",
        localizacao: localizacao || "Origem não identificada",
      }
    });

    revalidatePath(`/perfil/${psicologoId}`);
    return { success: true, message: "Avaliação enviada com sucesso!" };
  } catch (error: any) {
    console.error("ERRO PRISMA:", error);
    return { error: `Erro no servidor: ${error.message || "Tente novamente"}` };
  }
}