"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./components/Sidebar";
import { MobileHeader } from "./components/MobileHeader";
import { ConditionalMobileTabbar } from "./components/ConditionalMobileTabbar";
import { FooterDash } from "./components/FooterDash";

interface PainelLayoutClientProps {
  children: React.ReactNode;
  plano: string;
  slug: string;
  userId?: string;
}

export function PainelLayoutClient({ children, plano, slug, userId }: PainelLayoutClientProps) {
  const pathname = usePathname();
  // Estado inicial baseado na rota atual. Se for homepage do painel, expandido. Se interna, colapsado.
  const [isCollapsed, setIsCollapsed] = useState(pathname !== "/painel");

  // Efeito para atualizar automaticamente ao navegar
  useEffect(() => {
      if (pathname === "/painel") {
          setIsCollapsed(false); // Expande na Visão Geral
      } else {
          setIsCollapsed(true);  // Recolhe nas páginas internas (Pacientes, Grupos, Perfil, etc)
      }
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
       <Sidebar 
          plano={plano} 
          slug={slug} 
          userId={userId} 
          isCollapsed={isCollapsed} 
          toggleCollapse={() => setIsCollapsed(!isCollapsed)}
       />
       
       <main 
           className={`flex-1 min-h-screen p-4 md:p-6 lg:p-6 overflow-x-hidden transition-all duration-300 ease-in-out ${
              isCollapsed ? 'md:ml-20' : 'md:ml-64'
           }`}
        >
          <MobileHeader />
          {children}
          <FooterDash />
       </main>
       
       <ConditionalMobileTabbar plano={plano} slug={slug} userId={userId} />
    </div>
  );
}
