
import { PrismaClient } from '@prisma/client';
import { verifyPassword } from '../lib/password'; // Ajuste o caminho se necessário

const prisma = new PrismaClient();

async function main() {
  console.log("--- Diagnosticando Login ---");
  
  // 1. Listar usuários
  const users = await prisma.user.findMany({
    take: 5,
    select: { id: true, email: true, psicologo: { select: { id: true, nome: true } } }
  });
  
  console.log(`Encontrados ${users.length} usuários.`);
  users.forEach(u => console.log(`- ${u.email} (Psicologo: ${u.psicologo?.nome || 'Não'})`));

  if (users.length === 0) {
      console.log("ERRO CRÍTICO: Banco de dados de usuários está vazio.");
  }

  // 2. Teste simulado de senha
  try {
      const emailAlvo = "ana.silva@psiduo.com"; // Usuário conhecido
      const userFull = await prisma.user.findUnique({
          where: { email: emailAlvo },
      });

      if (userFull && userFull.password) {
          console.log(`\nVerificando senha para ${emailAlvo}...`);
          const senhasTeste = ["123456", "senha123", "admin", "password", "teste"];
          
          let encontrou = false;
          for (const senha of senhasTeste) {
              const match = await verifyPassword(senha, userFull.password);
              if (match) {
                  console.log(`✅ SUCESSO! A senha é: "${senha}"`);
                  encontrou = true;
                  break;
              }
          }
          
          if (!encontrou) {
              console.log("❌ Nenhuma das senhas comuns funcionou.");
              console.log("Hash armazenado (parcial):", userFull.password.substring(0, 10) + "...");
          }
      } else {
          console.log(`Usuário ${emailAlvo} não encontrado ou sem senha.`);
      }

  } catch (e) {
      console.error("Erro ao verificar senha:", e);
  }

  console.log("--- Fim do Diagnóstico ---");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
