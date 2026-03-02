import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - Reagir a uma vitória
export async function POST(
  req: NextRequest,
  props: { params: Promise<{ grupoId: string; vitoriaId: string }> }
) {
  try {
    const params = await props.params;
    const body = await req.json();
    const { pacienteId, emoji } = body;

    if (!pacienteId || !emoji) {
      return NextResponse.json(
        { error: "Paciente e emoji são obrigatórios" },
        { status: 400 }
      );
    }

    const vitoriaId = params.vitoriaId;

    // Validar emoji
    const emojisValidos = ["PALMAS", "CORACAO", "FOGO"];
    if (!emojisValidos.includes(emoji)) {
      return NextResponse.json(
        { error: "Emoji inválido. Use: PALMAS, CORACAO ou FOGO" },
        { status: 400 }
      );
    }

    // Verificar se a vitória existe e está aprovada
    const vitoria = await (prisma as any).vitoriaGrupo.findUnique({
      where: { id: vitoriaId },
    });

    if (!vitoria || !vitoria.aprovado) {
      return NextResponse.json(
        { error: "Vitória não encontrada ou não aprovada" },
        { status: 404 }
      );
    }

    // Verificar se já reagiu
    const jaReagiu = await (prisma as any).reacaoVitoria.findUnique({
      where: {
        vitoriaId_pacienteId: {
          vitoriaId,
          pacienteId,
        },
      },
    });

    if (jaReagiu) {
      // Atualizar reação existente
      const reacao = await (prisma as any).reacaoVitoria.update({
        where: {
          vitoriaId_pacienteId: {
            vitoriaId,
            pacienteId,
          },
        },
        data: { emoji },
      });

      return NextResponse.json({ success: true, reacao, updated: true });
    }

    // Criar nova reação
    const reacao = await (prisma as any).reacaoVitoria.create({
      data: {
        vitoriaId,
        pacienteId,
        emoji,
      },
    });

    return NextResponse.json({ success: true, reacao, updated: false });
  } catch (error) {
    console.error("Erro ao reagir à vitória:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// DELETE - Remover reação
export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ grupoId: string; vitoriaId: string }> }
) {
  try {
    const params = await props.params;
    const { searchParams } = new URL(req.url);
    const pacienteId = searchParams.get("pacienteId");

    if (!pacienteId) {
      return NextResponse.json(
        { error: "ID do paciente é obrigatório" },
        { status: 400 }
      );
    }

    const vitoriaId = params.vitoriaId;

    await (prisma as any).reacaoVitoria.delete({
      where: {
        vitoriaId_pacienteId: {
          vitoriaId,
          pacienteId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao remover reação:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
