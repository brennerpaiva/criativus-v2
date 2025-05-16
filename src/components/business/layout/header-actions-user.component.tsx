/* ------------------------------------------------------------------
 * src/components/business/layout/header-actions-user.component.tsx
 * ------------------------------------------------------------------
 * Exibe o nome do relatório e o botão “Excluir” **apenas** se
 * o slug presente na URL existir no array `reports` do contexto.
 * ----------------------------------------------------------------*/
"use client";

import { Button } from "@/components/ui/button";
import ReportService from "@/service/report.service";
import { ListFiltersPageConfig, usePageConfigStore } from "@/store/report/collection.store";
import { ReportInfo, useReportStore } from "@/store/report/user-report.store";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function HeaderActions() {
  const router = useRouter();
  const { findReportBySlug, removeReport } = useReportStore();
  const currentPageConfig = usePageConfigStore((state) => state.currentPageConfig);
  const [disabledSaveButton, setDisabledSaveButton] = useState<boolean>(true);
  const [hiddeButtons, setHiddeButtons] = useState<boolean>(true);

  useEffect(() => {
    if (!currentPageConfig?.slug || !currentPageConfig?.listFilters) {
      return
    }
    const reportMatch = findReportBySlug(currentPageConfig.slug);
    if (!reportMatch) {
      return;
    }
    setHiddeButtons(false);
    const isDifferent = checkDifferencesFiltersReports(
      currentPageConfig.listFilters,
      reportMatch
    );
    setDisabledSaveButton(!isDifferent);
  }, [currentPageConfig, findReportBySlug]);

  const handleDelete = async () => {
    if (!currentPageConfig?.slug) return;
    if (!confirm(`Excluir o relatório \"${currentPageConfig.name}\" permanentemente?`)) return;

    try {
      await ReportService.deleteReportBySlug(currentPageConfig.slug);
      removeReport(currentPageConfig.slug);
      router.push("/top-criativos-vendas");
    } catch {
      alert("Erro ao excluir relatório");
    }
  };

  const handleSave = async () => {
    if (!currentPageConfig?.slug || !currentPageConfig?.listFilters) return;
    if (!confirm(`Salvar o relatório \"${currentPageConfig.name}\" permanentemente?`)) return;

    try {
      const response = await ReportService.updateReportBySlug(
        currentPageConfig.listFilters,
        currentPageConfig.slug
      );
      alert(response);
    } catch {
      alert("Erro ao salvar relatório");
    }
  };

  function checkDifferencesFiltersReports(
    currentFilters: ListFiltersPageConfig,
    reportMatch?: ReportInfo
  ): boolean {
    if (!reportMatch) return true;

    const currentMetricsOrder = currentFilters.metricsOrder || [];
    const reportMetricsOrder = reportMatch.metricsOrder || [];

    if (currentMetricsOrder.length !== reportMetricsOrder.length) return true;
    if (!currentMetricsOrder.every((m, i) => m === reportMetricsOrder[i])) return true;

    if (currentFilters.sorted !== reportMatch.sorted) return true;

    const { dateRange: currentDateRange } = currentFilters;
    const { dateRange: reportDateRange } = reportMatch;

    if (!currentDateRange || !reportDateRange) {
      return currentDateRange !== reportDateRange;
    }

    const toDateOnly = (value: unknown) => {
      const date = value instanceof Date ? value : new Date(value as string);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    };

    try {
      const currentFrom = toDateOnly(currentDateRange.from);
      const currentTo = toDateOnly(currentDateRange.to);
      const reportFrom = toDateOnly(reportDateRange.from);
      const reportTo = toDateOnly(reportDateRange.to);

      if (currentFrom.getTime() !== reportFrom.getTime() || currentTo.getTime() !== reportTo.getTime()) {
        return true;
      }
    } catch {
      return true;
    }

    return false;
  }

  return (
    <div className="flex items-center gap-4">
      {currentPageConfig && !hiddeButtons && (
        <>
          <Button
            variant="outline"
            disabled={disabledSaveButton}
            size="sm"
            onClick={handleSave}
          >
            Salvar
          </Button>
          <Button variant="outline" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-1" />
          </Button>
        </>
      )}
    </div>
  );
}
