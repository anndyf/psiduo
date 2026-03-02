import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
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

    const { postId } = params;

    if (!psicologoId && !pacienteId) {
        return NextResponse.json({ error: "Identidade não confirmada" }, { status: 401 });
    }

    const whereClause: any = { postagemId: postId };
    if (psicologoId) whereClause.psicologoId = psicologoId;
    if (pacienteId) whereClause.pacienteId = pacienteId;

    // Verificar se já curtiu
    const existingLike = await (prisma as any).curtidaPostagem.findFirst({
        where: whereClause
    });

    if (existingLike) {
        // Remover like
        await (prisma as any).curtidaPostagem.delete({
            where: { id: existingLike.id }
        });
        return NextResponse.json({ liked: false });
    } else {
        // Adicionar like
        await (prisma as any).curtidaPostagem.create({
            data: whereClause
        });
        return NextResponse.json({ liked: true });
    }

  } catch (error) {
    console.error("Erro ao curtir:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
