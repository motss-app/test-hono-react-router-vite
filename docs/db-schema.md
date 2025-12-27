# DB Schema Reference — Core Tables (venues, products)

This file documents the core DB tables and provides example rows for `venues` and product modeling (`product_master` + `product_offering`). Use this as a reference for implementation and migrations.

---

## Conventions
- IDs: use *sortable* IDs such as **ULID** or **UUIDv7** for `id` columns (TEXT PK). These generate time-ordered identifiers that make range scans and sharding simpler.
- ID generation example (ULID):
```ts
import { ulid } from 'npm:ulid';
const id = ulid(); // e.g. '01H0X4ZQ7K8H2A0Q8W1M2N3P4'
```
- Times: store timestamps as INTEGER seconds since epoch (SQLite `strftime('%s','now')`).
- Money: store money in integer *minor units* (e.g., `price_minor` = 1299 for USD $12.99, or `price_minor` = 1200 for JPY ¥1200). Use a small `currencies` reference table (ISO4217 + `minor_units`) to record whether a currency has 0 or 2 minor units.
- Per-venue scoping: `venue_id` is the primary tenancy key used for runtime queries.

### Timestamps convention
- **All tables should include `created_at` and `modified_at` (INTEGER, epoch seconds).** These are authoritative times set by the server and are stored in UTC.
- Also include **`created_by`, `modified_by`, `deleted_at`, and `deleted_by`** where appropriate (TEXT, nullable) for auditing.
- Optionally store `created_at_offset_minutes` and `created_at_local` (ISO8601) for auditing/human-friendly display, but rely on UTC for logic and ordering.
- Use consistent units across tables (seconds) — prefer seconds for business events.

### Timezones & Timestamps
- **Use IANA timezone names** (e.g., `Asia/Singapore`, `America/Los_Angeles`) in `timezone` fields; these encode DST rules and historical/ future changes.
- **Persist UTC + offset**: store `created_at` (INTEGER, seconds since epoch) as the canonical event time, and also record `created_at_offset_minutes` (INTEGER) and optionally `created_at_local` (TEXT ISO8601) to make historical local-time reconstruction unambiguous.
- **Scheduling**: store the intended local time and `timezone` when scheduling events and convert to UTC at schedule time; handle ambiguous/nonexistent local times explicitly (ask user or apply deterministic rule).

Examples
- Non-DST (Singapore):
  - `timezone`: `Asia/Singapore`
  - `created_at`: `1700000000`
  - `created_at_offset_minutes`: `480`  -- (+08:00)
  - `created_at_local`: `"2024-11-25T18:26:40+08:00"`

- DST zone (Los Angeles during PDT):
  - `timezone`: `America/Los_Angeles`
  - `created_at`: `1700000000`
  - `created_at_offset_minutes`: `-420`  -- (PDT, UTC-7)
  - `created_at_local`: `"2024-03-10T02:30:00-07:00"`

### Why store UTC as the canonical timestamp (short)
- **Unambiguous:** UTC represents the same instant for everyone — avoids DST and timezone rule ambiguity.
- **Sortable & efficient:** integer epoch timestamps are compact and fast for range queries and ordering.
- **Accurate arithmetic:** always compute durations and comparisons in UTC.
- **Historical fidelity:** storing the local offset (`created_at_offset_minutes`) allows exact replay of local time even if timezone rules change later.

Reconstruction pattern (app-level):
- Convert `created_at` → local using `timezone` library (e.g., Intl/Temporal, luxon) and verify against `created_at_offset_minutes` or `created_at_local` for auditing.

---

### `venues` (branch / location)
Purpose: tenancy boundary for menus, printers, taxes, and local settings.

Columns
- `id` — TEXT PK — Example (ULID): `01H0X4ZQ7K8H2A0Q8W1M2N3P4`
- `name` — TEXT — Example: `"Sushi House - Orchard"`
- `slug` — TEXT UNIQUE — Example: `"sushi-house-orchard"
- `brand_id` — TEXT — Example: `"brand-azuki-01"`
- `owner_id` — TEXT — Example: `"org-42"` (legal owner or franchisee)
- `country` — TEXT — Example: `"SG"`
- `region` — TEXT — Example: `"Central"`
- `currency` — TEXT — Example: `"SGD"`
- `timezone` — TEXT — Example: `"Asia/Singapore"`
- `address` — JSON (nullable) — Example: `{ "line1": "1 Orchard Rd", "city":"Singapore" }`
- `settings` — JSON (nullable) — Example: `{ "kds_enabled": true, "default_tax_pct": 8 }`
- `created_at` — INTEGER — Example: `1700000000`
- `modified_at` — INTEGER — Example: `1700000100`
- `created_by` — TEXT NULLABLE — Example: `system`
- `modified_by` — TEXT NULLABLE — Example: `null` (no edits yet)
- `deleted_at` — INTEGER NULLABLE — Example: `null` (not deleted)
- `deleted_by` — TEXT NULLABLE — Example: `null` (not deleted)

Notes
- Use `brand_id` to link branches to a corporate brand. Use `owner_id` for the legal entity that owns the branch.
- `settings` stores venue-specific flags such as KDS configuration or payment preferences.

Example row (YAML):

```yaml
id: v1b2c3d4-1111-2222-3333-abcde00001
name: Sushi House - Orchard
slug: sushi-house-orchard
brand_id: brand-azuki-01
owner_id: org-42
country: SG
region: Central
currency: SGD
timezone: Asia/Singapore
address:
  line1: "1 Orchard Rd"
  city: "Singapore"
settings:
  kds_enabled: true
  default_tax_pct: 8
