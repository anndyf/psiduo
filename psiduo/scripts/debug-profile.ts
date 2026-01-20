
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = "ana.silva@psiduo.com";
  console.log(`Buscando perfil para ${email}...`);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
      console.log("User não encontrado.");
      return;
  }

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
      console.log("Psicologo não encontrado.");
      return;
  }

  console.log("Psicologo encontrado:");
  console.log("ID:", psicologo.id);
  console.log("Nome:", psicologo.nome);
  console.log("Plano:", psicologo.plano);
  console.log("Status:", psicologo.status);
  console.log("Redes:", psicologo.redesSociais);
  console.log("Preco (Decimal):", psicologo.preco);
  
  // Testando retorno serializável (simulando o Server Action)
  const dados = {
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
  };
  
  console.log("\nDados serializados simulação:");
  console.log(JSON.stringify(dados, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
