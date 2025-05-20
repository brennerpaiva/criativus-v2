/* ------------------------------------------------------------------
 * src/components/business/layout/nav-bar.component.tsx
 * ------------------------------------------------------------------
 * Sidebar da aplicação:
 * • Lê relatórios do back-end apenas uma vez (se ainda não há cache)
 * • Grava/consome a lista via Zustand + persist
 * • Injeta os relatórios em "Relatórios Customizados"
 * ----------------------------------------------------------------*/
"use client";

import { SquareTerminal } from "lucide-react";
import { useEffect } from "react";

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
    title: "Relatórios Customizados",
    url: "#",
    icon: SquareTerminal,
    isActive: true,
    items: [], // ← preenchido depois
  },
];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const { reports, loaded, setReports } = useReportStore();
  // Carrega relatórios se ainda não houver dados persistidos
  useEffect(() => {
    if (reports.length > 0 || loaded) return;
    if (!loaded) return;
    (async () => {
      try {
        const apiReports = await ReportService.listReports();
        setReports(
          apiReports.map(report => ({
            id: report.id,
            name: report.name,
            slug: report.slug,
            metricsOrder: report.metricsOrder ?? undefined,
            sorted: report.sorted ?? undefined,
            dateRange: report.dateStart && report.dateEnd
              ? { from: new Date(report.dateStart), to: new Date(report.dateEnd) }
              : undefined,
          }))
        );
      } catch (err) {
        console.error(err);
        alert("Erro ao listar relatórios");
      }
    })();
  }, [reports, loaded, setReports]);

  // Monta os itens dinamicamente
  const navItems = [
    {
      title: "Top Criativos",
      url: "#",
      icon: SquareTerminal,
      items: [
        { title: "Vendas", url: "/top-criativos-vendas" },
        { title: "Visitas", url: "/top-criativos-visitas" },
      ],
    },
    {
      title: "Relatórios Customizados",
      url: "#",
      icon: SquareTerminal,
      items: reports.map((r) => ({
        title: r.name,
        url: `/reports/${r.slug}`,
      })),
    },
  ];

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

