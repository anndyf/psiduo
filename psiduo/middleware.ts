import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Verificar se a rota precisa de autenticação
  const { pathname } = request.nextUrl;
  
  // Rotas protegidas
  const protectedRoutes = ["/painel", "/perfil/editar"];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (!isProtectedRoute) {
    return NextResponse.next();
  }
  
  // Verificar token de sessão NextAuth
  const token = request.cookies.get("next-auth.session-token") || 
                request.cookies.get("__Secure-next-auth.session-token");
  
  if (!token) {
    // Redirecionar para login se não autenticado
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/painel/:path*",
    "/perfil/editar/:path*",
  ],
};
