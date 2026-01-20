import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catálogo de Psicólogos | PsiDuo",
  description: "Encontre os melhores psicólogos para atendimento online.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
