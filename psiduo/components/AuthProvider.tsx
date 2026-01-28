"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export default function AuthProvider({ children, session }: { children: ReactNode, session?: any }) {
  return (
    <SessionProvider
      session={session}
      // Não buscar sessão automaticamente no carregamento
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      {children}
    </SessionProvider>
  );
}
