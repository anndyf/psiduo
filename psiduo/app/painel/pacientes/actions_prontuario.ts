'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- DADOS CADASTRAIS (PACIENTE) ---

export async function updateDadosCadastrais(pacienteId: string, dados: any) {
  try {
    await prisma.paciente.update({
      where: { id: pacienteId },
      data: {
        nome: dados.nome,
        cpf: dados.cpf,
        dataNascimento: dados.dataNascimento ? new Date(dados.dataNascimento) : null,
        sexo: dados.sexo,
        nacionalidade: dados.nacionalidade,
        estadoCivil: dados.estadoCivil,
        grauInstrucao: dados.grauInstrucao,
        profissao: dados.profissao,
        cidade: dados.cidade,
        estado: dados.estado,
        outrosContatos: dados.outrosContatos,
        telefone: dados.telefone,
        cep: dados.cep,
        endereco: dados.endereco,
      },
    });
    revalidatePath(`/painel/pacientes/${pacienteId}`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar dados cadastrais:", error);
    return { success: false, error: "Erro ao atualizar dados." };
  }
}

// --- CONFIGURAÇÕES DE DIÁRIO ---

export async function updateDiarySettings(pacienteId: string, ativo: boolean, dataInicio: string) {
  try {
    await prisma.paciente.update({
      where: { id: pacienteId },
      data: {
        ativo,
        dataInicio: new Date(dataInicio),
      },
    });
    revalidatePath(`/painel/pacientes/${pacienteId}`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar configurações do diário:", error);
    return { success: false, error: "Erro ao atualizar configurações." };
  }
}

// --- ANAMNESE ---

export async function getAnamnese(pacienteId: string) {
  try {
    const anamnese = await prisma.anamnese.findUnique({
      where: { pacienteId },
    });
    return { success: true, anamnese };
  } catch (error) {
    return { success: false, error: "Erro ao buscar anamnese" };
  }
}

export async function saveAnamnese(pacienteId: string, dados: any) {
  try {
    // Upsert para criar ou atualizar
    const anamnese = await prisma.anamnese.upsert({
      where: { pacienteId },
      create: {
        pacienteId,
        sintomas: dados.sintomas,
        inicioSintomas: dados.inicioSintomas,
        historicoFamiliar: dados.historicoFamiliar,
        expectativas: dados.expectativas,
        tratamentoPrevio: dados.tratamentoPrevio,
        rotinaHobbies: dados.rotinaHobbies
      },
      update: {
        sintomas: dados.sintomas,
        inicioSintomas: dados.inicioSintomas,
        historicoFamiliar: dados.historicoFamiliar,
        expectativas: dados.expectativas,
        tratamentoPrevio: dados.tratamentoPrevio,
        rotinaHobbies: dados.rotinaHobbies
      },
    });
    revalidatePath(`/painel/pacientes/${pacienteId}`);
    return { success: true, anamnese };
  } catch (error) {
    console.error("Erro ao salvar anamnese:", error);
    return { success: false, error: "Erro ao salvar anamnese" };
  }
}

// --- PRONTUÁRIO & EVOLUÇÕES ---

export async function getProntuario(pacienteId: string) {
  try {
    const prontuario = await prisma.prontuario.findUnique({
      where: { pacienteId },
      include: {
        evolucoes: {
          orderBy: { data: 'desc' },
          include: {
            psicologo: {
              select: { id: true, nome: true, foto: true, crp: true }
            }
          } as any
        }
      }
    });
    return { success: true, prontuario };
  } catch (error) {
    return { success: false, error: "Erro ao buscar prontuário" };
  }
}

export async function createProntuario(pacienteId: string, dadosIniciais: any) {
    try {
        const prontuario = await prisma.prontuario.create({
            data: {
                pacienteId,
                demanda: dadosIniciais.demanda,
                planoTrabalho: dadosIniciais.planoTrabalho,
                status: 'ABERTO'
            }
        });
        revalidatePath(`/painel/pacientes/${pacienteId}`);
        return { success: true, prontuario };
    } catch (error) {
        console.error("Erro ao criar prontuário:", error);
        return { success: false, error: "Erro ao criar prontuário" };
    }
}

export async function addEvolucao(prontuarioId: string, dados: any) {
    try {
        const evolucao = await prisma.evolucao.create({
            data: {
                prontuarioId,
                psicologoId: dados.psicologoId ?? null,
                data: new Date(dados.data),
                demanda: dados.demanda ?? null,
                planoTrabalho: dados.planoTrabalho ?? null,
                conteudo: dados.conteudo,
                procedimentos: dados.procedimentos ?? null,
            },
            include: {
                psicologo: {
                    select: { id: true, nome: true, foto: true, crp: true }
                }
            } as any
        });
        return { success: true, evolucao };
    } catch (error) {
        console.error("Erro ao adicionar evolução:", error);
        return { success: false, error: "Erro ao adicionar evolução" };
    }
}

export async function deleteEvolucao(evolucaoId: string) {
    try {
        await prisma.evolucao.delete({
            where: { id: evolucaoId }
        });
        return { success: true };
    } catch (error) {
        console.error("Erro ao excluir evolução:", error);
        return { success: false, error: "Erro ao excluir evolução." };
    }
}

export async function updateEvolucao(evolucaoId: string, dados: any) {
    try {
        const evolucao = await prisma.evolucao.update({
            where: { id: evolucaoId },
            data: {
                conteudo: dados.conteudo,
                // Pode-se permitir editar outros campos se necessário, mas o principal é o conteúdo
            },
            include: {
                psicologo: {
                    select: { id: true, nome: true, foto: true, crp: true }
                }
            } as any
        });
        return { success: true, evolucao };
    } catch (error) {
        console.error("Erro ao atualizar evolução:", error);
        return { success: false, error: "Erro ao atualizar evolução" };
    }
}

// --- FIM ---
