"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Home, Search, LayoutDashboard, LogIn, Menu as MenuIcon, ArrowLeft, ClipboardList } from "lucide-react";
import LogoPsiDuo from "@/components/LogoPsiDuo";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    // Pegar o tipo de usuário do localStorage
    const savedType = localStorage.getItem("psiduo_selection_made");
    setUserType(savedType);
  }, []);
  
  const isLogged = status === "authenticated";
  const isPatient = userType === "paciente";

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setIsOpen(false);
    router.push("/login");
    router.refresh();
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="w-full bg-slate-950 text-white py-2.5 shadow-2xl font-sans relative z-50 border-b border-white/5">
      <div className="container mx-auto px-6 flex justify-between items-center">
        
        {/* LOGO */}
        <Link href="/" className="hover:opacity-90 transition">
          <LogoPsiDuo variant="light" width={110} height={55} />
        </Link>

        {/* MENU DESKTOP */}
        <div className="hidden lg:flex items-center gap-8">
          {/* Links de Navegação */}
          <div className="flex space-x-6 text-sm font-medium text-slate-300">
            <Link href="/" className="hover:text-white transition">Início</Link>
            
            {isPatient ? (
              <>
                <Link href="/sou-paciente" className="hover:text-white transition text-indigo-400 font-bold">Sou Paciente</Link>
                <Link href="/catalogo" className="hover:text-white transition">Ver Catálogo</Link>
              </>
            ) : (
              <>
                <Link href="/sou-paciente" className="hover:text-white transition">Sou Paciente</Link>
                <Link href="/sou-psicologo" className="hover:text-white transition text-blue-400 font-bold">Sou Psicólogo</Link>
                <Link href="/recursos" className="hover:text-white transition">Recursos</Link>
                <Link href="/planos" className="hover:text-white transition">Planos</Link>
                <Link href="/catalogo" className="hover:text-white transition">Ver Catálogo</Link>
              </>
            )}
          </div>

          {/* Área de Ação (Login + Cadastro ou Painel + Sair) */}
          <div className="flex items-center gap-4 pl-4">
            {isLogged ? (
              <div className="flex items-center gap-3">
                <Link href="/painel">
                  <Button variant="white" size="sm" className="rounded-full shadow-lg">
                    Meu Painel
                  </Button>
                </Link>
                <Button 
                  variant="dark-outline" 
                  size="sm"
                  onClick={handleLogout}
                  className="rounded-full"
                >
                  Sair
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="dark-outline" size="sm" className="rounded-full">
                    Login
                  </Button>
                </Link>
                <Link href="/cadastro">
                  <Button variant="white" size="sm" className="rounded-full shadow-lg">
                    Cadastre-se
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={toggleMenu}
          className="hidden flex flex-col gap-1.5 p-2 hover:bg-white/5 rounded-lg transition active:scale-95"
          aria-label="Menu"
        >
          <span className={`block w-6 h-0.5 bg-white transition-transform ${isOpen ? "rotate-45 translate-y-2" : ""}`}></span>
          <span className={`block w-6 h-0.5 bg-white transition-opacity ${isOpen ? "opacity-0" : ""}`}></span>
          <span className={`block w-6 h-0.5 bg-white transition-transform ${isOpen ? "-rotate-45 -translate-y-2" : ""}`}></span>
        </button>
      </div>

      {/* MENU MOBILE (DROPDOWN) */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-slate-950 border-t border-white/5 shadow-2xl backdrop-blur-xl">
          <div className="container mx-auto px-6 py-6 space-y-4">
            <Link 
              href="/" 
              className="block text-white hover:text-blue-300 transition font-medium"
              onClick={() => setIsOpen(false)}
            >
              Início
            </Link>

            {isPatient ? (
              <>
                <Link 
                  href="/sou-paciente" 
                  className="block text-indigo-300 hover:text-white transition font-bold"
                  onClick={() => setIsOpen(false)}
                >
                  Sou Paciente
                </Link>
                <Link 
                  href="/catalogo" 
                  className="block text-white hover:text-blue-300 transition font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Ver Catálogo
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/recursos" 
                  className="block text-white hover:text-blue-300 transition font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Recursos
                </Link>
                <Link 
                  href="/planos" 
                  className="block text-white hover:text-blue-300 transition font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Planos
                </Link>
                <Link 
                  href="/catalogo" 
                  className="block text-white hover:text-blue-300 transition font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Ver Catálogo
                </Link>
                <Link 
                  href="/sou-psicologo" 
                  className="block text-blue-300 hover:text-white transition font-bold"
                  onClick={() => setIsOpen(false)}
                >
                  Sou Profissional
                </Link>
              </>
            )}

            <div className="pt-4 border-t border-white/10 space-y-3">
              {isLogged ? (
                <>
                  <Link 
                    href="/painel" 
                    className="block bg-white text-deep text-center px-5 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-lg hover:bg-slate-100 active:scale-95"
                    onClick={() => setIsOpen(false)}
                  >
                    Meu Painel
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-white/60 hover:text-white transition text-xs font-black uppercase tracking-widest border border-white/10 px-5 py-3 rounded-full hover:bg-white/5 active:scale-95"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="block text-white/60 hover:text-white text-center transition text-xs font-black uppercase tracking-widest border border-white/10 px-5 py-3 rounded-full hover:bg-white/5 active:scale-95"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    href="/cadastro" 
                    className="block bg-white text-deep text-center px-5 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-lg hover:bg-slate-100 active:scale-95"
                    onClick={() => setIsOpen(false)}
                  >
                    Cadastre-se
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* BOTTOM NAVIGATION (MOBILE ONLY) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 py-3 flex justify-around items-center z-[100] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] text-slate-400">
          <Link href="/" className="flex flex-col items-center gap-1 w-16 hover:text-deep active:scale-95 transition">
             <Home size={24} />
             <span className="text-[10px] font-bold">Início</span>
          </Link>
          
          {isLogged ? (
             <button onClick={() => router.back()} className="flex flex-col items-center gap-1 w-16 hover:text-deep active:scale-95 transition">
                <ArrowLeft size={24} />
                <span className="text-[10px] font-bold">Voltar</span>
             </button>
          ) : (
             <Link href="/catalogo" className="flex flex-col items-center gap-1 w-16 hover:text-deep active:scale-95 transition">
                <Search size={24} />
                <span className="text-[10px] font-bold">Busca</span>
             </Link>
          )}

          {isLogged ? (
             <Link href="/painel" className="flex flex-col items-center gap-1 w-16 text-blue-600 active:scale-95 transition">
                <div className="bg-blue-100 p-1.5 rounded-full">
                    <LayoutDashboard size={20} />
                </div>
                <span className="text-[10px] font-bold">Painel</span>
             </Link>
          ) : (
             <Link href="/quiz" className="flex flex-col items-center gap-1 w-16 text-indigo-500 hover:text-indigo-600 active:scale-95 transition">
                <ClipboardList size={24} />
                <span className="text-[10px] font-bold">Quiz</span>
             </Link>
          )}

          <button 
             onClick={toggleMenu} 
             className={`flex flex-col items-center gap-1 w-16 active:scale-95 transition ${isOpen ? 'text-deep' : 'hover:text-deep'}`}
          >
             <MenuIcon size={24} />
             <span className="text-[10px] font-bold">Menu</span>
          </button>
      </div>

    </nav>
  );
}