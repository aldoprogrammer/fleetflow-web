import { Suspense } from "react";
import { ForbiddenPanel } from "@/components/auth/ForbiddenPanel";

export default function ForbiddenPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}>
      <ForbiddenPanel />
    </Suspense>
  );
}
