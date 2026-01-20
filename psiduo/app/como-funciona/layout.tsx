import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Como Funciona | PsiDuo",
  description: "Entenda como conectamos você ao profissional ideal.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
