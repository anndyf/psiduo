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
        plano: psicologo.plano || "DUO_I",
        atendeOnline: psicologo.atendeOnline ?? true,
        atendePresencial: psicologo.atendePresencial ?? false
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
    dados.estado?.trim().length > 0 &&
    dados.crp?.trim().length >= 6; // CRP Obrigatório para ativar

  const novoStatus = estaCompleto ? "ATIVO" : "PENDENTE";

  try {
    const perfilAtual = await (prisma.psicologo as any).findUnique({ 
      where: { id }, 
      select: { plano: true, slug: true, especialidades: true } 
    });

    const dataUpdate: any = {
      foto: dados.foto,       
      biografia: dados.biografia || dados.bio,      
      abordagem: dados.abordagem,
      whatsapp: whatsappLimpo,
      crp: dados.crp,
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
      atendeOnline: dados.atendeOnline,
      atendePresencial: dados.atendePresencial,
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

    // --- LOGICA DE GRUPOS TERAPÊUTICOS ---
    // Se não tiver "Terapia em Grupo" selecionado no envio atual, garante que todos os grupos sejam desativados.
    // Isso corrige casos onde o estado anterior poderia estar dessincronizado.
    const mantemGrupo = dados.publicoAlvo?.includes("Terapia em Grupo");
    let mensagemGrupo = "";

    if (!mantemGrupo) {
        // Desativa todos os grupos que estejam ativos
        const resultado = await prisma.grupoTerapeutico.updateMany({
            where: { 
                psicologoId: id,
                ativo: true 
            },
            data: { ativo: false }
        });

        if (resultado.count > 0) {
             mensagemGrupo = " Atenção: Seus grupos foram congelados pois a modalidade 'Terapia em Grupo' não está selecionada.";
        }
    }
    // Se adicionar de volta, não faz nada automático (usuário deve reativar manualmente),
    // mas poderíamos avisar se quiséssemos. O requisito diz "exibe mensagem que ele deve reativar".
    // Se ele acabou de ADICIONAR (não tinha, agora tem), ele pode ir lá criar.
    // O requisito: "se ... desmarcar ... exibe mensagem". 
    
    const tinhaGrupo = perfilAtual?.publicoAlvo?.includes("Terapia em Grupo");
    // Se ele MARCAR DE VOLTA (tinha=false, tem=true), idealmente avisamos: "Seus grupos antigos permanecem inativos. Vá ao painel para reativá-los."
    if (!tinhaGrupo && mantemGrupo) {
         mensagemGrupo = " Lembre-se de reativar manualmente seus grupos no painel.";
    }

    const atualizado = await (prisma.psicologo as any).update({
      where: { id },
      data: dataUpdate,
    });

    revalidatePath("/catalogo");
    revalidatePath(`/perfil/${id}`);
    revalidatePath("/painel"); 
    revalidatePath("/painel/grupos"); 

    return { 
      success: true, 
      status: atualizado.status,
      message: "Perfil atualizado com sucesso!" + mensagemGrupo 
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
        publicoAlvo: true,
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
      psicologo.estado && psicologo.estado.trim().length > 0 &&
      psicologo.crp && psicologo.crp.trim().length >= 6;

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
      estado: psicologo.estado || "",
      especialidades: psicologo.especialidades || [],
      publicoAlvo: psicologo.publicoAlvo || []
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
export async function enviarAvaliacao(psicologoId: string, nota: number, comentario: string) {
  if (!psicologoId || psicologoId === "undefined") return { error: "Psicólogo não identificado." };
  
  try {
    // Log para depuração
    console.log("Tentando salvar avaliação:", { psicologoId, nota });

    const res = await (prisma.avaliacao as any).create({
      data: {
        psicologoId,
        nota: Number(nota),
        comentario: comentario?.trim() || "",
      }
    });

    revalidatePath(`/perfil/${psicologoId}`);
    return { success: true, message: "Avaliação enviada com sucesso!" };
  } catch (error: any) {
    console.error("ERRO PRISMA:", error);
    return { error: `Erro no servidor: ${error.message || "Tente novamente"}` };
  }
}

/**
 * SALVA APENAS A AGENDA DO PSICOLOGO
 */
export async function salvarAgendaPsicologo(id: string, agendaConfig: any) {
  if (!id || id === "undefined") return { error: "ID inválido." };

  try {
    await prisma.psicologo.update({
      where: { id },
      data: { agendaConfig }
    });

    revalidatePath("/painel");
    revalidatePath(`/perfil/${id}`);
    
    return { success: true, message: "Agenda atualizada com sucesso!" };
  } catch (error: any) {
    console.error("Erro ao salvar agenda:", error);
    return { error: "Erro ao salvar agenda." };
  }
}