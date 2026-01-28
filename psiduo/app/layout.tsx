import type { Metadata } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import AuthProvider from "@/components/AuthProvider";
import { Toaster } from 'sonner';
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-dm-sans" });
const outfit = Outfit({ subsets: ["latin"], weight: ["700"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "PsiDuo",
  description: "Plataforma de psicólogos",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192x192.png",
    shortcut: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PsiDuo",
  },
  formatDetection: {
    telephone: false,
    date: false,
    email: false,
    address: false,
  },
};

export const viewport = {
  themeColor: "#0f172a",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="pt-br">
      <body className={`${dmSans.className} ${outfit.variable} bg-mist text-deep antialiased`} suppressHydrationWarning>
        <AuthProvider session={session}>
          <Toaster position="top-center" richColors />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}