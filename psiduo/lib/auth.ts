import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { redirect } from "next/navigation";

/**
 * Obtém o usuário autenticado atual
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

/**
 * Requer autenticação - redireciona para login se não autenticado
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/**
 * Obtém a sessão completa
 */
export async function getSession() {
  return getServerSession(authOptions);
}
