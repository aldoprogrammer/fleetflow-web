import { create } from "zustand";

interface NavigationState {
  pendingHref: string | null;
  setPendingHref: (href: string | null) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  pendingHref: null,
  setPendingHref: (href) => set({ pendingHref: href }),
}));
