import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST - Marcar missão como concluída (participante)
export async function POST(
  req: NextRequest,
  props: { params: Promise<{ grupoId: string; missaoId: string }> }
) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    let pacienteId = session?.user?.pacienteId;

    if (!pacienteId) {
        const token = req.headers.get("Authorization")?.replace("Bearer ", "");
        if (token) {
            const p = await prisma.paciente.findFirst({ where: { tokenAcesso: token } });
            if (p) pacienteId = p.id;
        }
    }

    if (!pacienteId) {
       return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { status } = body;

    if (!['FEITO', 'PARCIAL', 'NAO_FEITO'].includes(status)) {
      return NextResponse.json(
        { error: "Status inválido. Use: FEITO, PARCIAL ou NAO_FEITO" },
        { status: 400 }
      );
    }

    const { missaoId } = params;

    // Verificar se a missão existe e está ativa
    const missao = await (prisma as any).missaoGrupo.findUnique({
      where: { id: missaoId },
    });

    if (!missao || !missao.ativo) {
      return NextResponse.json(
        { error: "Missão não encontrada ou inativa" },
        { status: 404 }
      );
    }

    // Atualizar conclusão
    const conclusao = await (prisma as any).conclusaoMissao.upsert({
      where: {
        missaoId_pacienteId: {
          missaoId,
          pacienteId,
        },
      },
      update: {
        status,
        dataConclusao: status !== "NAO_FEITO" ? new Date() : null,
      },
      create: {
        missaoId,
        pacienteId,
        status,
        dataConclusao: status !== "NAO_FEITO" ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, conclusao });
  } catch (error) {
    console.error("Erro ao marcar conclusão:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// GET - Ver progresso da missão (terapeuta)
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ grupoId: string; missaoId: string }> }
) {
  const params = await props.params;
  try {
    const { missaoId } = params;

    // Buscar conclusões
    const conclusoes = await (prisma as any).conclusaoMissao.findMany({
      where: { missaoId },
      include: {
        paciente: {
          select: { id: true, nome: true },
        },
      },
    });

    const totalParticipantes = conclusoes.length;

    const totalConcluidos = conclusoes.filter((c: any) => c.status === "FEITO" || c.status === "PARCIAL").length;
    const taxaConclusao =
      totalParticipantes > 0
        ? Math.round((totalConcluidos / totalParticipantes) * 100)
        : 0;

    return NextResponse.json({
      conclusoes,
      totalParticipantes,
      totalConcluidos,
      taxaConclusao,
    });
  } catch (error) {
    console.error("Erro ao buscar progresso:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
