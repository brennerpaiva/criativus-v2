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
  /* dados */
  currentPageConfig: PageConfig | null;
  loaded: boolean;

  /* actions */
  setCurrentPageConfig: (config: PageConfig | null) => void;
  updateListFilters: (filters: Partial<ListFiltersPageConfig>) => void;
  resetPageConfig: () => void;
}

/* ────────────────────────────────────────────────
 * Store
 * ────────────────────────────────────────────────*/
export const usePageConfigStore = create<PageConfigState>()(
  persist(
    (set, get) => ({
      currentPageConfig: null,
      loaded: false,

      /* ---------- configuração da página ---------- */
      setCurrentPageConfig: (config) => 
        set({ currentPageConfig: config, loaded: true }),

      updateListFilters: (filters) =>
        set((state) => {
          if (!state.currentPageConfig) return state;
          
          return {
            currentPageConfig: {
              ...state.currentPageConfig,
              listFilters: {
                ...state.currentPageConfig.listFilters,
                ...filters
              }
            }
          };
        }),

      resetPageConfig: () => 
        set({ currentPageConfig: null, loaded: false }),
    }),
    {
      name: "page-config",
      partialize: (state) => ({
        currentPageConfig: state.currentPageConfig,
        loaded: state.loaded,
      }),
    },
  ),
);

/* Helper para usar apenas o currentPageConfig */
export const useCurrentPageConfig = () =>
  usePageConfigStore((s) => s.currentPageConfig);