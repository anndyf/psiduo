import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET - Listar check-ins do grupo
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ grupoId: string }> }
) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    
    // @ts-ignore
    const psicologoId = session?.user?.psicologoId;
    // @ts-ignore
    let pacienteId = session?.user?.pacienteId;

    const grupoId = params.grupoId;

    if (!psicologoId && !pacienteId) {
        const token = req.headers.get("Authorization")?.replace("Bearer ", "");
        if (token) {
             const p = await prisma.paciente.findFirst({ where: { tokenAcesso: token } });
             if (p) pacienteId = p.id;
        }
    }

    if (!psicologoId && !pacienteId) {
         return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    if (psicologoId) {
        // Lógica do Psicólogo (Mantida)
        const grupo = await prisma.grupoTerapeutico.findFirst({
            where: { id: grupoId, psicologoId },
        });

        if (!grupo) return NextResponse.json({ error: "Grupo não encontrado" }, { status: 404 });

        const checkIns = await (prisma as any).checkInGrupo.findMany({
            where: { grupoId },
            include: {
                respostas: {
                    include: {
                        paciente: { select: { id: true, nome: true } },
                    },
                },
            },
            orderBy: { dataEnvio: "desc" },
        });

        return NextResponse.json({ checkIns });
    } else if (pacienteId) {
        // Lógica do Paciente (Nova)
        // 1. Verificar se participa do grupo
        const membro = await prisma.paciente.findFirst({
            where: { id: pacienteId, grupoId },
        });

        if (!membro) return NextResponse.json({ error: "Acesso negado ao grupo" }, { status: 403 });

        // 2. Buscar check-ins ativos
        const checkIns = await (prisma as any).checkInGrupo.findMany({
            where: { 
                grupoId,
                ativo: true,
                dataExpira: { gt: new Date() } // Apenas não expirados
            },
            include: {
                respostas: {
                    where: { pacienteId }, // Verificar se JÁ respondeu
                    select: { id: true }
                }
            },
            orderBy: { dataEnvio: "desc" },
        });
        
        // Mapear para facilitar front
        const checkInsFormatados = checkIns.map((c: any) => ({
            ...c,
            respondido: c.respostas.length > 0
        }));

        return NextResponse.json({ checkIns: checkInsFormatados });
    }

    return NextResponse.json({ error: "Perfil inválido" }, { status: 403 });
  } catch (error) {
    console.error("Erro ao buscar check-ins:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST - Criar novo check-in
export async function POST(
  req: NextRequest,
  props: { params: Promise<{ grupoId: string }> }
) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || !session.user?.psicologoId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const grupoId = params.grupoId;
    const body = await req.json();
    const { titulo, descricao, dataExpira } = body;

    if (!titulo || !dataExpira) {
      return NextResponse.json(
        { error: "Título e data de expiração são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o grupo pertence ao psicólogo
    const grupo = await prisma.grupoTerapeutico.findFirst({
      where: {
        id: grupoId,
        // @ts-ignore
        psicologoId: session.user.psicologoId,
      },
    });

    if (!grupo) {
      return NextResponse.json({ error: "Grupo não encontrado" }, { status: 404 });
    }

    // Criar check-in
    const checkIn = await (prisma as any).checkInGrupo.create({
      data: {
        grupoId,
        titulo,
        descricao,
        dataExpira: new Date(dataExpira),
      },
    });

    return NextResponse.json({ success: true, checkIn });
  } catch (error) {
    console.error("Erro ao criar check-in:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
