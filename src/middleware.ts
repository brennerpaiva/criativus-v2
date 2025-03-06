import { MiddlewareConfig, NextRequest, NextResponse } from "next/server";

// Definindo as rotas públicas
const publicRoutes = [
  { path: '/sign-in', whenAuthenticated: 'redirect' },
  { path: '/sign-up', whenAuthenticated: 'redirect' },
  { path: '/snapshot', whenAuthenticated: 'next' },
  { path: '/', whenAuthenticated: 'next' },
] as const;

const REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE = '/sign-in';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Verifica se o caminho corresponde a uma rota pública:
  const publicRoute = publicRoutes.find(route => {
    // Se a rota base for "/snapshot", qualquer caminho que inicie com "/snapshot" é público
    if (route.path === '/snapshot') {
      return path.startsWith('/snapshot');
    }
    // Para as demais, usa igualdade exata
    return route.path === path;
  });

  const authToken = request.cookies.get('access_token');
  console.log({ path, publicRoute });

  if (!authToken && publicRoute) {
    console.log('passou - sem token, mas rota pública');
    return NextResponse.next();
  }

  if (!authToken && !publicRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE;
    return NextResponse.redirect(redirectUrl);
  }

  if (authToken && publicRoute && publicRoute.whenAuthenticated === 'redirect') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/';
    return NextResponse.redirect(redirectUrl);
  }

  // Se houver token e não for rota pública, permite o acesso
  return NextResponse.next();
}

export const config: MiddlewareConfig = {
  matcher: [
    // Matcher para todas as rotas, exceto algumas especiais
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
