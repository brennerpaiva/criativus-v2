'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FacebookState {
 token: string | null;
 setToken: (token: string | null) => void;
 clear: () => void;
}

export const useFacebookStore = create<FacebookState>()(
 persist(
  (set) => ({
   token: null,
   setToken: (token) => set({ token }),
   clear: () => set({ token: null }),
  }),
  {
   name: 'facebook-token',
  }
 )
);
