# Scenario Stories — Why `venues` first & two E2E examples

This short doc explains why the flow starts at **venues → products** and provides two compact, story-driven scenarios (single-diner and group) with clear notes about what changes in the DB and how the UI behaves at each step. IDs throughout the system should be *sortable* (ULID or UUIDv7) to make time-ordered queries simple.

---

## Why start at `venues` → `products` 💡
- **Venues** are the tenancy boundary: pricing rules, taxes, printers, and menus are venue-scoped. The guest experience is always anchored to a venue (QR or venue URL).
- **Products** are authoritative menu items: server-side `price_cents` and availability live here and must be used to compute totals and snapshot order line prices.
- Practical effect: when a guest opens the app for a table, the very first action is to load the venue's `products` so the UI shows the correct menu and prices.

---

## Scenario 1 — Single-diner (one seat) 🥢

```
session s1
 └─ seat-1
      └─ order o1 -> [oi1, oi2]
```

Story (plain language):
1. Guest scans the table QR (maps to `venue V1`) → app loads `products` for V1.
2. Guest creates/joins `session s1` for the table and claims `seat-1`.
3. Guest builds a cart and taps **Place order**. Server reads `products.price_cents`, computes the authoritative total, and checks for duplicates using `client_order_id`.
4. Order is persisted (orders + items price snapshot); KDS gets notified and prints; KDS ACK toggles `orders.printed`. 
5. Payment (if required) is captured and `orders.status` becomes `paid`.

DB tables touched (high level):
- Read: `venues`, `products` (menu/prices)
- Writes: `table_sessions`, `seats`, `orders`, `order_items`
- Updates: `orders.printed`, `orders.status`, `orders.payment_intent_id`

Common failure modes & UX decisions:
- **Price mismatch**: server rejects or requests confirmation (show "Price changed" modal with delta).
- **Duplicate taps / retries**: idempotency key returns existing order (no dupes).
- **KDS offline**: increment `printed_attempts`, surface to admin queue.

---

## Scenario 2 — Group ordering (split-bill or shared) 🧑‍🤝‍🧑

```
session s2
 ├─ seat-1 -> order o10 -> [oi10, oi11]
 └─ seat-2 -> order o11 -> [oi12]
```

Story (plain language):
- Guests open the venue and join `session s2`; each diner claims a seat.
- **Split-bill**: each seat places and pays their own `order` (simple UX — separate `orders`).
- **Shared-bill**: the group selects a payer; either assign the same `payment_intent_id` to multiple `orders`, or create an `invoice` record and attach the orders to that invoice.
- Printing and KDS behavior is session-scoped — kitchen receives items grouped by session; payer handling is independent of printing.

DB tables touched (high level):
- Read: `venues`, `products`
- Writes: `table_sessions`, `seats`, multiple `orders`, `order_items` (each with price snapshot)
- Optional: `invoices` table if implementing shared-bill normalization

Key tradeoffs:
- Split-bill: simpler (one order = one payment). Good for quick launches.
- Shared-bill: better UX for one payer but requires invoice grouping and careful payment idempotency handling.

---

## Quick checklist (for engineers)
- Start UX at venue (load `products` immediately).
- Use `session` + `seat` to model table and diner/device mapping.
- Snapshot `price_cents` into `order_items` for auditability and refunds.
- Enforce idempotency on order creation (`client_order_id` / Idempotency-Key).
- Track printing with `printed` and `printed_attempts` for retries and observability.

---

If you want, I can:
- Add a compact UI flow diagram for the single-diner path showing price-mismatch and retry handling, or
- Add a short `invoices` DDL and migration to support shared payments.

Tell me which (or both) and I'll add them as follow-ups.