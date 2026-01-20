import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entrar | PsiDuo",
  description: "Acesse sua conta.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
