"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { AgendaModal } from "./AgendaModal";
import { 
  LayoutDashboard, 
  Calendar, 
  HeartHandshake,
  UsersRound, 
  UserCog, 
  Settings, 
  LogOut, 
  LifeBuoy,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign
} from "lucide-react";
import LogoPsiDuo from "@/components/LogoPsiDuo";

interface SidebarProps {
    plano: string;
    slug?: string;
    userId?: string;
    isCollapsed?: boolean;
    toggleCollapse?: () => void;
}

export function Sidebar({ plano, slug, userId, isCollapsed = false, toggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const isDuoII = plano === "DUO_II";
  const [showAgenda, setShowAgenda] = useState(false);

  const menu = [
    { name: "Dashboard", href: "/painel", icon: LayoutDashboard },
    { name: "Agenda", href: "/painel/agenda", icon: Calendar },
    { name: "Visão Geral", href: "/painel/pacientes", icon: HeartHandshake },
    { name: "Grupos Terapêuticos", href: "/painel/grupos", icon: UsersRound },
    { name: "Financeiro", href: "/painel/financeiro", icon: CircleDollarSign },
    { name: "Editar Perfil", href: "/painel/perfil", icon: UserCog },
    { name: "Configurações", href: "/painel/configuracoes", icon: Settings },
  ];

  return (
    <>
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white hidden md:flex flex-col h-screen fixed left-0 top-0 overflow-y-auto z-40 border-r border-slate-100/80 transition-all duration-300 ease-in-out`}>
      
      {/* Toggle Button */}
      {toggleCollapse && (
          <button 
            onClick={toggleCollapse}
            className="absolute -right-3 top-9 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-amber-500 shadow-sm transition-colors z-50 hover:scale-110"
            title={isCollapsed ? "Expandir Menu" : "Recolher Menu"}
          >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
      )}

      {/* Logos & Brand */}
      <div className={`px-8 pt-10 pb-2 flex flex-col items-center transition-all duration-300 ${isCollapsed ? 'px-0' : ''}`}>
        
        {/* Logo Image */}
        {isCollapsed ? (
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-slate-900/20 shrink-0">
             <span className="tracking-tighter text-xl">P<span className="text-amber-500">.</span></span>
          </div>
        ) : (
          <>
            <LogoPsiDuo variant="dark" width={140} height={70} />
            <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] leading-none mt-1 uppercase whitespace-nowrap text-center">
                Painel Profissional
            </p>
          </>
        )}

      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 mt-6">
        
        {menu.map(item => {
           const isActive = pathname === item.href || (item.name === "Agenda" && showAgenda);
           const Icon = item.icon;
           const isAction = (item as any).isAction;

           // Base Styles
           const baseClasses = `w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative text-xs font-bold uppercase tracking-wide ${isCollapsed ? 'justify-center px-2 aspect-square' : ''}`;
           
           // Active Styles: Dark Background, White Text, Amber Icon
           const activeClasses = "bg-slate-900 text-white shadow-lg shadow-slate-900/20 translate-x-1";
           
           // Inactive Styles
           const inactiveClasses = "text-slate-500 hover:bg-slate-50 hover:text-slate-900";

           const Content = () => (
               <>
                {/* Icon: Amber if active, Slate if inactive */}
                <Icon 
                    size={20} 
                    className={`${isActive ? "text-amber-500" : "text-slate-400 group-hover:text-slate-600"} transition-colors`} 
                    strokeWidth={isActive ? 2.5 : 2} 
                />
                
                {/* Text Label */}
                <span className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${isCollapsed ? 'w-0 opacity-0 absolute' : 'w-auto opacity-100'}`}>
                    {item.name}
                </span>
                
                {/* Tooltip for collapsed mode */}
                {isCollapsed && (
                    <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all duration-200 shadow-xl translate-x-[-10px] group-hover:translate-x-0 border border-slate-800">
                        {item.name}
                        {/* Little triangle pointer */}
                        <div className="absolute top-1/2 -left-1.5 w-3 h-3 bg-slate-900 transform rotate-45 -translate-y-1/2 border-l border-b border-slate-800"></div>
                    </div>
                )}
               </>
           );

           if (isAction) {
               return (
                <button
                    key={item.href}
                    onClick={() => setShowAgenda(true)}
                    className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
                    title={isCollapsed ? item.name : undefined}
                >
                    <Content />
                </button>
               )
           }

           return (
             <Link 
                key={item.href} 
                href={item.href}
                className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
             >
                <Content />
             </Link>
           )
        })}
      </nav>

      {/* Footer Actions */}
      <div className={`p-4 space-y-1 mt-auto ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        
        <button 
            onClick={() => window.location.href = "mailto:suporte@psiduo.com.br"}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all text-xs font-bold uppercase tracking-wide group relative ${isCollapsed ? 'justify-center aspect-square' : ''}`}
        >
            <LifeBuoy size={20} className="text-slate-400 group-hover:text-amber-500 transition-colors" />
            <span className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${isCollapsed ? 'w-0 opacity-0 absolute' : 'w-auto opacity-100'}`}>Ajuda</span>
            
            {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all duration-200 shadow-xl">
                    Ajuda
                </div>
            )}
        </button>

         <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all text-xs font-bold uppercase tracking-wide group relative ${isCollapsed ? 'justify-center aspect-square' : ''}`}
         >
            <LogOut size={20} strokeWidth={2} className="opacity-70 group-hover:opacity-100" />
            <span className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${isCollapsed ? 'w-0 opacity-0 absolute' : 'w-auto opacity-100'}`}>Sair</span>

            {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all duration-200 shadow-xl">
                    Sair
                </div>
            )}
         </button>
      </div>
    </aside>

    {userId && (
        <AgendaModal 
            isOpen={showAgenda} 
            onClose={() => setShowAgenda(false)} 
            userId={userId} 
        />
    )}
    </>
  );
}
