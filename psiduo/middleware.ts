import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Verificar se a rota precisa de autenticação
  const { pathname } = request.nextUrl;
  
  // Rotas protegidas
  const protectedRoutes = ["/painel", "/admin", "/perfil/editar"];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (!isProtectedRoute || pathname === "/admin/login") {
    return NextResponse.next();
  }
  
  // Verificar token de sessão (Painel e Admin)
  const isPathAdmin = pathname.startsWith("/admin");

  if (isPathAdmin) {
    const adminToken = request.cookies.get("psiduo_admin_token");
    if (!adminToken || adminToken.value !== "authenticated_so_secure") {
        const loginUrl = new URL("/admin/login", request.url);
        return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  const token = request.cookies.get("next-auth.session-token") || 
                request.cookies.get("__Secure-next-auth.session-token");
  
  if (!token) {
    // Redirecionar para login se não autenticado (Painel)
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/painel/:path*",
    "/admin/:path*",
    "/perfil/editar/:path*",
  ],
};
