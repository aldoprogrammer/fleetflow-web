"use client";

import type { ReactNode } from "react";
import { RouteProgressBar } from "@/components/ui/RouteProgressBar";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <>
      <RouteProgressBar />
      {children}
    </>
  );
}
