
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Checando Prisma Client...");
  
  // @ts-ignore
  if (prisma.paciente) {
      console.log("✅ prisma.paciente está DEFINIDO.");
      // @ts-ignore
      const count = await prisma.paciente.count();
      console.log(`Contagem de pacientes: ${count}`);
  } else {
      console.log("❌ prisma.paciente está UNDEFINED.");
      console.log("Keys disponíveis:", Object.keys(prisma));
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
