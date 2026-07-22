# FleetFlow Web — Visual Preview

Operations portal screenshots (SUPER ADMIN). Use for portfolio reviewers, recruiters, or teammates before running the stack locally.

> **IDE preview:** If images look blank in Cursor/VS Code, reload the window after opening this repo. On **GitHub**, images render automatically.

---

## Dashboard

KPI overview with month-over-month comparisons and quick actions.

![Dashboard](01-dashboard.png)

---

## Notifications

Order lifecycle alerts (assign → pickup → delivery → proof photos). Booking refs use `#` + last 6 hex chars (e.g. `#4982F3`).

![Notifications inbox](02-notifications.png)

---

## Create order

Merchant, vehicle type, and parcel category tags before map pickup/delivery.

![Create dispatch order](03-create-order.png)

---

## Select pickup address

Leaflet map picker — search or click map, then confirm coordinates.

![Select pickup address](04-select-pickup-address.png)

---

## Order detail + proof photos

Fulfillment stepper, trip map, booking `#XXXXXX`, and before-pickup / after-delivery proof gallery (SSE-synced).

![Order detail with proof photos](05-order-detail-proof-photos.png)

---

## Track order

Open the live fulfillment tracker by order UUID.

![Track order](06-track-order.png)

---

## Fleet control

Live driver availability, on-trip / offline counts, and roster coordinates.

![Fleet control](07-fleet-control.png)

---

## Ledger & settlements

Merchant debits, driver payouts, and platform settlement audit trail.

![Ledger](08-ledger.png)

---

## Related

| Item | Link |
|------|------|
| Portal README | [../../README.md](../../README.md) |
| E2E demo script | [../../../fleetflow-docs/DEMO_E2E.md](../../../fleetflow-docs/DEMO_E2E.md) |
| Realtime SSE | [../../../fleetflow-docs/REALTIME_SSE.md](../../../fleetflow-docs/REALTIME_SSE.md) |
| Local URL | http://localhost:3001 |
