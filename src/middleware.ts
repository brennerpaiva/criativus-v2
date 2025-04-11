import { MiddlewareConfig, NextRequest, NextResponse } from "next/server";
import { userModel } from "./types/model/user.model";

// Define as rotas públicas (não incluímos "/" pois não desejamos ter página home)
const publicRoutes = [
  { path: '/sign-in', whenAuthenticated: 'redirect' },
  { path: '/sign-up', whenAuthenticated: 'redirect' },
  { path: '/login-facebook', whenAuthenticated: 'next' }, //TODO: VER SE É POSSÍVEL DEIXAR COMO REDIRECT
  { path: '/snapshot', whenAuthenticated: 'next' },
] as const;

const REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE = '/sign-in';
// Rota para redirecionar usuários autenticados (ex: dashboard)
const AUTHENTICATED_HOME_REDIRECT = '/top-criativos-vendas'; // ajuste conforme sua necessidade

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Cria uma instância de resposta modificável
  let response = NextResponse.next();

  // Recupera o token e os dados do usuário
  const authToken = request.cookies.get('access_token')?.value;
  const userCookie = request.cookies.get('user')?.value || '';

  let user: userModel | null = null;
  try {
    user = userCookie ? JSON.parse(userCookie) : null;
  } catch (error) {
    console.error("Erro ao parsear o cookie de usuário:", error);
    user = null;
  }

  // Identifica se a rota é pública
  const publicRoute = publicRoutes.find(route => {
    if (route.path === '/snapshot') {
      return path.startsWith('/snapshot');
    }
    return route.path === path;
  });

  if (!user?.facebookId && !publicRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE;
    
    // Cria a resposta de redirecionamento
    const redirectResponse = NextResponse.redirect(redirectUrl);
    
    // Deleta os cookies na resposta de redirecionamento
    ["user", "userToken", "access_token", "activeAdAccount", "adAccounts"].forEach((cookieName) => {
      redirectResponse.cookies.delete(cookieName);
    });
    
    return redirectResponse;
  }  
  
  // Se não houver token e a rota for pública, retorna a resposta modificada com os cookies deletados
  if (!authToken && publicRoute) {
    return NextResponse.next();
  }

  // Se não houver token e não for rota pública, cria uma resposta de redirecionamento com os cookies deletados
  if (!authToken && !publicRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE;
    return NextResponse.redirect(redirectUrl);
  }

  // Se houver token e a rota for pública com comportamento "redirect" para usuários autenticados,
  // redireciona para a rota padrão do usuário autenticado
  if (authToken && publicRoute && publicRoute.whenAuthenticated === 'redirect') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = AUTHENTICATED_HOME_REDIRECT;
    return NextResponse.redirect(redirectUrl);
  }

  // Em outros casos (usuário autenticado e rota protegida), retorna a resposta modificada
  return response;
}

export const config: MiddlewareConfig = {
  matcher: [
    // Aplica o middleware a todas as rotas, exceto as rotas estáticas e arquivos especiais
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