created_at: 1700000000
modified_at: 1700000000
created_by: system
modified_by: null
deleted_at: null
deleted_by: null
```

Deleted row example (YAML):

```yaml
# Soft-deleted record snapshot
id: v1b2c3d4-1111-2222-3333-abcde00001
deleted_at: 1700005000
deleted_by: user:alice
```



---

### `product_master` (global SKU)
Purpose: canonical product identity used for analytics and shared definitions.

Columns
- `id` — TEXT PK — Example: `prod-master-0001`
- `master_sku` — TEXT UNIQUE — Example: `"SH-YAKI-01"`
- `name` — TEXT — Example: `"Yakitori (3pc)"`
- `description` — TEXT — Example: `"Grilled skewered chicken"`
- `tags` — TEXT/JSON — Example: `['grill','skewer','popular']`
- `created_at` — INTEGER — Example: `1700000100`
- `modified_at` — INTEGER — Example: `1700000200`
- `created_by` — TEXT NULLABLE — Example: `system`
- `modified_by` — TEXT NULLABLE — Example: `null` (no edits yet)
- `deleted_at` — INTEGER NULLABLE — Example: `null` (not deleted)
- `deleted_by` — TEXT NULLABLE — Example: `null` (not deleted)

Example row (YAML):

```yaml
id: 01H0X4ZQ7K8H2A0Q8W1M2N4A
master_sku: SH-YAKI-01
name: Yakitori (3pc)
description: Grilled skewered chicken
tags: ['grill','skewer','popular']
created_at: 1700000100
modified_at: 1700000200
created_by: system
modified_by: null
deleted_at: null
deleted_by: null
```

Deleted row example (YAML):

```yaml
# Soft-deleted record snapshot
id: 01H0X4ZQ7K8H2A0Q8W1M2N4A
deleted_at: 1700005000
deleted_by: user:alice
```

---

### `product_offering` (per-venue listing)
Purpose: per-venue overrides for price, name, availability, promotions, seasonal variations.

Note: **Offerings commonly inherit default fields** (e.g., `name`, `description`) from `product_master`. Resolve display values at read time (e.g., `COALESCE(product_offering.name, product_master.name)`) or copy defaults on create.

Columns
- `id` — TEXT PK — Example: `offering-6789`
- `venue_id` — TEXT FK → `venues.id` — Example: `01H0X4ZQ7K8H2A0Q8W1M2N3P4`
- `product_master_id` — TEXT FK → `product_master.id` — Example: `prod-master-0001`
- `offering_sku` — TEXT — Example: `SH-ORC-YAK-1`
- `price_minor` — INTEGER — Example: `800` (SGD 8.00)  
  - Note: `price_minor` is stored in the venue's currency minor unit (see `currencies` table guidance below).
- `available` — INTEGER (0/1) — Example: `1`
- `display_name` — TEXT — Example: `"Yakitori - Orchard Special"`
- `promotion_id` — TEXT (nullable) — Example: `promo-summer-2026`
- `effective_from` — INTEGER (nullable) — Example: `1700001000`
- `effective_to` — INTEGER (nullable) — Example: `1702593000`
- `metadata` — JSON (nullable, e.g., modifiers) — Example: `{ "spicy_level": ["mild","regular"] }`
- `created_at` — INTEGER (nullable) — Example: `1700000100`
- `modified_at` — INTEGER (nullable) — Example: `1700000200`
- `created_by` — TEXT NULLABLE — Example: `system`
- `modified_by` — TEXT NULLABLE — Example: `null` (no edits yet)
- `deleted_at` — INTEGER NULLABLE — Example: `null` (not deleted)
- `deleted_by` — TEXT NULLABLE — Example: `null` (not deleted)

Notes
- At runtime, fetch `product_offering` by `venue_id` to present local menu and price.
- Keep `product_master_id` in `order_items` for cross-venue analytics.

Example row (YAML):

```yaml
id: offering-6789
venue_id: v1b2c3d4-1111-2222-3333-abcde00001
product_master_id: 01H0X4ZQ7K8H2A0Q8W1M2N4A
offering_sku: SH-ORC-YAK-1
price_minor: 800
available: 1
display_name: "Yakitori - Orchard Special"
created_at: 1700000100
modified_at: 1700000200
created_by: system
modified_by: null
deleted_at: null
deleted_by: null
```

Deleted row example (YAML):

```yaml
# Soft-deleted record snapshot
id: offering-6789
deleted_at: 1700005000
deleted_by: user:alice
```



---

## Index & constraint recommendations
- `CREATE INDEX idx_product_offering_venue ON product_offering(venue_id);`
- `CREATE UNIQUE INDEX idx_unique_offering_sku ON product_offering(venue_id, offering_sku);`
- `CREATE INDEX idx_products_master ON product_master(master_sku);`

---

## Currency & Pricing Patterns

**Venue currency**
- Store a `currency` code on the `venues` row (ISO 4217). Default all `product_offering` prices to the venue currency unless an offering explicitly overrides currency (rare).

---

### `currencies` (reference)
Purpose: canonical minor unit and formatting metadata used by the app for correct arithmetic and display.

Columns
- `code` TEXT PRIMARY KEY — ISO 4217 (e.g., `USD`, `JPY`)
- `minor_units` INTEGER NOT NULL — number of fractional digits (e.g., 2 for USD, 0 for JPY) — Example: `2` (USD), `0` (JPY)
- `symbol` TEXT NULLABLE — e.g., `$`, `¥`
- `display_name` TEXT NULLABLE — e.g., `United States Dollar`
- `created_at` INTEGER — Example: `1700000000`
- `modified_at` INTEGER — Example: `1700000000`
- `created_by` TEXT NULLABLE — Example: `system`
- `modified_by` TEXT NULLABLE — Example: `null` (no edits yet)
- `deleted_at` INTEGER NULLABLE — Example: `null` (not deleted)
- `deleted_by` TEXT NULLABLE — Example: `null` (not deleted)

YAML example:
```yaml
- code: USD
  minor_units: 2
  symbol: "$"
  display_name: United States Dollar
  created_at: 1700000000
  modified_at: 1700000000
  created_by: system
  modified_by: null
  deleted_at: null
  deleted_by: null

- code: JPY
  minor_units: 0
  symbol: "¥"
  display_name: Japanese Yen
  created_at: 1700000000
  modified_at: 1700000000
  created_by: system
  modified_by: null
  deleted_at: null
  deleted_by: null
```

Deleted row example (YAML):

```yaml
# Soft-deleted record snapshot
- code: EUR
  minor_units: 2
  symbol: "€"
  display_name: Euro
  created_at: 1700000000
  created_by: system
  deleted_at: 1700005000
  deleted_by: user:alice
```


Notes
- Use `minor_units` when converting to/from display strings and when applying rounding rules.

---

### `product_pricing` (versioned pricing)
Purpose: hold time-bound or promotional price components and metadata; authoritative when present for an `offering_id`.

Columns
- `id` TEXT PRIMARY KEY — Example: `pricing-001`
- `offering_id` TEXT NOT NULL  -- FK -> `product_offering.id` — Example: `offering-6789`
- `valid_from` INTEGER NOT NULL — Example: `1700001000`
- `valid_to` INTEGER NULLABLE — Example: `1702593000`
- `base_price_minor` INTEGER NOT NULL — Example: `800` (SGD 8.00)
- `msrp_minor` INTEGER NULLABLE — Example: `900` (SGD 9.00)
- `markup_bps` INTEGER DEFAULT 0   -- basis points (100 bps = 1%) — Example: `0`
- `tax_code` TEXT NULLABLE         -- maps to `tax_rates.tax_code` — Example: `GST`
- `tax_included` INTEGER DEFAULT 0 -- 0 = exclusive, 1 = inclusive — Example: `0` (exclusive)
- `promotion_id` TEXT NULLABLE — Example: `promo-summer-2026`
- `metadata` JSON NULLABLE         -- free-form (channels, notes) — Example: `{ "channels": ["web","kiosk"] }`
- `created_at` INTEGER NOT NULL — Example: `1700000000`
- `modified_at` INTEGER NOT NULL — Example: `1700000000`
- `created_by` TEXT NULLABLE — Example: `system`
- `modified_by` TEXT NULLABLE — Example: `null` (no edits yet)
- `deleted_at` INTEGER NULLABLE — Example: `null` (not deleted)
- `deleted_by` TEXT NULLABLE — Example: `null` (not deleted)
- `items` JSON NULLABLE — Example: see below (array of order items with id, offering_id, unit_price_minor, quantity, tax_minor, total_minor)

Indexes & constraints
- `CREATE INDEX idx_product_pricing_offering ON product_pricing(offering_id, valid_from);`
- Consider a unique constraint on `(offering_id, valid_from)` to prevent accidental overlaps.

YAML example:
```yaml
- id: pricing-001
  offering_id: offering-6789
  valid_from: 1700001000
  valid_to: 1702593000
  base_price_minor: 800
  msrp_minor: 900
  markup_bps: 0
  tax_code: GST
  tax_included: 0
  promotion_id: promo-summer-2026
  metadata:
    channels: ['web','kiosk']
  created_at: 1700000000
  created_by: system
  modified_by: null
  deleted_at: null
  deleted_by: null
```

Deleted row example (YAML):

```yaml
- id: pricing-001
  offering_id: offering-6789
  deleted_at: 1700005000
  deleted_by: user:alice
```

Selecting active pricing (usage)
```sql
SELECT * FROM product_pricing
WHERE offering_id = ?
  AND (valid_from IS NULL OR valid_from <= ?)
  AND (valid_to IS NULL OR valid_to >= ?)
