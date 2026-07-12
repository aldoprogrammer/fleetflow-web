# FleetFlow Web — Reusable Components

> Last updated: 2026-07-11

## UI primitives (`src/components/ui/`)

| Component | Purpose |
|-----------|---------|
| `AppLink` | Next.js `Link` with instant pending state + progress bar trigger |
| `ActionLoadingOverlay` | Blur overlay for API form submits |
| `RouteProgressBar` | Top animated bar during route transitions |
| `Skeleton` | Shimmer placeholder block |
| `PageSection` | Standard white card with optional title/description |
| `PortalPageLoader` | Dashboard-shaped route loading fallback |

## Skeletons (`src/components/ui/skeletons/`)

| Component | When |
|-----------|------|
| `DashboardSkeleton` | Dashboard / session hydrate |
| `MetricCardSkeleton` | KPI grid loading |
| `QuickActionSkeleton` | Quick action row loading |
| `OrderTrackerSkeleton` | Order detail API first fetch |
| `ModulePageSkeleton` | Generic admin module |
| `PageContentSkeleton` | Picks skeleton by `pathname` |

Import via barrel: `import { Skeleton, AppLink } from "@/components/ui"`.

## Layout & auth

| Component | Purpose |
|-----------|---------|
| `PortalShell` | Sidebar + header + RBAC nav |
| `RouteGuard` | Client permission check |
| `LoginForm` / `LoginHero` | Enterprise login |
| `DemoAccountPicker` | One-click demo roles |
| `ModulePlaceholder` | RBAC-gated stub pages |

## Dashboard

| Component | Purpose |
|-----------|---------|
| `MetricCard` | KPI with MoM comparison + sentiment color |
| `QuickActionCard` | Clickable CTA cards |
| `DashboardContent` | Role dashboard composition |

## Shared libs (not components — import these instead of duplicating)

| Module | Purpose |
|--------|---------|
| `lib/auth/access.ts` | Route rules + nav config |
| `lib/auth/permissions.ts` | Web RBAC mirror (sync with shared) |
| `lib/navigation/nav-icons.ts` | Lucide icon map for nav items |
| `lib/navigation/quick-action-copy.ts` | Dashboard CTA text |
| `hooks/useAppNavigation.ts` | `push`/`replace` with transition |
| `stores/auth-store.ts` | JWT session |
| `stores/navigation-store.ts` | Route pending flag |

## Adding a new reusable component

1. Place in `components/ui/` if generic, or domain folder if specific.
2. Export from `components/ui/index.ts` if primitive.
3. Document row in this file.
4. Follow skill: `.cursor/skills/fleetflow-web-ui/SKILL.md`.
