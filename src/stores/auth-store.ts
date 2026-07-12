"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { login as loginApi } from "@/lib/api/auth";
import { registerAccessTokenGetter } from "@/lib/api/client";
import {
  clearAuthCookies,
  setAuthCookie,
  setRbacCookie,
} from "@/lib/auth/cookies";
import type { AuthSession, UserRole } from "@/lib/auth/types";

interface AuthState {
  session: AuthSession | null;
  isHydrated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  setHydrated: (value: boolean) => void;
}

function persistSession(session: AuthSession): void {
  setAuthCookie(session.accessToken, session.expiresIn);
  setRbacCookie(session.user.role, session.expiresIn);
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      isHydrated: false,
      login: async (email, password, role) => {
        const session = await loginApi({ email, password, role });
        persistSession(session);
        set({ session });
      },
      logout: () => {
        clearAuthCookies();
        set({ session: null });
      },
      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: "fleetflow-auth",
      partialize: (state) => ({ session: state.session }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
        if (state?.session) {
          persistSession(state.session);
        }
      },
    },
  ),
);

registerAccessTokenGetter(() => useAuthStore.getState().session?.accessToken ?? null);
