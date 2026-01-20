import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Painel Profissional | PsiDuo",
  description: "Gerencie seus pacientes e agenda.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
