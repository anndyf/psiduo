'use server'

import { prisma } from "@/lib/prisma";

export async function loginPsicologo(formData: FormData) {
  const email = formData.get("email") as string;
  const senha = formData.get("senha") as string;

  // 1. Busca o psicólogo pelo e-mail
  const psicologo = await prisma.psicologo.findUnique({
    where: { email },
  });

  // 2. Valida existência e senha
  if (!psicologo || psicologo.senha !== senha) {
    return { error: "E-mail ou senha incorretos." };
  }

  // 3. Verifica o status para dar um feedback personalizado
  if (psicologo.status === "PENDENTE") {
    return { 
      success: true, 
      id: psicologo.id, 
      status: "PENDENTE",
      message: "Sua conta está pendente. Vamos escolher um plano?" 
    };
  }

  return { success: true, id: psicologo.id, status: psicologo.status };
}