ORDER BY valid_from DESC
LIMIT 1;
```

Notes
- When no active row exists, fall back to `product_offering.price_minor`.
- Keep pricing history: do not mutate old rows; insert new rows when price changes.

---

### `tax_rates` (regional tax rules)
Purpose: hold tax percentages and effective windows per territory and tax code used by pricing.

Columns
- `id` TEXT PRIMARY KEY — Example: `tax-sg-gst8`
- `country` CHAR(2) NOT NULL — Example: `SG`
- `region` TEXT NULLABLE — Example: `null` (country-wide) or `Central`
- `tax_code` TEXT NOT NULL   -- e.g., `GST`, `VAT`, `TAX10` — Example: `GST`
- `percent_bps` INTEGER NOT NULL — Example: `800` (8.00%, stored in basis points)
- `effective_from` INTEGER NOT NULL — Example: `1700000000`
- `effective_to` INTEGER NULLABLE — Example: `null` (open-ended) or `1702593000`
- `created_at` INTEGER NOT NULL — Example: `1700000000`
- `modified_at` INTEGER NOT NULL — Example: `1700000100`
- `created_by` TEXT NULLABLE — Example: `system`
- `modified_by` TEXT NULLABLE — Example: `null` (no edits yet)
- `deleted_at` INTEGER NULLABLE — Example: `null` (not deleted)
- `deleted_by` TEXT NULLABLE — Example: `null` (not deleted)

Indexes
- `CREATE INDEX idx_tax_rates_country ON tax_rates(country, region, tax_code, effective_from);`


YAML example:
```yaml
- id: tax-uk-vat20
  country: GB
  region: null
  tax_code: VAT
  percent_bps: 2000
  effective_from: 1700000000
  effective_to: null
  created_at: 1700000000
  modified_at: 1700000100
  created_by: system
  modified_by: null
  deleted_at: null
  deleted_by: null

- id: tax-sg-gst8
  country: SG
  region: null
  tax_code: GST
  percent_bps: 800
  effective_from: 1700000000
  effective_to: null
  created_at: 1700000000
  modified_at: 1700000100
  created_by: system
  modified_by: null
  deleted_at: null
  deleted_by: null

- id: tax-jp-consumption
  country: JP
  region: null
  tax_code: TAX
  percent_bps: 1000
  effective_from: 1700000000
  effective_to: null
  created_at: 1700000000
  modified_at: 1700000100
  created_by: system
  modified_by: null
  deleted_at: null
  deleted_by: null
```

Lookup pattern
- Query by `venue.country` and optionally `venue.region`, then filter `effective_from/ to` and pick the most specific rule.

Tax calculations & rounding
- Compute tax with integer math using bps: `tax_minor = round((price_minor * percent_bps) / 10000)`.
- Document rounding policy (e.g., round half away from zero) and include tests for JPY/JPY-like currencies.

---



### `users` (application identities)
Purpose: store local user accounts and identity metadata (support SSO/external providers by leaving `password_hash` nullable).

Columns
- `id` TEXT PRIMARY KEY — Example (ULID): `usr-01H0X4ZQ7K8H2A0Q8W1M2N7`
- `email` TEXT UNIQUE NOT NULL — Example: `alice@example.com`
- `password_hash` TEXT NULLABLE — Example: `bcrypt$2b$...` (nullable for SSO-only accounts)
- `first_name` TEXT NULLABLE — Example: `Alice`
- `last_name` TEXT NULLABLE — Example: `Smith`
- `phone` TEXT NULLABLE — Example: `+65 9123 4567`
- `default_delivery_address_id` TEXT NULLABLE — FK -> `addresses.id` — Example: `addr-001`
- `status` TEXT NOT NULL — Example: `active` (enum: `active`, `suspended`, `deleted`)
- `email_verified` INTEGER DEFAULT 0 — Example: `0`
- `first_login` INTEGER NULLABLE — Example: `1700000000` — *set on first successful login*
- `last_login` INTEGER NULLABLE — Example: `1700000500`
- `metadata` JSON NULLABLE — Example: `{ "mfa_enabled": false }`
- `created_at` INTEGER NOT NULL — Example: `1700000000`
- `modified_at` INTEGER NOT NULL — Example: `1700000100`
- `created_by` TEXT NULLABLE — Example: `system`
- `modified_by` TEXT NULLABLE — Example: `admin:john`
- `deleted_at` INTEGER NULLABLE — Example: `null`
- `deleted_by` TEXT NULLABLE — Example: `null`

Indexes & constraints
- `CREATE UNIQUE INDEX idx_users_email ON users(email);`

Example row (YAML):

```yaml
id: usr-01H0X4ZQ7K8H2A0Q8W1M2N7
email: alice@example.com
password_hash: bcrypt$2b$...
name: Alice Smith
phone: "+65 9123 4567"
default_delivery_address_id: addr-001
status: active
email_verified: 1
last_login: 1700000500
metadata:
  mfa_enabled: false
created_at: 1700000000
modified_at: 1700000100
created_by: system
modified_by: admin:john
deleted_at: null
deleted_by: null
```

Deleted row example (YAML):

```yaml
id: usr-01H0X4ZQ7K8H2A0Q8W1M2N7
deleted_at: 1700005000
deleted_by: admin:john
```

---

### `sessions` (KV-backed login sessions)
Purpose: short-lived sessions stored in Workers KV (write-once at creation, read-many until expiry). Store session token hashes when needed and keep minimal durable audit records in D1 for forensics.

KV key pattern (recommended): `session:{session_id}` with a compact JSON value. Set KV `expiration`/`expirationTtl` so session entries auto-expire.

JSON value keys (recommended)
- `user_id` (TEXT, required)
  - canonical `users.id` the session belongs to. Example: `"usr-01H0X4ZQ7K8H2A0Q8W1M2N7"`
- `issued_at` (INTEGER, epoch seconds)
  - when the session was created. Example: `1700000000`
- `expires_at` (INTEGER, epoch seconds)
  - TTL for the session; enforce both cookie and KV expiry. Example: `1700003600`
- `token_hash` (TEXT, nullable)
  - store a hash of the session token for verification (do not store raw token). Example: `"sha256$..."`
- `ver` (INTEGER, nullable)
  - session version used together with `user:{id}:session_version` for fast global revocation. Example: `1`
- `device` (TEXT, nullable)
  - human device label. Example: `"iPhone 14"`
- `ip` (TEXT, nullable)
  - IP address used at login. Example: `"203.0.113.42"`
- `user_agent` (TEXT, nullable)
  - user agent string. Example: `"Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)"`
- `last_seen` (INTEGER, nullable)
  - last activity timestamp; update sparingly (batch or periodically). Example: `1700001800`
- `locale` (TEXT, nullable)
  - preferred locale (BCP47) for the session, e.g., used to localize messages before falling back to user profile. Example: `"en-SG"`
- `meta` (JSON object, nullable)
  - small app-specific metadata: `{ "platform":"ios" }`
- `auth_method` (TEXT, nullable)
  - e.g., `password`, `sso`, `otp` (helps auditing). Example: `"password"`
- `remember` (BOOLEAN/int, nullable)
  - whether this session was created via 'remember me' flow. Example: `0` or `1`

Security & sizing notes
- Keep KV values compact (avoid full user profiles). Check KV value size limits.
- Do not store plaintext credentials, PII beyond what you need for session logic, or large payloads.
- Use HttpOnly, Secure, SameSite cookies for the session id.
- Avoid frequent writes to the same key — use event batching for `last_seen` or write last_seen to D1 if you need frequent updates.

Revocation & logout patterns
- Per-session revocation (targeted): call the user DO's `removeSession(session_id)` method to remove the session from the DO's active set; the DO acts as the authoritative source for active sessions. This avoids separate revocation keys and ensures immediate, authoritative invalidation.
- Per-user revocation (global): maintain an authoritative `user:{user_id}:session_version` in a strongly consistent store (Durable Object or Redis). Include `ver` in each session value and reject when `session.ver != authority_ver`.
  - Version semantics: the authority version may be an incrementing integer (easy INCR semantics) or a new opaque identifier (ULID/UUIDv7) written on revoke; both are valid — integer INCR is simplest, ULID/UUIDv7 gives monotonic unique IDs and avoids racey increments in some sharded setups.
- Logout policy: **default logout** clears only the current session. Provide an explicit **"Logout everywhere"** action (or use in security events) that invalidates all sessions by calling `userDO.incrVersion()` and `userDO.clearSessions()` (clear DO active set) and then **delete per-user KV session entries immediately**.

Safe write order (recommended)
1. Update authoritative state (DO: incrVersion() for global revoke, or remove the `session_id` from the DO's active set for per-session revoke).
2. Persist audit row to D1 (`revoke` event with who/when/reason).
3. **Delete the KV session keys immediately** after DO updates to avoid stale cached copies — do not rely on natural expiry alone.

Note: since the DO is the authoritative store for session state, removing the session from the DO (and deleting the KV copy) is sufficient and explicit — you do not need separate `revoked` markers.

Pseudocode examples
- Per-session revoke:

```js
await userDO.removeSession(session_id); // removes from DO active set
await DB.insert('session_audit', {session_id, user_id, event:'revoke_session', at: now()});
await KV.delete(`session:${session_id}`); // optional
```

- Revoke-all / logout-all:

```js
await userDO.incrVersion(); // new authoritative version
await DB.insert('session_audit', {user_id, event:'revoke_all', at: now()});
// optionally: delete per-user session index keys / let sessions expire
```

Notes
- Deletion alone (without an authoritative revoke) can be ambiguous or race with writes; the authoritative DO/Version approach makes intent explicit and is resilient to caches and eventual consistency.
- Keep DO state small (version + small active session set with TTL for cleanup). Persist revocation/removal events to D1 for audit and admin listing.
- If immediate revocation is critical and you cannot run DOs, consider a managed Redis for the authoritative `user:{id}:session_version`.
- If immediate revocation is critical, write revocation events to D1 and check D1 (or maintain a small Redis/Upstash revocation set if you need very low latency).

### Durable Objects (DO) — per-user revocation pattern 🔁
Rationale: when you want a Cloudflare-only solution that supports *fast* global revocation and simple coordination without an external Redis, use a small DO instance keyed by `user:{user_id}` to hold the *authoritative* version and a small active-session set.

How it works (concise):
- DO is single-instance per key (strongly consistent). It stores: `version` (int) and a small active-session set (session IDs) with TTL for cleanup.
- On admin revoke (single session or revoke-all), call the user DO: for per-session revoke, remove the `session_id` from the DO's active set; for revoke-all, increment `version` and clear the DO's active session set (remove all session IDs). Persist an audit row to D1.

### DO implementation sketch (TypeScript pseudocode)
Example DO internal state (JSON inside DO):

```ts
interface SessionMeta {
  session_id: string
  user_id: string
  issued_at: number
  expires_at: number
  ver: string | number
  device?: string
  ip?: string
  user_agent?: string
  locale?: string
  remember?: number
  last_seen?: number
  meta?: Record<string, any>
}

