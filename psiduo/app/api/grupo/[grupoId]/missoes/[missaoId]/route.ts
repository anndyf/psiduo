import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT - Editar Missão
export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ grupoId: string; missaoId: string }> }
) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || !session.user?.psicologoId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { missaoId } = params;
    const body = await req.json();
    const { titulo, descricao, dataFim } = body;

    // Verificar propriedade do grupo/missão se necessário, mas update falhará se ID não existir
    // Idealmente verificar se psicologoId bate com o grupo da missão, mas vamos confiar na sessão por agora ou fazer um findFirst.
    
    // Check ownership simple
    const missao = await (prisma as any).missaoGrupo.findUnique({
        where: { id: missaoId },
        include: { grupo: true }
    });
    
    // @ts-ignore
    if (!missao || missao.grupo.psicologoId !== session.user.psicologoId) {
        return NextResponse.json({ error: "Missão não encontrada ou sem permissão" }, { status: 403 });
    }

    const updated = await (prisma as any).missaoGrupo.update({
      where: { id: missaoId },
      data: { 
        titulo, 
        descricao, 
        dataFim: dataFim ? new Date(dataFim) : undefined 
      },
    });

    return NextResponse.json({ success: true, missao: updated });
  } catch (error) {
    console.error("Erro ao editar missão:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// DELETE - Excluir Missão
export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ grupoId: string; missaoId: string }> }
) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || !session.user?.psicologoId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { missaoId } = params;

    // Check ownership
    const missao = await (prisma as any).missaoGrupo.findUnique({
        where: { id: missaoId },
        include: { grupo: true }
    });
    
    // @ts-ignore
    if (!missao || missao.grupo.psicologoId !== session.user.psicologoId) {
        return NextResponse.json({ error: "Missão não encontrada ou sem permissão " }, { status: 403 });
    }

    await (prisma as any).missaoGrupo.delete({
      where: { id: missaoId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir missão:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
