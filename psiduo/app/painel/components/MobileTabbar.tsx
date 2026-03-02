"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { 
  LayoutDashboard, 
  Calendar, 
  HeartHandshake, 
  Users, 
  User,
  UserCog, 
  Settings, 
  LogOut, 
  LifeBuoy, 
  ChevronLeft, 
  Eye, 
  CircleDollarSign,
  Menu,
  X,
  Wallet
} from "lucide-react";



interface MobileTabbarProps {
    plano: string;
    slug?: string;
    userId?: string;
}

export function MobileTabbar({ plano, slug, userId }: MobileTabbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isDuoII = plano === "DUO_II";

  const isActive = (path: string) => pathname === path;

  // Menu items secundários para o overlay
  const moreMenu = [
    { name: "Grupos", href: "/painel/grupos", icon: Users, color: "text-blue-600", bg: "bg-blue-50/50", duoIIOnly: true },
    { name: "Financeiro", href: "/painel/financeiro", icon: CircleDollarSign, color: "text-emerald-600", bg: "bg-emerald-50/50", duoIIOnly: true },
    { name: "Perfil", href: "/painel/perfil", icon: User, color: "text-amber-600", bg: "bg-amber-50/50" },
    { name: "Ajustes", href: "/painel/configuracoes", icon: Settings, color: "text-slate-600", bg: "bg-slate-100/50" },
  ];

  const filteredMenu = moreMenu.filter(item => {
    if (item.duoIIOnly && !isDuoII) return false;
    return true;
  });

  return (
    <>
        {/* Overlay do Menu - Bottom Sheet Style */}
        {isMenuOpen && (
            <div className="fixed inset-0 z-[200] md:hidden">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsMenuOpen(false)} />
                
                <div className="absolute bottom-0 left-0 w-full animate-in slide-in-from-bottom-full duration-500">
                    <div className="bg-white rounded-t-[2.5rem] p-8 pb-12 shadow-2xl">
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8" />
                        
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 text-center">Mais Opções</h3>

                        <div className={`grid ${filteredMenu.length >= 3 ? 'grid-cols-2' : 'grid-cols-2'} gap-2 mb-8`}>
                            {filteredMenu.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link 
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`flex flex-col items-center justify-center gap-3 py-6 rounded-3xl ${item.bg} border border-transparent hover:border-slate-100 active:scale-95 transition-all`}
                                    >
                                        <div className={`${item.color}`}>
                                            <Icon size={24} strokeWidth={2.5} />
                                        </div>
                                        <span className="text-[9px] font-black text-slate-900 uppercase tracking-tight">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="space-y-4">
                             <button 
                                onClick={() => { window.location.href = "mailto:suporte@psiduo.com.br"; setIsMenuOpen(false); }}
                                className="w-full h-16 rounded-3xl bg-slate-50 text-slate-900 flex flex-col items-center justify-center gap-1 active:scale-[0.98] transition-all border border-slate-100"
                             >
                                <LifeBuoy size={20} className="text-deep" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Suporte</span>
                             </button>

                             {session && (
                                 <button 
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="w-full h-20 rounded-3xl bg-red-50 text-red-600 flex flex-col items-center justify-center gap-1 active:scale-[0.98] transition-all border border-red-100/50 shadow-sm shadow-red-100"
                                 >
                                    <LogOut size={22} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Sair da Conta</span>
                                 </button>
                             )}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Tabbar Fixa - Premium Style */}
        <nav className="fixed bottom-6 left-4 right-4 h-22 bg-white/90 backdrop-blur-xl border border-slate-200/50 rounded-[2.5rem] shadow-2xl shadow-slate-900/10 px-2 flex justify-between items-center z-[110] md:hidden active:scale-100 transition-all">
        
            {/* 0. Voltar */}
            <button 
                onClick={() => router.back()}
                className="flex flex-col items-center justify-center gap-1.5 flex-1 h-full rounded-2xl text-slate-400 hover:text-slate-900 active:scale-90 transition-all"
            >
                <ChevronLeft size={20} strokeWidth={2.5} />
                <span className="text-[7px] font-black uppercase tracking-widest">Voltar</span>
            </button>

            {/* 1. Início (Painel) */}
            <Link 
                href="/painel" 
                className={`flex flex-col items-center justify-center gap-1.5 flex-1 h-full rounded-2xl transition-all ${isActive("/painel") ? "text-deep" : "text-slate-400"}`}
            >
                <div className={`p-2 rounded-xl transition-all ${isActive("/painel") ? "bg-deep text-white shadow-lg shadow-deep/20 scale-110" : ""}`}>
                    <LayoutDashboard size={20} strokeWidth={isActive("/painel") ? 2.5 : 2} />
                </div>
                <span className={`text-[7px] font-black uppercase tracking-widest ${isActive("/painel") ? "text-deep" : "opacity-40"}`}>Painel</span>
            </Link>

             {/* 2. Pacientes */}
             {isDuoII && (
                <Link 
                    href="/painel/pacientes" 
                    className={`flex flex-col items-center justify-center gap-1.5 flex-1 h-full rounded-2xl transition-all ${isActive("/painel/pacientes") ? "text-deep" : "text-slate-400"}`}
                >
                    <div className={`p-2 rounded-xl transition-all ${isActive("/painel/pacientes") ? "bg-deep text-white shadow-lg shadow-deep/20 scale-110" : ""}`}>
                        <Users size={20} strokeWidth={isActive("/painel/pacientes") ? 2.5 : 2} />
                    </div>
                    <span className={`text-[7px] font-black uppercase tracking-widest ${isActive("/painel/pacientes") ? "text-deep" : "opacity-40"}`}>Pacientes</span>
                </Link>
             )}

             {/* 4. Agenda */}
             {isDuoII && (
                <Link 
                    href="/painel/agenda"
                    className={`flex flex-col items-center justify-center gap-1.5 flex-1 h-full rounded-2xl transition-all ${isActive("/painel/agenda") ? "text-deep" : "text-slate-400"}`}
                >
                    <div className={`p-2 rounded-xl transition-all ${isActive("/painel/agenda") ? "bg-deep text-white shadow-lg shadow-deep/20 scale-110" : ""}`}>
                        <Calendar size={20} strokeWidth={isActive("/painel/agenda") ? 2.5 : 2} />
                    </div>
                    <span className={`text-[7px] font-black uppercase tracking-widest ${isActive("/painel/agenda") ? "text-deep" : "opacity-40"}`}>Agenda</span>
                </Link>
             )}

             {/* 5. Menu Expansion */}
             <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`flex flex-col items-center justify-center gap-1.5 flex-1 h-full rounded-2xl transition-all ${isMenuOpen ? "text-deep" : "text-slate-400"}`}
            >
                <div className={`p-2 rounded-xl transition-all ${isMenuOpen ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10 scale-110" : "bg-slate-50"}`}>
                     {isMenuOpen ? <X size={20} strokeWidth={2.5} /> : <Menu size={20} strokeWidth={2.5} />}
                </div>
                <span className={`text-[7px] font-black uppercase tracking-widest ${isMenuOpen ? "text-slate-900" : "opacity-40"}`}>Menu</span>
            </button>
        </nav>


    </>
  );
}
