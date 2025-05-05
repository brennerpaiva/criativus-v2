"use client";

import { Separator } from "@radix-ui/react-select";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import "../../assets/styles/globals.css";

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/business/layout/nav-bar.component";
import { useAuth } from "@/context/auth.context";

/**
 * Exemplo simples para "limpar" a rota e transformá-la em um título.
 * Ajuste de acordo com suas rotas reais ou use um mapeamento
 * mais elaborado se desejar.
 */
function getPageTitle(pathname: string): string {
  // Se a rota for '/', podemos retornar 'Início' ou algo assim
  if (pathname === "/") return "Home";

  // Caso queira criar um dicionário de rotas -> Títulos
  // por exemplo:
  const routeMap: Record<string, string> = {
    "/top-criativos-vendas": "Top Criativos - Vendas",
    "/top-criativos-visitas": "Top Criativos - Visitas",
    "/snapshots": "Snapshots",
    "/custom": "Custom Page",
  };

  // Se existir na tabela, retorna o valor
  if (routeMap[pathname]) {
    return routeMap[pathname];
  }

  // Senão, extrai o último segmento da rota e capitaliza
  // Ex.: "/dashboard/users" => "Users"
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0) {
    const lastSegment = segments[segments.length - 1];
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  }

  // Se nenhuma regra se aplicar, retorna um fallback
  return "Página Atual";
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname(); // <-- para pegar a rota atual
  const { login, user, activeAdAccount, logout, loading } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Mudar para false se necessário

  // Título da página com base na rota
  const pageTitle = getPageTitle(pathname);

  useEffect(() => {
    if (activeAdAccount) {
      fetchData();
    }
  }, [activeAdAccount]);

  async function fetchData() {
    try {
      if (activeAdAccount) {
        // const insights = await FacebookAdsService.getCreativeInsights(adAccount.id);
        // console.log("Insights obtidos:", insights);
      } else {
        console.log("AdAccount ainda não está disponível.");
      }
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator className="mr-2 h-4" />
            
            {/* Breadcrumb com o nome da conta + título da página atual */}
            <Breadcrumb>
              <BreadcrumbList>
                {/* Exibe o nome da conta, se disponível */}
                {activeAdAccount?.name && (
                  <>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#">{activeAdAccount.name}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                  </>
                )}

                {/* Título da página atual */}
                <BreadcrumbItem>
                  <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
