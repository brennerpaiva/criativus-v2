/* src/app/(users)/layout.tsx */
"use client";
import { Separator } from "@radix-ui/react-select";
import { usePathname } from "next/navigation";
import "../../assets/styles/globals.css";

import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage
} from "@/components/ui/breadcrumb";
import {
  SidebarInset, SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/business/layout/app-sidebar.component";
import { HeaderActions } from "@/components/business/layout/header-actions-user.component";
import { useAuth } from "@/context/auth.context";
import { usePageConfigStore } from "@/store/report/collection.store";
import { useEffect } from "react";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname      = usePathname();
  // const setCurrentBySlug = useReportStore((s) => s.setCurrentBySlug);
  const { activeAdAccount } = useAuth();
  const resetPageConfig = usePageConfigStore(
      (s) => s.resetPageConfig,
    );

    useEffect(() => {
      // const slug = pathname.match(/\/(?:reports|relatorios)\/([^/]+)/)?.[1] ?? null;
      resetPageConfig()
    }, []);

  /* fallback para páginas que não são relatório */

  return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 items-center gap-2 w-full">
            <div className="flex items-center gap-2 px-4 w-full">
              <SidebarTrigger className="-ml-1" />
              <Separator className="mr-2 h-4" />

              {/* breadcrumb */}
              <div className="justify-between m-auto align-center inline-flex items-center w-full">
                <Breadcrumb>
                  <BreadcrumbList>
                    {activeAdAccount?.name && (
                      <>
                        <BreadcrumbItem className="hidden md:block">
                          <BreadcrumbLink>{activeAdAccount.name}</BreadcrumbLink>
                        </BreadcrumbItem>
                        {/* <BreadcrumbSeparator className="hidden md:block" /> */}
                      </>
                    )}
                    <BreadcrumbItem>
                      <BreadcrumbPage></BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>

                {/* título real + botão excluir (HeaderActions) */}
                <HeaderActions />
              </div>
              
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
  );
}
