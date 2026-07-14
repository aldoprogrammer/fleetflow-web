"use client";

import { create } from "zustand";

export interface PushToast {
  id: string;
  title: string;
  body: string;
  href?: string | null;
  createdAt: number;
}

interface ToastState {
  toasts: PushToast[];
  push: (toast: Omit<PushToast, "createdAt">) => void;
  dismiss: (id: string) => void;
}

const MAX_VISIBLE = 3;
const AUTO_DISMISS_MS = 6000;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: (toast) => {
    set((state) => ({
      toasts: [
        { ...toast, createdAt: Date.now() },
        ...state.toasts.filter((item) => item.id !== toast.id),
      ].slice(0, MAX_VISIBLE),
    }));

    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        get().dismiss(toast.id);
      }, AUTO_DISMISS_MS);
    }
  },
  dismiss: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((item) => item.id !== id),
    }));
  },
}));
