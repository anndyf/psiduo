
import { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PainelLayoutClient } from "./PainelLayoutClient";

export const metadata: Metadata = {
  title: "Painel Profissional | PsiDuo",
  description: "Gerencie seus pacientes e agenda.",
};

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  let plano = "DUO_I";
  let slug = "";

  if (user && (user as any).id) {
    // Uma única query que busca tudo que o layout precisa
    const psicologo = await prisma.psicologo.findUnique({
      where: { userId: (user as any).id },
      select: { id: true, plano: true, slug: true, planoValidade: true }
    });

    if (psicologo) {
      // Verificar expiração de plano inline (sem query extra)
      if (psicologo.plano === "DUO_II" && psicologo.planoValidade) {
        const expirado = new Date(psicologo.planoValidade) < new Date();
        if (expirado) {
          // Downgrade assíncrono — não bloqueia o render
          prisma.psicologo.update({
            where: { id: psicologo.id },
            data: { plano: "DUO_I" }
          }).catch(e => console.error("Erro ao fazer downgrade de plano:", e));

          plano = "DUO_I";
        } else {
          plano = psicologo.plano;
        }
      } else {
        plano = psicologo.plano ?? "DUO_I";
      }

      if (psicologo.slug) slug = psicologo.slug;
      (user as any).psicologoId = psicologo.id;
    }
  }

  return (
    <PainelLayoutClient plano={plano} slug={slug} userId={(user as any)?.psicologoId}>
      {children}
    </PainelLayoutClient>
  );
}
