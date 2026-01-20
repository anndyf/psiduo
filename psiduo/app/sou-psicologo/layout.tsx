import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sou Psicólogo | PsiDuo",
  description: "Faça parte da plataforma que valoriza seu trabalho.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