interface DOState {
  version: string | number
  sessions: Record<string, SessionMeta>
  last_cleanup_at?: number
}
```

DO methods (sketch):
```ts
class UserSessionDO {
  async addSession(meta: SessionMeta) {
    this.state.sessions[meta.session_id] = meta
    // write-through: update KV for fast reads
    await SESSIONS_KV.put(`session:${meta.session_id}`, JSON.stringify(meta), {expiration: meta.expires_at})
    await SESSIONS_KV.put(`user:${meta.user_id}:ver`, String(this.state.version))
    await this.saveState()
    await D1.run('INSERT INTO session_audit ...')
  }

  async removeSession(session_id: string) {
    const s = this.state.sessions[session_id]
    if (s) delete this.state.sessions[session_id]
    await this.saveState()
    // immediately delete cached KV copy so edges see invalidation
    await SESSIONS_KV.delete(`session:${session_id}`)
    await D1.run('INSERT INTO session_audit ...')
  }

  async incrVersion() {
    // new version may be integer INCR or ULID/UUIDv7
    this.state.version = newULIDOrIncr()
    // clear active sessions set
    this.state.sessions = {}
    await this.saveState()
    // write-through KV for fast readers
    await SESSIONS_KV.put(`user:${this.user_id}:ver`, String(this.state.version))
    await D1.run('INSERT INTO session_audit ...')
  }

  async isActiveSession(session_id: string, ver?: string|number): Promise<{ active: boolean, session?: SessionMeta, currentVersion?: string|number }> {
    // authoritative check: session exists, not expired, and matches current DO version
    const s = this.state.sessions[session_id]
    if (!s) return { active: false }
    const active = (s.expires_at > now()) && (ver == null ? (s.ver === this.state.version) : (s.ver === this.state.version || ver === this.state.version))
    if (!active) return { active: false }
    return { active: true, session: s, currentVersion: this.state.version }
  }

  async getVersion(): Promise<string|number> {
    // returns the current authoritative per-user version
    return this.state.version
  }

  async clearSessions() {
    // authoritative revoke-all: bump version and clear sessions
    this.state.version = newULIDOrIncr()
    this.state.sessions = {}
    await this.saveState()
    // write-through update so edges can fast-reject on version mismatch
    await SESSIONS_KV.put(`user:${this.user_id}:ver`, String(this.state.version))
    await D1.run('INSERT INTO session_audit ...')
  }
}
```

### ASCII flow (KV-first, DO authoritative)
```text
            Client
            |
            v
    Edge Worker (Auth middleware)
            |
            v
  +---------------------------+
  | 1) KV.get(session:{id})   |  <-- fast-path cache (KV)
  +---------------------------+
            |
   +--------+--------+
   |                 |
   |                 |
[NO SESSION]    [SESSION FOUND in KV]
   |                 |
   v                 v
+----------------+  read session.user_id & session.ver
| Call userDO.is  |        |
| ActiveSession() |        v
+----------------+  +-------------------------------+
| DO active ->    |  | 2) KV.get(user:{user_id}:ver) |
|   ALLOW (opt:   |  +-------------------------------+
|   populate KV)  |        |
| DO inactive ->  |        |
|   REJECT        |        +-- user_ver === session.ver -> ALLOW (fast path)
+----------------+        |
                          +-- mismatch/missing -> Call userDO.isActiveSession(session_id, session.ver)
                                | active -> ALLOW (update KV)
                                | inactive -> REJECT + DELETE KV `session:{id}`

Canonical flows (matches examples):
1) KV miss -> DO says active -> ALLOW (optionally re-populate KV for future fast path)
2) KV hit with user_ver match -> ALLOW (fast, no DO call)
3) KV hit with ver mismatch -> DO: if session active -> ALLOW (update KV); else -> REJECT + DELETE KV


Administrative / logout actions:
- Per-session logout:
  1) userDO.removeSession(session_id)   <-- authoritative delete
  2) Persist audit row to D1
  3) Immediately delete KV `session:{session_id}` (no stale cache)
- Logout-everywhere / revoke-all:
  1) userDO.incrVersion(); userDO.clearSessions()  <-- authoritative
  2) Persist audit to D1
  3) Delete per-user KV session keys OR rely on ver mismatch to reject (DO writes new `user:{id}:ver` to KV)
