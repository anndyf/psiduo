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

    const { grupoId, postId } = params;

    if (!psicologoId && !pacienteId) {
        const token = req.headers.get("Authorization")?.replace("Bearer ", "");
        if (token) {
             const p = await prisma.paciente.findFirst({ where: { tokenAcesso: token, grupoId } }); // Enforce group match
             if (p) pacienteId = p.id;
        }
    }

    if (!psicologoId && !pacienteId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verify Psychologist Ownership
    if (psicologoId) {
        const count = await prisma.grupoTerapeutico.count({
            where: { id: grupoId, psicologoId }
        });
        if (count === 0) {
             return NextResponse.json({ error: "Permissão negada" }, { status: 403 });
        }
    }

    if (!psicologoId && !pacienteId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { conteudo } = body;

    if (!conteudo || conteudo.trim() === "") {
        return NextResponse.json({ error: "Conteúdo vazio" }, { status: 400 });
    }

    let data: any = {
        postagemId: postId,
        conteudo,
    };

    if (psicologoId) {
        data.psicologoId = psicologoId;
    } else if (pacienteId) {
        data.pacienteId = pacienteId;
    }

    const comentario = await (prisma as any).comentarioPostagem.create({
        data,
        include: {
            paciente: { select: { nome: true } },
            psicologo: { select: { nome: true } },
        }
    });

    return NextResponse.json({ 
        success: true, 
        comentario: {
            id: comentario.id,
            conteudo: comentario.conteudo,
            autorNome: comentario.paciente?.nome || comentario.psicologo?.nome,
            autorTipo: comentario.psicologo ? "TERAPEUTA" : "PARTICIPANTE",
            criadoEm: comentario.criadoEm
        }
    });

  } catch (error) {
    console.error("Erro ao comentar:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
