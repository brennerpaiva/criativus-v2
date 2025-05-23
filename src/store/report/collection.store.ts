/* ------------------------------------------------------------------ */
/* src/store/report/collection.store.ts                               */
/* ------------------------------------------------------------------ */
"use client";

import { SimpleRange } from "@/components/ui/custom/date-picker-range";
import { MetricKey } from "@/constants/metric";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ────────────────────────────────────────────────
 * Tipos
 * ────────────────────────────────────────────────*/
export interface ListFiltersPageConfig {
  metricsOrder?: MetricKey[];
  sorted?: MetricKey;
  dateRange?: SimpleRange;
}

export interface PageConfig {
  listFilters?: ListFiltersPageConfig;
  name: string;
  description?: string;
  icon: string;
  slug?: string;
  id?: string;
}

interface PageConfigState {
  currentPageConfig: PageConfig | null;
  hasHydrated: boolean;                        // ✅ indica quando terminou
  setCurrentPageConfig: (config: PageConfig | null) => void;
  updateListFilters: (filters: Partial<ListFiltersPageConfig>) => void;
  resetPageConfig: () => void;
}

/* ────────────────────────────────────────────────
 * Store
 * ────────────────────────────────────────────────*/
export const usePageConfigStore = create<PageConfigState>()(
  persist(
    (set) => ({
      currentPageConfig: null,
      hasHydrated: false,

      setCurrentPageConfig: (config) =>
        set({ currentPageConfig: config }),

      updateListFilters: (filters) =>
        set((state) =>
          state.currentPageConfig
            ? {
                currentPageConfig: {
                  ...state.currentPageConfig,
                  listFilters: {
                    ...state.currentPageConfig.listFilters,
                    ...filters,
                  },
                },
              }
            : state,
        ),

      resetPageConfig: () =>
        set({ currentPageConfig: null }),
    }),
    {
      name: "page-config",

      /* grava só o que interessa */
      partialize: (state) => ({
        currentPageConfig: state.currentPageConfig,
      }),

      /* MEMÓRIA vence DISCO */
      merge: (persisted: any, current) => ({
        ...current,          // ← valor definido antes da hidratação
        ...persisted,        // ← valor que existia no localStorage
      }),

      /* marca quando concluiu a hidratação */
      onRehydrateStorage: () => (state) => {
        if(state)
        state.hasHydrated = true;
      },
    },
  ),
);

/* helper */
export const useCurrentPageConfig = () =>
  usePageConfigStore((s) => s.currentPageConfig);