```

Notes & concerns:
- Deleting KV immediately after DO changes avoids stale reads on edges.
- Clearing all per-user KV session keys may be expensive; use a per-user index (in D1 or compact KV list) to enumerate and delete, or rely on DO clearing + KV write-through to update user version for fast rejection.
- Keep DO state small; perform periodic cleanup of expired sessions in the DO.
- On auth check: read session from KV (fast), then call `userDO.check(session_id, session.ver)` → returns OK or REJECT (DO keeps authoritative state).

Pros ✅
- Immediate revocation (no eventual-consistency window).
- No external provider required — fits full CF stack (KV + DO + D1 for audit).
- Strong consistency for revokes; simple API for admins and edges.

Cons ⚠️
- DOs serialize requests per instance — for extremely hot users there may be contention. If you expect heavy concurrent operations for the same user, shard DO state (user:{id}:shardN) or offload hot counters to D1/Redis.
- DO memory limits; keep per-user state tiny (int + small set with TTL).
- Extra DO call per auth check (low latency, but additional hop).

DO interface (canonical, pseudo)
- getVersion() -> string | number
- incrVersion() -> string | number
- removeSession(session_id: string) -> ok  // removes session from DO active set
- clearSessions() -> ok // bump version and clear active sessions
- isActiveSession(session_id: string, ver?: string | number) -> { active: boolean, session?: SessionMeta, currentVersion?: string | number }

Pseudocode (auth check) — uses rich DO response:

```js
// KV-first fast path with DO fallback (rich DO response)
const kvSession = await KV.get(`session:${id}`)
if (!kvSession) {
  // KV miss -> ask authoritative DO
  const res = await userDO.isActiveSession(id) // res = { active, session?, currentVersion? }
  if (!res.active) return reject()
  // re-populate KV for fast future reads
  await KV.put(`session:${id}`, JSON.stringify(res.session), { expiration: res.session.expires_at })
  await KV.put(`user:${res.session.user_id}:ver`, String(res.currentVersion))
  return allow()
}

// Fast-path: KV has session
const session = JSON.parse(kvSession)
const userVer = await KV.get(`user:${session.user_id}:ver`)
if (userVer && userVer === String(session.ver)) {
  return allow() // fast path — no DO call
}

// Fallback authoritative check on mismatch or missing KV ver
const res = await userDO.isActiveSession(session.id, session.ver)
if (!res.active) {
  // stale or revoked session: delete cached KV copy to avoid future acceptance
  await KV.delete(`session:${session.id}`)
  return reject()
}
// active: update KV with canonical session and version then allow
await KV.put(`session:${session.id}`, JSON.stringify(res.session), { expiration: res.session.expires_at })
await KV.put(`user:${res.session.user_id}:ver`, String(res.currentVersion))
return allow()
```

Admin revoke-all pseudocode:

```js
await userDO.incrVersion(); // returns new version
await userDO.clearSessions(); // remove all session IDs from DO active set
INSERT INTO session_audit (user_id,event,at) VALUES (?, 'revoke_all', strftime('%s','now'))
```

Policy: logout behavior and safe actions
- **Default logout (recommended UX):** clear only the current session — implement by calling `userDO.removeSession(session_id)`, writing an audit row to D1, and **delete the KV session key immediately** (do not rely on expiry).
- **Logout everywhere / security event:** invalidate all sessions by calling `userDO.incrVersion()` (or set a new ULID/UUIDv7 version), write an audit row to D1, then optionally delete KV session keys for that user.

Safe write order (summary):
1. Update authoritative DO (revokeSession or incrVersion).
2. Persist audit to D1 (who/when/reason).
3. Optionally delete KV session keys (or let them expire).

Notes:
- Keep DO state small and persist revocation events to D1 for durability and listing.
- Use DO per-user — DO per-session is generally overkill and can exhaust DO instances.

Listing & admin operations
- KV is not great for arbitrary listing; maintain a compact per-user index (D1 table or KV list key `user:{user_id}:sessions`) when you create sessions so admin UI can list & revoke quickly.

Example KV value (expanded JSON):

```json
{
  "user_id":"usr-01H0X4ZQ7K8H2A0Q8W1M2N7",
  "issued_at":1700000000,
  "expires_at":1700003600,
  "token_hash":"sha256$...",
  "ver":1,
  "device":"iPhone 14",
  "ip":"203.0.113.42",
  "user_agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
  "last_seen":1700001800,
  "locale":"en-SG",
  "meta":{"platform":"ios"},
  "auth_method":"password",
  "remember":0
}
```

Example audit row (D1 SQL):

```sql
INSERT INTO session_audit (session_id, user_id, event, at, ip, device)
VALUES (?, ?, 'login', strftime('%s','now'), ?, ?);
```

Quick checklist
- Generate long random `session_id` and store as cookie value.
- Set KV expiration; keep values small.
- Implement revocation via versioning or per-session revocation keys.
- Write compact audit rows to D1 when sessions are created/revoked for traceability.

---

### `orders` (orders ledger)
Purpose: store order-level snapshot, financial totals, status, and references to payments/invoices.

Columns
- `id` TEXT PRIMARY KEY — Example: `ord-0001`
- `venue_id` TEXT NOT NULL — FK -> `venues.id`
- `user_id` TEXT NULLABLE — FK -> `users.id` (null for guest checkouts)
- `status` TEXT NOT NULL — Order business lifecycle state. See **Order Statuses** below for meanings.
- `subtotal_minor` INTEGER NOT NULL — Example: `2400`
- `tax_minor` INTEGER NOT NULL — Example: `192`
- `delivery` JSON NULLABLE — Example: an object containing delivery-related snapshot fields. Recommended shape:
 - `delivery` JSON NULLABLE — delivery snapshot. Recommended shape (types + examples):
   - `address_id` TEXT NULLABLE — FK -> `addresses.id` — Example: `addr-001`
   - `fee_minor` INTEGER — delivery fee in minor units. Example: `0`
   - `method` TEXT — delivery method. Example: `pickup` or `delivery`
   - `address` JSON NULLABLE — delivery address snapshot. Example: `{ "line1": "1 Orchard Rd", "city": "Singapore", "postal_code": "238882" }`
   - `provider_id` TEXT NULLABLE — external delivery provider id. Example: `grab-001`
   - `provider_name` TEXT NULLABLE — delivery provider name. Example: `Grab`
   - `eta_minutes` INTEGER NULLABLE — estimated minutes until delivery/pickup. Example: `30`
   - `tracking_number` TEXT NULLABLE — provider tracking id. Example: `GRAB123456789`
- `discounts` JSON NULLABLE — array of discount objects applied to the order. See [`discounts` table schema](#discounts-promotions-and-discounts) for base structure. Includes computed fields like `amount_minor` for applied snapshots.
- `total_minor` INTEGER NOT NULL — Example: `2592`
- `currency` TEXT NOT NULL — Example: `SGD`
 - `items` JSON NOT NULL — array of order item objects. See [`items` table schema](#items-line-items) for structure.
 - `payment` JSON NULLABLE — payment snapshot stored on the order. See [`payments` table schema](#payments-payment-records) for structure.
 - `created_at` INTEGER NOT NULL — Example: `1700001000`
 - `created_by` TEXT NULLABLE — Example: `user:alice`
 - `closed_at` INTEGER NULLABLE — Example: `1700001300`
 - `closed_by` TEXT NULLABLE — Example: `user:alice`
 - `canceled_at` INTEGER NULLABLE — Example: `1700001200` (when canceled)
 - `canceled_by` TEXT NULLABLE — Example: `user:bob` (who canceled)
 - `expired_at` INTEGER NULLABLE — Example: `1700001400` (expiration time)
 - `expired_by` TEXT NULLABLE — Example: `system` (e.g., TTL cleanup)
 - `modified_at` INTEGER NOT NULL — Example: `1700001300`
 - `modified_by` TEXT NULLABLE — Example: `user:alice`
 - `deleted_at` INTEGER NULLABLE — Example: `null` (soft-deleted timestamp)
 - `deleted_by` TEXT NULLABLE — Example: `null` (who soft-deleted)

Indexes & constraints
- `CREATE INDEX idx_orders_venue ON orders(venue_id);`
- `CREATE INDEX idx_orders_user ON orders(user_id);`

Example row (YAML):

```yaml
id: ord-0001
venue_id: v1b2c3d4-1111-2222-3333-abcde00001
user_id: usr-01H0X4ZQ7K8H2A0Q8W1M2N7
created_by: user:alice
status: closed
subtotal_minor: 2400
tax_minor: 192
delivery:
  address_id: addr-001
  fee_minor: 500
  method: delivery
  address:
    line1: "1 Orchard Rd"
    city: "Singapore"
    postal_code: "238882"
  provider_id: grab-001
  provider_name: Grab
  eta_minutes: 30
  tracking_number: GRAB123456789
