import type { UserRole } from "./types";

export interface DemoAccount {
  role: UserRole;
  email: string;
  password: string;
  displayName: string;
  description: string;
  initials: string;
  tone: string;
}

export const DEMO_PASSWORD = "FleetFlow!2026";

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: "SUPERADMIN",
    email: "superadmin@fleetflow.dev",
    password: DEMO_PASSWORD,
    displayName: "FleetFlow Super Admin",
    description: "Platform governance, ledger, and user provisioning",
    initials: "SA",
    tone: "from-violet-500 to-indigo-600",
  },
  {
    role: "REGIONAL_MANAGER",
    email: "regional.manager@fleetflow.dev",
    password: DEMO_PASSWORD,
    displayName: "Jakarta Regional Manager",
    description: "Multi-hub SLA monitoring and escalation control",
    initials: "RM",
    tone: "from-sky-500 to-blue-600",
  },
  {
    role: "HEAD_OF_WAREHOUSE",
    email: "warehouse.head@fleetflow.dev",
    password: DEMO_PASSWORD,
    displayName: "Central Warehouse Head",
    description: "Inbound staging, dock capacity, and handoffs",
    initials: "WH",
    tone: "from-amber-500 to-orange-600",
  },
  {
    role: "FLEET_OPERATOR",
    email: "fleet.operator@fleetflow.dev",
    password: DEMO_PASSWORD,
    displayName: "Fleet Operations Lead",
    description: "Dispatch queue, driver shifts, and live telemetry",
    initials: "FO",
    tone: "from-orange-500 to-rose-600",
  },
  {
    role: "MERCHANT_ADMIN",
    email: "merchant.admin@acme-commerce.id",
    password: DEMO_PASSWORD,
    displayName: "Acme Merchant Admin",
    description: "B2B order intake and fulfillment tracking",
    initials: "MA",
    tone: "from-emerald-500 to-teal-600",
  },
  {
    role: "DRIVER_PARTNER",
    email: "driver.partner@fleetflow.dev",
    password: DEMO_PASSWORD,
    displayName: "Alex Rivera",
    description: "Assigned routes, proof of delivery, and earnings",
    initials: "AR",
    tone: "from-teal-500 to-cyan-600",
  },
];
