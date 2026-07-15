"use client";

import type { ReactNode } from "react";
import { SessionBootstrap } from "@/components/auth/SessionBootstrap";
import { RealtimeSync } from "@/components/realtime/RealtimeSync";
import { RouteProgressBar } from "@/components/ui/RouteProgressBar";
import { ToastViewport } from "@/components/ui/ToastViewport";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <>
      <SessionBootstrap />
      <RealtimeSync />
      <RouteProgressBar />
      {children}
      <ToastViewport />
    </>
  );
}