discounts:
  - discount_id: disc-001
    id: d-001
    amount_minor: 200
    type: fixed
    code: WELCOME10
    applied_to: order
    item_id: oi-0001
    category: promo
    metadata:
      note: "VIP discount"
  - discount_id: disc-002
    id: d-002
    type: percentage
    percentage_bps: 1000
    code: SUMMER10
    applied_to: order
    item_id: null
    category: promo
    metadata:
      note: "10% off order total"
total_minor: 2592
currency: SGD
items:
  - id: oi-0001
    offering_id: offering-6789
    product_master_id: prod-master-0001
    name: Yakitori (3pc)
    unit_price_minor: 800
    quantity: 3
    tax_code: GST
    tax_minor: 192
    total_minor: 2400
    metadata: {}
payment:
  id: usr-01H0X4ZQ7K8H2A0Q8W1M2N7
  provider: stripe
  provider_name: Stripe
  provider_payment_id: pi_1JXXXX
  method: card
  amount_minor: 2592
  currency: SGD
  status: succeeded
  captured_at: 1700001300
  refunded_amount_minor: 0
  fee_minor: 0
  payer:
    name: Alice
    email: alice@example.com
  card:
    brand: Visa
    last4: "4242"
  metadata: {}
  created_at: 1700001300
created_at: 1700001000
closed_at: 1700001300
closed_by: user:alice
canceled_at: null
canceled_by: null
expired_at: null
expired_by: null
modified_at: 1700001300
modified_by: user:alice
deleted_at: null
deleted_by: null
```
 
#### Order Statuses

- `open`: Cart / in-progress — editable by the customer; used while building the order. **Not used in current implementation (orders start in `provisional` or `payment_pending`), but kept for completeness and future flexibility.** Typical next: `provisional` (for multi-device/group ordering), `payment_pending` (for direct single-user checkout).

- `provisional`: Short-lived, mutable order state (DO-coordinated) for multi-device merges or group ordering; editable by participants. Typical next: `payment_pending`, `expired`, or `canceled`.

- `payment_pending`: Checkout finalized but payment not yet confirmed. Waits on payment provider or user action. Typical next: `paid`, `canceled`, or `expired`.

- `placed`: Order submitted to fulfillment/KDS (cooking/dispatch). Payment must be succeeded. Typical next: `closed`, `canceled` (rare), or `expired` (if fulfillment times out).

- `paid`: Payment succeeded (also recorded in the `payment` snapshot). Business fulfillment continues. **In our use cases, transitions immediately to `placed`.** Typical next: `placed` (or `closed`/`canceled` in other implementations, but not used here).

- `canceled`: Order canceled by user, operator, or system. Terminal; record `canceled_at` and reason. Refunds are recorded in payment records/snapshot.

- `expired`: TTL or provisional window elapsed (or payment timeout). Treat as terminal for that session; may be revived only by creating a new order or explicit re-open flow.

- `closed`: Business lifecycle finished/archived — no further edits; used for completed bookkeeping/audits. Terminal.

---

### `discounts` (promotions and discounts)
Purpose: configurable discounts/promotions that merchants can create and apply to orders or specific products.

Columns
- `id` TEXT PRIMARY KEY — Example: `disc-001`
- `venue_id` TEXT NOT NULL — FK -> `venues.id` — Example: `v1b2c3d4-1111-2222-3333-abcde00001`
- `product_master_id` TEXT NULLABLE — FK -> `product_master.id` — Example: `prod-master-0001` (null for venue-wide discounts)
- `offering_id` TEXT NULLABLE — FK -> `product_offering.id` — Example: `offering-6789` (null for venue-wide or master-level discounts)
- `code` TEXT UNIQUE — Example: `WELCOME10`
- `name` TEXT NOT NULL — Example: `Welcome Discount`
- `type` TEXT NOT NULL — Example: `fixed` or `percentage`
- `amount_minor` INTEGER NULLABLE — for fixed type, discount amount in minor units. Set only when `type = 'fixed'`. Example: `200`
- `percentage_bps` INTEGER NULLABLE — for percentage type, discount in basis points. Set only when `type = 'percentage'`. Example: `1000` (10%)
- `applicable_to` TEXT NOT NULL — Example: `order` or `item`
- `category` TEXT NULLABLE — Example: `promo`, `loyalty`, `manual`
- `valid_from` INTEGER NULLABLE — Example: `1700000000`
- `valid_to` INTEGER NULLABLE — Example: `1702593000`
- `usage_limit` INTEGER NULLABLE — max uses. Example: `100`
- `used_count` INTEGER DEFAULT 0 — Example: `5`
- `metadata` JSON NULLABLE — Example: `{ "note": "First-time customers" }`
- `created_at` INTEGER NOT NULL — Example: `1700000000`
- `modified_at` INTEGER NOT NULL — Example: `1700000100`
- `created_by` TEXT NULLABLE — Example: `merchant:john`
- `modified_by` TEXT NULLABLE — Example: `merchant:john`
- `deleted_at` INTEGER NULLABLE — Example: `null`
- `deleted_by` TEXT NULLABLE — Example: `null`

Indexes & constraints
- `CREATE UNIQUE INDEX idx_discounts_code ON discounts(venue_id, code);`
- `CREATE INDEX idx_discounts_venue ON discounts(venue_id);`
- `CREATE INDEX idx_discounts_product ON discounts(product_master_id);`
- `CREATE INDEX idx_discounts_offering ON discounts(offering_id);`

Example row (YAML):

```yaml
id: disc-001
venue_id: v1b2c3d4-1111-2222-3333-abcde00001
product_master_id: prod-master-0001
code: WELCOME10
name: Welcome Discount
type: fixed
amount_minor: 200
applicable_to: order
category: promo
valid_from: 1700000000
valid_to: 1702593000
usage_limit: 100
used_count: 5
metadata:
  note: "First-time customers"
