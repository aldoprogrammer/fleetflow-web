# fleetflow-web



> **FleetFlow Production Board** · [View Kanban Board →](https://github.com/users/aldoprogrammer/projects/2)



Next.js enterprise operations portal for FleetFlow (auth, RBAC, dispatch, tracking).



## Stack



- Next.js 15 App Router · React 19 · Zustand · Tailwind CSS

- Formik · Yup · Lucide · Auto Animate



## Quick start



```bash

pnpm install

pnpm run dev    # http://localhost:3001

```



API must run at `http://localhost:3000` (see `fleetflow-infra` + `fleetflow-api`).

**End-to-end demo (merchant create → matcher → Flutter pickup/deliver → live tracker):** [DEMO_E2E.md](../fleetflow-docs/DEMO_E2E.md)

## Features



- JWT login + 6 demo RBAC personas

- Middleware + client `RouteGuard` permission enforcement

- Enterprise dashboard with KPI MoM metrics

- Order create + live tracker with skeleton loading

- Reusable UI kit (`AppLink`, skeletons, overlays)



## Documentation



| Doc | Content |

|-----|---------|

| [docs/COMPONENTS.md](./docs/COMPONENTS.md) | Reusable component catalog |

| [docs/WEB_PATTERNS.md](./docs/WEB_PATTERNS.md) | Auth, RBAC, loading, navigation |

| [../.cursor/skills/fleetflow-web-ui/SKILL.md](../.cursor/skills/fleetflow-web-ui/SKILL.md) | Agent skill for UI work |

| [../.cursor/skills/fleetflow-rbac-portal/SKILL.md](../.cursor/skills/fleetflow-rbac-portal/SKILL.md) | Agent skill for portal RBAC |



## Testing & QA

| Layer | Command |
|-------|---------|
| Unit (Jest) | `pnpm test` |
| E2E (Playwright) | `pnpm test:e2e` |
| Playwright UI (click play) | `pnpm test:e2e:ui` |
| E2E + visible browser | `pnpm exec playwright test --headed` |
| E2E debug (step-by-step) | `pnpm exec playwright test --debug` |
| Install Chromium (first run) | `pnpm test:e2e:install` |

Run all commands from **`fleetflow-web`** (not monorepo root).

```bash
# Unit tests
pnpm test

# E2E headless (UI mock — does NOT test real order matching)
pnpm test:e2e

# Live API order matching (requires infra + seed + API on :3000)
PLAYWRIGHT_LIVE_API=true pnpm test:e2e:live

# Playwright UI — pick a test, click play (▶), browser opens while it runs
pnpm test:e2e:ui

# E2E with browser visible (no UI panel)
pnpm exec playwright test --headed

# One spec file + browser
pnpm exec playwright test e2e/portal.spec.ts --headed

# Step-through debugger
pnpm exec playwright test --debug

# First-time setup (if browser missing)
pnpm test:e2e:install

# Open last HTML report
pnpm test:e2e:report
```

Full guide: [fleetflow-docs/QA_TESTING.md](../fleetflow-docs/QA_TESTING.md)

Portfolio architecture diagram + video script: [fleetflow-docs/ARCHITECTURE.md](../fleetflow-docs/ARCHITECTURE.md)



## Key paths



```

src/components/ui/       # Reusable primitives + skeletons

src/lib/auth/            # RBAC, access rules, session

src/lib/navigation/      # Nav icons, quick-action copy

src/hooks/useAppNavigation.ts

```



## Related repos



| Repo | Role |

|------|------|

| [fleetflow-api](../fleetflow-api) | Backend API |

| [fleetflow-shared](../fleetflow-shared) | Shared contracts |

| [fleetflow-app](../fleetflow-app) | Driver mobile app |

| [fleetflow-infra](../fleetflow-infra) | Docker & local HA |

| [fleetflow-docs](../fleetflow-docs) | Architecture docs |



## GitHub About (recommended)



Set **Website** in repo **About** → `https://github.com/users/aldoprogrammer/projects/2`

