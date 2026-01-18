'use server'

import { prisma } from "@/lib/prisma";
import { Psicologo, Avaliacao } from "@prisma/client";

export type QuizData = {
  tipoQuiz: 'INDIVIDUAL' | 'CASAL';
  genero: string;
  idade: string;
  sexualidade: string;
  etnia: string;
  pronomes: string;
  prefLgbt: boolean;
  statusRelacionamento: string;
  terapiaAntes: boolean;
  demanda: string[]; 
  expectativa: string[];
  modeloTerapeuta: string; 
  estiloTerapeuta: string; 
  preferenciasEspecificas: {
    homemMulher: string; 
    lgbtqia: boolean;
    mais45: boolean;
    naoReligioso: boolean;
    negros: boolean;
  };
};

export interface ScoredPsicologo extends Psicologo {
  avaliacoes: Avaliacao[];
  score: number;
}

export async function findMatches(quizData: QuizData) {
  try {
    const whereClause: any = {
      status: "ATIVO"
    };

    // REGRA DE OURO: Se for casal, SÓ traz quem atende casais
    if (quizData.tipoQuiz === 'CASAL') {
      whereClause.publicoAlvo = {
        has: "Casais"
      };
    }

    const psicologos = await prisma.psicologo.findMany({
      where: whereClause,
      include: {
        avaliacoes: true
      }
    });

    // Mapeamento de sintomas para temas clínicos (LISTA_TEMAS oficial)
    const demandToThemes: Record<string, string[]> = {
      "Estou me sentindo triste": ["Depressão", "Transtornos do humor"],
      "Estou me sentindo ansioso": ["Ansiedade", "Transtornos do humor"],
      "Meu humor está interferindo no trabalho": ["Estresse e Burnout", "Carreira", "Insatisfação profissional"],
      "Problemas em manter relacionamentos": ["Relacionamentos amorosos", "Dependência emocional", "Conflitos familiares"],
      "Não vejo sentido/propósito na vida": ["Identidade e propósito", "Autoconhecimento", "Regulação emocional"],
      "Estou em luto": ["Luto e perdas"],
      "Experimentei situações traumáticas": ["Transtornos do humor"], 
      "Falar sobre um desafio específico": ["Tomada de decisões", "Regulação emocional"],
      "Quero ganhar autoestima": ["Autoestima e confiança"],
      "Quero melhorar mas não sei por onde começar": ["Autoconhecimento", "Regulação emocional"],
      "Preciso de ajuda com vícios": ["Vícios e Dependências", "Compulsão"],
      
      // DEMANDAS DE CASAL
      "Melhorar a comunicação": ["Relacionamentos amorosos", "Comunicação assertiva"],
      "Conflitos e brigas frequentes": ["Relacionamentos amorosos", "Conflitos familiares", "Gestão de conflitos"],
      "Quebra de confiança / Traição": ["Relacionamentos amorosos", "Traição e confiança", "Luto e perdas"],
      "Dificuldades na vida sexual": ["Sexualidade", "Relacionamentos amorosos"],
      "Alinhamento sobre futuro/filhos": ["Relacionamentos amorosos", "Conflitos familiares", "Planejamento de vida"],
      "Planejamento financeiro": ["Relacionamentos amorosos", "Conflitos familiares"],
      "Apoio em momentos de crise": ["Relacionamentos amorosos", "Regulação emocional"],
      "Decidir sobre separação": ["Relacionamentos amorosos", "Divórcio e separação"],
      "Fortalecer a conexão emocional": ["Relacionamentos amorosos", "Apego e conexão"],
    };

    const scoredMatches = psicologos.map(psi => {
      let score = 0;

      // 1. DEMANDAS -> TEMAS (Peso 10)
      const mappedThemes = quizData.demanda.flatMap(d => demandToThemes[d] || []);
      const temasMatch = psi.temas.filter((t: string) => mappedThemes.includes(t));
      score += temasMatch.length * 10;

      // 2. CRUZAMENTO DE PÚBLICO-ALVO (Peso 12) - "Cruzar os dados"
      // Se o paciente é Mulher e o psi atende Mulheres
      if (quizData.genero.includes("Mulher") && psi.publicoAlvo?.includes("Mulheres")) score += 12;
      if (quizData.genero.includes("Homem") && psi.publicoAlvo?.includes("Homens")) score += 12;
      
      // Se o paciente é LGBTQIA+ e o psi foca nesse público
      const isLgbtPatient = quizData.sexualidade !== "Heterossexual" || quizData.genero.includes("Trans") || quizData.genero === "Não-binário";
      if (isLgbtPatient && (psi.publicoAlvo?.includes("Público LGBTQIA+") || quizData.prefLgbt)) {
        score += 12;
      }

      // Se o paciente é Negro e o psi foca em Público Negro
      if ((quizData.etnia === "Preta" || quizData.etnia === "Parda") && psi.publicoAlvo?.includes("Público Negro")) {
        score += 12;
      }

      // 3. PREFERÊNCIAS EXPLÍCITAS (Peso 15)
      if (quizData.preferenciasEspecificas.homemMulher === "FEMININO") {
        if (psi.genero?.includes("Mulher")) score += 15;
      } else if (quizData.preferenciasEspecificas.homemMulher === "MASCULINO") {
        if (psi.genero?.includes("Homem")) score += 15;
      }

      if (quizData.preferenciasEspecificas.lgbtqia) {
        // Se o paciente quer um psi LGBTQIA+, pontua se o psi for
        const psiIsLgbt = psi.sexualidade !== "Heterossexual" || psi.genero?.includes("Trans") || psi.genero === "Não-binário";
        if (psiIsLgbt) score += 15;
      }

      if (quizData.preferenciasEspecificas.negros) {
        if (psi.etnia === "Preta" || psi.etnia === "Parda") score += 15;
      }

      if (quizData.preferenciasEspecificas.mais45 && (psi.idade ?? 0) >= 45) score += 10;
      if (quizData.preferenciasEspecificas.naoReligioso && (psi.religiao === "Não Religioso" || !psi.religiao)) score += 10;

      // 4. MODELO E ESTILO (Peso 8)
      if (quizData.modeloTerapeuta !== "SEM_PREFERENCIA" && psi.diretividade === quizData.modeloTerapeuta) {
        score += 8;
      }
      if (quizData.estiloTerapeuta !== "SEM_PREFERENCIA" && psi.estilo === quizData.estiloTerapeuta) {
        score += 8;
      }

      // 5. TERAPIA ANTES (Peso 5)
      // Se nunca fez terapia (terapiaAntes: false), psicólogos com perfil mais acolhedor ou diretividade "POUCO_DIRETIVO" podem ser bons
      if (!quizData.terapiaAntes && psi.diretividade === "POUCO_DIRETIVO") {
        score += 5;
      }

      // BOOST PREMIUM (Duo II)
      if (psi.plano === "DUO_II") {
        score += 5;
      }

      return {
        ...psi,
        score,
        // Garantindo que os tipos de data e preço sejam strings amigáveis para o cliente
        preco: psi.preco?.toString() || "",
        criadoEm: psi.criadoEm.toISOString(),
        atualizadoEm: psi.atualizadoEm.toISOString(),
      };
    });

    // Ordenar e retornar top 3
    return scoredMatches
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

  } catch (error) {
    console.error("Match Error:", error);
    throw new Error("Erro ao processar combinação.");
  }
}
