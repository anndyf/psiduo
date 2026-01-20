import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cadastro | PsiDuo",
  description: "Crie sua conta e comece sua jornada.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
