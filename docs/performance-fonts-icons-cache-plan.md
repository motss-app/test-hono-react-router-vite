# Performance Plan: Fonts, Icon Imports, and Cache-Control

This plan addresses these 3 problems:

1. **How to self-host fonts without re-downloading on every deployment**
2. **Where Iconify icons should be imported so they do not bloat critical path**
3. **How to tune cache-control so hashed assets cache longer, non-hashed shorter in browsers**

---

## Current State (from repo)

- `app/root.tsx` loads Inter via:
  - `https://fonts.googleapis.com` preconnect
  - `https://fonts.gstatic.com` preconnect
  - Google Fonts stylesheet URL with `display=swap`
- `app/root.tsx` imports Iconify icons for ErrorBoundary (`IconArrowLeft`, `IconBug`, `IconExclamationTriangle`), making icon-related assets part of the root app shell.
- Cache headers currently:
  - `headers/_headers.canary`
    - `/assets/*`: `max-age=86400`, `s-maxage=31536000`, `immutable`
    - `/*.css` + `/*.js`: `max-age=900`, `s-maxage=3600`
  - `headers/_headers.production`
    - `/assets/*`: `max-age=604800`, `s-maxage=315360000`, `immutable`
    - `/*.css` + `/*.js`: `max-age=1800`, `s-maxage=10800`

---

## Problem 1 — Fonts: Self-host + Manual update flow (not per deploy)

## Goal

- Remove render-blocking Google Fonts request chain.
- Keep font updates manual and controlled.
- Avoid “download fonts every deployment”.

## Recommendation

Use **committed local font files** as default strategy:

- Put Inter files in `public/fonts/`
- Serve locally from your domain
- Update only when needed

### Update options (manual trigger only)

### Option A (simple, no automation)

- Download Inter `.woff2` files manually from Google Fonts / helper site.
- Commit files to `public/fonts`.
- Rename with a version suffix when updating (example: `inter-latin-var-v4.woff2`).

### Option B (manual script trigger, recommended for repeatability)

- Add a script like `scripts/update-fonts.ts`
- Trigger it manually via `deno task fonts:update`
- Script behavior:
  1. Fetch selected Inter file(s)
  2. Write to `public/fonts`
  3. Optionally update a small manifest/version constant
  4. Do **not** run automatically in build/deploy

### Option C (use npm source package, still manual)

- Use `@fontsource/inter` as source files
- Manual update = bump package version intentionally
- Optional copy step from `node_modules` to `public/fonts`
- Still not required at deploy time

## Implementation steps

1. Add `public/fonts/inter-latin-var-v1.woff2` (and any needed subsets).
2. Replace Google stylesheet usage in `app/root.tsx` with local preload + local `@font-face`.
3. Keep `font-display: swap`.
4. Add font metric overrides in `@font-face`:
   - `size-adjust`
   - `ascent-override`
   - `descent-override`
   - `line-gap-override`
5. Keep existing app font stack as fallback (`'Inter', sans-serif`).
6. Validate CLS and render-blocking reduction in Lighthouse.

---

## Problem 2 — Iconify imports: move out of root critical path

## Goal

- Prevent icon package/CSS from loading in the initial app shell when a page does not need it.

## Recommendation

- **Do not import Iconify icons from `app/root.tsx`.**
- Import Iconify only in route/component modules that render those icons.

## Concrete approach

1. In `app/root.tsx` ErrorBoundary, replace Iconify usage with:
   - inline SVG icons, or
   - tiny local icon components that do not depend on Iconify package.
2. Keep Iconify imports in route-level pages where needed (`home`, `about`, etc.).
3. If needed, split icon exports by feature:
   - `app/icons/home-icons.ts`
   - `app/icons/about-icons.ts`
   - avoid a single root-level “export all icons” dependency.
4. Optional: lazy-load large icon-heavy UI sections with `React.lazy`.

## Expected outcome

- `/hono-rpc` no longer pays icon bundle/icon CSS cost at first paint.
- Smaller critical request chain for non-icon pages.

---

## Problem 3 — Cache policy: hashed long, non-hashed short in browser

## Goal

- Keep browser invalidation easy for non-hashed files.
- Keep CDN caching aggressive.
- Preserve long cache for hashed assets.

## Proposed policy

### 1) Hashed assets (`/assets/*`)

Use long cache (safe because filename changes on content changes):

- Browser: `max-age=604800` (7 days) or `2592000` (30 days)
- CDN: `s-maxage=31536000` (1 year)
- Keep `immutable`
- Keep `stale-while-revalidate` (e.g. `86400`)

### 2) Non-hashed JS/CSS (`/*.js`, `/*.css`)

Use short browser cache + longer CDN cache:

- Browser: `max-age=300` to `1800` (5–30 minutes)
- CDN: `s-maxage=86400` (1 day) or `21600` (6 hours)
- `stale-while-revalidate` optional
- **No `immutable`**

### 3) Fonts (`/*.woff2`)

If filenames are versioned (`inter-...-v1.woff2`):

- Browser: medium-long (`max-age=604800` or higher)
- CDN: long (`s-maxage=31536000`)
- `immutable` allowed

If filenames are not versioned:

- Browser: shorter
- no `immutable`

---

## Rollout order

1. Font self-host migration (remove Google CSS dependency).
2. Root icon decoupling (`root.tsx` no Iconify imports).
3. Cache header tuning in both:
   - `headers/_headers.canary`
   - `headers/_headers.production`
4. Verify with:
   - `deno task check`
   - `deno task build`
   - Lighthouse run in clean profile (no extension noise)

---

## Validation checklist

- [ ] No Google Fonts stylesheet request in network waterfall.
- [ ] `fonts.gstatic.com` request removed (unless intentionally still used).
- [ ] Root route without icons does not load icon chunk/CSS eagerly.
- [ ] Hashed assets receive long cache headers.
- [ ] Non-hashed assets receive short browser cache headers.
- [ ] Lighthouse render-blocking insight improved.
- [ ] CLS remains low after font swap (metric overrides verified).

