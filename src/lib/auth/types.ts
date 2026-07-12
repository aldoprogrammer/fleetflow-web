export const USER_ROLES = [
  "SUPERADMIN",
  "REGIONAL_MANAGER",
  "HEAD_OF_WAREHOUSE",
  "FLEET_OPERATOR",
  "MERCHANT_ADMIN",
  "DRIVER_PARTNER",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
  merchantId?: string | null;
  driverId?: string | null;
  permissions: string[];
}

export interface AuthSession {
  accessToken: string;
  expiresIn: number;
  tokenType: "Bearer";
  user: AuthUser;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPERADMIN: "Super Admin",
  REGIONAL_MANAGER: "Regional Manager",
  HEAD_OF_WAREHOUSE: "Head of Warehouse",
  FLEET_OPERATOR: "Fleet Operator",
  MERCHANT_ADMIN: "Merchant Admin",
  DRIVER_PARTNER: "Driver Partner",
};
