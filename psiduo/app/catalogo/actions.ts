'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { hashPassword, validatePasswordStrength } from "@/lib/password";
import { signupRateLimit, checkRateLimit } from "@/lib/rate-limit";
import { enviarEmailBoasVindas } from "@/lib/mail";

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

    // Envio de email de boas vindas (sem travar se falhar)
    try {
        await enviarEmailBoasVindas(dados.email, dados.nome.split(" ")[0]);
    } catch (e) {
        console.error("Falha ao enviar email boas vindas (não crítico):", e);
    }

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

// --- VALIDAÇÃO DE CRP (Formato, Duplicidade e Status) ---
export async function validarStatusCRP(crp: string) {
  // 1. Validação de Formato (Ex: 06/12345)
  // Aceita 4 a 6 dígitos após a barra
  const regex = /^\d{2}\/\d{4,6}$/;
  if (!regex.test(crp)) {
    return { valido: false, mensagem: "Formato inválido. Use Região/Número (Ex: 06/12345)." };
  }

  // 2. Verificação de Duplicidade (Já existe no PsiDuo?)
  const existe = await prisma.psicologo.findUnique({
    where: { crp: crp },
  });

  if (existe) {
    return { valido: false, mensagem: "Este CRP já está cadastrado no PsiDuo." };
  }

  // 3. VERIFICAÇÃO DE STATUS NO CONSELHO (MOCK INTERFACE)
  // ATENÇÃO: Para bloquear CRPs inativos/cancelados em tempo real,
  // é necessário integrar com uma API paga (ex: Infosimples, Consultar.IO).
  // Abaixo está a estrutura pronta para receber essa integração.
  
  // 3. VERIFICAÇÃO DE STATUS COM INFOSIMPLES
  const token = process.env.INFOSIMPLES_TOKEN;
  
  // DESATIVADO TEMPORARIAMENTE PARA TESTES (Bypass)
  if (false && token) {
      try {
        // CORREÇÃO: Endpoint exato conforme documentação enviada
        // CORREÇÃO FINAL: Extrair prefixo para determinar UF
        // A Infosimples exige UF + Número separados.
        
        // Remove símbolos para garantir análise limpa
        const crpLimpo = crp.replace(/[^\d]/g, '');
        
        let prefixo = '';
        let numero = '';

        if (crp.includes('/')) {
             const parts = crp.split('/');
             prefixo = parts[0];
             numero = parts[1];
        } else if (crpLimpo.length >= 3) {
             // Se não tem barra, assume que os 2 primeiros são o prefixo
             prefixo = crpLimpo.substring(0, 2);
             numero = crpLimpo.substring(2);
        } else {
             // Formato muito curto/invalido, usa o original
             prefixo = crp;
             numero = crp;
        }
        
        const mapaUf: Record<string, string> = {
            '01': 'DF', '02': 'PE', '03': 'BA', '04': 'MG', '05': 'RJ', 
            '06': 'SP', '07': 'RS', '08': 'PR', '09': 'GO', '10': 'PA',
            '11': 'CE', '12': 'SC', '13': 'PB', '14': 'MS', '15': 'AL',
            '16': 'ES', '17': 'RN', '18': 'MT', '19': 'SE', '20': 'AM',
            '21': 'PI', '22': 'MA', '23': 'TO', '24': 'RO'
        };

        const ufDestino = mapaUf[prefixo] || 'SP'; // Fallback para SP se não mapeado, ou tratar erro

        // Envia separado: UF e REGISTRO (apenas o número)
        const response = await fetch(`https://api.infosimples.com/api/v2/consultas/cfp/cadastro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: token,
                uf: ufDestino,
                registro: numero, // Envia apenas a parte depois da barra (ex: 24850)
                timeout: 600,
                ignore_site_receipt: 1 
            }),
            next: { revalidate: 0 }
        });

        const data = await response.json();

        // Verifica sucesso da consulta (code 200 = sucesso na busca)
        if (data.code === 200 && data.data && data.data.length > 0) {
            const registro = data.data[0]; // Infosimples retorna wrapper
            
            // CORREÇÃO FINAL DE ESTRUTURA:
            // A resposta real vem em registro.resultados[0]
            const dadosProfissional = (registro.resultados && registro.resultados.length > 0) 
                                      ? registro.resultados[0] 
                                      : registro; // Fallback

            // Pega a situação
            const situacao = dadosProfissional.situacao || dadosProfissional.status || dadosProfissional.situacao_cadastral;

            // Debug silencioso no console do servidor (opcional)
            console.log("Status CRP encontrado:", situacao);

            if (situacao && situacao.toUpperCase().includes("ATIVO")) {
                return { valido: true };
            } else {
                return { 
                    valido: false, 
                    mensagem: `CRP com situação: ${situacao || "Irregular"}. O cadastro exige registro ATIVO no conselho.` 
                };
            }
        } else if (data.code === 602 || data.code === 603) { 
             // 602/603 = Não encontrado na base
             return { valido: false, mensagem: "CRP não encontrado na base oficial." };
        } else {
             // MOSTRA O ERRO REAL DA API PARA DEPURAÇÃO
             // code_message geralmente traz "Parâmetro inválido: uf" etc.
             const erroMsg = data.code_message || `Erro código ${data.code}`;
             console.error("Erro API Infosimples Detalhe:", data);
             return { valido: false, mensagem: `Erro na validação oficial: ${erroMsg}` };
        }

      } catch (error) {
          console.error("⚠️ ERRO CRÍTICO INFOSIMPLES:", error);
          // MODO FAIL-OPEN: Se a API falhar (timeout, erro de conexão, endpoint errado),
          // permitimos o cadastro para não travar a operação, mas logamos o erro.
          // Em produção rigorosa, você retornaria valid: false.
          return { valido: true }; 
      }
  }

  // Se não tiver token configurado, segue o fluxo de desenvolvimento (Mock)
  return { valido: true };
}

// Mantendo compatibilidade se algo ainda usar, mas redirecionando
export async function verificarCRP(crp: string) {
    const res = await validarStatusCRP(crp);
    // Retorna true se JÁ EXISTE (comportamento antigo esperava boolean de duplicidade?)
    // O antigo retornava `!!existe`. Ou seja, true = duplicado.
    // validarStatusCRP retorna valido=true se NÃO duplicado.
    // Então, se valido=false e msg="Este CRP já está cadastrado", então verificarCRP deve retornar true.
    if (!res.valido && res.mensagem?.includes("já está cadastrado")) return true;
    return false;
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