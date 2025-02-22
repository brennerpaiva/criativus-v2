"use client";

import { AppSidebar } from '@/components/business/layout/nav-bar.component';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/context/auth.context';
import userService from '@/service/user.service';
import { Separator } from '@radix-ui/react-select';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import '../../assets/styles/globals.css';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { login, user, adAccount, logout, loading } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Mudar para false se necessário

  useEffect(() => {
    if (adAccount) {
      fetchData();
    }
  }, [adAccount]);

  async function fetchData() {
    try {
      console.log("Buscando insights para a conta:", adAccount);
      
      if (adAccount) {
        // const insights = await FacebookAdsService.getCreativeInsights(adAccount.id);
        // console.log("Insights obtidos:", insights);
      } else {
        console.log("AdAccount ainda não está disponível.");
      }

      const users = await userService.findAllUsers();
      console.log("Usuários encontrados:", users);
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
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Building Your Application</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
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
