import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quiz de Conexão | PsiDuo",
  description: "Encontre o profissional ideal para você.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
