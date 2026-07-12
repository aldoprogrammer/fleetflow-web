export interface QuickActionCopy {
  description: string;
  cta: string;
  tone: "primary" | "default";
}

export const QUICK_ACTION_COPY: Record<string, QuickActionCopy> = {
  "/orders/create": {
    description: "Submit a new B2B pickup and trigger automatic driver matching.",
    cta: "Create now",
    tone: "primary",
  },
  "/orders/track": {
    description: "Look up an order ID and monitor live fulfillment status.",
    cta: "Track order",
    tone: "default",
  },
  "/operations/orders": {
    description: "Review cross-tenant dispatches, SLA risk, and escalations.",
    cta: "View orders",
    tone: "default",
  },
  "/fleet": {
    description: "Monitor dispatch queue health and fleet availability.",
    cta: "Open fleet",
    tone: "default",
  },
  "/drivers": {
    description: "Manage partner onboarding, shifts, and compliance.",
    cta: "Manage drivers",
    tone: "default",
  },
  "/merchants": {
    description: "Configure merchant wallets, API keys, and billing limits.",
    cta: "Open merchants",
    tone: "default",
  },
  "/ledger": {
    description: "Audit settlements, payouts, and platform fee collection.",
    cta: "View ledger",
    tone: "default",
  },
  "/admin/users": {
    description: "Provision enterprise users and assign RBAC roles.",
    cta: "Manage users",
    tone: "primary",
  },
};

export function getQuickActionCopy(href: string, label: string): QuickActionCopy {
  return (
    QUICK_ACTION_COPY[href] ?? {
      description: `Open ${label.toLowerCase()} workspace.`,
      cta: "Open",
      tone: "default",
    }
  );
}
