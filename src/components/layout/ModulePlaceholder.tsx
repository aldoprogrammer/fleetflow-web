import type { ReactElement, ReactNode } from "react";
import { PageSection } from "@/components/ui/PageSection";

interface ModulePlaceholderProps {
  title: string;
  description: string;
  bullets: string[];
}

export function ModulePlaceholder({
  title,
  description,
  bullets,
}: ModulePlaceholderProps): ReactElement {
  return (
    <PageSection title={title} description={description}>
      <ul className="space-y-2 text-sm text-slate-700">
        {bullets.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="text-emerald-600">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </PageSection>
  );
}

interface PermissionGateProps {
  allowed: boolean;
  children: ReactNode;
}

export function PermissionGate({ allowed, children }: PermissionGateProps): ReactElement | null {
  if (!allowed) return null;
  return <>{children}</>;
}
