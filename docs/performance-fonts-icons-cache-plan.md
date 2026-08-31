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

## Problem 1 — Fonts: `@fontsource-variable/open-sans` + manual update flow (not per deploy)

## Goal

- Remove render-blocking Google Fonts request chain.
- Keep font updates manual and controlled.
- Avoid “download fonts every deployment”.

## Recommendation

Use `@fontsource-variable/open-sans` as the default source of font files.

- Fonts are bundled/served from your own app origin (no Google Fonts runtime request chain).
- No font download step on every deployment.
- Update only when you intentionally bump the package version.

### Install command

This repo is Deno-first, so install via Deno:

```bash
deno install npm:@fontsource-variable/open-sans
```

If you are outside this repo's Deno workflow, the npm equivalent is:

```bash
npm install @fontsource-variable/open-sans
```

### Update options (manual trigger only)

### Option A (recommended): package bump only

- Keep `@fontsource-variable/open-sans` pinned in `package.json`.
- Manual update = bump package version intentionally.
- No per-deployment font-fetch script required.

### Option B: manual script trigger (optional)

- Add a script like `scripts/update-fonts.ts` only if you want custom control.
- Trigger it manually via `deno task fonts:update`
- Script behavior:
  1. Fetch selected Open Sans file(s)
  2. Write to `public/fonts`
  3. Optionally update a small manifest/version constant
  4. Do **not** run automatically in build/deploy

### Option C: direct committed `.woff2` files (fallback)

- Download Open Sans `.woff2` files manually and commit under `public/fonts`.
- Still update only when needed.
- Useful if you want zero dependency on `@fontsource*`.

## Implementation steps

1. Add dependency: `@fontsource-variable/open-sans`.
2. Import once in `app/root.tsx` (top-level side-effect import):
   ```ts
   import '@fontsource-variable/open-sans';
   ```
3. Preload the primary Open Sans `.woff2` file in `app/root.tsx` `links()`:
   ```ts
   import openSansPrimaryWoff2
     from '@fontsource-variable/open-sans/files/open-sans-latin-wght-normal.woff2?url';

   export const links = () => [
     {
       as: 'font',
       crossOrigin: 'anonymous',
       href: openSansPrimaryWoff2,
       rel: 'preload',
       type: 'font/woff2',
     },
   ];
   ```
   - Use the exact `.woff2` filename that matches your chosen subset/axis in `@fontsource-variable/open-sans/files`.
   - Vite will fingerprint/hash this emitted asset in production.
4. Remove Google font links from `links()` in `app/root.tsx`:
   - `fonts.googleapis.com` preconnect
   - `fonts.gstatic.com` preconnect
   - Google stylesheet URL
5. Update global font stack in `app/app.styles.ts`:
   - from: `'Inter', sans-serif`
   - to: `'Open Sans Variable', 'Open Sans', sans-serif`
6. Keep `font-display: swap` (Fontsource already ships with this default verify generated CSS if needed).
7. Validate CLS and render-blocking reduction in Lighthouse.

### How to use `@fontsource-variable/open-sans` in this app

- Import it once in `app/root.tsx` so every route has font-face definitions.
- Add a manual preload entry for the primary above-the-fold `.woff2` file in `links()`.
- Do not import it repeatedly in route files.
- Keep typography usage in StyleX (`fontFamily`) as usual.

---

## Problem 2 — Iconify imports: move out of root critical path

## Goal

- Prevent icon package/CSS from loading in the initial app shell when a page does not need it.

## Recommendation

- **Do not import Iconify icons from `app/root.tsx`.**
- Import Iconify only in route/component modules that render those icons.
- Prefer `@loadable/component` for code-splitting over `React.lazy`.

## Concrete approach

1. In `app/root.tsx` ErrorBoundary, replace Iconify usage with:
   - inline SVG icons, or
   - tiny local icon components that do not depend on Iconify package.
2. Keep Iconify imports in route-level pages where needed (`home`, `about`, etc.).
3. If needed, split icon exports by feature:
   - `app/icons/home-icons.ts`
   - `app/icons/about-icons.ts`
   - avoid a single root-level “export all icons” dependency.
4. Optional: lazy-load large icon-heavy UI sections with `@loadable/component`.

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

### Hashed assets (`/assets/*`)

Use long cache (safe because filename changes on content changes):

- Browser: `max-age=604800` (7 days) or `2592000` (30 days)
- CDN: `s-maxage=31536000` (1 year)
- Keep `immutable`
- Keep `stale-while-revalidate` (e.g. `86400`)

### Non-hashed JS/CSS (`/*.js`, `/*.css`)

Use short browser cache + longer CDN cache:

- Browser: `max-age=300` to `1800` (5–30 minutes)
- CDN: `s-maxage=86400` (1 day) or `21600` (6 hours)
- `stale-while-revalidate` optional
- **No `immutable`**

### Fonts (`/*.woff2`)

If filenames are versioned:

- Browser: medium-long (`max-age=604800` or higher)
- CDN: long (`s-maxage=31536000`)
- `immutable` allowed

If filenames are not versioned:

- Browser: shorter
- no `immutable`

### Suggested concrete header values for this repo

- Hashed assets (`/assets/*`): long browser + long CDN
  - `Cache-Control: public, max-age=604800, s-maxage=31536000, stale-while-revalidate=86400, immutable`
- Non-hashed JS/CSS (`/*.js`, `/*.css`): short browser + longer CDN
  - `Cache-Control: public, max-age=900, s-maxage=86400, stale-while-revalidate=300, must-revalidate`
- Non-hashed HTML routes: short browser + short/medium CDN
  - keep existing route-level HTML policy style (`must-revalidate`)

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
