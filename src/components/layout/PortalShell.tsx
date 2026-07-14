"use client";

import { AppLink } from "@/components/ui/AppLink";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { PageContentSkeleton } from "@/components/ui/skeletons/PageContentSkeleton";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, LogOut, Truck } from "lucide-react";
import { useState, type ReactElement, type ReactNode } from "react";
import { getNavItemsForPermissions, type NavItemConfig } from "@/lib/auth/access";
import { getNavIcon } from "@/lib/navigation/nav-icons";
import { ROLE_LABELS } from "@/lib/auth/types";
import { useAuthStore } from "@/stores/auth-store";
import { useNavigationStore } from "@/stores/navigation-store";

interface PortalShellProps {
  children: ReactNode;
}

const GROUP_LABELS: Record<NavItemConfig["group"], string> = {
  core: "Workspace",
  operations: "Operations",
  admin: "Administration",
};

function NavLink({
  item,
  pathname,
  pendingHref,
  compact = false,
}: {
  item: NavItemConfig;
  pathname: string;
  pendingHref: string | null;
  compact?: boolean;
}): ReactElement {
  const Icon = getNavIcon(item.icon);
  const isCurrent =
    pathname === item.href || pathname.startsWith(`${item.href}/`);
  const isPendingTarget = pendingHref === item.href;
  const active = isPendingTarget || (isCurrent && !pendingHref);

  return (
    <AppLink
      href={item.href}
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-emerald-600 text-white"
          : compact
            ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            : "text-slate-300 hover:bg-slate-800 hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{item.label}</span>
    </AppLink>
  );
}

export function PortalShell({ children }: PortalShellProps): ReactElement {
  const pathname = usePathname();
  const router = useRouter();
  const pendingHref = useNavigationStore((s) => s.pendingHref);
  const isRouteTransitioning =
    pendingHref !== null && pendingHref.split("?")[0] !== pathname;
  const session = useAuthStore((s) => s.session);
  const logout = useAuthStore((s) => s.logout);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const user = session?.user;
  const permissions = user?.permissions ?? [];
  const navItems = getNavItemsForPermissions(permissions);

  const grouped = (["core", "operations", "admin"] as const)
    .map((group) => ({
      group,
      items: navItems.filter((item) => item.group === group),
    }))
    .filter((section) => section.items.length > 0);

  const handleLogout = (): void => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    logout();
    router.replace("/login");
  };

  const logoutButtonContent = isLoggingOut ? (
    <>
      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
      Signing out...
    </>
  ) : (
    <>
      <LogOut className="h-3.5 w-3.5" />
      Sign out
    </>
  );

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-slate-900 text-white lg:flex">
        <div className="border-b border-slate-800 px-5 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            FleetFlow
          </p>
          <p className="mt-1 text-lg font-semibold">Operations Portal</p>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {grouped.map((section) => (
            <div key={section.group}>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {GROUP_LABELS[section.group]}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    pendingHref={pendingHref}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {user ? (
          <div className="border-t border-slate-800 p-4">
            <p className="truncate text-sm font-medium">{user.displayName}</p>
            <p className="truncate text-xs text-slate-400">{user.email}</p>
            <p className="mt-1 inline-flex rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
              {ROLE_LABELS[user.role]}
            </p>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              aria-busy={isLoggingOut}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {logoutButtonContent}
            </button>
          </div>
        ) : null}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-slate-200 bg-white px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Truck className="h-4 w-4 text-emerald-700" />
              <span className="font-medium text-slate-900">FleetFlow Enterprise</span>
              {user ? (
                <span className="hidden rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 sm:inline">
                  {ROLE_LABELS[user.role]}
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                aria-busy={isLoggingOut}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {logoutButtonContent}
              </button>
            </div>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                pathname={pathname}
                pendingHref={pendingHref}
                compact
              />
            ))}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {isRouteTransitioning && pendingHref ? (
            <PageContentSkeleton pathname={pendingHref.split("?")[0] ?? pendingHref} />
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
