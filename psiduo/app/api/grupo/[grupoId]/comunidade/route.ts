import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Listar postagens
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ grupoId: string }> }
) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    const grupoId = params.grupoId;

    // Auth & Permission Check
    // @ts-ignore
    let psicologoId = session?.user?.psicologoId;
    // @ts-ignore
    let pacienteId = session?.user?.pacienteId;

    if (!psicologoId && !pacienteId) {
        const token = req.headers.get("Authorization")?.replace("Bearer ", "");
        if (token) {
           const p = await prisma.paciente.findFirst({ where: { tokenAcesso: token, grupoId } }); // Enforces patient belongs to group
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
            return NextResponse.json({ error: "Permissão negada (Grupo não pertence a este profissional)" }, { status: 403 });
        }
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;
    const skip = (page - 1) * limit;

    const postagens = await (prisma as any).postagemGrupo.findMany({
      where: { grupoId },
      include: {
        paciente: { select: { id: true, nome: true } },
        psicologo: { select: { id: true, nome: true, foto: true } },
        _count: { select: { curtidas: true, comentarios: true } },
        curtidas: { select: { pacienteId: true } },
        comentarios: {
          take: 3, 
          orderBy: { criadoEm: "desc" },
          include: {
            paciente: { select: { id: true, nome: true } },
            psicologo: { select: { id: true, nome: true } },
          }
        }
      },
      orderBy: { criadoEm: "desc" },
      take: limit,
      skip,
    });
    
    const feed = postagens.map((post: any) => ({
      id: post.id,
      conteudo: post.conteudo,
      criadoEm: post.criadoEm,
      autor: post.paciente
        ? { id: post.paciente.id, nome: post.paciente.nome, tipo: "PARTICIPANTE" }
        : post.psicologo
        ? { id: post.psicologo.id, nome: post.psicologo.nome, tipo: "TERAPEUTA", foto: post.psicologo.foto }
        : { id: "unknown", nome: "Usuário Desconhecido", tipo: "PARTICIPANTE" },
      stats: {
        likes: post._count.curtidas,
        comentarios: post._count.comentarios
      },
      userLiked: false, // Implementar checagem se necessário
      previewComentarios: post.comentarios.reverse().map((c: any) => ({
        id: c.id,
        conteudo: c.conteudo,
        autorNome: c.paciente?.nome || c.psicologo?.nome,
        autorTipo: c.psicologo ? "TERAPEUTA" : "PARTICIPANTE",
        criadoEm: c.criadoEm,
      }))
    }));

    return NextResponse.json({ feed });
  } catch (error) {
    console.error("Erro ao buscar postagens:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST - Criar postagem
export async function POST(
  req: NextRequest,
  props: { params: Promise<{ grupoId: string }> }
) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    const grupoId = params.grupoId;
    
    // @ts-ignore
    let psicologoId = session?.user?.psicologoId;
    // @ts-ignore
    let pacienteId = session?.user?.pacienteId;

    if (!psicologoId && !pacienteId) {
        const token = req.headers.get("Authorization")?.replace("Bearer ", "");
        if (token) {
           const p = await prisma.paciente.findFirst({ where: { tokenAcesso: token, grupoId } });
           if (p) pacienteId = p.id;
        }
    }

    if (!psicologoId && !pacienteId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { conteudo } = body;

    if (!conteudo) {
      return NextResponse.json({ error: "Conteúdo obrigatório" }, { status: 400 });
    }

    const postagem = await (prisma as any).postagemGrupo.create({
      data: {
        grupoId,
        conteudo,
        psicologoId, 
        pacienteId,
      },
      include: {
        paciente: { select: { id: true, nome: true } },
        psicologo: { select: { id: true, nome: true, foto: true } },
      },
    });

    // Formatar retorno
    const postFormatado = {
      id: postagem.id,
      conteudo: postagem.conteudo,
      criadoEm: postagem.criadoEm,
      autor: postagem.paciente
        ? { id: postagem.paciente.id, nome: postagem.paciente.nome, tipo: "PARTICIPANTE" }
        : postagem.psicologo
        ? { id: postagem.psicologo.id, nome: postagem.psicologo.nome, tipo: "TERAPEUTA", foto: postagem.psicologo.foto }
        : { id: "unknown", nome: "Usuário Desconhecido", tipo: "PARTICIPANTE" },
      stats: { likes: 0, comentarios: 0 },
      userLiked: false,
      previewComentarios: []
    };

    return NextResponse.json({ success: true, post: postFormatado, feed: [postFormatado] }); 
    // frontend espera 'success' e recarrega ou usa 'post'
  } catch (error) {
    console.error("Erro ao criar postagem:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
