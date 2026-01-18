import { PrismaClient } from '@prisma/client';
import { verifyPassword } from './lib/password';

const prisma = new PrismaClient();

async function testLogin() {
  const email = 'ana.silva@psiduo.com';
  const senha = 'PsiDuo@2026';
  
  console.log('🔍 Testando login...');
  console.log('Email:', email);
  console.log('Senha:', senha);
  console.log('');
  
  // Buscar usuário
  const user = await prisma.user.findUnique({
    where: { email },
    include: { psicologo: true }
  });
  
  if (!user) {
    console.log('❌ Usuário não encontrado!');
    return;
  }
  
  console.log('✅ Usuário encontrado:');
  console.log('  - ID:', user.id);
  console.log('  - Email:', user.email);
  console.log('  - Psicólogo:', user.psicologo?.nome);
  console.log('  - Hash da senha:', user.password?.substring(0, 20) + '...');
  console.log('');
  
  if (!user.password) {
    console.log('❌ Usuário sem senha!');
    return;
  }
  
  // Verificar senha
  const isValid = await verifyPassword(senha, user.password);
  
  if (isValid) {
    console.log('✅ Senha correta! Login deve funcionar.');
  } else {
    console.log('❌ Senha incorreta! Problema no hash.');
  }
}

testLogin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
