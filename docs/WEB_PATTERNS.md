# FleetFlow Web — Architecture Patterns

> Last updated: 2026-07-11

## Portal auth

1. User signs in at `/login` → `POST /v1/auth/login`.
2. `auth-store` persists JWT + sets cookies (`fleetflow_token`, `fleetflow_rbac`).
3. `middleware.ts` blocks unauthenticated or unauthorized routes.
4. `RouteGuard` re-checks permissions client-side.

## RBAC

- **API:** `@fleetflow/shared` `ROLE_PERMISSIONS`.
- **Web middleware:** `fleetflow-web/src/lib/auth/permissions.ts` (Edge-safe mirror — update both when matrix changes).
- **Routes & menus:** `lib/auth/access.ts`.

## Loading strategy

| Layer | Mechanism |
|-------|-----------|
| Route change | `AppLink` + `RouteProgressBar` + `(portal)/loading.tsx` |
| Session hydrate | `PageContentSkeleton` in `RouteGuard` |
| API retrieve | Domain skeleton until first response |
| API submit | `ActionLoadingOverlay` on form card |
| Poll refresh | Inline badge only (no full skeleton) |

## Navigation

- Never use raw `next/link` for portal nav — use `AppLink`.
- Never use raw `router.push` — use `useAppNavigation().push`.

## Related skills

- `.cursor/skills/fleetflow-web-ui/SKILL.md`
- `.cursor/skills/fleetflow-rbac-portal/SKILL.md`

## Related docs

- [COMPONENTS.md](./COMPONENTS.md)
- [fleetflow-docs/README.md](../../fleetflow-docs/README.md)
