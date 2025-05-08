/* src/app/(users)/layout.tsx */
"use client";
import { Separator } from "@radix-ui/react-select";
import { usePathname } from "next/navigation";
import "../../assets/styles/globals.css";

import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  SidebarInset, SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/business/layout/app-sidebar.component";
import { HeaderActions } from "@/components/business/layout/header-actions-user.component";
import { useAuth } from "@/context/auth.context";
import { ReportsProvider } from "@/context/reports.context";
import { useReportStore } from "@/store/report/user-report.store";
import { useEffect } from "react";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname      = usePathname();
  const setCurrentBySlug = useReportStore((s) => s.setCurrentBySlug);
  const { activeAdAccount } = useAuth();

  /* fallback para páginas que não são relatório */
  const defaultTitle = pathname === "/" ? "Home"
    : pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()) ?? "";

    useEffect(() => {
      const slug = pathname.match(/\/(?:reports|relatorios)\/([^/]+)/)?.[1] ?? null;
      setCurrentBySlug(slug);
    }, [pathname, setCurrentBySlug]);

  return (
    <ReportsProvider>
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
                        <BreadcrumbSeparator className="hidden md:block" />
                      </>
                    )}
                    <BreadcrumbItem>
                      <BreadcrumbPage>{defaultTitle}</BreadcrumbPage>
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
    </ReportsProvider>
  );
}
