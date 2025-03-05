'use client';

import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const router = useRouter();
  // Enquanto estiver checando, não renderiza nada (ou um loading se preferir

  // Se chegar aqui, significa que não existe token e podemos mostrar o children
  return <>{children}</>;
}
