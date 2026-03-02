import { Metadata } from "next";
import { Sidebar } from "../../painel/components/Sidebar";
import { MobileTabbar } from "../../painel/components/MobileTabbar";
import { MobileHeader } from "../../painel/components/MobileHeader";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Minhas Avaliações | PsiDuo",
  description: "Gerencie sua reputação e feedback.",
};

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  let plano = "DUO_I";
  let slug = "";

  if (user && (user as any).psicologoId) {
     const psicologo = await prisma.psicologo.findUnique({
         where: { id: (user as any).psicologoId },
         select: { plano: true, slug: true }
     });
     if (psicologo) {
         if (psicologo.plano) plano = psicologo.plano;
         if (psicologo.slug) slug = psicologo.slug;
     }
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
       <Sidebar plano={plano} slug={slug} />
       <main className="flex-1 md:ml-72 min-h-screen p-4 pb-32 md:p-8 md:pb-12 lg:p-12">
          <MobileHeader />
          {children}
       </main>
       <MobileTabbar plano={plano} slug={slug} />
    </div>
  );
}
