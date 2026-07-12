import { AppLink } from "@/components/ui/AppLink";
import { ArrowRight } from "lucide-react";
import type { ReactElement } from "react";
import type { NavItemConfig } from "@/lib/auth/access";
import { getNavIcon } from "@/lib/navigation/nav-icons";
import { getQuickActionCopy } from "@/lib/navigation/quick-action-copy";

interface QuickActionCardProps {
  item: NavItemConfig;
}

export function QuickActionCard({ item }: QuickActionCardProps): ReactElement {
  const Icon = getNavIcon(item.icon);
  const copy = getQuickActionCopy(item.href, item.label);
  const isPrimary = copy.tone === "primary";

  return (
    <AppLink
      href={item.href}
      className={`group relative flex items-center gap-4 overflow-hidden rounded-2xl border p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
        isPrimary
          ? "border-emerald-200 bg-gradient-to-r from-emerald-50 to-white hover:border-emerald-300 hover:shadow-emerald-100"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-slate-200/80"
      }`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
          isPrimary
            ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30"
            : "bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white"
        }`}
      >
        <Icon className="h-5 w-5" strokeWidth={2.2} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">{item.label}</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">{copy.description}</p>
      </div>

      <span
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
          isPrimary
            ? "bg-emerald-600 text-white group-hover:bg-emerald-700"
            : "bg-slate-900 text-white group-hover:bg-emerald-600"
        }`}
      >
        {copy.cta}
        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
      </span>
    </AppLink>
  );
}
