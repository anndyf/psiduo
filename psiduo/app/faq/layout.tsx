import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Perguntas Frequentes | PsiDuo",
  description: "Tire suas dúvidas sobre a plataforma.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
