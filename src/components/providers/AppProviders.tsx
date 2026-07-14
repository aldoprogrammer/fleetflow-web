"use client";

import type { ReactNode } from "react";
import { RouteProgressBar } from "@/components/ui/RouteProgressBar";
import { ToastViewport } from "@/components/ui/ToastViewport";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <>
      <RouteProgressBar />
      {children}
      <ToastViewport />
    </>
  );
}
