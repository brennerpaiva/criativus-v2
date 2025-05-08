/* ------------------------------------------------------------------
 * src/components/business/layout/nav-bar.component.tsx
 * ------------------------------------------------------------------
 * Sidebar da aplicação:
 * • Lê relatórios do back-end apenas uma vez (se ainda não há cache)
 * • Grava/consome a lista via Zustand + persist
 * • Injeta os relatórios em “Relatórios Customizados”
 * ----------------------------------------------------------------*/
"use client";

import { SquareTerminal } from "lucide-react";
import { useEffect, useState } from "react";

import { NavMain } from "@/components/business/layout/nav-main";
import { NavUser } from "@/components/business/layout/nav-user";
import { TeamSwitcher } from "@/components/business/layout/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import { useAuth } from "@/context/auth.context";
import ReportService from "@/service/report.service";
import { useReportStore } from "@/store/report/user-report.store";
import { CreateReportPopover } from "../popover/create-report-popover.component";

/* ---------- menu base ---------- */
const BASE_NAV = [
  {
    title: "Top Criativos",
    url: "#",
    icon: SquareTerminal,
    isActive: true,
    items: [
      { title: "Vendas", url: "/top-criativos-vendas" },
      { title: "Visitas", url: "/top-criativos-visitas" },
      { title: "Custom", url: "/custom" },
    ],
  },
  {
    title: "Relatórios",
    url: "#",
    icon: SquareTerminal,
    isActive: true,
    items: [], // ← preenchido depois
  },
];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  /* Zustand store ------------------------------------------------ */
  const { reports, loaded, setReports } = useReportStore();

  /* estado local do menu ---------------------------------------- */
  const [navItems, setNavItems] = useState(BASE_NAV);

  /* 1. Carrega relatórios só se não houver cache ---------------- */
  useEffect(() => {
    if (loaded) return; // já persistidos → evita request

    (async () => {
      try {
        const apiReports = await ReportService.listReports();
        setReports(
          apiReports.map(({ id, name, slug }) => ({ id, name, slug })),
        );
      } catch (err) {
        console.error(err);
        alert("Erro ao listar relatórios");
      }
    })();
  }, [loaded, setReports]);

  /* 2. Atualiza menu sempre que a lista mudar ------------------- */
  useEffect(() => {
    const reportLinks = reports.map((r) => ({
      title: r.name,
      url: `/reports/${r.slug}`,
    }));

    setNavItems((prev) =>
      prev.map((item) =>
        item.title === "Relatórios"
          ? { ...item, items: reportLinks }
          : item,
      ),
    );
  }, [reports]);

  /* render ------------------------------------------------------- */
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navItems} />
        <CreateReportPopover />
      </SidebarContent>

      <SidebarFooter>{user && <NavUser {...user} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
