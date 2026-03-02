import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// POST - Criar resposta
export async function POST(
  req: NextRequest,
  props: { params: Promise<{ grupoId: string; checkInId: string }> }
) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    let pacienteId = session?.user?.pacienteId;

    // Autenticação alternativa via Token (Header)
    if (!pacienteId) {
        const token = req.headers.get("Authorization")?.replace("Bearer ", "");
        if (token) {
            const paciente = await prisma.paciente.findFirst({
                where: { tokenAcesso: token, ativo: true },
                select: { id: true }
            });
            if (paciente) {
                pacienteId = paciente.id;
            }
        }
    }

    if (!pacienteId) {
      return NextResponse.json({ error: "Apenas pacientes autenticados podem responder" }, { status: 403 });
    }

    const { grupoId, checkInId } = params;
    const body = await req.json();
    const { emocao, comentario } = body;

    if (!emocao) {
         return NextResponse.json({ error: "Emoção é obrigatória" }, { status: 400 });
    }

    // Validar se check-in existe e não expirou
    console.log(`[DEBUG] CheckIn Responder: ID=${checkInId} Grupo=${grupoId} Date=${new Date().toISOString()}`);
    
    const checkIn = await (prisma as any).checkInGrupo.findFirst({
        where: { id: checkInId, grupoId, dataExpira: { gt: new Date() } }
    });
    console.log(`[DEBUG] CheckIn Found:`, checkIn ? "YES" : "NO");

    if (!checkIn) {
        return NextResponse.json({ error: "Check-in inválido ou expirado" }, { status: 404 });
    }

    // Verificar se já respondeu
    const jaRespondeu = await (prisma as any).respostaCheckIn.findFirst({
        where: { checkInId, pacienteId }
    });

    if (jaRespondeu) {
        return NextResponse.json({ error: "Você já respondeu este check-in" }, { status: 400 });
    }

    // Criar resposta
    const resposta = await (prisma as any).respostaCheckIn.create({ 
        data: {
            checkInId,
            pacienteId,
            emocao,
            comentario
        }
    });

    return NextResponse.json({ success: true, resposta });

  } catch (error) {
    console.error("Erro ao responder check-in:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
