"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  
  const isLogged = status === "authenticated";

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
    <nav className="w-full bg-deep text-white py-4 shadow-md font-sans relative z-50">
      <div className="container mx-auto px-6 flex justify-between items-center">
        
        {/* LOGO */}
        <Link href="/" className="text-2xl font-bold tracking-tight hover:opacity-90 transition font-logo">
          Psi<span className="text-blue-400">Duo</span>
        </Link>

        {/* MENU DESKTOP */}
        <div className="hidden lg:flex items-center gap-8">
          {/* Links de Navegação */}
          <div className="flex space-x-6 text-sm font-medium text-slate-300">
            <Link href="/" className="hover:text-white transition">Início</Link>
            <Link href="/como-funciona" className="hover:text-white transition">Como Funciona</Link>
            <Link href="/catalogo" className="hover:text-white transition">Catálogo</Link>
            <Link href="/sou-psicologo" className="hover:text-white transition text-blue-300 font-bold">Para Psicólogos</Link>
          </div>

          {/* Área de Ação (Login + Cadastro ou Painel + Sair) */}
          <div className="flex items-center gap-4 pl-8 border-l border-white/10">
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

        {/* BOTÃO HAMBURGER (MOBILE) */}
        <button
          onClick={toggleMenu}
          className="lg:hidden flex flex-col gap-1.5 p-2 hover:bg-white/5 rounded-lg transition active:scale-95"
          aria-label="Menu"
        >
          <span className={`block w-6 h-0.5 bg-white transition-transform ${isOpen ? "rotate-45 translate-y-2" : ""}`}></span>
          <span className={`block w-6 h-0.5 bg-white transition-opacity ${isOpen ? "opacity-0" : ""}`}></span>
          <span className={`block w-6 h-0.5 bg-white transition-transform ${isOpen ? "-rotate-45 -translate-y-2" : ""}`}></span>
        </button>
      </div>

      {/* MENU MOBILE (DROPDOWN) */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-deep border-t border-white/10 shadow-2xl">
          <div className="container mx-auto px-6 py-6 space-y-4">
            <Link 
              href="/" 
              className="block text-white hover:text-blue-300 transition font-medium"
              onClick={() => setIsOpen(false)}
            >
              Início
            </Link>
            <Link 
              href="/como-funciona" 
              className="block text-white hover:text-blue-300 transition font-medium"
              onClick={() => setIsOpen(false)}
            >
              Como Funciona
            </Link>
            <Link 
              href="/catalogo" 
              className="block text-white hover:text-blue-300 transition font-medium"
              onClick={() => setIsOpen(false)}
            >
              Catálogo
            </Link>
            <Link 
              href="/sou-psicologo" 
              className="block text-blue-300 hover:text-white transition font-bold"
              onClick={() => setIsOpen(false)}
            >
              Para Psicólogos
            </Link>

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
    </nav>
  );
}