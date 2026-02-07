# DB Schema Reference — Core Tables (venues, products)

- [DB Schema Reference — Core Tables (venues, products)](#db-schema-reference--core-tables-venues-products)
  - [Conventions](#conventions)
    - [Timestamps convention](#timestamps-convention)
    - [Timezones \& Timestamps](#timezones--timestamps)
    - [Why store UTC as the canonical timestamp (short)](#why-store-utc-as-the-canonical-timestamp-short)
  - [Tables](#tables)
    - [`organizations` (legal entities)](#organizations-legal-entities)
    - [`brands` (brand identity)](#brands-brand-identity)
    - [`venues` (branch / location)](#venues-branch--location)
    - [`products` (global SKU)](#products-global-sku)
    - [`offerings` (per-venue listing)](#offerings-per-venue-listing)
    - [`currencies`](#currencies)
    - [`prices` (versioned pricing)](#prices-versioned-pricing)
    - [`tax_rates` (regional tax rules)](#tax_rates-regional-tax-rules)
    - [`users` (application identities)](#users-application-identities)
    - [`sessions` (KV-backed login sessions)](#sessions-kv-backed-login-sessions)
    - [`orders` (orders ledger)](#orders-orders-ledger)
      - [Order Statuses](#order-statuses)
    - [`discounts` (promotions and discounts)](#discounts-promotions-and-discounts)
    - [`items` (line items)](#items-line-items)
    - [`payments` (payment records)](#payments-payment-records)
    - [`receipts` (payment receipts)](#receipts-payment-receipts)
    - [`seats` (in-store seating management)](#seats-in-store-seating-management)
    - [`addresses` (reusable addresses)](#addresses-reusable-addresses)
    - [`roles` (RBAC)](#roles-rbac)
      - [Access Scope Definitions](#access-scope-definitions)
      - [How Scope is Applied (Implementation Logic)](#how-scope-is-applied-implementation-logic)
      - [Recommended Permission Flags (String Array)](#recommended-permission-flags-string-array)
      - [Reference: User Types \& Default Roles](#reference-user-types--default-roles)
- [Architecture Patterns \& Implementation Examples](#architecture-patterns--implementation-examples)
  - [Durable Objects (DO) — per-user revocation pattern](#durable-objects-do--per-user-revocation-pattern)
    - [DO implementation sketch (TypeScript pseudocode)](#do-implementation-sketch-typescript-pseudocode)
    - [ASCII flow (KV-first, DO authoritative)](#ascii-flow-kv-first-do-authoritative)
    - [Expiration Strategy \& Recommendations](#expiration-strategy--recommendations)
  - [Guest checkout (anonymous)](#guest-checkout-anonymous)
  - [Provisional orders \& DO coordination](#provisional-orders--do-coordination)
  - [How to consume (example pattern)](#how-to-consume-example-pattern)
  - [Linkages](#linkages)


This file documents the core DB tables and provides example rows for `venues` and product modeling (`products` + `offerings`). Use this as a reference for implementation and migrations.

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

## Tables

### `organizations` (legal entities)
Purpose: Represent legal business entities that own/operate venues (e.g., franchisees, restaurant groups, holding companies).

Columns
- `id` TEXT PRIMARY KEY — Unique organization identifier (ULID). Example: `org-01H0X4ZQ7K8H2A0Q8W1M2N3`
- `name` TEXT NOT NULL — Public display name of the organization. Example: `"ABC Restaurant Group"`
- `legal_name` TEXT NOT NULL — Official business name registered with government authorities. Example: `"ABC Restaurant Pte Ltd"`
- `tax_id` TEXT NULLABLE — Business registration number or tax identification number (UEN, EIN, etc.). Example: `"201234567K"`
- `contact_email` TEXT NULLABLE — Primary administrative contact email for the organization. Example: `"admin@abcgroup.com"`
- `contact_phone` TEXT NULLABLE — Primary administrative contact phone number. Example: `"+65 6123 4567"`
- `website` TEXT NULLABLE — Official corporate website URL. Example: `"https://abcgroup.com"`
- `metadata` JSON NULLABLE — Extensible container for additional organization-specific data (e.g., industry, employee count). Example: `{"industry": "F&B", "employee_count": 150}`
- `created_at` INTEGER NOT NULL — Unix timestamp of creation. Example: `1700000000`
- `modified_at` INTEGER NOT NULL — Unix timestamp of last edit. Example: `1700000100`
- `created_by` TEXT NULLABLE — User ID or 'system' who created the organization. Example: `system`
- `modified_by` TEXT NULLABLE — User ID who last modified the organization. Example: `null` (no edits yet)
- `deleted_at` INTEGER NULLABLE — Unix timestamp of soft-deletion. Null means active. Example: `null` (not deleted)
- `deleted_by` TEXT NULLABLE — User ID who deleted the organization. Example: `null` (not deleted)

Example row (YAML):

```yaml
id: org-01H0X4ZQ7K8H2A0Q8W1M2N3
name: ABC Restaurant Group
legal_name: ABC Restaurant Pte Ltd
tax_id: 201234567K
contact_email: admin@abcgroup.com
contact_phone: "+65 6123 4567"
website: https://abcgroup.com
metadata:
  industry: F&B
  employee_count: 150
created_at: 1700000000
modified_at: 1700000000
created_by: system
modified_by: null
deleted_at: null
deleted_by: null
```

---

### `brands` (brand identity)
Purpose: Corporate brand identity shared across multiple venues (e.g., "McDonald's", "Sushi House Group").

Columns
- `id` TEXT PRIMARY KEY — Unique brand identifier (ULID). Example: `brand-01H0X4ZQ7K8H2A0Q8W1M2N4`
- `owner_id` TEXT NOT NULL — FK -> `organizations.id`. Brand IP owner/licensor. Example: `org-01H0X4ZQ7K8H2A0Q8W1M2N3`
- `name` TEXT NOT NULL — Public-facing brand name used for marketing and display. Example: `"Sushi House"`
- `slug` TEXT UNIQUE NOT NULL — URL-safe string for use in browser addresses and API routes. Example: `"sushi-house"`
- `logo_light_url` TEXT NULLABLE — URL to the brand logo intended for use on white or light-colored backgrounds. Example: `"https://cdn.example.com/logo-light.png"`
- `logo_dark_url` TEXT NULLABLE — URL to the brand logo intended for use on dark backgrounds (Dark Mode). Example: `"https://cdn.example.com/logo-dark.png"`
- `logo_icon_url` TEXT NULLABLE — URL to a square or small-scale version of the logo for favicons and small UI elements. Example: `"https://cdn.example.com/icon.png"`
- `tagline` TEXT NULLABLE — Short, catchy marketing phrase associated with the brand. Example: `"Authentic Japanese dining experience"`
- `metadata` JSON NULLABLE — Extensible container for additional brand-specific configuration or static data (e.g., brand colors, social media handles). Example: `{"color_primary": "#FF6B6B", "founding_year": 2020}`
- `created_at` INTEGER NOT NULL — Unix timestamp of creation. Example: `1700000000`
- `modified_at` INTEGER NOT NULL — Unix timestamp of last edit. Example: `1700000100`
- `created_by` TEXT NULLABLE — User ID or 'system' who created the brand. Example: `system`
- `modified_by` TEXT NULLABLE — User ID who last modified the brand. Example: `null` (no edits yet)
- `deleted_at` INTEGER NULLABLE — Unix timestamp of soft-deletion. Null means active. Example: `null` (not deleted)
- `deleted_by` TEXT NULLABLE — User ID who deleted the brand. Example: `null` (not deleted)

Example row (YAML):

```yaml
id: brand-01H0X4ZQ7K8H2A0Q8W1M2N4
owner_id: org-01H0X4ZQ7K8H2A0Q8W1M2N3
name: Sushi House
slug: sushi-house
logo_light_url: https://cdn.example.com/logo-light.png
logo_dark_url: https://cdn.example.com/logo-dark.png
logo_icon_url: https://cdn.example.com/icon.png
tagline: Authentic Japanese dining experience
metadata:
  color_primary: "#FF6B6B"
  founding_year: 2020
created_at: 1700000000
modified_at: 1700000000
created_by: system
modified_by: null
deleted_at: null
deleted_by: null
```

---

### `venues` (branch / location)
Purpose: tenancy boundary for menus, printers, taxes, and local settings.

Columns
- `id` TEXT PRIMARY KEY — Unique venue identifier (ULID). Example: `venue-01H0X4ZQ7K8H2A0Q8W1M2N3P4`
- `name` TEXT NOT NULL — Display name of the venue. Example: `"Sushi House - Orchard"`
- `slug` TEXT UNIQUE NOT NULL — URL-friendly identifier. Example: `"sushi-house-orchard"`
- `type` TEXT NOT NULL — Venue category (restaurant, bar, cafe). Determines UI behavior like reservation support or quick-service flows. Example: `restaurant`
- `tier` TEXT NOT NULL DEFAULT 'branch' — Venue role/hierarchy. Values: `hq`, `flagship`, `branch`, `pop-up`, `kiosk`. Example: `flagship`
- `brand_id` TEXT NOT NULL — FK -> `brands.id`. Links branch to its corporate brand identity. Example: `"brand-azuki-01"`
- `owner_id` TEXT NOT NULL — FK -> `organizations.id`. The legal entity/franchisee that owns this specific branch. Example: `"org-42"`
- `currency` TEXT NOT NULL — ISO 4217 Currency Code for all transactions. Example: `"SGD"`
- `timezone` TEXT NOT NULL — IANA Timezone for operational hours/reporting. Example: `"Asia/Singapore"`
- `tax_rate_bps` INTEGER DEFAULT 0 — Default tax rate in basis points (e.g., 900 = 9%). Example: `900`
- `service_charge_bps` INTEGER DEFAULT 0 — Default service charge in basis points (e.g., 1000 = 10%). Example: `1000`
- `kds_enabled` INTEGER DEFAULT 0 — Boolean (0/1) indicating if Kitchen Display System is active. Example: `1`
- `default_locale` TEXT NOT NULL DEFAULT 'en-SG' — Primary language for menus/UI (ISO locale code). Example: `en-SG`
- `supported_locales` JSON NOT NULL DEFAULT '["en-SG"]' — Array of supported ISO locale codes. Example: `["en-SG", "zh-CN"]`
- `date_format` TEXT NOT NULL DEFAULT 'DD/MM/YYYY' — Date display format for this venue. Example: `DD/MM/YYYY` (Singapore), `MM/DD/YYYY` (US)
- `website` TEXT NULLABLE — Public website URL. Example: `https://sushihouse.sg`
- `opened_at` INTEGER NULLABLE — Unix timestamp when venue officially opened for business. Example: 1609459200 (Jan 1, 2021)
- `business_hours` JSON NULLABLE — Weekly business hours as 7-item array [sun,mon,tue,wed,thu,fri,sat]. Each day is null (closed) or flat array of HH:MM times (open,close,open,close,...). Example: `[null,["11:00","15:00","17:00","23:00"],null,["11:00","23:00"],null,["11:00","23:00"],null]`
- `closure_dates` JSON NULLABLE — Special date closures/modified hours as array of [date,...times] tuples. Use null for times to indicate closure. Times in 24-hour HH:MM format. Example: `[["2025-01-01",null],["2025-12-25","10:00","18:00"]]`
- `address_id` TEXT NULLABLE — FK -> `addresses.id`. Links to physical location data. Example: `addr-001`
- `settings` JSON NULLABLE — Venue-specific flags and configuration (e.g. KDS settings, printer IP, payment preferences). Example: `{ "printer_ip": "192.168.1.100" }`
- `created_at` INTEGER NOT NULL — Unix timestamp of creation. Example: `1700000000`
- `modified_at` INTEGER NOT NULL — Unix timestamp of last edit. Example: `1700000100`
- `created_by` TEXT NULLABLE — User ID or 'system' who created the venue. Example: `system`
- `modified_by` TEXT NULLABLE — User ID who last modified the venue. Example: `null` (no edits yet)
- `deleted_at` INTEGER NULLABLE — Unix timestamp of soft-deletion. Null means active. Example: `null` (not deleted)
- `deleted_by` TEXT NULLABLE — User ID who deleted the venue. Example: `null` (not deleted)


Example row (YAML):

```yaml
id: venue-01H0X4ZQ7K8H2A0Q8W1M2N3P4
name: Sushi House - Orchard
slug: sushi-house-orchard
type: restaurant
tier: flagship
brand_id: brand-azuki-01
owner_id: org-42
currency: SGD
timezone: Asia/Singapore
tax_rate_bps: 900
service_charge_bps: 1000
kds_enabled: 1
default_locale: en-SG
supported_locales:
  - en-SG
  - zh-CN
date_format: DD/MM/YYYY
website: https://sushihouse.sg
opened_at: 1609459200  # Jan 1, 2021
business_hours:
  - null  # Sunday closed
  - ["11:00", "15:00", "17:00", "23:00"]  # Monday lunch & dinner
  - ["11:00", "23:00"]  # Tuesday
  - ["11:00", "23:00"]  # Wednesday
  - ["11:00", "23:00"]  # Thursday
  - ["11:00", "23:00"]  # Friday
  - ["11:00", "23:00"]  # Saturday
closure_dates:
  - ["2025-01-01", null]  # New Year closed
  - ["2025-12-25", "10:00", "18:00"]  # Christmas special hours
address_id: addr-001
settings:
  printer_ip: "192.168.1.100"
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

### `products` (global SKU)
Purpose: canonical product identity used for analytics and shared definitions.

Columns
- `id` — TEXT PK — Unique product identifier (ULID). Example: `prod-0001`
- `sku` — TEXT UNIQUE — Canonical SKU for cross-venue tracking. Example: `"SH-YAKI-01"`
- `name` — TEXT — Primary product name. Example: `"Yakitori (3pc)"`
- `slug` — TEXT UNIQUE NOT NULL — URL-friendly identifier for public menus/SEO. Example: `"yakitori-3pc"`
- `description` — TEXT — Detailed product description. Example: `"Grilled skewered chicken"`
- `tags` — TEXT/JSON — Categorization tags for filtering/search. Example: `["grill", "skewer", "popular"]`
- `created_at` — INTEGER — Unix timestamp of creation. Example: `1700000100`
- `modified_at` — INTEGER — Unix timestamp of last edit. Example: `1700000200`
- `created_by` — TEXT NULLABLE — User ID or 'system' who created the product. Example: `system`
- `modified_by` — TEXT NULLABLE — User ID who last modified the product. Example: `null` (no edits yet)
- `deleted_at` — INTEGER NULLABLE — Unix timestamp of soft-deletion. Null means active. Example: `null` (not deleted)
- `deleted_by` — TEXT NULLABLE — User ID who deleted the product. Example: `null` (not deleted)

Example row (YAML):

```yaml
id: 01H0X4ZQ7K8H2A0Q8W1M2N4A
sku: SH-YAKI-01
name: Yakitori (3pc)
slug: yakitori-3pc
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

### `offerings` (per-venue listing)
Purpose: per-venue overrides for price, name, availability, promotions, seasonal variations.

Note: **Offerings inherit default fields** (e.g., `name`, `description`) from `products`. Use `COALESCE(offerings.name, products.name)` at read time to allow venue-specific overrides. If an offering field is `NULL`, the global product value is used.

Columns
- `id` — TEXT PK — Unique identifier for the venue-specific offering (ULID). Example: `offering-6789`
- `venue_id` — TEXT FK → `venues.id` — Links the offering to a specific branch. Example: `venue-01H0X4ZQ7K8H2A0Q8W1M2N3P4`
- `product_id` — TEXT FK → `products.id` — Links to the master product definition (the "Master Product"). Example: `prod-0001`
- `sku` — TEXT NULLABLE — Venue-specific SKU (overrides global SKU if set). If null, falls back to `products.sku`. Example: `SH-ORC-YAK-1`
- `slug` — TEXT NULLABLE — Venue-specific URL slug. If null, falls back to `products.slug`. Example: `yakitori-special`
- `price_minor` — INTEGER — Default offering price in minor units (stored in venue currency). Example: `800` (SGD 8.00)
- `status` — TEXT NOT NULL DEFAULT 'active' — Offering state. Enum:
    - `active`: Visible on menu, can be added to cart.
    - `sold_out`: Visible on menu with 'Sold Out' tag, cannot be added to cart.
    - `hidden`: Hidden from menu listing, but can still be ordered (e.g., via direct link or staff POS). Great for secret menus/staff items.
    - `inactive`: Completely disabled and invisible.
  Example: `active`
- `stock_count` — INTEGER NULLABLE — Current available quantity. Null means infinite stock. System can auto-set status to `sold_out` when hitting 0. Example: `20`
- `name` — TEXT NULLABLE — Venue-specific name override. If null, falls back to `products.name`. Example: `"Yakitori - Orchard Special"`
- `description` — TEXT NULLABLE — Venue-specific description. If null, falls back to `products.description`. Example: `"Our signature grilled skewers with a special local glaze."`
- `tags` — TEXT/JSON NULLABLE — Venue-specific tags (e.g., "Trending", "Chef's Choice"). If null, falls back to `products.tags`. Example: `["chef-choice", "local-special"]`
- `discount_id` — TEXT NULLABLE — FK -> `discounts.id`. Active discount/promotion linked to this offering. Example: `disc-001`
- `effective_from` — INTEGER NULLABLE — Unix timestamp when offering starts. Null means "always active in the past". Example: `1700001000`
- `effective_to` — INTEGER NULLABLE — Unix timestamp when offering expires. Null means "always active in the future". Example: `1702593000`
- `metadata` — JSON (nullable) — Extensible container for modifiers or venue preferences. Example: `{"spicy_level": ["mild", "regular"]}`
- `created_at` — INTEGER — Unix timestamp of creation. Example: `1700000100`
- `modified_at` — INTEGER — Unix timestamp of last edit. Example: `1700000200`
- `created_by` — TEXT NULLABLE — User ID or 'system' who created the offering. Example: `system`
- `modified_by` — TEXT NULLABLE — User ID who last modified the offering. Example: `null` (no edits yet)
- `deleted_at` — INTEGER NULLABLE — Unix timestamp of soft-deletion. Example: `null` (not deleted)
- `deleted_by` — TEXT NULLABLE — User ID who deleted the offering. Example: `null` (not deleted)

Notes
- **Venue-Specific Menus**: When rendering the menu for a specific branch (e.g., via QR code), always filter `offerings` by `venue_id`. This ensures customers only see items and prices authorized for that location.
- **Global Analytics**: While customers buy an `offering`, always store the parent `product_id` in the `order_items` table. This allows higher-level reporting to track performance of a specific product (e.g., "Classic Burger") across all venues, regardless of local name or price overrides.

Example row (YAML):

```yaml
id: offering-6789
venue_id: v1b2c3d4-1111-2222-3333-abcde00001
product_id: 01H0X4ZQ7K8H2A0Q8W1M2N4A
sku: SH-ORC-YAK-1
slug: yakitori-special
price_minor: 800
status: active
stock_count: null
name: "Yakitori - Orchard Special"
description: "Our signature grilled skewers with a special local glaze."
tags: ["chef-choice", "local-special"]
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

Indexes
- `CREATE INDEX idx_offerings_venue ON offerings(venue_id);`
- `CREATE UNIQUE INDEX idx_unique_offering_sku ON offerings(venue_id, sku);`
- `CREATE INDEX idx_products_sku ON products(sku);`
- `CREATE INDEX idx_products_slug ON products(slug);`
- `CREATE INDEX idx_offerings_slug ON offerings(venue_id, slug);`

---

### `currencies`
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

### `prices` (versioned pricing)
Purpose: hold time-bound or promotional price components and metadata; authoritative when present for an `offering_id`.

Columns
- `id` TEXT PRIMARY KEY — Unique price identifier. Example: `price-001`
- `offering_id` TEXT NOT NULL  -- FK -> `offerings.id` — Example: `offering-6789`
- `valid_from` INTEGER NOT NULL — Example: `1700001000`
- `valid_to` INTEGER NULLABLE — Example: `1702593000`
- `base_price_minor` INTEGER NOT NULL — Example: `800` (SGD 8.00)
- `msrp_minor` INTEGER NULLABLE — Example: `900` (SGD 9.00)
- `markup_bps` INTEGER DEFAULT 0   -- basis points (100 bps = 1%) — Example: `0`
- `tax_code` TEXT NULLABLE         -- maps to `tax_rates.tax_code` — Example: `GST`
- `tax_included` INTEGER DEFAULT 0 -- 0 = exclusive, 1 = inclusive — Example: `0` (exclusive)
- `discount_id` TEXT NULLABLE — Example: `disc-001`
- `metadata` JSON NULLABLE         -- free-form (channels, notes) — Example: `{ "channels": ["web","kiosk"] }`
- `created_at` INTEGER NOT NULL — Example: `1700000000`
- `modified_at` INTEGER NOT NULL — Example: `1700000000`
- `created_by` TEXT NULLABLE — Example: `system`
- `modified_by` TEXT NULLABLE — Example: `null` (no edits yet)
- `deleted_at` INTEGER NULLABLE — Example: `null` (not deleted)
- `deleted_by` TEXT NULLABLE — Example: `null` (not deleted)
- `items` JSON NULLABLE — Example: see below (array of order items with id, offering_id, unit_price_minor, quantity, tax_minor, total_minor)

Indexes & constraints
- `CREATE INDEX idx_prices_offering ON prices(offering_id, valid_from);`
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
  discount_id: disc-001
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
SELECT * FROM prices
WHERE offering_id = ?
  AND (valid_from IS NULL OR valid_from <= ?)
  AND (valid_to IS NULL OR valid_to >= ?)
ORDER BY valid_from DESC
LIMIT 1;
```

Notes
- When no active row exists, fall back to `offerings.price_minor`.
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
- `id` TEXT PRIMARY KEY — Example (ULID): `user-01H0X4ZQ7K8H2A0Q8W1M2N7`
- `email` TEXT NULLABLE — Example: `alice@example.com` (Nullable for anonymous guests)
- `role_id` TEXT NOT NULL — FK -> `roles.id` — Example: `role-admin`
- `password_hash` TEXT NULLABLE — Example: `bcrypt$2b$...` (nullable for SSO-only accounts)
- `first_name` TEXT NULLABLE — Example: `Alice`
- `last_name` TEXT NULLABLE — Example: `Smith`
- `phone` TEXT NULLABLE — Example: `+65 9123 4567`
- `default_delivery_address_id` TEXT NULLABLE — FK -> `addresses.id` — Example: `addr-001`
- `status` TEXT NOT NULL — Example: `active` (enum: `active`, `suspended`, `deleted`). Guests are `active` but have `role_id='role-guest'`.
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
- `CREATE UNIQUE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;`

Example row (YAML):

```yaml
id: user-01H0X4ZQ7K8H2A0Q8W1M2N7
email: alice@example.com
role_id: role-admin
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
id: user-01H0X4ZQ7K8H2A0Q8W1M2N7
deleted_at: 1700005000
deleted_by: admin:john
```

---

### `sessions` (KV-backed login sessions)
Purpose: short-lived sessions stored in Workers KV (write-once at creation, read-many until expiry). Store session token hashes when needed and keep minimal durable audit records in D1 for forensics.

KV key pattern (recommended): `session:{session_id}` with a compact JSON value. Set KV `expiration`/`expirationTtl` so session entries auto-expire.

JSON value keys (recommended)
- `user_id` (TEXT, required)
  - canonical `users.id` the session belongs to. Example: `"user-01H0X4ZQ7K8H2A0Q8W1M2N7"`
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

---


### `orders` (orders ledger)
Purpose: store order-level snapshot, financial totals, status, and references to payments/invoices.

Columns
- `id` TEXT PRIMARY KEY — Example: `ord-0001`
- `venue_id` TEXT NOT NULL — FK -> `venues.id`
- `user_id` TEXT NULLABLE — FK -> `users.id` (null for guest checkouts)
- `seat_id` TEXT NULLABLE — FK -> `seats.id` (for in-store orders; null for delivery/pickup)
- `status` TEXT NOT NULL — Order business lifecycle state. See **Order Statuses** below for meanings.
- `subtotal_minor` INTEGER NOT NULL — Example: `2400`
- `tax_minor` INTEGER NOT NULL — Example: `192`
- `service_charge_minor` INTEGER DEFAULT 0 — Example: `240` (10% of subtotal)
- `delivery` JSON NULLABLE — delivery snapshot. Recommended shape (types + examples):
   - `address_id` TEXT NULLABLE — FK -> `addresses.id` — Example: `addr-001`
   - `fee_minor` INTEGER — delivery fee in minor units. Example: `0`
   - `method` TEXT — Enum: `pickup`, `delivery` — Example: `pickup`
   - `address` JSON NULLABLE — delivery address snapshot. Example: `{ "line1": "1 Orchard Rd", "city": "Singapore", "postal_code": "238882" }`
   - `provider_id` TEXT NULLABLE — external delivery provider id. Example: `grab-001`
   - `provider_name` TEXT NULLABLE — delivery provider name. Example: `Grab`
   - `eta_minutes` INTEGER NULLABLE — estimated minutes until delivery/pickup. Example: `30`
   - `tracking_number` TEXT NULLABLE — provider tracking id. Example: `GRAB123456789`
- `discounts` JSON NULLABLE — array of discount objects applied to the order. See [`discounts` table schema](#discounts-promotions-and-discounts) for base structure. Includes computed fields like `amount_minor` for applied snapshots.
- `total_minor` INTEGER NOT NULL — Example: `2832` (subtotal + tax + service_charge + delivery_fee - discounts)
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
- `CREATE INDEX idx_orders_seat ON orders(seat_id);`

Example row (YAML):

```yaml
id: ord-0001
venue_id: venue-01H0X4ZQ7K8H2A0Q8W1M2N3P4
user_id: user-01H0X4ZQ7K8H2A0Q8W1M2N7
seat_id: seat-001
created_by: user:alice
status: closed
subtotal_minor: 2400
tax_minor: 192
service_charge_minor: 240
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
total_minor: 2832
currency: SGD
items:
  - id: oi-0001
    offering_id: offering-6789
    product_id: prod-0001
    name: Yakitori (3pc)
    unit_price_minor: 800
    quantity: 3
    tax_code: GST
    tax_minor: 192
    total_minor: 2400
    metadata: {}
payment:
  id: user-01H0X4ZQ7K8H2A0Q8W1M2N7
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
- `venue_id` TEXT NOT NULL — FK -> `venues.id` — Example: `venue-01H0X4ZQ7K8H2A0Q8W1M2N3P4`
- `product_id` TEXT NULLABLE — FK -> `products.id` — Example: `prod-0001` (null for venue-wide discounts)
- `offering_id` TEXT NULLABLE — FK -> `offerings.id` — Example: `offering-6789` (null for venue-wide or master-level discounts)
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
- `CREATE INDEX idx_discounts_product ON discounts(product_id);`
- `CREATE INDEX idx_discounts_offering ON discounts(offering_id);`

Example row (YAML):

```yaml
id: disc-001
venue_id: v1b2c3d4-1111-2222-3333-abcde00001
product_id: prod-0001
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
- `product_id` TEXT NULLABLE — FK -> `products.id` — Example: `prod-0001`
- `offering_id` TEXT NULLABLE — FK -> `offerings.id` — Example: `offering-6789`
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
product_id: 01H0X4ZQ7K8H2A0Q8W1M2N4A
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

### `seats` (in-store seating management)
Purpose: Manage seating reservations and occupancy for in-store QR ordering in BBQ/restaurant settings. Supports reservations with payment holds as deposits, occupancy with time limits, multiple orders per seat, and penalty enforcement for violations.

**Note: Audit logging for seat changes will be implemented in a future phase (see TODO: Audit Events System below)**

Use cases:
1. Reserve a seat for a group arriving soon (reservation window with payment deposit).
2. Track when a group arrives and occupies the seat (release deposit on arrival).
3. Enforce time limits on occupancy to free up seats.
4. Allow multiple orders per occupied seat without sharing tables.
5. Apply penalties for overstaying or no-shows (convert deposit to charge).
6. Staff can assign or modify seat status with payment adjustments.
7. Audit seat lifecycle for venue management.

Columns
- `id` — TEXT PK — Example: `seat-001`
- `venue_id` — TEXT FK → `venues.id` — Example: `venue-01H0X4ZQ7K8H2A0Q8W1M2N3P4`
- `label` — TEXT — Example: `"Table 5"` (human-readable seat identifier)
- `status` — TEXT — Enum: `available`, `reserved`, `occupied` — Example: `available`
- `capacity` — INTEGER — Example: `4` (max pax per seat)
- `type` — TEXT (nullable) — Example: `"table"`, `"booth"`, `"bar"` (seat type)
- `section` — TEXT (nullable) — Example: `"indoor"`, `"outdoor"`, `"vip"` (venue section)
- `reserved_at` — INTEGER (nullable) — Timestamp when the reservation starts (begin of reservation window)
- `reserved_until` — INTEGER (nullable) — Timestamp when the reservation ends (end of reservation window)
- `occupied_at` — INTEGER (nullable) — Timestamp when the seat was actually occupied (group arrived)
- `occupied_until` — INTEGER (nullable) — Timestamp when the occupancy ends (time limit)
- `reserved_by` — TEXT (nullable) — Example: `"user:alice"` (who reserved)
- `orders` — JSON — Array of order IDs associated with this seat. Example: `["ord-001", "ord-002"]`
- `staff_id` — TEXT (nullable) — Staff member managing this seat. Example: `"staff:john"`
- `penalty_fee_minor` — INTEGER (nullable) — Deposit/hold amount in minor units (converted to penalty if violated). Example: `1000` (SGD 10.00 deposit)
- `metadata` — JSON (nullable) — Additional data. Example: `{"notes": "VIP reservation"}`
- `created_at` — INTEGER — Example: `1700000000`
- `modified_at` — INTEGER — Example: `1700000100`
- `created_by` — TEXT (nullable) — Example: `"user:alice"`
- `modified_by` — TEXT (nullable) — Example: `"staff:john"`
- `deleted_at` — INTEGER (nullable) — Example: `null`
- `deleted_by` — TEXT (nullable) — Example: `null`


Example row (YAML):

```yaml
# Reserved seat with active deposit hold
id: seat-001
venue_id: v1b2c3d4-1111-2222-3333-abcde00001
label: "Table 5"
status: reserved
capacity: 4
type: table
section: indoor
reserved_at: 1700000000
reserved_until: 1700003600
occupied_at: null
occupied_until: null
reserved_by: user:alice
orders: []
staff_id: null
penalty_fee_minor: 1000  # $10.00 deposit hold on user's card
metadata: {"special_request": "Window seat preferred"}
created_at: 1700000000
modified_at: 1700000000
created_by: system
modified_by: user:alice
```

```yaml
# Occupied seat with deposit released
id: seat-002
venue_id: v1b2c3d4-1111-2222-3333-abcde00001
label: "Bar Counter 3"
status: occupied
capacity: 2
type: bar
section: indoor
reserved_at: null  # Cleared after arrival
reserved_until: null
occupied_at: 1700000500
occupied_until: 1700010500  # 1 hour time limit
reserved_by: null
orders: ["ord-001", "ord-002"]
staff_id: staff:john
penalty_fee_minor: null  # Deposit released on arrival
metadata: {"server": "john", "course": "main"}
created_at: 1699990000
modified_at: 1700000500
created_by: system
modified_by: staff:john
```

---

### `addresses` (reusable addresses)
Purpose: Unified address management for venues (locations), users (profiles), and guests (delivery). Supports geographic queries via lat/lng.

Columns
- `id` TEXT PRIMARY KEY — Unique identifier for the address record. Example: `addr-001`
- `owner_type` TEXT NOT NULL — Type of entity that owns this address. Enum: `venue`, `user`, `guest`. Example: `venue`
- `owner_id` TEXT NOT NULL — ID of the entity that owns this address. Example: `venue-01H0X4ZQ7K8H2A0Q8W1M2N3P4` (venue), `user-01H0X4ZQ7K8H2A0Q8W1M2N7` (user), `guest-01H0X4ZQ7K8H2A0Q8W1M2N8` (guest)
- `type` TEXT NULLABLE — Address purpose. Enum: `business` (venue-only: restaurant location), `delivery` (user/guest-only: food delivery address). Example: `business`
- `line1` TEXT NOT NULL — Primary street address (building number and street name). Example: `1 Orchard Road`
- `line2` TEXT NULLABLE — Secondary address line (apartment, suite, floor). Example: `Unit 123`
- `line3` TEXT NULLABLE — Additional address line (building name, complex). Example: `Orchard Towers`
- `line4` TEXT NULLABLE — Additional address line (district, neighborhood). Example: `Orchard Planning Area`
- `line5` TEXT NULLABLE — Additional address line (landmarks, instructions). Example: `Near Orchard MRT`
- `city` TEXT NOT NULL — City or municipality name. Example: `Singapore`
- `district` TEXT NULLABLE — District or sub-city area. Example: `Orchard`
- `state` TEXT NULLABLE — State, province, or administrative region. Example: `Singapore` (for countries with states)
- `postal_code` TEXT NOT NULL — Postal/ZIP code for mail delivery. Example: `238842`
- `country` TEXT NOT NULL — Country code (ISO 3166-1 alpha-2). Example: `SG`
- `phone` TEXT NULLABLE — Contact phone number for this address (for delivery instructions). Example: `+65 9123 4567`
- `plus_code` TEXT NULLABLE — Google Plus Code (open location code) for human-readable coordinates. Example: `6PH57VP3+PR`
- `latitude` REAL NULLABLE — Geographic latitude coordinate. Example: `1.2931`
- `longitude` REAL NULLABLE — Geographic longitude coordinate. Example: `103.8558`
- `label` TEXT NULLABLE — Human-readable name/tag for this address. Example: `Main Location`, `Home`, `Work`
- `contact_name` TEXT NULLABLE — Contact person name for this address. Example: `John Doe`
- `contact_email` TEXT NULLABLE — Contact email for this address (may differ from owner's main email). Example: `john.doe@company.com`
- `delivery_instructions` TEXT NULLABLE — Special delivery instructions for this address. Example: `Ring doorbell twice, leave at reception`
- `sort_order` INTEGER DEFAULT 0 — Display priority for address ordering (lower numbers = higher priority). 0 = lowest priority, positive numbers = higher priority. Example: `10`
- `created_at` INTEGER NOT NULL — Unix timestamp when the address was created. Example: `1700000000`
- `created_by` TEXT NULLABLE — ID of the user/system that created this address. Example: `user:alice`
- `modified_at` INTEGER NOT NULL — Unix timestamp when the address was last modified. Example: `1700000100`
- `modified_by` TEXT NULLABLE — ID of the user/system that last modified this address. Example: `user:alice`
- `deleted_at` INTEGER NULLABLE — Unix timestamp when the address was soft-deleted (null = not deleted). Example: `1700001000`
- `deleted_by` TEXT NULLABLE — ID of the user/system that soft-deleted this address (null = not deleted). Example: `user:bob`

Indexes & constraints
- `CREATE INDEX idx_addresses_owner ON addresses(owner_type, owner_id);`
- `CREATE INDEX idx_addresses_type ON addresses(type);`
- `CREATE INDEX idx_addresses_city ON addresses(city);`
- `CREATE INDEX idx_addresses_district ON addresses(district);`
- `CREATE INDEX idx_addresses_postal ON addresses(postal_code);`
- `CREATE INDEX idx_addresses_country ON addresses(country);`
- `CREATE INDEX idx_addresses_sort_order ON addresses(owner_type, owner_id, sort_order);`
- `CREATE INDEX idx_addresses_geo ON addresses(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;`

Example row (YAML):

```yaml
# Venue business address
id: addr-001
owner_type: venue
owner_id: venue-01H0X4ZQ7K8H2A0Q8W1M2N3P4
type: business
line1: "1 Orchard Road"
line2: null
line3: "Orchard Towers"
line4: null
line5: null
city: "Singapore"
district: "Orchard"
state: null
postal_code: "238842"
country: "SG"
phone: null
plus_code: "6PH57VP3+PR"
latitude: 1.2931
longitude: 103.8558
timezone: "Asia/Singapore"
label: "Main Location"
contact_name: null
contact_email: null
delivery_instructions: null
business_hours: '[null,["11:00","15:00","17:00","23:00"],null,["11:00","23:00"],null,["11:00","23:00"],null]'
closure_dates: '[["2025-01-01",null],["2025-12-25","10:00","18:00"]]'
sort_order: 100
created_at: 1700000000
created_by: system
modified_at: 1700000100
modified_by: null
deleted_at: null
deleted_by: null
```

```yaml
# Guest delivery address
id: addr-002
owner_type: guest
owner_id: guest-01H0X4ZQ7K8H2A0Q8W1M2N8
type: delivery
line1: "123 Guest Street"
line2: "#05-678"
line3: "Guest Apartments"
line4: "Tampines"
line5: "Near Tampines MRT Exit A"
city: "Singapore"
district: "Tampines"
state: null
postal_code: "123456"
country: "SG"
phone: "+65 9123 4567"
plus_code: "6PH58Q2F+8W"
latitude: 1.3521
longitude: 103.8198
timezone: "Asia/Singapore"
label: "Home"
contact_name: "John Doe"
contact_email: "john.doe@example.com"
delivery_instructions: "Ring doorbell twice"
business_hours: null
closure_dates: null
sort_order: 100
created_at: 1700000000
created_by: user:alice
modified_at: 1700000100
modified_by: user:alice
deleted_at: null
deleted_by: null
```


---

### `roles` (RBAC)
Purpose: basic role-based access control (named roles).

`roles` columns
- `id` TEXT PRIMARY KEY — Unique role identifier. Example: `role-admin`
- `name` TEXT UNIQUE NOT NULL — Human-readable role name. Example: `admin`
- `permissions` JSON NOT NULL DEFAULT '[]' — JSON Array of permission strings. Presence implies `true`. Example: `["users:create", "orders:read"]`
- `scope` TEXT NOT NULL DEFAULT 'own' — Data visibility scope. Values: `own`, `venue`, `system`. Determine which rows are returned. Example: `venue`
- `created_at` INTEGER NOT NULL — Unix timestamp of creation. Example: `1700000000`
- `created_by` TEXT NULLABLE — User ID who created the role. Example: `system`
- `modified_at` INTEGER NOT NULL — Unix timestamp of last modification. Example: `1700000000`
- `modified_by` TEXT NULLABLE — User ID who last modified the role. Example: `user:alice`
- `deleted_at` INTEGER NULLABLE — Soft-delete timestamp. Example: `null`
- `deleted_by` TEXT NULLABLE — User ID who deleted the role. Example: `null`

#### Access Scope Definitions
Permissions follow the format `resource:action`.
- **Resource**: The entity being accessed (e.g., `order`, `user`).
- **Action**: The capability being performed (e.g., `read`, `create`).
- **Scope**: The data visibility filter (e.g., Own, Venue, System).

| Scope | Description | Typical Role | Database Filter Example |
| :--- | :--- | :--- | :--- |
| **Own** | User acts only on their own data. | Guest, Customer | `WHERE owner_id = current_user.id` |
| **Venue** | User acts on all data in their active venue. | Staff | `WHERE venue_id = current_user.venue_id` |
| **System** | User acts on all data globally. | Admin | (No Filter) |

#### How Scope is Applied (Implementation Logic)
When an API request is made, the backend performs two checks:
1. **Permission Check**: Does the user have the `resource:action` flag? (e.g., `order:read`)
2. **Scope Application**: What is the user's role scope? Apply the filter.

**Pseudo-code Example:**
```typescript
export type AccessScope = 'own' | 'venue' | 'system';

/**
 * Applies row-level security filters based on the user's role scope.
 * @param query - The Knex/Kysely query builder instance
 * @param user - The authenticated user object (must contain role.scope and identifying IDs)
 * @param ownerColumn - The column name checking ownership (default: 'user_id')
 */
export function applyScope(query: any, user: any, ownerColumn = 'user_id') {
  const scope = user.role.scope as AccessScope;

  // 1. System Admin: See everything (Global)
  if (scope === 'system') {
    return query; 
  }

  // 2. Venue Staff: See everything in this venue
  if (scope === 'venue') {
    // Assumes the user is linked to a venue and the table has 'venue_id'
    if (!user.venue_id) throw new Error("Venue scope requires user.venue_id");
    return query.where('venue_id', '=', user.venue_id);
  }

  // 3. Customer/Guest: See only their own data
  if (scope === 'own') {
    // Assumes the table tracks ownership via `ownerColumn` (e.g. user_id)
    return query.where(ownerColumn, '=', user.id);
  }
  
  // Default: Safe fallback (return nothing if scope is unknown)
  return query.where('1', '=', '0'); 
}

async function getOrders(user, db) {
  // 1. Permission Check
  if (!user.permissions.includes("order:read")) {
    // Check strict string permission
    throw new Error("Unauthorized: Missing order:read permission");
  }

  // 2. Scope Application
  let query = db.selectFrom("orders");

  // Apply the helper function to filter rows based on 'scope'
  query = applyScope(query, user, 'user_id');

  return await query.execute();
}
```

#### Recommended Permission Flags (String Array)
We use standard granular verbs.

We standardize on the `read`, `create`, `edit`, `delete` order, followed by specialized actions.

**System**
- `sys:monitor` — View system status
- `settings:read` — View global settings
- `settings:edit` — Update global settings

**Venues**
- `venue:read` — View venue details
- `venue:create` — Create venues
- `venue:edit` — Edit venue details
- `venue:delete` — Delete venues

**Users**
- `user:read` — View user profiles
- `user:create` — Create users
- `user:edit` — Edit user details
- `user:delete` — Delete/Ban users

**Roles**
- `role:read` — View roles
- `role:create` — Create roles
- `role:edit` — Edit roles
- `role:delete` — Delete roles

**Catalog**
- `catalog:read` — View products
- `catalog:create` — Create products
- `catalog:edit` — Edit products/prices
- `catalog:delete` — Delete/Archive products

**Orders**
- `order:read` — View orders
- `order:create` — Create/Draft new orders
- `order:edit` — Edit active orders (add/remove items)
- `order:delete` — Delete/Archive orders
- `order:checkout` — Finalize/Place orders
- `order:discount` — Apply manual discounts
- `order:void` — Void orders
- `order:refund` — Refund orders

**Seating**
- `seat:read` — View floor plan/status
- `seat:create` — Create seats/tables
- `seat:edit` — Edit seat properties
- `seat:delete` — Remove seats
- `seat:reserve` — Make a reservation

**Promotions**
- `discount:read` — View available promotions
- `discount:create` — Create promotions
- `discount:edit` — Edit promotion rules
- `discount:delete` — Delete promotions

**Payments**
- `payment:read` — View payment records
- `payment:create` — Process a payment
- `payment:edit` — Edit payment metadata
- `payment:delete` — Delete payment records
- `payment:void` — Void pending payments

**Addresses**
- `address:read` — View addresses
- `address:create` — Create addresses
- `address:edit` — Edit addresses
- `address:delete` — Delete addresses

**Reports**
- `report:read` — View reports
- `report:export` — Export reports

#### Reference: User Types & Default Roles

| User Configuration / Type | Default Role ID | Typical Permissions | Scope / Description |
| :--- | :--- | :--- | :--- |
| **Guest** (Anonymous) | `role-guest` | `["catalog:read", "order:create", "order:checkout", "seat:read", "seat:reserve", "discount:read", "payment:create"]` | Can browse, order, and pay for own session. |
| **Customer** (Signed Up) | `role-user` | `["catalog:read", "order:read", "order:create", "order:checkout", "seat:read", "seat:reserve", "discount:read", "payment:create", "user:read", "user:edit", "address:read", "address:create", "address:edit", "address:delete"]` | Can browse and manage own data (profile, orders, addresses). |
| **Staff** (Employee) | `role-staff` | `["venue:read", "catalog:read", "order:read", "order:edit", "order:discount", "order:void", "payment:read", "seat:edit", "discount:read", "user:read"]` | Can manage all venue resources. |
| **Admin** (Manager/Owner) | `role-admin` | `["*"]` (Wildcard) | Full access. |

Example rows (YAML):

```yaml
# roles
- id: role-admin
  name: admin
  scope: system
  permissions:
    - "*"
  created_at: 1700000000
  modified_at: 1700000000
  created_by: system
  modified_by: null
  deleted_at: null
  deleted_by: null
  
- id: role-staff
  name: staff
  scope: venue
  permissions:
    - venue:read
    - catalog:read
    - order:read
    - order:edit
    - order:discount
    - order:void
    - payment:read
    - seat:edit
    - user:read
  created_at: 1700000000
  modified_at: 1700000000
  created_by: system
  modified_by: null
  deleted_at: null
  deleted_by: null

- id: role-user
  name: user
  scope: own
  permissions:
    - catalog:read
    - order:read
    - order:create
    - order:checkout
    - seat:read
    - seat:reserve
    - discount:read
    - payment:create
    - user:read
    - user:edit
    - address:read
    - address:create
    - address:edit
    - address:delete
  created_at: 1700000000
  modified_at: 1700000000
  created_by: system
  modified_by: null
  deleted_at: null
  deleted_by: null

- id: role-guest
  name: guest
  scope: own
  permissions:
    - catalog:read
    - order:create
    - order:checkout
    - seat:read
    - seat:reserve
    - discount:read
    - payment:create
  created_at: 1700000000
  modified_at: 1700000000
  created_by: system
  modified_by: null
  deleted_at: null
  deleted_by: null
```

---

---

# Architecture Patterns & Implementation Examples

The following sections verify the feasibility of key flows using the schema above.

## Durable Objects (DO) — per-user revocation pattern
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
  ver: number // use integer for simple comparison
  device?: string
  ip?: string
  user_agent?: string
  locale?: string
  remember?: number
  last_seen?: number
  meta?: Record<string, any>
}

interface DOState {
  version: number
  sessions: Record<string, SessionMeta> // Record for JSON serialization support
  last_cleanup_at: number // For lazy garbage collection of expired sessions
}
```

DO methods (sketch):
```ts
class UserSessionDO implements DurableObject {
  private state: DOState;

  // Helper: Centralize version logic
  private isValidVersion(ver: number): boolean {
    return ver === this.state.version;
  }
  
  // Helper: Lazy cleanup of expired sessions
  private cleanupExpired() {
     const now = Date.now();
     // Run only if enough time passed (e.g., 24h) to save CPU
     if (now - this.state.last_cleanup_at < 86400000) return;

     for (const [id, meta] of Object.entries(this.state.sessions)) {
       if (meta.expires_at < now) {
         delete this.state.sessions[id];
       }
     }
     this.state.last_cleanup_at = now;
  }

  async addSession(meta: SessionMeta) {
    this.state.sessions[meta.session_id] = meta
    // write-through: update KV for fast reads
    await SESSIONS_KV.put(`session:${meta.session_id}`, JSON.stringify(meta), {expiration: meta.expires_at})
    await SESSIONS_KV.put(`user:${meta.user_id}:ver`, String(this.state.version))
    await this.saveState()
    await D1.run('INSERT INTO session_audit ...') // Persist audit trail
  }

  async removeSession(session_id: string) {
    const s = this.state.sessions[session_id]
    if (s) delete this.state.sessions[session_id]
    await this.saveState()
    // immediately delete cached KV copy so edges see invalidation
    await SESSIONS_KV.delete(`session:${session_id}`)
    await D1.run('INSERT INTO session_audit ...')
  }

  // Renamed from incrVersion/clearSessions to be more explicit
  async revokeAllSessions() {
    // 1. Bump version (invalidates all old session versions)
    this.state.version++;
    // 2. Clear memory (garbage collection) - technically optional for security but good hygiene
    this.state.sessions = {} 
    
    await this.saveState()
    // write-through KV for fast readers
    await SESSIONS_KV.put(`user:${this.user_id}:ver`, String(this.state.version))
    await D1.run('INSERT INTO session_audit ...')
  }

  async isActiveSession(session_id: string, ver?: number): Promise<{ active: boolean, session?: SessionMeta, currentVersion?: number }> {
    // 0. Occasional cleanup
    this.cleanupExpired();

    // 1. Authoritative check: version match (fastest fail)
    // If ver is provided, must match current DO version
    if (ver !== undefined && !this.isValidVersion(ver)) {
        return { active: false };
    }

    // 2. Session existence check
    const s = this.state.sessions[session_id]
    if (!s) return { active: false }

    // 3. Expiry check
    if (s.expires_at <= Date.now()) return { active: false }

    // Double check internal version consistency (in case session stored has diff version)
    if (!this.isValidVersion(s.ver)) return { active: false }

    return { active: true, session: s, currentVersion: this.state.version }
  }

  async getVersion(): Promise<number> {
    return this.state.version
  }
}
```

### ASCII flow (KV-first, DO authoritative)
```text
            Client (sends cookie: session_id)
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
[KV MISS]       [KV HIT]
   |                 |
   v                 v
+----------------+  read session.user_id & session.ver
| Call userDO.is  |        |
| ActiveSession   |        v
| (session_id)    |  +-------------------------------+
+----------------+  | 2) KV.get(user:{user_id}:ver) |
| DO active ->    |  +-------------------------------+
|   ALLOW (write  |       |
|    to KV)       |       |
| DO inactive ->  |       +-- user_ver === session.ver -> ALLOW (fast path)
|   REJECT        |       |
+----------------+        +-- mismatch/missing -> Call userDO.isActiveSession(session_id, session.ver)
                                | active -> ALLOW (update KV)
                                | inactive -> REJECT + DELETE KV `session:{id}`

Canonical flows (matches examples):
1) KV miss (but cookie sent) -> DO says active -> ALLOW (write to KV so next time is fast)
2) KV hit with user_ver match -> ALLOW (fast, no DO call)
3) KV hit with ver mismatch -> DO: if session active -> ALLOW (update KV); else -> REJECT + DELETE KV


Administrative / logout actions:
- Per-session logout:
  1) userDO.removeSession(session_id)   <-- authoritative delete
  2) Persist audit row to D1
  3) Immediately delete KV `session:{session_id}` (no stale cache)
- Logout-everywhere / revoke-all:
  1) userDO.revokeAllSessions()  <-- authoritative (bumps version + clears sessions)
  2) Persist audit to D1
  3) Rely on ver mismatch to reject (DO writes new `user:{id}:ver` to KV) - this is mathematically equivalent to deleting keys but instantly global.
```

Notes & concerns:
- Deleting KV immediately after DO changes avoids stale reads on edges.
- DO state is small and authoritative; periodic cleanup handles expired sessions.
- On auth check: read session from KV (fast), then call `userDO.isActiveSession` only if needed.

Pros ✅
- Near-immediate revocation (KV propagation speed ~seconds).
- Reliable strong consistency option available (bypassing KV if needed).
- No external provider required — fits full CF stack (KV + DO + D1 for audit).
- Simple API for admins and edges.

Cons ⚠️
- DOs serialize requests per instance — for extremely hot users there may be contention. If you expect heavy concurrent operations for the same user, shard DO state (user:{id}:shardN) or offload hot counters to D1/Redis.
- DO memory limits; keep per-user state tiny (int + small set with TTL).
- Extra DO call per auth check (low latency, but additional hop).

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
await userDO.revokeAllSessions(); 
// DO internally handles version bump, clearing sessions, and KV write-through
```

Policy: logout behavior and safe actions
- **Default logout (recommended UX):** clear only the current session — implement by calling `userDO.removeSession(session_id)`, writing an audit row to D1, and **delete the KV session key immediately**.
- **Logout everywhere / security event:** invalidate all sessions by calling `userDO.revokeAllSessions()`.

Safe write order (summary):
1. Update authoritative DO (revokeSession or revokeAllSessions).
2. Persist audit to D1 (who/when/reason).
3. Optionally delete KV session keys (or let them expire).

Notes:
- Keep DO state small and persist revocation events to D1 for durability and listing.
- Use DO per-user — DO per-session is generally overkill and can exhaust DO instances.

Listing & admin operations
- **Real-time (Active):** Call the DO directly (e.g., `userDO.getSessions()`) to view technically active sessions. Since the DO is per-user, this is fast and strictly consistent.
- **Historical (Audit):** Query the `session_audit` table in D1 to see login history and revocation events.
- **Anti-pattern:** Do not maintain a "list of sessions" in KV. It is redundant, hard to keep in sync, and unnecessary given the DO's authoritative state.

Example KV value (expanded JSON):

```json
{
  "user_id":"user-01H0X4ZQ7K8H2A0Q8W1M2N7",
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
- Use `expiration` (absolute timestamp) in KV to match `session.expires_at`. Do not use `expirationTtl` to avoid extending cache beyond valid session life.
- Implement revocation via versioning.
- Write compact audit rows to D1 when sessions are created/revoked for traceability.

### Expiration Strategy & Recommendations

**KV Cache vs. Session Life**
- **CRITICAL:** Always use `expiration` (absolute timestamp) when writing to KV, never `expirationTtl`.
  - *Risk:* If a session expires at 10:00 PM, and you write to KV at 9:55 PM with `expirationTtl: 3600` (1 hour), the KV key remains alive until 10:55 PM. This creates a 55-minute window where a "dead" session effectively persists in the cache.
  - *Fix:* `KV.put(key, value, { expiration: session.expires_at })`. This ensures the cache key vanishes exactly when the session dies.

**Recommended Session Durations**
- **Standard Web App (SaaS, Commerce):** 7 to 30 days. Prioritize UX and reducing login friction.
- **High-Security (Banking, Admin):** 15 to 30 minutes (sliding window).
  - *Sliding window:* The expiration timer resets on every user action (e.g., navigation, API call). If the timeout is set to 15 minutes, the user is logged out only if they are inactive for the full 15 minutes. This contrasts with a *fixed* expiration, which would force a logout regardless of activity.
- **Mobile App:** Long-lived refresh token (infinite/year) + short-lived access token (1 hour).

## Guest checkout (anonymous)
Policy: Reuse the `users` table for guests to unify identity management. This avoids duplicate fields in `orders` and simplifies address/history association if they register later.

**Guest User Schema (Annotated `users` row)**

Guests are stored in the main `users` table to unify identity management.

**User Table Columns (Guest Configuration):**

- `id`: *Generate Link* (ULID/UUID).
- `email`: **`NULL`** (unless you captured it via a "Email me my receipt" flow).
- `role_id`: **`role-guest`** (A restricted role with 0 permissions).
- `password_hash`: **`NULL`** (Guests cannot login).
- `first_name`: **`NULL`** (or captured name).
- `last_name`: **`NULL`** (or captured name).
- `phone`: **`NULL`** (or captured phone).
- `default_delivery_address_id`: **`NULL`**.
- `status`: `'active'` (They are active users, just with a specific role).
- `email_verified`: `0`.
- `first_login`: **`NULL`**.
- `last_login`: **`NULL`**.
- `metadata`: `{ "is_guest": true }` (Optional flag for easier filtering).
- `created_at`: *Timestamp*.
- `modified_at`: *Timestamp*.
- `created_by`: `'system'` (or generic app user).
- `modified_by`: `'system'`.
- `deleted_at`: **`NULL`**.
- `deleted_by`: **`NULL`**.

**Address Handling:**
- Do **not** create a row in the `addresses` table for one-off guest deliveries.
- Store the delivery details efficiently in the `orders.delivery` JSON snapshot.
- *Reason:* Keeps the global address book clean. Convert to an `addresses` row only if the guest converts to a full account.

**Key Changes:**
- `orders` table: `user_id` should now point to this guest user row (typically generated at checkout start).
- `orders` table: `guest_email` and `guest_name` fields are **not needed** on the order itself, as they are stored on the linked user row.

**Account Promotion (Guest → Full User):**
When a guest decides to sign up, use their **Email** or **Phone** as the unique identifier.
1. **Lookup:** Check `users` table for this email/phone.
2. **Match (Guest):** If found and `role_id` is `role-guest` -> **Update** this row (promote): set `password_hash`, change `role` to `role-user` (the default for signed-up customers), verify status.
   - **Why this works:** The `users.id` (PK) remains unchanged. Since existing `orders` are already linked to this `user_id`, the user effectively "inherits" their entire guest history instantly upon registration.
3. **Match (Full User):** If found and is a standard user -> **Reject** (or require login). You cannot overwrite a full account. 
4. **No Match:** Create new user with `role-user`.

**Example guest order (YAML):**

```yaml
id: ord-guest-0001
venue_id: v1b2c3d4-1111-2222-3333-abcde00001
user_id: user-guest-01H0X4ZQ...  # Points to the guest user row
seat_id: null
created_by: null
status: closed
subtotal_minor: 1299
tax_minor: 104
items:
  - id: oi-001
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

## Provisional orders & DO coordination
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
- To render a venue menu: SELECT COALESCE(offerings.name, products.name) as name, ... FROM offerings JOIN products ON offerings.product_id = products.id WHERE venue_id = ? AND status IN ('active', 'sold_out') AND (effective_from IS NULL OR effective_from <= now) AND (effective_to IS NULL OR effective_to >= now) ORDER BY name;
- On order creation: store `items.product_id` (required), `items.offering_id` (nullable), and snapshot `price_minor`, `tax_code`, `item_name`; prefer resolving price/tax via `prices` when `offering_id` is present.

---

## Linkages
- See `docs/scenario-stories.md` for story-driven usage examples and customer flows.

**Consistency note:** Use `created_at` and `modified_at` across tables as the canonical timestamps (INTEGER seconds since epoch). Store local reconstructions (`created_at_local`, `created_at_offset_minutes`) only for display/audit when needed; always compute and compare times in UTC. Also include `created_by`, `modified_by`, `deleted_at`, and `deleted_by` for auditing.

---


Created as a reference for the Phase 0 schema and product modeling (master + offering) — I can add more tables (invoices, refunds, seats) if you want the full schema documented next.
