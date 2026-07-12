"use client";

import { usePathname } from "next/navigation";
import { PageContentSkeleton } from "@/components/ui/skeletons/PageContentSkeleton";

export function PortalPageLoader() {
  const pathname = usePathname();
  return <PageContentSkeleton pathname={pathname} />;
}
