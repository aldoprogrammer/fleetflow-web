import {
  Building2,
  LayoutDashboard,
  PackagePlus,
  ScrollText,
  Search,
  Truck,
  UserCog,
  Users,
  Warehouse,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { NavItemConfig } from "@/lib/auth/access";

export const NAV_ICONS: Record<NavItemConfig["icon"], LucideIcon> = {
  dashboard: LayoutDashboard,
  create: PackagePlus,
  track: Search,
  orders: ScrollText,
  fleet: Truck,
  drivers: Users,
  merchants: Building2,
  ledger: Warehouse,
  users: UserCog,
};

export function getNavIcon(icon: NavItemConfig["icon"]): LucideIcon {
  return NAV_ICONS[icon];
}
