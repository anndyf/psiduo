import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Listar vitórias do grupo
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ grupoId: string }> }
) {
  try {
    const params = await props.params;
    const grupoId = params.grupoId;
    const { searchParams } = new URL(req.url);
    const apenasAprovadas = searchParams.get("aprovadas") === "true";

    // Buscar vitórias
    const vitorias = await (prisma as any).vitoriaGrupo.findMany({
      where: {
        grupoId,
        ...(apenasAprovadas && { aprovado: true }),
      },
      include: {
        paciente: {
          select: { id: true, nome: true },
        },
        reacoes: {
          include: {
            paciente: {
              select: { id: true, nome: true },
            },
          },
        },
      },
      orderBy: { criadoEm: "desc" },
    });

    return NextResponse.json({ vitorias });
  } catch (error) {
    console.error("Erro ao buscar vitórias:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST - Criar nova vitória (participante)
export async function POST(
  req: NextRequest,
  props: { params: Promise<{ grupoId: string }> }
) {
  try {
    const params = await props.params;
    const grupoId = params.grupoId;
    const body = await req.json();
    const { pacienteId, texto } = body;

    if (!pacienteId || !texto) {
      return NextResponse.json(
        { error: "Paciente e texto são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o paciente pertence ao grupo
    const paciente = await prisma.paciente.findFirst({
      where: {
        id: pacienteId,
        grupoId,
      },
    });

    if (!paciente) {
      return NextResponse.json(
        { error: "Paciente não pertence a este grupo" },
        { status: 403 }
      );
    }

    // Criar vitória (pendente de aprovação)
    const vitoria = await (prisma as any).vitoriaGrupo.create({
      data: {
        grupoId,
        pacienteId,
        texto,
        aprovado: false, // Precisa aprovação do terapeuta
      },
      include: {
        paciente: {
          select: { id: true, nome: true },
        },
      },
    });

    return NextResponse.json({ success: true, vitoria });
  } catch (error) {
    console.error("Erro ao criar vitória:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// PATCH - Aprovar/reprovar vitória (terapeuta)
export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ grupoId: string }> }
) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || !session.user?.psicologoId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const grupoId = params.grupoId;
    const body = await req.json();
    const { vitoriaId, aprovado } = body;

    if (!vitoriaId || typeof aprovado !== "boolean") {
      return NextResponse.json(
        { error: "ID da vitória e status de aprovação são obrigatórios" },
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

    // Atualizar vitória
    const vitoria = await (prisma as any).vitoriaGrupo.update({
      where: { id: vitoriaId },
      data: { aprovado },
    });

    return NextResponse.json({ success: true, vitoria });
  } catch (error) {
    console.error("Erro ao aprovar vitória:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
