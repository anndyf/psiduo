import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diário Emocional | PsiDuo",
  description: "Seu espaço seguro para registrar emoções.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