created_at: 1700000000
modified_at: 1700000100
created_by: merchant:john
modified_by: merchant:john
```

---

### `items` (line items)
Purpose: individual items in an order (snapshot pricing and references to master/offering).

Columns
- `id` TEXT PRIMARY KEY — Example: `oi-0001`
- `order_id` TEXT NOT NULL — FK -> `orders.id` — Example: `ord-0001`
- `product_master_id` TEXT NULLABLE — FK -> `product_master.id` — Example: `prod-master-0001`
- `offering_id` TEXT NULLABLE — FK -> `product_offering.id` — Example: `offering-6789`
- `name` TEXT NOT NULL — Example: `Yakitori (3pc)` (snapshot)
- `unit_price_minor` INTEGER NOT NULL — Example: `800`
- `quantity` INTEGER NOT NULL — Example: `3`
- `tax_code` TEXT NULLABLE — snapshot of tax code applied. Example: `GST`
- `tax_minor` INTEGER NOT NULL — Example: `192`
- `discount_minor` INTEGER DEFAULT 0 — Example: `0`
- `total_minor` INTEGER NOT NULL — Example: `2400` (calculated as `(unit_price_minor * quantity) + tax_minor - discount_minor`)

- `metadata` JSON NULLABLE — Example: `null`
- `created_at` INTEGER NOT NULL — Example: `1700001000`
- `created_by` TEXT NULLABLE — Example: `user:alice`
- `modified_at` INTEGER NOT NULL — Example: `1700001000`
- `modified_by` TEXT NULLABLE — Example: `user:alice`
- `deleted_at` INTEGER NULLABLE — Example: `null`
- `deleted_by` TEXT NULLABLE — Example: `null`

Indexes
- `CREATE INDEX idx_items_order ON items(order_id);`

Example row (YAML):

```yaml
id: oi-0001
order_id: ord-0001
product_master_id: 01H0X4ZQ7K8H2A0Q8W1M2N4A
offering_id: offering-6789
name: Yakitori (3pc)
unit_price_minor: 800
quantity: 3
tax_code: GST
tax_minor: 192
discount_minor: 0
total_minor: 2400
metadata: {}
created_at: 1700001000
created_by: user:alice
modified_at: 1700001000
modified_by: user:alice
```

---

### `payments` (payment records)
Purpose: record payment attempts and captures associated with orders.

Columns
- `id` TEXT PRIMARY KEY — Example: `pay-0001`
- `order_id` TEXT NULLABLE — FK -> `orders.id` — Example: `ord-0001`
- `amount_minor` INTEGER NOT NULL — Example: `2592`
- `currency` TEXT NOT NULL — Example: `SGD`
- `provider` TEXT NULLABLE — Example: `stripe`
- `provider_name` TEXT NULLABLE — Example: `Stripe`
- `provider_payment_id` TEXT NULLABLE — Example: `ch_1J...`
- `method` TEXT NULLABLE — Example: `card`
- `card_brand` TEXT NULLABLE — Example: `Visa`
- `card_last4` TEXT NULLABLE — Example: `4242`
- `status` TEXT NOT NULL — Example: `captured` (`pending`,`captured`,`failed`,`refunded`)
- `captured_at` INTEGER NULLABLE — Example: `1700001300`
- `captured_by` TEXT NULLABLE — Example: `system`
- `failed_at` INTEGER NULLABLE — Example: `null`
- `failed_by` TEXT NULLABLE — Example: `null`
- `refunded_at` INTEGER NULLABLE — Example: `null`
- `refunded_by` TEXT NULLABLE — Example: `null`
- `refunded_minor` INTEGER DEFAULT 0 — Example: `0`
- `metadata` JSON NULLABLE — Example: `{}`
- `created_at` INTEGER NOT NULL — Example: `1700001300`
- `modified_at` INTEGER NOT NULL — Example: `1700001300`
- `created_by` TEXT NULLABLE — Example: `system`
- `modified_by` TEXT NULLABLE — Example: `system`
- `deleted_at` INTEGER NULLABLE — Example: `null`
- `deleted_by` TEXT NULLABLE — Example: `null`

Indexes
- `CREATE INDEX idx_payments_order ON payments(order_id);`

Example row (YAML):

```yaml
id: pay-0001
order_id: ord-0001
amount_minor: 2592
currency: SGD
provider: stripe
provider_name: Stripe
provider_payment_id: ch_1J...
method: card
card_brand: Visa
card_last4: 4242
status: captured
captured_at: 1700001300
captured_by: system
refunded_minor: 0
metadata: {}
created_at: 1700001300
modified_at: 1700001300
created_by: system
modified_by: system
deleted_at: null
deleted_by: null
failed_at: null
failed_by: null
refunded_at: null
refunded_by: null
```

Deleted row example (YAML):

```yaml
id: pay-0001
deleted_at: 1700005000
deleted_by: admin:john
modified_at: 1700005000
modified_by: admin:john
```

---

### `receipts` (payment receipts)
Purpose: receipts generated from orders after successful payment for accounting and records.

Columns
- `id` TEXT PRIMARY KEY — Receipt unique identifier. Example: `rec-0001`
- `order_id` TEXT NOT NULL — FK -> `orders.id` — Reference to the order this receipt is for. Example: `ord-0001`
- `receipt_number` TEXT UNIQUE — Human-readable receipt number for reference. Example: `REC-2025-0001`
- `currency` TEXT NOT NULL — Currency code (e.g., SGD). Example: `SGD`
- `subtotal_minor` INTEGER NOT NULL — Subtotal amount in minor units (before tax and discounts). Example: `3000`
- `tax_minor` INTEGER NOT NULL — Tax amount in minor units. Example: `300`
- `discount_minor` INTEGER NOT NULL — Discount amount in minor units. Example: `708`
- `amount_minor` INTEGER NOT NULL — Total amount in minor units (subtotal + tax - discount). Example: `2592`
- `issued_at` INTEGER NOT NULL — Date and time the receipt was generated. Example: `1700002000`
- `paid_at` INTEGER NULLABLE — Date and time the payment was received. Example: `1700002000`
- `created_at` INTEGER NOT NULL — Record creation timestamp. Example: `1700002000`
- `modified_at` INTEGER NOT NULL — Record modification timestamp. Example: `1700002000`
- `created_by` TEXT NULLABLE — User/system that created the record. Example: `system`
- `modified_by` TEXT NULLABLE — User/system that modified the record. Example: `system`
- `deleted_at` INTEGER NULLABLE — Soft delete timestamp. Example: `null`
- `deleted_by` TEXT NULLABLE — User/system that deleted the record. Example: `null`

Indexes
- `CREATE UNIQUE INDEX idx_receipts_number ON receipts(receipt_number);`

Example row (YAML):

```yaml
id: rec-0001
order_id: ord-0001
receipt_number: REC-2025-0001
currency: SGD
subtotal_minor: 3000
tax_minor: 300
discount_minor: 708
amount_minor: 2592
issued_at: 1700002000
paid_at: 1700002000
created_at: 1700002000
created_by: system
modified_at: 1700002000
modified_by: system
deleted_at: null
deleted_by: null
```

---

### `seats` (venue seats / allocations)
Purpose: optional seat-level reservations/allocations per venue.

Columns
- `id` TEXT PRIMARY KEY — Example: `seat-001`
- `venue_id` TEXT NOT NULL — FK -> `venues.id`
- `label` TEXT NOT NULL — Example: `A12`
- `status` TEXT NOT NULL — Example: `available` (`available`,`reserved`,`occupied`)
- `metadata` JSON NULLABLE
- `created_at` INTEGER NOT NULL — Example: `1700000000`
- `modified_at` INTEGER NOT NULL — Example: `1700000100`
- `created_by` TEXT NULLABLE — Example: `system`
- `modified_by` TEXT NULLABLE — Example: `null`
- `deleted_at` INTEGER NULLABLE
- `deleted_by` TEXT NULLABLE

Example row (YAML):

```yaml
id: seat-001
venue_id: v1b2c3d4-1111-2222-3333-abcde00001
label: A12
status: available
metadata: null
created_at: 1700000000
modified_at: 1700000100
created_by: system
modified_by: null
deleted_at: null
deleted_by: null
```

---

### `roles` & `user_roles` (RBAC)
Purpose: basic role-based access control (named roles + association table).

`roles` columns
- `id` TEXT PRIMARY KEY — Example: `role-admin`
- `name` TEXT UNIQUE NOT NULL — Example: `admin`
- `permissions` JSON NULLABLE — Example: `{"manage_users": true}`
- `created_at` INTEGER NOT NULL — Example: `1700000000`
- `modified_at` INTEGER NOT NULL — Example: `1700000000`
- `created_by` TEXT NULLABLE
- `modified_by` TEXT NULLABLE
- `deleted_at` INTEGER NULLABLE
- `deleted_by` TEXT NULLABLE

`user_roles` columns
- `user_id` TEXT NOT NULL — FK -> `users.id`
- `role_id` TEXT NOT NULL — FK -> `roles.id`
- `assigned_at` INTEGER NOT NULL — Example: `1700000000`
- `assigned_by` TEXT NULLABLE — Example: `admin:john`
- `created_at` INTEGER NOT NULL — Example: `1700000000`
- `created_by` TEXT NULLABLE — Example: `admin:john`
- `deleted_at` INTEGER NULLABLE — Example: `null`
- `deleted_by` TEXT NULLABLE — Example: `null`

Indexes
- `CREATE UNIQUE INDEX idx_user_roles_unique ON user_roles(user_id, role_id);`

Example rows (YAML):

```yaml
# roles
- id: role-admin
  name: admin
  permissions:
    manage_users: true
  created_at: 1700000000
  modified_at: 1700000000
  created_by: system
  modified_by: null
  deleted_at: null
  deleted_by: null

