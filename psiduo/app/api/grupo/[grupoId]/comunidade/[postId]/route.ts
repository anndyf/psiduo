import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ grupoId: string; postId: string }> }
) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    
    // @ts-ignore
    let psicologoId = session?.user?.psicologoId;
    // @ts-ignore
    let pacienteId = session?.user?.pacienteId;

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

    const { postId } = params;

    // Buscar o post para ver quem é o dono
    const post = await (prisma as any).postagemGrupo.findUnique({
        where: { id: postId }
    });

    if (!post) {
        return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
    }

    // Regras de Delete:
    // 1. Psicólogo pode deletar TUDO (Moderação)
    // 2. Paciente só pode deletar o SEU próprio post

    const isOwner = pacienteId && post.pacienteId === pacienteId;
    const isModerator = !!psicologoId;

    if (!isOwner && !isModerator) {
        return NextResponse.json({ error: "Sem permissão para deletar" }, { status: 403 });
    }

    await (prisma as any).postagemGrupo.delete({
        where: { id: postId }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Erro ao deletar post:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
