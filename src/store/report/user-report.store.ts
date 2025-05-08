/* ------------------------------------------------------------------
 * src/store/report/user-report.store.ts
 * ------------------------------------------------------------------
 * Mantém lista de relatórios + relatório atual (com preferências).
 * ----------------------------------------------------------------*/
"use client";

import { MetricKey } from "@/constants/metric";
import { DateRange } from "react-day-picker";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ────────────────────────────────────────────────
 * Tipos
 * ────────────────────────────────────────────────*/
export interface ReportViewPrefs {
  metricsOrder?: MetricKey[];   //  ⬅️  “?”
  orderMetric?:  MetricKey;
  dateRange?:    DateRange;
}

export interface ReportInfo {
  id: number;
  name: string;
  slug: string;
  prefs?: ReportViewPrefs;         // ⬅️  novo
}

interface ReportState {
  /* dados */
  reports: ReportInfo[];
  currentReport: ReportInfo | null;

  /* flags */
  loaded: boolean;

  /* actions */
  setReports:        (list: ReportInfo[]) => void;
  addReport:         (r: ReportInfo) => void;
  removeReport:      (slug: string) => void;
  setCurrentReport:  (r: ReportInfo | null) => void;
  setCurrentBySlug:  (slug: string | null) => void;
  updateCurrentPrefs:(prefs: Partial<ReportViewPrefs>) => void; // ⬅️ novo
}

/* ────────────────────────────────────────────────
 * Store
 * ────────────────────────────────────────────────*/
export const useReportStore = create<ReportState>()(
  persist(
    (set, get) => ({
      reports: [],
      currentReport: null,
      loaded: false,

      /* ---------- lista geral ---------- */
      setReports: (list) => set({ reports: list, loaded: true }),

      addReport: (r) =>
        set((st) => ({ reports: [...st.reports, r] })),

      /** Remove pelo slug; se era o current, zera. */
      removeReport: (slug) =>
        set((st) => {
          const filtered = st.reports.filter((r) => r.slug !== slug);
          const resetCurrent =
            st.currentReport?.slug === slug ? null : st.currentReport;
          return { reports: filtered, currentReport: resetCurrent };
        }),

      /* ---------- seleção ---------- */
      setCurrentReport: (r) => set({ currentReport: r }),

      setCurrentBySlug: (slug) => {
        const report = get().reports.find((r) => r.slug === slug) ?? null;
        set({ currentReport: report });
      },

      /* ---------- atualiza preferências do current ---------- */
      updateCurrentPrefs: (prefs) =>
        set((st) => {
          if (!st.currentReport) return {};
          const merged: ReportInfo = {
            ...st.currentReport,
            prefs: { ...st.currentReport.prefs, ...prefs },
          };

          /** sincronia opcional com o array `reports` */
          const idx = st.reports.findIndex((r) => r.slug === merged.slug);
          const reports =
            idx >= 0
              ? [
                  ...st.reports.slice(0, idx),
                  merged,
                  ...st.reports.slice(idx + 1),
                ]
              : st.reports;

          return { currentReport: merged, reports };
        }),
    }),
    {
      name: "user-reports",
      partialize: (state) => ({
        reports: state.reports,
        currentReport: state.currentReport,
      }),
    },
  ),
);

/* Helper para usar apenas o currentReport */
export const useCurrentReport = () =>
  useReportStore((s) => s.currentReport);
