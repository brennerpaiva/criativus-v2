/* ------------------------------------------------------------------
 * src/store/report/user-report.store.ts
 * ------------------------------------------------------------------
 * Mantém lista de relatórios + relatório atual (com preferências).
 * ----------------------------------------------------------------*/
"use client";

import { MetricKey } from "@/constants/metric";
import { DateRange } from "react-day-picker";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/* ────────────────────────────────────────────────
 * Tipos
 * ────────────────────────────────────────────────*/

export interface ReportInfo {
  id: number;
  name: string;
  slug: string;
  metricsOrder?: MetricKey[];   //  ⬅️  "?"
  sorted?:  MetricKey;
  dateRange?:   DateRange;
}

interface ReportState {
  /* dados */
  reports: ReportInfo[];

  /* flags */
  loaded: boolean;

  /* actions */
  setReports:        (list: ReportInfo[]) => void;
  addReport:         (r: ReportInfo) => void;
  removeReport:      (slug: string) => void;
  findReportBySlug:  (slug: string) => ReportInfo | undefined;
}

/* ────────────────────────────────────────────────
 * Store
 * ────────────────────────────────────────────────*/
export const useReportStore = create<ReportState>()(
  persist(
    (set, get) => ({
      reports: [],
      loaded: false,
      setReports: (list) => {
        if (!get().loaded) {
          set({ reports: list, loaded: true });
        }
      },
      addReport: (r) => set((st) => ({ reports: [...st.reports, r] })),
      removeReport: (slug) =>
        set((st) => ({
          reports: st.reports.filter((r) => r.slug !== slug),
        })),
      findReportBySlug: (slug) =>
        get().reports.find((report) => report.slug === slug),
    }),
    {
      name: "user-reports",
      storage: createJSONStorage(() => localStorage), // ✅ ESSE É O PONTO-CHAVE
      partialize: (state) => ({
        reports: state.reports,
        loaded: state.loaded,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setReports?.(state.reports || []);
      },
    }
  )
);

