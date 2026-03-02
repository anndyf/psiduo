import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Listar missões do grupo
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ grupoId: string }> }
) {
  const params = await props.params;
  try {
    const grupoId = params.grupoId;
    const { searchParams } = new URL(req.url);
    const apenasAtivas = searchParams.get("ativas") === "true";

    // Auth para identificar paciente
    const session = await getServerSession(authOptions);
    // @ts-ignore
    let pacienteId = session?.user?.pacienteId;

    if (!pacienteId) {
        const token = req.headers.get("Authorization")?.replace("Bearer ", "");
        if (token) {
           const p = await prisma.paciente.findFirst({where: {tokenAcesso: token}});
           if(p) pacienteId = p.id;
        }
    }

    // Buscar missões
    const missoes = await (prisma as any).missaoGrupo.findMany({
      where: {
        grupoId,
        ...(apenasAtivas && { ativo: true }),
      },
      include: {
        conclusoes: {
          include: {
            paciente: {
              select: { id: true, nome: true },
            },
          },
        },
      },
      orderBy: { dataInicio: "desc" },
    });

    if (pacienteId) {
        const missoesFormatadas = missoes.map((m: any) => {
            const conclusao = m.conclusoes.find((c: any) => c.pacienteId === pacienteId);
            return {
                ...m,
                status: conclusao ? conclusao.status : "NAO_FEITO"
            };
        });
        return NextResponse.json({ missoes: missoesFormatadas });
    }

    return NextResponse.json({ missoes });
  } catch (error) {
    console.error("Erro ao buscar missões:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST - Criar nova missão (terapeuta)
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
    const { titulo, descricao, dataFim } = body;

    if (!titulo || !descricao || !dataFim) {
      return NextResponse.json(
        { error: "Título, descrição e data de término são obrigatórios" },
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
      include: {
        participantes: true,
      },
    });

    if (!grupo) {
      return NextResponse.json({ error: "Grupo não encontrado" }, { status: 404 });
    }

    // Criar missão
    const missao = await (prisma as any).missaoGrupo.create({
      data: {
        grupoId,
        titulo,
        descricao,
        dataFim: new Date(dataFim),
      },
    });

    // Criar registros de conclusão para cada participante
    const conclusoes = await Promise.all(
      grupo.participantes.map((participante: any) =>
        (prisma as any).conclusaoMissao.create({
          data: {
            missaoId: missao.id,
            pacienteId: participante.id,
            status: "NAO_FEITO",
          },
        })
      )
    );

    return NextResponse.json({ success: true, missao, conclusoes });
  } catch (error) {
    console.error("Erro ao criar missão:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// PATCH - Desativar missão
export async function PATCH(
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

    const body = await req.json();
    const { missaoId, ativo } = body;

    if (!missaoId || typeof ativo !== "boolean") {
      return NextResponse.json(
        { error: "ID da missão e status são obrigatórios" },
        { status: 400 }
      );
    }

    const missao = await (prisma as any).missaoGrupo.update({
      where: { id: missaoId },
      data: { ativo },
    });

    return NextResponse.json({ success: true, missao });
  } catch (error) {
    console.error("Erro ao atualizar missão:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
