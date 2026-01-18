import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/password';

const prisma = new PrismaClient();

const psicologos = [
  // DUO II (Premium)
  {
    nome: "Dra. Ana Carolina Silva",
    email: "ana.silva@psiduo.com",
    crp: "06/123456",
    whatsapp: "5511987654321",
    abordagem: "TCC – Terapia Cognitivo-Comportamental",
    especialidades: ["Psicologia Clínica", "Neuropsicologia"],
    temas: ["Ansiedade", "Depressão", "Transtornos de Humor"],
    preco: 180,
    duracaoSessao: 50,
    plano: "DUO_II",
    status: "ATIVO",
    cidade: "São Paulo",
    estado: "SP",
    idade: 35,
    genero: "Feminino",
    biografia: "Psicóloga clínica com 10 anos de experiência em TCC. Especialista em transtornos de ansiedade e depressão. Atendimento humanizado e baseado em evidências científicas.",
    foto: "https://i.pravatar.cc/300?img=1",
    videoApresentacao: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    redesSociais: {
      instagram: "@dra.anacarolina",
      linkedin: "ana-carolina-silva"
    }
  },
  {
    nome: "Dr. Roberto Mendes",
    email: "roberto.mendes@psiduo.com",
    crp: "06/234567",
    whatsapp: "5511976543210",
    abordagem: "Psicanálise Freudiana (Sigmund Freud)",
    especialidades: ["Psicanálise", "Psicologia Clínica"],
    temas: ["Trauma", "Relacionamentos", "Autoconhecimento"],
    preco: 200,
    duracaoSessao: 50,
    plano: "DUO_II",
    status: "ATIVO",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    idade: 45,
    genero: "Masculino",
    biografia: "Psicanalista com formação internacional. 15 anos de experiência clínica. Atendimento presencial e online com foco em processos profundos de autoconhecimento.",
    foto: "https://i.pravatar.cc/300?img=12"
  },
  {
    nome: "Dra. Mariana Costa",
    email: "mariana.costa@psiduo.com",
    crp: "06/345678",
    whatsapp: "5511965432109",
    abordagem: "ACT – Terapia de Aceitação e Compromisso",
    especialidades: ["Psicologia Clínica", "Terapia de Casal"],
    temas: ["Relacionamentos", "Ansiedade", "Mindfulness"],
    preco: 170,
    duracaoSessao: 50,
    plano: "DUO_II",
    status: "ATIVO",
    cidade: "Belo Horizonte",
    estado: "MG",
    idade: 32,
    genero: "Feminino",
    biografia: "Especialista em ACT e mindfulness. Trabalho com aceitação emocional e valores pessoais. Atendimento individual e de casais.",
    foto: "https://i.pravatar.cc/300?img=5",
    videoApresentacao: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
  {
    nome: "Dr. Felipe Santos",
    email: "felipe.santos@psiduo.com",
    crp: "06/456789",
    whatsapp: "5511954321098",
    abordagem: "Gestalt-Terapia",
    especialidades: ["Psicologia Clínica", "Psicologia Organizacional"],
    temas: ["Autoestima", "Carreira", "Desenvolvimento Pessoal"],
    preco: 190,
    duracaoSessao: 50,
    plano: "DUO_II",
    status: "ATIVO",
    cidade: "Curitiba",
    estado: "PR",
    idade: 38,
    genero: "Masculino",
    biografia: "Gestalt-terapeuta com experiência em psicologia organizacional. Foco em desenvolvimento pessoal e profissional. Atendimento online e presencial.",
    foto: "https://i.pravatar.cc/300?img=13"
  },
  {
    nome: "Dra. Juliana Oliveira",
    email: "juliana.oliveira@psiduo.com",
    crp: "06/567890",
    whatsapp: "5511943210987",
    abordagem: "DBT – Terapia Dialética Comportamental",
    especialidades: ["Psicologia Clínica"],
    temas: ["Borderline", "Regulação Emocional", "Automutilação"],
    preco: 220,
    duracaoSessao: 50,
    plano: "DUO_II",
    status: "ATIVO",
    cidade: "Porto Alegre",
    estado: "RS",
    idade: 40,
    genero: "Feminino",
    biografia: "Especialista em DBT e regulação emocional. Atendimento especializado para transtorno de personalidade borderline. Formação internacional em DBT.",
    foto: "https://i.pravatar.cc/300?img=9",
    redesSociais: {
      instagram: "@psi.juliana",
      youtube: "Dra Juliana Oliveira"
    }
  },
  
  // DUO I (Gratuito)
  {
    nome: "Psic. Lucas Ferreira",
    email: "lucas.ferreira@psiduo.com",
    crp: "06/678901",
    whatsapp: "5511932109876",
    abordagem: "TCC – Terapia Cognitivo-Comportamental",
    especialidades: ["Psicologia Clínica"],
    temas: ["Ansiedade", "Estresse"],
    preco: 120,
    duracaoSessao: 50,
    plano: "DUO_I",
    status: "ATIVO",
    cidade: "Campinas",
    estado: "SP",
    idade: 28,
    genero: "Masculino",
    biografia: "Psicólogo recém-formado com foco em TCC. Atendimento online acessível para ansiedade e estresse.",
    foto: "https://i.pravatar.cc/300?img=14"
  },
  {
    nome: "Psic. Beatriz Almeida",
    email: "beatriz.almeida@psiduo.com",
    crp: "06/789012",
    whatsapp: "5511921098765",
    abordagem: "Abordagem Centrada na Pessoa (ACP)",
    especialidades: ["Psicologia Clínica"],
    temas: ["Autoestima", "Relacionamentos"],
    preco: 100,
    duracaoSessao: 50,
    plano: "DUO_I",
    status: "ATIVO",
    cidade: "Santos",
    estado: "SP",
    idade: 26,
    genero: "Feminino",
    biografia: "Psicóloga humanista com atendimento acolhedor. Foco em autoestima e relacionamentos interpessoais.",
    foto: "https://i.pravatar.cc/300?img=10"
  },
  {
    nome: "Psic. Carlos Eduardo",
    email: "carlos.eduardo@psiduo.com",
    crp: "06/890123",
    whatsapp: "5511910987654",
    abordagem: "Análise do Comportamento",
    especialidades: ["Psicologia Clínica"],
    temas: ["Fobias", "Compulsões"],
    preco: 130,
    duracaoSessao: 50,
    plano: "DUO_I",
    status: "ATIVO",
    cidade: "Sorocaba",
    estado: "SP",
    idade: 30,
    genero: "Masculino",
    biografia: "Analista do comportamento. Trabalho com modificação de comportamentos disfuncionais e fobias.",
    foto: "https://i.pravatar.cc/300?img=15"
  },
  {
    nome: "Psic. Fernanda Lima",
    email: "fernanda.lima@psiduo.com",
    crp: "06/901234",
    whatsapp: "5511909876543",
    abordagem: "Psicologia Positiva Clínica",
    especialidades: ["Psicologia Clínica"],
    temas: ["Bem-estar", "Felicidade"],
    preco: 110,
    duracaoSessao: 50,
    plano: "DUO_I",
    status: "ATIVO",
    cidade: "Ribeirão Preto",
    estado: "SP",
    idade: 27,
    genero: "Feminino",
    biografia: "Psicóloga com foco em psicologia positiva. Trabalho com fortalecimento de recursos pessoais e bem-estar.",
    foto: "https://i.pravatar.cc/300?img=20"
  },
  {
    nome: "Psic. Gabriel Rocha",
    email: "gabriel.rocha@psiduo.com",
    crp: "06/012345",
    whatsapp: "5511898765432",
    abordagem: "Terapia Sistêmica",
    especialidades: ["Psicologia Clínica"],
    temas: ["Família", "Adolescência"],
    preco: 140,
    duracaoSessao: 50,
    plano: "DUO_I",
    status: "ATIVO",
    cidade: "São José dos Campos",
    estado: "SP",
    idade: 29,
    genero: "Masculino",
    biografia: "Terapeuta sistêmico com experiência em terapia familiar e de adolescentes. Atendimento online.",
    foto: "https://i.pravatar.cc/300?img=17"
  }
];

async function seed() {
  console.log('🗑️  Limpando banco de dados...');
  
  // Limpar dados existentes (ordem importa por causa das relações)
  await prisma.auditLog.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  
  // Deletar avaliações antes de psicólogos (foreign key)
  try {
    await prisma.$executeRaw`DELETE FROM "Avaliacao"`;
  } catch (e) {
    console.log('⚠️  Tabela Avaliacao não existe ou já está vazia');
  }
  
  await prisma.psicologo.deleteMany();
  await prisma.user.deleteMany();
  
  console.log('✅ Banco limpo!');
  console.log('');
  console.log('👥 Criando 10 psicólogos...');
  
  const senha = await hashPassword('PsiDuo@2026');
  
  for (const psi of psicologos) {
    // Criar User
    const user = await prisma.user.create({
      data: {
        email: psi.email,
        password: senha,
      }
    });
    
    // Gerar slug
    const slug = psi.nome
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .trim();
    
    // Criar Psicologo
    await prisma.psicologo.create({
      data: {
        userId: user.id,
        nome: psi.nome,
        slug: `${slug}-${Math.floor(1000 + Math.random() * 9000)}`,
        crp: psi.crp,
        whatsapp: psi.whatsapp,
        abordagem: psi.abordagem,
        especialidades: psi.especialidades,
        temas: psi.temas,
        preco: psi.preco,
        duracaoSessao: psi.duracaoSessao,
        plano: psi.plano as any,
        status: psi.status,
        cidade: psi.cidade,
        estado: psi.estado,
        idade: psi.idade,
        genero: psi.genero,
        biografia: psi.biografia,
        foto: psi.foto,
        videoApresentacao: psi.videoApresentacao,
        redesSociais: psi.redesSociais,
        acessos: Math.floor(Math.random() * 500),
        cliquesWhatsapp: Math.floor(Math.random() * 100),
      }
    });
    
    console.log(`✅ ${psi.nome} (${psi.plano})`);
  }
  
  console.log('');
  console.log('🎉 Seed concluído com sucesso!');
  console.log('');
  console.log('📊 Resumo:');
  console.log('   - 10 psicólogos criados');
  console.log('   - 5 Duo II (Premium)');
  console.log('   - 5 Duo I (Gratuito)');
  console.log('   - Senha padrão: PsiDuo@2026');
  console.log('');
  console.log('🔐 Credenciais de teste:');
  console.log('   Email: ana.silva@psiduo.com');
  console.log('   Senha: PsiDuo@2026');
}

seed()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
