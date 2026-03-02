import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const { grupoId, cpf } = await req.json();

        if (!grupoId || !cpf) {
            return NextResponse.json(
                { success: false, error: "Dados incompletos" },
                { status: 400 }
            );
        }

        // Remover formatação do CPF
        const cpfLimpo = cpf.replace(/\D/g, "");

        // Buscar paciente no grupo com este CPF
        const paciente = await prisma.paciente.findFirst({
            where: {
                grupoId,
                cpf: cpfLimpo,
                ativo: true
            },
            select: {
                id: true,
                nome: true,
                tokenAcesso: true,
                grupo: {
                    select: {
                        id: true,
                        titulo: true,
                        ativo: true
                    }
                }
            }
        });

        if (!paciente || !paciente.grupo?.ativo) {
            return NextResponse.json(
                { success: false, error: "CPF não encontrado neste grupo" },
                { status: 404 }
            );
        }

        // Retornar token de acesso
        return NextResponse.json({
            success: true,
            token: paciente.tokenAcesso,
            pacienteId: paciente.id,
            nome: paciente.nome
        });

    } catch (error) {
        console.error("Erro no login do grupo:", error);
        return NextResponse.json(
            { success: false, error: "Erro ao processar login" },
            { status: 500 }
        );
    }
}
