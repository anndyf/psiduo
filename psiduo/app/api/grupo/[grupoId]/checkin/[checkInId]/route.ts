import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  props: { params: Promise<{ grupoId: string; checkInId: string }> }
) {
  const params = await props.params;
  try {
    const body = await req.json();
    const { pacienteId, emocao, comentario } = body;

    if (!pacienteId || !emocao) {
      return NextResponse.json(
        { error: "Paciente e status da bateria são obrigatórios" },
        { status: 400 }
      );
    }

    const checkInId = params.checkInId;

    // Verificar se o check-in existe e está ativo
    const checkIn = await (prisma as any).checkInGrupo.findUnique({
      where: { id: checkInId },
    });

    if (!checkIn || !checkIn.ativo) {
      return NextResponse.json(
        { error: "Check-in não encontrado ou expirado" },
        { status: 404 }
      );
    }

    // Usar upsert para permitir atualizar a resposta
    const resposta = await (prisma as any).respostaCheckIn.upsert({
      where: {
        checkInId_pacienteId: {
          checkInId,
          pacienteId,
        },
      },
      update: {
        emocao,
        comentario,
      },
      create: {
        checkInId,
        pacienteId,
        emocao,
        comentario,
      },
    });

    return NextResponse.json({ success: true, resposta });
  } catch (error) {
    console.error("Erro ao responder check-in:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar resposta" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  props: { params: Promise<{ grupoId: string; checkInId: string }> }
) {
  const params = await props.params;
  try {
    const checkInId = params.checkInId;

    const respostas = await (prisma as any).respostaCheckIn.groupBy({
      by: ["emocao"],
      where: { checkInId },
      _count: true,
    });
    
    // Obter total de participantes do grupo
    const grupo: any = await (prisma as any).grupoTerapeutico.findUnique({
      where: { id: params.grupoId },
      include: {
        participantes: true
      }
    });

    const totalParticipantes = grupo?.participantes?.length || 0;
    const totalRespostas = respostas.reduce((acc: number, curr: { _count: number }) => acc + curr._count, 0);
    const taxaResposta = totalParticipantes > 0 
      ? Math.round((totalRespostas / totalParticipantes) * 100) 
      : 0;

    const todasRespostas = await (prisma as any).respostaCheckIn.findMany({
       where: { checkInId },
       select: {
         id: true,
         emocao: true,
         comentario: true,
         paciente: { select: { nome: true } }
       },
       orderBy: { criadoEm: 'desc' }
    });

    const comentarios = todasRespostas.filter((c:any) => c.comentario && c.comentario.trim().length > 0);

    return NextResponse.json({
      respostas, // Mantido para compatibilidade (GroupBy)
      totalParticipantes,
      totalRespostas,
      taxaResposta,
      comentarios,
      respostasDetalhadas: todasRespostas
    });
  } catch (error) {
    console.error("Erro ao obter resultados:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar resultados" },
      { status: 500 }
    );
  }
}

// PUT - Editar Check-in
export async function PUT(
  req: Request,
  props: { params: Promise<{ grupoId: string; checkInId: string }> }
) {
  const params = await props.params;
  try {
     const session = await getServerSession(authOptions);
     // @ts-ignore
     if (!session || !session.user?.psicologoId) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
     }
     
     const { titulo, descricao, dataExpira } = await req.json();
     
     const updated = await (prisma as any).checkInGrupo.update({
        where: { id: params.checkInId },
        data: { 
            titulo, 
            descricao, // Check schema se tem descricao
            dataExpira: dataExpira ? new Date(dataExpira) : undefined,
            ativo: true // Reativa se editar? Opcional.
        }
     });

     return NextResponse.json({ success: true, checkIn: updated });
  } catch(err) {
      return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}

// DELETE - Excluir Check-in
export async function DELETE(
  req: Request,
  props: { params: Promise<{ grupoId: string; checkInId: string }> }
) {
  const params = await props.params;
  try {
     const session = await getServerSession(authOptions);
     // @ts-ignore
     if (!session || !session.user?.psicologoId) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
     }
     
     await (prisma as any).checkInGrupo.delete({
        where: { id: params.checkInId }
     });

     return NextResponse.json({ success: true });
  } catch(err) {
      return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 });
  }
}
