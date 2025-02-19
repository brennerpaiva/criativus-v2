'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const router = useRouter();
  // Estado para controlar se ainda estamos verificando a existência do token
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Se existir token, redireciona para o dashboard
      router.replace('/dashboard');
    } else {
      // Se não existir, liberamos a renderização dos children
      setIsAuthenticated(false);
    }
  }, [router]);

  // Enquanto estiver checando, não renderiza nada (ou um loading se preferir)
  if (isAuthenticated) {
    return null;
    // ou: return <div>Carregando...</div>;
  }

  // Se chegar aqui, significa que não existe token e podemos mostrar o children
  return <>{children}</>;
}
