import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed...')

  // Limpar tabelas principais primeiro (devido ao cascade, apagar User já limpa quase tudo)
  await prisma.user.deleteMany()
  await prisma.grupoTerapeutico.deleteMany()
  await prisma.paciente.deleteMany()

  const passwordHash = await bcrypt.hash('123456', 10)

  // -----------------------------------------------------
  // 1. PSICÓLOGO PLANO DUO I (Básico)
  // -----------------------------------------------------
  const user1 = await prisma.user.create({
    data: {
      email: 'duo1@psiduo.com.br',
      password: passwordHash,
      psicologo: {
        create: {
          nome: 'Dra. Ana (Plano Duo I)',
          crp: '06/11111',
          whatsapp: '11999990001',
          abordagem: 'TCC',
          especialidades: ['Ansiedade', 'Depressão'],
          temas: ['Autoconhecimento', 'Relacionamentos'],
          preco: 150.00,
          biografia: 'Atuo na abordagem cognitivo-comportamental focada em resultados práticos.',
          plano: 'DUO_I',
          verificado: true,
          status: 'ATIVO',
          cidade: 'São Paulo',
          estado: 'SP',
          duracaoSessao: 50,
          atendeOnline: true,
          atendePresencial: false,
        }
      }
    },
    include: { psicologo: true }
  })
  const psicoDuo1Id = user1.psicologo!.id

  // Pacientes para o Psicologo DUO I
  const paciente1_1 = await prisma.paciente.create({
    data: {
      nome: 'João Paciente (Duo I)',
      tokenAcesso: 'token-joao-' + Date.now(),
      cpf: '11111111111',
      psicologoId: psicoDuo1Id,
      ativo: true,
      tipo: 'INDIVIDUAL',
      whatsapp: '11988887777',
      // Instrumentos Aplicados
      instrumentos: {
        create: [
          {
            tipo: 'PHQ-9',
            respostas: {
                "q1": 1, "q2": 2, "q3": 0, "q4": 1, "q5": 3, "q6": 0, "q7": 1, "q8": 0, "q9": 0
            },
            resultado: {
                score: 8, severity: 'Leve', color: '#f59e0b', level: 'Depressão Leve'
            }
          }
        ]
      },
      // Solicitações Ativas
      solicitacoesInstrumento: {
        create: [
          { tipo: 'GAD-7', concluida: false }
        ]
      },
      anamnese: {
        create: {
          sintomas: 'Ansiedade moderada e insônia',
          inicioSintomas: 'Cerca de 6 meses atrás',
          historicoFamiliar: 'Mãe com histórico de depressão.',
          expectativas: 'Melhorar a qualidade do sono e reduzir crise de ansiedade.'
        }
      },
      prontuario: {
        create: {
          demanda: 'Paciente relata episódios constantes de preocupação excessiva.',
          planoTrabalho: 'Utilizar técnicas de relaxamento progressivo e reestruturação cognitiva.',
          status: 'ABERTO',
          evolucoes: {
            create: [
              {
                data: new Date(),
                conteudo: 'Sessão inicial. Paciente apresentou-se colaborativo.',
                psicologoId: psicoDuo1Id
              }
            ]
          }
        }
      }
    }
  })


  // -----------------------------------------------------
  // 2. PSICÓLOGO PLANO DUO II (Completo - Com Diário, Metas e Grupos)
  // -----------------------------------------------------
  const user2 = await prisma.user.create({
    data: {
      email: 'duo2@psiduo.com.br',
      password: passwordHash,
      psicologo: {
        create: {
          nome: 'Dr. Carlos (Plano Duo II)',
          crp: '06/22222',
          whatsapp: '11999990002',
          abordagem: 'Psicanálise',
          especialidades: ['Ansiedade', 'Trauma'],
          temas: ['Luto', 'Carreira'],
          preco: 250.00,
          biografia: 'Especialista em Psicanálise com foco na escuta ativa e profunda.',
          plano: 'DUO_II',
          verificado: true,
          status: 'ATIVO',
          cidade: 'Rio de Janeiro',
          estado: 'RJ',
          duracaoSessao: 50,
          atendeOnline: true,
          atendePresencial: true,
        }
      }
    },
    include: { psicologo: true }
  })
  const psicoDuo2Id = user2.psicologo!.id

  // Pacientes para o Psicologo DUO II (com diário e metas)
  const paciente2_1 = await prisma.paciente.create({
    data: {
      nome: 'Maria Paciente (Duo II)',
      tokenAcesso: 'token-maria-' + Date.now(),
      cpf: '22222222222',
      psicologoId: psicoDuo2Id,
      ativo: true,
      tipo: 'INDIVIDUAL',
      whatsapp: '21988887777',
      // Notas Clinicas Pessoais do Psico
      notasClinicas: {
        create: [
          { conteudo: 'Maria parece um pouco evasiva ao falar sobre a família.' }
        ]
      },
      // Registros do Diário (Mockando 3 dias)
      registros: {
        create: [
          { data: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), humor: 3, sono: 2, notas: 'Dormi mal, muito trabalho.', tags: ['trabalho', 'cansada'] },
          { data: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), humor: 4, sono: 4, notas: 'Dia tranquilo, consegui descansar.', tags: ['descanso'] },
          { data: new Date(), humor: 5, sono: 5, notas: 'Ótimo dia, sai com os amigos!', tags: ['amigos', 'alegria'] }
        ]
      },
      // Metas
      metas: {
        create: [
          {
            titulo: 'Beber 2L de água',
            descricao: 'Importante para hidratação',
            frequencia: 'DIARIO',
            ativa: true,
            registros: {
              create: [
                { data: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), feito: true },
                { data: new Date(), feito: true }
              ]
            }
          },
          {
            titulo: 'Ler 10 páginas de um livro',
            frequencia: 'DIARIO',
            ativa: true
          }
        ]
      },
      // Instrumentos e Prontuario
      instrumentos: {
        create: [
          {
            tipo: 'ISI',
            respostas: {"1a":3,"1b":2,"1c":1,"2":3,"3":2,"4":2,"5":2},
            resultado: {score:15, category: 'Insônia Clínica (Moderada)'}
          }
        ]
      },
      solicitacoesInstrumento: {
        create: [
          { tipo: 'WHO-5', concluida: false },
          { tipo: 'PHQ-9', concluida: false }
        ]
      },
      prontuario: {
        create: {
          demanda: 'Problemas no trabalho afetando vida pessoal.',
          planoTrabalho: 'Analisar transferência',
          evolucoes: {
            create: [{ data: new Date(), conteudo: 'Sessão de escuta livre.', psicologoId: psicoDuo2Id }]
          }
        }
      }
    }
  })

  // Grupo Terapêutico (Exclusivo Duo II)
  const grupo1 = await prisma.grupoTerapeutico.create({
    data: {
      psicologoId: psicoDuo2Id,
      titulo: 'Grupo de Apoio à Ansiedade',
      descricao: 'Encontros semanais para discutir e manejar a ansiedade.',
      temas: ['Ansiedade', 'Mindfulness'],
      publicoAlvo: ['Jovens Adultos'],
      precoMensal: 200.00,
      periodicidade: 'Semanal',
      diaSemana: 'Quarta-feira',
      horario: '19:00',
      duracaoSessao: 90,
      vagasTotais: 10,
      vagasOcupadas: 1,
      modalidade: 'ONLINE',
      participantes: {
          connect: [{ id: paciente2_1.id }] // Vincula a paciente que já criamos
      },
      // Uma missão pra teste
      missoes: {
        create: [
          {
            titulo: 'Praticar respiração diafragmática',
            descricao: 'Faça o exercício de respiração 4-7-8 por 5 minutos todos os dias esta semana.',
            dataInicio: new Date(),
            dataFim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        ]
      },
      // Um checkin pra teste
      checkIns: {
        create: [
          {
            titulo: 'Como você está se sentindo nesta semana?',
            dataEnvio: new Date(),
            dataExpira: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            respostas: {
                create: [
                    {
                        pacienteId: paciente2_1.id,
                        emocao: 'esperancoso',
                        comentario: 'Um pouco melhor nas crises.'
                    }
                ]
            }
          }
        ]
      }
    }
  })


  // -----------------------------------------------------
  // 3. CARGA DE TESTE: 20 PSICÓLOGOS DIVERSOS
  // -----------------------------------------------------
  const psicologosData = [
    {
      nome: "Dra. Beatriz Helena",
      crp: "06/33333",
      email: "beatriz@teste.com",
      abordagem: "TCC",
      especialidades: ["Ansiedade", "TOC"],
      temas: ["Adultos", "Mulheres"],
      preco: 120.00,
      cidade: "São Paulo",
      estado: "SP",
      biografia: "Especialista em transtornos de ansiedade e TOC com mais de 10 anos de experiência clínica.",
      genero: "Mulher Cis",
      foto: "https://images.unsplash.com/photo-1559839734-2b71f1e3c770?q=80&w=200&h=200&auto=format&fit=crop"
    },
    {
      nome: "Dr. Ricardo Mendes",
      crp: "05/44444",
      email: "ricardo@teste.com",
      abordagem: "Psicanálise",
      especialidades: ["Depressão", "Luto"],
      temas: ["Adultos", "Idosos"],
      preco: 180.00,
      cidade: "Rio de Janeiro",
      estado: "RJ",
      biografia: "Atendimento psicanalítico focado na subjetividade e nos processos de luto.",
      genero: "Homem Cis",
      foto: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=200&h=200&auto=format&fit=crop"
    },
    {
      nome: "Juliana Silva",
      crp: "08/55555",
      email: "juliana@teste.com",
      abordagem: "Fenomenologia",
      especialidades: ["Existencial", "Carreira"],
      temas: ["LGBTQIA+", "Jovens"],
      preco: 100.00,
      cidade: "Curitiba",
      estado: "PR",
      biografia: "Abordagem humanista focada no sentido da vida e transições de carreira.",
      genero: "Mulher Cis",
      foto: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=200&h=200&auto=format&fit=crop"
    },
    {
      nome: "Marcos Oliveira",
      crp: "12/66666",
      email: "marcos@teste.com",
      abordagem: "Gestalt-Terapia",
      especialidades: ["Relacionamentos", "Autoestima"],
      temas: ["Casais", "Adultos"],
      preco: 150.00,
      cidade: "Florianópolis",
      estado: "SC",
      biografia: "Foco no aqui e agora, trabalhando autoconhecimento e dinâmicas relacionais.",
      genero: "Homem Cis",
      foto: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&h=200&auto=format&fit=crop"
    },
    {
      nome: "Dra. Letícia Santos",
      crp: "06/77777",
      email: "leticia@teste.com",
      abordagem: "Análise do Comportamento",
      especialidades: ["Autismo", "TDAH"],
      temas: ["Crianças", "Adolescentes"],
      preco: 200.00,
      cidade: "Campinas",
      estado: "SP",
      biografia: "Especialista em desenvolvimento infantil e neurodivergências.",
      genero: "Mulher Cis",
      foto: "https://images.unsplash.com/photo-1527613473269-476ed49609f5?q=80&w=200&h=200&auto=format&fit=crop"
    },
    {
      nome: "Felipe Arantes",
      crp: "04/88888",
      email: "felipe@teste.com",
      abordagem: "TCC",
      especialidades: ["Esportes", "Performance"],
      temas: ["Atletas", "Profissionais"],
      preco: 130.00,
      cidade: "Belo Horizonte",
      estado: "MG",
      biografia: "Psicologia do esporte e alta performance para atletas e executivos.",
      genero: "Homem Cis",
      foto: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&h=200&auto=format&fit=crop"
    },
    {
      nome: "Dra. Carla Viana",
      crp: "02/99999",
      email: "carla@teste.com",
      abordagem: "Psicologia Analítica",
      especialidades: ["Sonhos", "Inconsciente"],
      temas: ["Mulheres", "Espiritualidade"],
      preco: 220.00,
      cidade: "Recife",
      estado: "PE",
      biografia: "Abordagem Jungiana focada em análise de sonhos e processos de individuação.",
      genero: "Mulher Cis",
      foto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&h=200&auto=format&fit=crop"
    },
    {
      nome: "Henrique Souza",
      crp: "06/12121",
      email: "henrique@teste.com",
      abordagem: "Humanista",
      especialidades: ["Dependência Química", "Vícios"],
      temas: ["Adultos", "Famílias"],
      preco: 90.00,
      cidade: "Santo André",
      estado: "SP",
      biografia: "Apoio clínico para dependentes e seus familiares em busca de recuperação.",
      genero: "Homem Cis",
      foto: "https://images.unsplash.com/photo-1566753323558-f4e0952af115?q=80&w=200&h=200&auto=format&fit=crop"
    },
    {
      nome: "Dra. Patrícia Lima",
      crp: "05/13131",
      email: "patricia@teste.com",
      abordagem: "Sistêmica",
      especialidades: ["Família", "Conflitos"],
      temas: ["Casais", "Famílias"],
      preco: 250.00,
      cidade: "Niterói",
      estado: "RJ",
      biografia: "Terapia familiar e de casal com foco na resolução de conflitos geracionais.",
      genero: "Mulher Cis",
      foto: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=200&h=200&auto=format&fit=crop"
    },
    {
      nome: "Tiago Rocha",
      crp: "07/14141",
      email: "tiago@teste.com",
      abordagem: "TCC",
      especialidades: ["Ansiedade Social", "Fobia"],
      temas: ["Jovens", "Estudantes"],
      preco: 110.00,
      cidade: "Porto Alegre",
      estado: "RS",
      biografia: "Tratamento focado em ansiedade social e superação de medos limitantes.",
      genero: "Homem Cis",
      foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&auto=format&fit=crop"
    },
    {
      nome: "Dra. Renata Mello",
      crp: "06/15151",
      email: "renata@teste.com",
      abordagem: "Logoterapia",
      especialidades: ["Sentido", "Depressão"],
      temas: ["Idosos", "Doenças Crônicas"],
      preco: 160.00,
      cidade: "São Caetano",
      estado: "SP",
      biografia: "Acompanhamento psicológico para pacientes com doenças crônicas e idosos.",
      genero: "Mulher Cis",
      foto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop"
    },
    {
      nome: "Gabriel Santos",
      crp: "11/16161",
      email: "gabriel@teste.com",
      abordagem: "Esquizoanálise",
      especialidades: ["Filosofia", "Arte"],
      temas: ["Artistas", "Criativos"],
      preco: 140.00,
      cidade: "Fortaleza",
      estado: "CE",
      biografia: "Clínica transversal focada em processos criativos e subjetividades contemporâneas.",
      genero: "Homem Cis",
      foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=200&auto=format&fit=crop"
    },
    {
      nome: "Dra. Cláudia Castro",
      crp: "10/17171",
      email: "claudia@teste.com",
      abordagem: "Psicodrama",
      especialidades: ["Grupos", "Dinâmica"],
      temas: ["Mulheres", "Autoestima"],
      preco: 170.00,
      cidade: "Belém",
      estado: "PA",
      biografia: "Facilitadora de grupos terapêuticos e vivências de psicodrama.",
      genero: "Mulher Cis",
      foto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&h=200&auto=format&fit=crop"
    },
    {
      nome: "André Valente",
      crp: "03/18181",
      email: "andre@teste.com",
      abordagem: "DBT",
      especialidades: ["Borderline", "Regulação"],
      temas: ["Adultos", "Crise"],
      preco: 300.00,
      cidade: "Salvador",
      estado: "BA",
      biografia: "Especialista em Terapia Dialética Comportamental e regulação emocional.",
      genero: "Homem Cis",
      foto: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=200&h=200&auto=format&fit=crop"
    },
    {
      nome: "Sofia Albuquerque",
      crp: "06/19191",
      email: "sofia@teste.com",
      abordagem: "Psicologia Positiva",
      especialidades: ["Felicidade", "Propósito"],
      temas: ["Lideranças", "Carreira"],
      preco: 190.00,
      cidade: "São Bernardo",
      estado: "SP",
      biografia: "Aplicação da psicologia positiva no ambiente corporativo e vida pessoal.",
      genero: "Mulher Cis",
      foto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&auto=format&fit=crop"
    },
    {
      nome: "Lucas Duarte",
      crp: "14/20202",
      email: "duarte@teste.com",
      abordagem: "Existencialismo",
      especialidades: ["Angústia", "Sentido"],
      temas: ["Adultos", "LGBTQIA+"],
      preco: 125.00,
      cidade: "Campo Grande",
      estado: "MS",
      biografia: "Clínica existencial dedicada ao acolhimento de questões identitárias e de gênero.",
      genero: "Homem Trans",
      foto: "https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=200&h=200&auto=format&fit=crop"
    },
    {
      nome: "Bruna Xavier",
      crp: "06/21212",
      email: "bruna@teste.com",
      abordagem: "Winnicottiana",
      especialidades: ["Maternidade", "Puerpério"],
      temas: ["Mães", "Bebês"],
      preco: 210.00,
      cidade: "Jundiaí",
      estado: "SP",
      biografia: "Apoio psicológico focado na parentalidade e no desenvolvimento inicial.",
      genero: "Mulher Cis",
      foto: "https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=200&h=200&auto=format&fit=crop"
    },
    {
      nome: "Dra. Isabela Neves",
      crp: "09/22223",
      email: "isabela@teste.com",
      abordagem: "Neuropsicologia",
      especialidades: ["Avaliação", "Memória"],
      temas: ["Adultos", "Idosos"],
      preco: 350.00,
      cidade: "Goiânia",
      estado: "GO",
      biografia: "Avaliação neuropsicológica completa e reabilitação cognitiva.",
      genero: "Mulher Cis",
      foto: "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?q=80&w=200&h=200&auto=format&fit=crop"
    },
    {
      nome: "Samuel Ferreira",
      crp: "16/23232",
      email: "samuel@teste.com",
      abordagem: "Psicologia de Selves",
      especialidades: ["Trauma", "Dissociação"],
      temas: ["Adultos", "Vítimas de Violência"],
      preco: 280.00,
      cidade: "Vitória",
      estado: "ES",
      biografia: "Especialista em traumas complexos e processos de cura emocional profunda.",
      genero: "Homem Cis",
      foto: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=200&h=200&auto=format&fit=crop"
    },
    {
      nome: "Dra. Monica Guedes",
      crp: "06/24242",
      email: "monica@teste.com",
      abordagem: "TCC",
      especialidades: ["Emagrecimento", "Alimentação"],
      temas: ["Mulheres", "Transtornos Alimentares"],
      preco: 200.00,
      cidade: "Sorocaba",
      estado: "SP",
      biografia: "Foco no tratamento de compulsão alimentar e relação com o corpo.",
      genero: "Mulher Cis",
      foto: "https://images.unsplash.com/photo-1512485694743-9c9538b4e6e0?q=80&w=200&h=200&auto=format&fit=crop"
    }
  ];

  for (const item of psicologosData) {
    const slug = item.nome.toLowerCase().replace(/\s+/g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    await prisma.user.create({
      data: {
        email: item.email,
        password: passwordHash,
        psicologo: {
          create: {
            nome: item.nome,
            crp: item.crp,
            slug: `${slug}-${Math.floor(Math.random() * 1000)}`,
            whatsapp: "11999999999",
            abordagem: item.abordagem,
            especialidades: item.especialidades,
            temas: item.temas,
            preco: item.preco,
            biografia: item.biografia,
            plano: Math.random() > 0.5 ? "DUO_II" : "DUO_I",
            verificado: true,
            status: "ATIVO",
            cidade: item.cidade,
            estado: item.estado,
            duracaoSessao: 50,
            atendeOnline: true,
            atendePresencial: Math.random() > 0.5,
            foto: item.foto,
            genero: item.genero
          }
        }
      }
    });
  }



  console.log('Seed Finalizado com Sucesso ✅')
  console.log('--- Credenciais Geradas ---')
  console.log('✅ Psicólogo Duo I (Básico): duo1@psiduo.com.br / Senha: 123456')
  console.log('✅ Psicólogo Duo II (Completo): duo2@psiduo.com.br / Senha: 123456')
  console.log('✅ CATÁLOGO: Profissionais configurados corretamente como ATIVOS.')
  console.log('--- Pacientes Duo I ---')
  console.log('👦 João (CPF: 11111111111)')
  console.log('--- Pacientes Duo II (Gama Clínica) ---')
  console.log('👩 Maria (Ansiedade/Padrão) - CPF: 22222222222')
  console.log('👨 Pedro (Burnout/Dev) - CPF: 33333333333')
  console.log('👩 Sofia (Depressão Moderada) - CPF: 44444444444')
  console.log('👦 Lucas (TDAH/Ansiedade Social) - CPF: 55555555555')
  console.log('👩 Julia (Luto Agudo) - CPF: 66666666666')
  console.log('👨 Roberto (Transição de Carreira) - CPF: 77777777777')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
