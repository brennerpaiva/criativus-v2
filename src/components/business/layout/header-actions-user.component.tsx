/* ------------------------------------------------------------------
 * src/components/business/layout/header-actions-user.component.tsx
 * ------------------------------------------------------------------
 * Exibe o nome do relatório e o botão “Excluir” **apenas** se
 * o slug presente na URL existir no array `reports` do contexto.
 * ----------------------------------------------------------------*/
"use client";

import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import ReportService from "@/service/report.service";
import { useReportStore } from "@/store/report/user-report.store";
import { Trash2 } from "lucide-react";
// import ReportService from "@/service/report.service"; // habilite quando tiver endpoint

export function HeaderActions() {
  const pathname = usePathname();
  const router   = useRouter();
  const { currentReport, loaded, setReports } = useReportStore();
  const removeReport = useReportStore((s) => s.removeReport);
  console.log(currentReport)

  /* -------- excluir -------- */
  const handleDelete = async () => {
    if (!currentReport) return;
    if (!confirm(`Excluir o relatório "${currentReport.name}" permanentemente?`)) return;

    try {
      const response = await ReportService.deleteReportBySlug(currentReport.slug)
      removeReport(currentReport.slug);
      router.push("/top-criativos-vendas");     // volta para lista
    } catch {
      alert("Erro ao excluir relatório");
    }
  };

  /* -------- render -------- */
  return (
    <div className="flex items-center gap-4">
      {/* <h2 className="text-lg font-semibold">
        {currentReport ? currentReport.name : "Página"}
      </h2> */}

      {currentReport && (
        <>
         <Button variant="outline" size="sm" onClick={handleDelete}>
            Salvar
          </Button>
          <Button variant="outline" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-1" />
            {/* Excluir */}
          </Button>
        </>
      )}
    </div>
  );
}
