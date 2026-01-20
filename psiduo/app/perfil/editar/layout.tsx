import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editar Perfil | PsiDuo",
  description: "Gerencie suas informações profissionais.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
