"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// --- SEGURANÇA ---
const ADMIN_USER = "Admin";
const ADMIN_PASS = "Duo2026#!Admin";
const COOKIE_NAME = "psiduo_admin_token";

export async function adminLogin(formData: FormData) {
  const user = formData.get("user") as string;
  const pass = formData.get("pass") as string;

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    const cookieStore = await cookies();
    // Define cookie válido por 24 horas
    cookieStore.set(COOKIE_NAME, "authenticated_so_secure", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 dia
      path: "/",
    });
    return { success: true };
  }

  return { success: false, error: "Credenciais inválidas" };
}

export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/admin/login");
}

async function checkAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME);

  if (!token || token.value !== "authenticated_so_secure") {
    // Se for chamada de uma Server Action, retorna erro ou lança.
    // Se for página, deve redirecionar.
    // Como estamos em server action, vamos lançar erro que o front pega.
    throw new Error("UNAUTHORIZED_ADMIN");
  }
}

// --- METRICAS GERAIS ---
export async function getAdminMetrics() {
  await checkAdmin();

  const [
    totalPsicologos,
    totalPacientes,
    totalDiarios,
    totalPlanoII
  ] = await Promise.all([
    prisma.psicologo.count(),
    prisma.paciente.count(),
    prisma.registroDiario.count(),
    prisma.psicologo.count({ where: { plano: 'DUO_II' } })
  ]);

  return {
    totalPsicologos,
    totalPacientes,
    totalDiarios,
    totalPlanoII
  };
}

// --- LISTAR PSICÓLOGOS ---
export async function getPsicologosList() {
  try {
    await checkAdmin();
    console.log("Admin Action: Fetching psicologos...");

    const psis = await prisma.psicologo.findMany({
      orderBy: { criadoEm: 'desc' },
      select: {
        id: true,
        nome: true,
        crp: true,
        plano: true,
        status: true,
        verificado: true,
        whatsapp: true,
        criadoEm: true,
        _count: {
          select: { pacientes: true }
        },
        user: {
          select: { email: true }
        }
      }
    });

    return psis.map(p => ({
      id: p.id,
      nome: p.nome,
      email: p.user?.email || "Email não encontrado",
      crp: p.crp,
      plano: p.plano,
      status: p.status,
      verificado: p.verificado,
      whatsapp: p.whatsapp,
      pacientes: p._count.pacientes,
      criadoEm: p.criadoEm.toISOString() 
    }));
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED_ADMIN') throw error;
    console.error("Admin Action Error:", error);
    return [];
  }
}

// --- AÇÕES ---
export async function toggleStatusPsicologo(id: string, novoStatus: string) {
  await checkAdmin();
  
  try {
    await prisma.psicologo.update({
      where: { id },
      data: { status: novoStatus }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao atualizar status" };
  }
}

export async function togglePlano(id: string, currentPlano: string, diasDeValidade?: number) {
  await checkAdmin();
  const novoPlano = currentPlano === 'DUO_II' ? 'DUO_I' : 'DUO_II';
  
  let validade: Date | null = null;

  if (novoPlano === 'DUO_II' && diasDeValidade && diasDeValidade > 0) {
    const data = new Date();
    data.setDate(data.getDate() + diasDeValidade);
    validade = data;
  }

  try {
    await prisma.psicologo.update({
      where: { id },
      data: { 
          plano: novoPlano,
          planoValidade: validade,
          subscriptionId: null // Remove vínculo de assinatura automática ao forçar manual
      }
    });
    return { success: true, novoPlano };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erro ao atualizar plano" };
  }
}

export async function toggleVerificado(id: string, currentStatus: boolean) {
  await checkAdmin();
  
  try {
    await prisma.psicologo.update({
      where: { id },
      data: { verificado: !currentStatus }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao atualizar verificação" };
  }
}

export async function getFinancialMetrics() {
  await checkAdmin();
  
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalPaying,
    monthlyUsers,
    yearlyUsers,
    manualUsers,
    newSubsThisMonth
  ] = await Promise.all([
    prisma.psicologo.count({ where: { plano: 'DUO_II' } }),
    prisma.psicologo.count({ where: { plano: 'DUO_II', ciclo: 'MONTHLY' } }),
    prisma.psicologo.count({ where: { plano: 'DUO_II', ciclo: 'YEARLY' } }),
    prisma.psicologo.count({ where: { plano: 'DUO_II', ciclo: null } }), // Manuais ou legado
    prisma.psicologo.count({ 
      where: { 
        plano: 'DUO_II',
        dataInicioPlano: { gte: firstDayOfMonth }
      } 
    })
  ]);

  // Estimativa de MRR (Receita Recorrente Mensal)
  const mrrFromMonthly = monthlyUsers * 39.99;
  const mrrFromYearly = yearlyUsers * (429.90 / 12);
  const totalMRR = mrrFromMonthly + mrrFromYearly;

  return {
    totalPaying,
    breakdown: {
      monthly: monthlyUsers,
      yearly: yearlyUsers,
      manual: manualUsers
    },
    newSubsThisMonth,
    revenue: {
      mrr: totalMRR,
      monthlyTotal: mrrFromMonthly,
      yearlyShare: mrrFromYearly
    }
  };
}
