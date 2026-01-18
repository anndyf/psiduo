/**
 * Script de Migração Segura: Sistema Antigo → NextAuth
 * 
 * Este script migra psicólogos existentes para o novo modelo de autenticação
 * sem perder dados. Executa em 3 etapas:
 * 
 * 1. Adiciona coluna userId como opcional
 * 2. Cria Users para psicólogos existentes
 * 3. Torna userId obrigatório
 */

import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/password';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Iniciando migração segura...\n');

  // ETAPA 1: Buscar psicólogos sem User
  console.log('📊 Buscando psicólogos existentes...');
  const psicologos = await prisma.$queryRaw<any[]>`
    SELECT id, nome, email, senha 
    FROM "Psicologo" 
    WHERE email IS NOT NULL
  `;

  console.log(`✅ Encontrados ${psicologos.length} psicólogos para migrar\n`);

  if (psicologos.length === 0) {
    console.log('✨ Nenhum psicólogo para migrar. Tudo pronto!');
    return;
  }

  // ETAPA 2: Criar Users e vincular
  console.log('🔐 Criando usuários e aplicando hash de senhas...\n');

  for (const psi of psicologos) {
    try {
      // Verificar se já existe User com este email
      const existingUser = await prisma.user.findUnique({
        where: { email: psi.email }
      });

      let userId: string;

      if (existingUser) {
        console.log(`⚠️  User já existe para ${psi.nome} (${psi.email})`);
        userId = existingUser.id;
      } else {
        // Criar novo User
        const senhaHash = psi.senha 
          ? await hashPassword(psi.senha)
          : await hashPassword('PsiDuo@2026'); // Senha temporária

        const user = await prisma.user.create({
          data: {
            email: psi.email,
            password: senhaHash,
          }
        });

        userId = user.id;
        
        if (!psi.senha) {
          console.log(`⚠️  ${psi.nome}: Senha temporária criada (PsiDuo@2026)`);
        } else {
          console.log(`✅ ${psi.nome}: User criado com senha migrada`);
        }
      }

      // Vincular User ao Psicologo
      await prisma.$executeRaw`
        UPDATE "Psicologo" 
        SET "userId" = ${userId}
        WHERE id = ${psi.id}
      `;

    } catch (error: any) {
      console.error(`❌ Erro ao migrar ${psi.nome}:`, error.message);
    }
  }

  console.log('\n✅ Migração concluída!\n');

  // ETAPA 3: Verificar resultados
  const psicologosSemUser = await prisma.$queryRaw<any[]>`
    SELECT COUNT(*) as count
    FROM "Psicologo" 
    WHERE "userId" IS NULL
  `;

  const count = parseInt(psicologosSemUser[0].count);

  if (count > 0) {
    console.log(`⚠️  ATENÇÃO: ${count} psicólogos ainda sem User vinculado`);
  } else {
    console.log('✨ Todos os psicólogos foram migrados com sucesso!');
  }

  // ETAPA 4: Remover colunas antigas (COMENTADO - executar manualmente)
  console.log('\n📝 Próximos passos manuais:');
  console.log('1. Verificar que todos os psicólogos têm userId');
  console.log('2. Executar: ALTER TABLE "Psicologo" DROP COLUMN email;');
  console.log('3. Executar: ALTER TABLE "Psicologo" DROP COLUMN senha;');
  console.log('4. Executar: ALTER TABLE "Psicologo" ALTER COLUMN "userId" SET NOT NULL;');
}

main()
  .catch((e) => {
    console.error('❌ Erro fatal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
