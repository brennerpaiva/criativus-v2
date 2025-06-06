/* ------------------------------------------------------------------
 * src/store/report/user.store.ts
 * ------------------------------------------------------------------
 * Mantém informações do usuário logado
 * ----------------------------------------------------------------*/
"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/* ────────────────────────────────────────────────
 * Tipos
 * ────────────────────────────────────────────────*/

export interface User {
  id: number;
  name: string;
  email: string;
  facebookId: string;
}

interface UserState {
  /* dados */
  user: User | null;
  token: string | null;

  /* flags */
  isAuthenticated: boolean;
  loaded: boolean;

  /* actions */
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

/* ────────────────────────────────────────────────
 * Store
 * ────────────────────────────────────────────────*/
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loaded: false,

      setUser: (user) => 
        set({ 
          user, 
          isAuthenticated: !!user,
          loaded: true 
        }),

      setToken: (token) => 
        set({ token }),

      logout: () => 
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        }),
    }),
    {
      name: "user-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/* helper */
export const useCurrentUser = () => useUserStore((s) => s.user);
