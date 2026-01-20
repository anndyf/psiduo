
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/password';

const prisma = new PrismaClient();

async function main() {
  const email = "ana.silva@psiduo.com";
  const novaSenha = "123456";

  console.log(`Resetando senha para ${email}...`);

  const hashedPassword = await hashPassword(novaSenha);

  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword }
  });

  console.log(`✅ Senha atualizada com sucesso para "${novaSenha}"`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