# user_roles
- user_id: usr-01H0X4ZQ7K8H2A0Q8W1M2N7
  role_id: role-admin
  assigned_at: 1700000000
  assigned_by: admin:john
  created_at: 1700000000
  created_by: admin:john
  deleted_at: null
  deleted_by: null
```

---

### `addresses` (reusable addresses)
Purpose: reusable address records for venues or users.

Columns
- `id` TEXT PRIMARY KEY — Example: `addr-001`
- `owner_type` TEXT NOT NULL — Example: `customer|venue|user`
- `owner_id` TEXT NOT NULL — Example: `cust-001|v1b2c3d4...|usr-...`
- `type` TEXT NULLABLE — Example: `billing|shipping|home`
- `address` JSON NOT NULL — Example: `{ "line1": "1 Orchard Rd", "city": "Singapore", "postal": "238842" }`
- `label` TEXT NULLABLE — Example: `Office`
- `is_primary` INTEGER DEFAULT 0 — Example: `1`
- `created_at` INTEGER NOT NULL — Example: `1700000000`
- `modified_at` INTEGER NOT NULL — Example: `1700000100`
- `created_by` TEXT NULLABLE — Example: `user:alice`
- `modified_by` TEXT NULLABLE — Example: `user:alice`
- `deleted_at` INTEGER NULLABLE
- `deleted_by` TEXT NULLABLE

Example row (YAML):

```yaml
id: addr-001
owner_type: customer
owner_id: cust-001
type: billing
address:
  line1: "1 Orchard Rd"
  city: "Singapore"
  postal: "238842"
label: Office
is_primary: 1
created_at: 1700000000
modified_at: 1700000100
created_by: user:alice
modified_by: user:alice
deleted_at: null
deleted_by: null
```

---

### Guest checkout (anonymous)
Policy: For guest/anonymous orders we **do not** create `users` rows. Guest activity is a one-off tied to the `orders` record and should be captured via snapshot fields.

Recommended fields:
- `orders.guest_name` TEXT NULLABLE
- `orders.guest_email` TEXT NULLABLE
- `orders.guest_phone` TEXT NULLABLE
- Use `items` rows (or an `items` list) to store per-line prices and tax; avoid a separate `pricing_snapshot` JSON field.
- `order_items.price_minor`, `order_items.tax_code`, `order_items.item_name` — snapshot pricing and display values at order time

Notes:
- `created_by` will be `null` or set to a readable token (e.g., `system:cron`) for guest or system-created orders.
- If a guest later registers, you may link their account to existing orders via application logic, but do not create persistent `users` automatically without consent.

Example guest order (YAML):

```yaml
id: ord-guest-0001
venue_id: v1b2c3d4-1111-2222-3333-abcde00001
user_id: null
created_by: null
guest_name: "Guest"
guest_email: null
status: closed
subtotal_minor: 1299
tax_minor: 104
items:
  - id: oi-guest-01
    offering_id: null
    name: "Yakitori (3pc)"
    unit_price_minor: 1299
    quantity: 1
    tax_minor: 104
    total_minor: 1299
    tax_code: sg_standard
```

Deleted row example (YAML):

```yaml
id: ord-0001
deleted_at: 1700005000
deleted_by: admin:john
```

---

### Provisional orders & DO coordination
In high-concurrency or multi-device scenarios we recommend supporting *provisional* orders (short-lived, mutable order objects) that are coordinated by a Durable Object (DO). This lets the DO act as the authoritative coordinator for merges, concurrency resolution, and finalization (no long-lived reservations required).

Key additions to `orders` schema (recommended):
- `order_group_id` TEXT NULLABLE — link related orders or per-user provisional orders
- `main_payer_id` TEXT NULLABLE — user designated to be the payer for merged-bill flows
- `status` add provisional states: `provisional`, `payment_pending`, `placed`, `paid`, `canceled`, `expired`
- `expires_at` INTEGER NULLABLE — TTL for provisional orders
- `version` INTEGER NOT NULL DEFAULT 1 — optimistic lock for merges/finalize

DO responsibilities (per-order DO)
- Authoritative merge and concurrency control (join/leave/merge operations are serialized by DO). 
- Validate items (prices, stock) at merge or finalize and reject when validation fails.
- Persist audit events to D1 (merge events, finalize attempts, who/when/reason).
- Coordinate finalization (idempotent checkout) and write the final immutable order snapshot to `orders` + `order_items`.

DO pseudo-methods (sketch):
```
class OrderDO {
  async joinOrder(user_id, cartPayload) // merge client cart into DO state
  async assignMainPayer(user_id)
  async validateItems() -> { valid:boolean, corrections: [] }
  async finalizeCheckout(idempotencyKey, payments[]) -> { success:boolean, order_id?, errors[] }
  async getStatus() -> { status, participants, totals }
}
```

Finalize flow (idempotent):
1. Client calls DO.finalizeCheckout(idempotencyKey, payments)
2. DO validates items and availability (no reservation step) — fail if insufficient stock
3. DO attempts payments atomically (use idempotency keys with payment providers or payment service)
4. If payments succeed: DO writes immutable `orders` + `items`, persists `order_payments` rows, and emits audit row to D1; mark status `placed`/`paid` per business policy
5. If payments fail: DO records attempt, returns structured errors and keeps provisional order (or marks `payment_pending` per policy)

Idempotency & concurrency notes
- Require client-provided **idempotency keys** for finalize operations (prevent duplicate charges).  
- Use the DO + order.version (optimistic lock) to detect concurrent merges/finalizations and return merge/conflict errors for client to reconcile.  
- DO writes audits to D1; compact or garbage-collect DO state when order finalizes or expires.

Payment & billing models
- Single merged bill: one `main_payer_id` pays the total; other participants are listed in DO state and can view the order.  
- Split billing: implement per-user provisional orders within the same table or create multiple orders and link them with `order_group_id`.  
- Payment records should be stored in `order_payments` (see `payments` section) with `amount_minor`, `provider`, `status`, `txn_ref`.

UI/UX considerations
- Merges require an explicit prompt: "Join existing provisional bill? Merge and designate main payer?" 
- No real-time propagation required — clients refresh the order (GET /order/{id}/status) to view updated merges/finalization.  
- Display validation corrections and require explicit user acceptance before finalize (e.g., price changes, stock shortfalls).

Operational notes
- Cron job to expire and GC provisional orders beyond `expires_at` (clean DO state + D1 audit).  
- DOs can be sharded by order id to handle hot orders; keep DO state small and persist audits to D1.  
- Use idempotency and durable payment patterns (provider-side idempotency or your payment orchestrator) to avoid double-charges.

---

## How to consume (example pattern)
- To render a venue menu: SELECT * FROM product_offering WHERE venue_id = ? AND available = 1 AND (effective_from IS NULL OR effective_from <= now) AND (effective_to IS NULL OR effective_to >= now) ORDER BY display_name;
- On order creation: store `items.product_master_id` (required), `items.offering_id` (nullable), and snapshot `price_minor`, `tax_code`, `item_name`; prefer resolving price/tax via `product_pricing` when `offering_id` is present.

---

## Linkages
- See `docs/scenario-stories.md` for story-driven usage examples and customer flows.

**Consistency note:** Use `created_at` and `modified_at` across tables as the canonical timestamps (INTEGER seconds since epoch). Store local reconstructions (`created_at_local`, `created_at_offset_minutes`) only for display/audit when needed; always compute and compare times in UTC. Also include `created_by`, `modified_by`, `deleted_at`, and `deleted_by` for auditing.

---

Created as a reference for the Phase 0 schema and product modeling (master + offering) — I can add more tables (invoices, refunds, seats) if you want the full schema documented next.
