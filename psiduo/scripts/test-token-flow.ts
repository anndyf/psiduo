
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateToken(length = 12) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

async function main() {
  console.log("--- Teste de Fluxo de Token ---");

  // 1. Buscar um psicólogo para associar
  const psicologo = await prisma.psicologo.findFirst();
  if (!psicologo) {
      console.log("❌ Nenhum psicólogo encontrado para teste.");
      return;
  }
  console.log(`Psicólogo encontrado: ${psicologo.nome} (${psicologo.id})`);

  // 2. Criar Paciente Simulado
  const token = generateToken();
  const nome = "Paciente Teste Token Auto";
  
  console.log(`Criando paciente com token: ${token}`);

  try {
      const paciente = await prisma.paciente.create({
          data: {
              nome,
              psicologoId: psicologo.id,
              tokenAcesso: token,
          }
      });
      console.log(`✅ Paciente criado com ID: ${paciente.id}`);

      // 3. Validar Token (Simulando validarToken)
      console.log("Validando token...");
      const check = await prisma.paciente.findUnique({
          where: { tokenAcesso: token },
          select: { id: true, nome: true }
      });

      if (check) {
          console.log(`✅ SUCESSO! Token validado para: ${check.nome}`);
      } else {
          console.log(`❌ FALHA! Token não encontrado no banco.`);
      }

      // 4. Limpeza
      console.log("Deletando paciente de teste...");
      await prisma.paciente.delete({ where: { id: paciente.id } });
      console.log("Limpeza concluída.");

  } catch (e) {
      console.error("Erro no fluxo:", e);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
