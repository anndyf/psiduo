import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import GrupoLoginClient from "./page.client";

interface PageProps {
    params: Promise<{ grupoId: string }>;
}

export default async function GrupoLoginPage(props: PageProps) {
    const params = await props.params;
    const { grupoId } = params;

    // Buscar informações do grupo
    const grupo = await prisma.grupoTerapeutico.findUnique({
        where: { id: grupoId },
        select: {
            id: true,
            titulo: true,
            descricao: true,
            ativo: true,
            psicologo: {
                select: {
                    nome: true,
                    foto: true
                }
            }
        }
    });

    if (!grupo || !grupo.ativo) {
        notFound();
    }

    return <GrupoLoginClient grupo={grupo} />;
}
