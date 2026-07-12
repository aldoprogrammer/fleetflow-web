import { Loader2 } from "lucide-react";
import type { ReactElement, ReactNode } from "react";

interface ActionLoadingOverlayProps {
  show: boolean;
  label?: string;
  children?: ReactNode;
}

export function ActionLoadingOverlay({
  show,
  label = "Processing request...",
  children,
}: ActionLoadingOverlayProps): ReactElement | null {
  if (!show) return null;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[inherit] bg-white/85 backdrop-blur-[2px]">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-lg">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {children}
      </div>
    </div>
  );
}
