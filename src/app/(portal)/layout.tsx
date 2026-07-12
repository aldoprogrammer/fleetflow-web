import { PortalShell } from "@/components/layout/PortalShell";
import { RouteGuard } from "@/components/auth/RouteGuard";

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PortalShell>
      <RouteGuard>{children}</RouteGuard>
    </PortalShell>
  );
}
