# Plan: Integrate Paraglide JS + ICU + i18nexus

> Issue: [#14 — feat: integrate i18nexus](https://github.com/motss-app/test-hono-react-router-vite/issues/14)
>
> Branch: `feat/integrate-i18nexus`

## Overview

Add i18n support using:
- **Paraglide JS** (`@inlang/paraglide-js`) — compiler-based, tree-shakable, type-safe i18n library
- **ICU MessageFormat v1** — via `@inlang/plugin-icu1` for proper pluralization, select, and formatting
- **i18nexus** — as the translation management system (TMS), pulled via REST API or CLI
- **In-URL locale routing** — `/en-US/about`, `/ja-JP/about` using Paraglide's built-in URL strategy

### Rendering Architecture

| Mode | Routes | Locale Handling |
|------|--------|-----------------|
| **SSG** (default) | `/`, `/about`, `/holy-grail`, `/errors` | Prerendered per locale at build time |
| **SSR** (explicit) | `/ssr`, `/hono-rpc`, `/errors/:code` | Locale detected via middleware per-request |

## Architecture

```
+---------------------------+
|  i18nexus Dashboard (TMS) |
+---------------------------+
        |           |
        |  REST API |  CLI (@i18nexus/cli)
        |           |
        v           v
  messages/{locale}.json          <-- ICU MessageFormat v1
        |
        v
  Paraglide JS Compiler + @inlang/plugin-icu1
        |
        v
  app/paraglide/                  <-- generated, do not edit
    messages.js   (m.greeting(), m.items_in_cart(), ...)
    runtime.js    (getLocale, setLocale, overwriteGetLocale)
    server.js     (paraglideMiddleware)
        |
        +---------------------------------------------+
        |                       |                      |
        v                       v                      v
  +-----------+          +-----------+          +-----------+
  |   Hono    |          |  React    |          |  Client   |
  |  Worker   |          |  Router   |          |   App     |
  | (server)  |          |   SSR     |          | (browser) |
  +-----------+          +-----------+          +-----------+
  paraglide               overwriteGetLocale    m.greeting()
  Middleware               from URL params       setLocale()
```

---

## Step 1: Install Dependencies ✅

```bash
# Paraglide JS (includes Vite plugin)
deno add npm:@inlang/paraglide-js@2.20.2

# ICU MessageFormat v1 plugin for Paraglide
deno add npm:@inlang/plugin-icu1@1.1.0

# Message lint rules
deno add npm:@inlang/message-lint-rule-empty-pattern@1.4.8
deno add npm:@inlang/message-lint-rule-missing-translation@1.4.8

# i18nexus CLI for local dev workflow
deno add npm:@i18nexus/cli@5.1.1

# intl-messageformat (ICU runtime — used by Paraglide's ICU plugin output)
deno add npm:intl-messageformat@11.2.9
```

---

## Step 2: Initialize Paraglide Project

Run the init command from the repo root:

```bash
npx @inlang/paraglide-js@latest init
```

This creates:
- `project.inlang/settings.json` — Paraglide project config
- `messages/en-US.json` — base language translations (empty to start)

### Configure ICU Plugin

Edit `project.inlang/settings.json`:

```jsonc
{
  "$schema": "https://inlang.com/schema/project-settings",
  "modules": [
    "https://cdn.jsdelivr.net/npm/@inlang/plugin-icu1@latest/dist/index.js",
    "https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-empty-pattern@latest/dist/index.js",
    "https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-missing-translation@latest/dist/index.js",
    "https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-invalid-variablename@latest/dist/index.js",
    "https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-missing-key@latest/dist/index.js"
  ],
  "plugin.inlang.icu-messageformat-1": {
    "pathPattern": "./messages/{locale}.json"
  },
  "sourceLanguageTag": "en-US",
  "languageTags": ["en-US", "ja-JP"]
}
```

> **Note:** Start with `en-US` and `ja-JP` as the initial locale pair. Add more languages via the i18nexus dashboard later.

### Create Initial Translation Files

```bash
mkdir -p messages
```

`messages/en-US.json`:
```json
{
  "greeting": "Hello {name}!",
  "nav_home": "Home",
  "nav_about": "About",
  "items_in_cart": "{count, plural, =0 {No items} one {# item} other {# items}}",
  "welcome_message": "Welcome to our app!"
}
```

`messages/ja-JP.json`:
```json
{
  "greeting": "こんにちは {name}！",
  "nav_home": "ホーム",
  "nav_about": "について",
  "items_in_cart": "{count, plural, =0 {アイテムなし} other {# 個のアイテム}}",
  "welcome_message": "アプリへようこそ！"
}
```

---

## Step 3: Configure Paraglide in Vite

### 3a: Dev Vite Config (`packages/frontend/vite.config.ts`)

Add `paraglideVitePlugin` to the plugins array:

```diff
 import { cloudflare } from '@cloudflare/vite-plugin';
 import { reactRouter } from '@react-router/dev/vite';
+import { paraglideVitePlugin } from '@inlang/paraglide-js';
 import { sentryReactRouter } from '@sentry/react-router';
 import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
 import { defineConfig, type UserConfig } from 'vite';

 // ...

 plugins: [
   ...(isDev
     ? [
         cloudflare({ /* ... */ }),
         themeBuildPlugin({ /* ... */ }),
         vanillaExtractPlugin(),
         veCssTextPlugin(),
         vanillaExtractSsrFixPlugin(),
+        paraglideVitePlugin({
+          project: './project.inlang',
+          outdir: './packages/frontend/app/paraglide',
+          strategy: ['url', 'cookie', 'preferredLanguage', 'baseLocale'],
+        }),
         reactRouter(),
         ...sentryPlugins,
       ]
     : []),
 ],
```

### 3b: Production React Router Build (`packages/frontend/vite.react-router.config.ts`)

Add the same plugin:

```diff
+import { paraglideVitePlugin } from '@inlang/paraglide-js';

 // In the plugins array (non-dev):
 plugins: isDev
   ? []
   : [
       themeBuildPlugin({ /* ... */ }),
       vanillaExtractPlugin({ /* ... */ }),
       veCssTextPlugin(),
+      paraglideVitePlugin({
+        project: './project.inlang',
+        outdir: './packages/frontend/app/paraglide',
+        strategy: ['url', 'cookie', 'preferredLanguage', 'baseLocale'],
+      }),
       reactRouter(),
       // ...
     ],
```

### 3c: Worker Build (`packages/frontend/vite.worker.config.ts`)

No changes needed — the worker bundle doesn't import Paraglide directly. The SSR handler imports the server build, which already includes Paraglide.

---

## Step 4: Enable React Router Middleware

React Router v8 has built-in middleware support — no config flag needed.

> **Note:** Middleware runs for **SSR pages** only. SSG pages are prerendered HTML served from Cloudflare Workers Assets — no middleware executes at request time.

### 4a: `packages/frontend/react-router.config.ts`

No changes needed — middleware is built-in in RR8.

### 4b: `packages/frontend/app/root.tsx` — Add Paraglide Middleware

```diff
+import { paraglideMiddleware } from './paraglide/server.js';
+import type { MiddlewareFunction } from 'react-router';
+
+export const middleware: MiddlewareFunction[] = [
+  (ctx, next) => paraglideMiddleware(ctx.request, () => next()),
+];
```

### 4c: `packages/frontend/app/routes.ts` — Add `:locale?` Prefix

```diff
 import { index, type RouteConfig, route, prefix } from '@react-router/dev/routes';

 export default [
-  index('./routes/home.tsx'),
-  route('/about', './routes/about.tsx'),
-  route('/holy-grail', './routes/holy-grail.tsx'),
-  route('/ssr', './routes/ssr.tsx'),
-  route('/hono-rpc', './routes/hono-rpc.tsx'),
-  route('/errors', './routes/errors.tsx'),
-  route('/errors/:code', './routes/errors.$code.tsx'),
-  route('*', './routes/$.tsx'),
+  ...prefix(':locale?', [
+    index('./routes/home.tsx'),
+    route('/about', './routes/about.tsx'),
+    route('/holy-grail', './routes/holy-grail.tsx'),
+    route('/ssr', './routes/ssr.tsx'),
+    route('/hono-rpc', './routes/hono-rpc.tsx'),
+    route('/errors', './routes/errors.tsx'),
+    route('/errors/:code', './routes/errors.$code.tsx'),
+    route('*', './routes/$.tsx'),
+  ]),
 ] satisfies RouteConfig;
```

---

## Step 5: Wire Paraglide into the Hono Server Layer

The Hono server (`worker.ts`) catches all requests and delegates to React Router. The flow differs for SSG vs SSR:

| Request Type | Hono Behavior |
|-------------|---------------|
| **Static assets** (`/assets/*`) | Served via `c.env.ASSETS.fetch()` — no Paraglide involvement |
| **SSG pages** (`/en-US/about`) | Cloudflare Workers Assets serves prerendered HTML — no Paraglide middleware runs |
| **SSR pages** (`/en-US/ssr`) | React Router middleware → Paraglide `paraglideMiddleware()` → loader → render |

### 5a: `packages/frontend/worker.ts`

For **SSR pages**, Paraglide's middleware runs inside React Router's middleware system (defined in `root.tsx`). No changes are needed to the Hono handler.

For **SSG pages**, the HTML is already prerendered and served from Cloudflare Workers Assets — Paraglide is not involved at request time.

---

## Step 6: Update Root Layout for Locale-Awareness

The `<html lang>` attribute must reflect the active locale. This works for both SSG and SSR:

- **SSG pages**: `getLocale()` returns the locale from the URL segment at build time (e.g., `/en-US/about` → `en-US`)
- **SSR pages**: `getLocale()` returns the locale detected by `paraglideMiddleware()` per-request

### 6a: `packages/frontend/app/root.tsx`

Update the `<html>` tag to use the active locale:

```diff
-import type { JSX, PropsWithChildren } from 'react';
+import type { JSX, PropsWithChildren } from 'react';
+import { getLocale } from './paraglide/runtime.js';

 export function Layout({ children }: PropsWithChildren): JSX.Element {
   const rootLoaderData = useRouteLoaderData<typeof loader>('root');
   const cspNonce = rootLoaderData?.cspNonce ?? undefined;

   return (
     <html
-      lang="en"
+      lang={getLocale()}
       suppressHydrationWarning
     >
       {/* ... */}
     </html>
   );
 }
```

---

## Step 7: Create a Language Switcher Component

### `packages/frontend/app/components/language-switcher.tsx`

```tsx
import { getLocale, setLocale, type Locale } from '../paraglide/runtime.js';

const LOCALE_LABELS: Record<Locale, string> = {
  'en-US': 'English (US)',
  'ja-JP': '日本語',
};

export function LanguageSwitcher() {
  const currentLocale = getLocale();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const newLocale = event.target.value as Locale;
    setLocale(newLocale);
    // setLocale() reloads the page by default
  }

  return (
    <select value={currentLocale} onChange={handleChange}>
      {(Object.keys(LOCALE_LABELS) as Locale[]).map((locale) => (
        <option key={locale} value={locale}>
          {LOCALE_LABELS[locale]}
        </option>
      ))}
    </select>
  );
}
```

---

## Step 8: Update Existing Route Components

Replace hardcoded strings with Paraglide message functions. The `m.*()` functions work identically for SSG and SSR:

- **SSG pages**: Message functions compile to static strings at build time
- **SSR pages**: Message functions resolve to the active locale per-request

### Example: `packages/frontend/app/routes/home.tsx` (SSG)

```diff
+import { m } from '../paraglide/messages.js';
+import { LanguageSwitcher } from '../components/language-switcher.js';

 export default function Home() {
   return (
     <div>
-      <h1>Welcome to our app!</h1>
+      <h1>{m.welcome_message()}</h1>
+      <p>{m.greeting({ name: 'World' })}</p>
+      <LanguageSwitcher />
     </div>
   );
 }
```

### Example: Navigation links

```tsx
import { m } from '../paraglide/messages.js';
import { localizeHref } from '../paraglide/runtime.js';

// In a nav component:
<Link to={localizeHref('/')}>{m.nav_home()}</Link>
<Link to={localizeHref('/about')}>{m.nav_about()}</Link>
```

---

## Step 9: Set Up i18nexus Integration

### 9a: Create i18nexus Project

1. Sign up at [app.i18nexus.com/sign-up](https://app.i18nexus.com/sign-up)
2. Create a new project with library set to **i18next** (Paraglide's ICU plugin reads the same JSON structure)
3. Add source language: `en`
4. Add target language: `ja`
5. Note the **API Key** from project settings

### 9b: Configure `.env` for i18nexus

Add to `.env.local` (and `.env.canary`, `.env.production`):

```bash
I18NEXUS_API_KEY=your_api_key_here
```

### 9c: Create a Pull Script

`scripts/pull-translations.ts`:

```typescript
/**
 * Pulls translations from i18nexus and writes them to messages/{locale}.json
 * for Paraglide to compile.
 *
 * Usage:
 *   deno run -A scripts/pull-translations.ts
 */

const API_KEY = Deno.env.get('I18NEXUS_API_KEY');

if (!API_KEY) {
  throw new Error('I18NEXUS_API_KEY is not set in environment');
}

const BASE_URL = 'https://api.i18nexus.com/project_resources';

interface Language {
  full_code: string;
  language_code: string;
  country_code: string | null;
  base_language: boolean;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(`${url}?api_key=${API_KEY}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

async function pullTranslations(): Promise<void> {
  // Fetch project languages
  const languagesResponse = await fetchJson<{ collection: Language[] }>(
    `${BASE_URL}/languages.json`
  );
  const languages = languagesResponse.collection;

  console.log(`Found ${languages.length} languages:`, languages.map((l) => l.full_code));

  // Fetch all translations at once
  const translationsResponse = await fetchJson<Record<string, Record<string, Record<string, string>>>>(
    `${BASE_URL}/translations.json`
  );

  // Write each language to its own file
  for (const lang of languages) {
    const langCode = lang.full_code;

    if (langCode in translationsResponse) {
      // i18nexus may return namespaced translations; flatten if single namespace
      const langTranslations = translationsResponse[langCode];
      const namespaces = Object.keys(langTranslations);

      let flatTranslations: Record<string, string>;

      if (namespaces.length === 1) {
        // Single namespace: use directly
        flatTranslations = langTranslations[namespaces[0]] ?? {};
      } else {
        // Multiple namespaces: flatten with dots
        flatTranslations = {};
        for (const ns of namespaces) {
          const nsTranslations = langTranslations[ns] ?? {};
          for (const [key, value] of Object.entries(nsTranslations)) {
            flatTranslations[ns === 'default' ? key : `${ns}.${key}`] = value;
          }
        }
      }

      const outputPath = new URL(`../messages/${langCode}.json`, import.meta.url);
      await Deno.writeTextFile(
        outputPath,
        JSON.stringify(flatTranslations, null, 2) + '\n'
      );
      console.log(`Written: messages/${langCode}.json (${Object.keys(flatTranslations).length} keys)`);
    }
  }

  console.log('Done! Paraglide will recompile on next build/dev.');
}

await pullTranslations();
```

### 9d: Add Deno Task

Add to root `deno.json`:

```jsonc
"tasks": {
  // ... existing
  "pull:i18n": "deno run -A scripts/pull-translations.ts",
}
```

### 9e: i18nexus CLI (Alternative)

Install and configure the CLI:

```bash
deno add npm:@i18nexus/cli
```

Create `.i18nexusrc.json` in repo root:

```json
{
  "project_id": "your_project_id",
  "output_dir": "./messages"
}
```

Pull translations via CLI:

```bash
npx @i18nexus/cli pull
```

---

## Step 10: Configure `routeStrategies` for Non-Localized Routes

Some routes should not use URL-based locale detection. Add `routeStrategies` to the Paraglide compiler config:

```diff
 paraglideVitePlugin({
   project: './project.inlang',
   outdir: './packages/frontend/app/paraglide',
   strategy: ['url', 'cookie', 'preferredLanguage', 'baseLocale'],
+  routeStrategies: [
+    { match: '/hono-rpc/:path(.*)?', strategy: ['cookie', 'baseLocale'] },
+    { match: '/api/:path(.*)?', exclude: true },
+    { match: '/assets/:path(.*)?', exclude: true },
+    { match: '/healthz', exclude: true },
+  ],
 }),
```

---

## Step 11: Handle CSP and Nonce for Paraglide

### SSG Pages

No CSP concerns — prerendered HTML is served from Cloudflare Workers Assets. The `lang` attribute is baked in at build time.

### SSR Pages

Paraglide's `overwriteGetLocale` on the server uses `AsyncLocalStorage`. Since the project runs on Cloudflare Workers (which don't have Node.js `AsyncLocalStorage`), use the `paraglideMiddleware()` approach which works with Web Standard `Request` objects.

Verify that the CSP policy allows the Paraglide runtime script if any dynamic loading is involved. Since Paraglide compiles to static ESM, no additional CSP changes should be needed.

---

## Step 12: Update Prerendering for SSG Pages

The app is **SSG by default** (prerendered at build time) with **SSR only on specific routes** (`/ssr`, `/hono-rpc`, `/errors/:code`). The `:locale?` prefix means each SSG page needs to be prerendered for every supported locale.

### How It Works

| Route Type | Example URLs | Behavior |
|-----------|--------------|----------|
| **SSG** (default) | `/en-US/about`, `/ja-JP/about` | Prerendered at build time, one HTML file per locale |
| **SSR** (explicit) | `/en-US/ssr`, `/ja-JP/ssr` | Rendered on every request via loader |
| **Catch-all** | `*` | Handles unknown paths, returns 404 |

### Update `packages/frontend/vite-utils/route-discovery.ts`

Add locale-aware prerender discovery:

```typescript
const SUPPORTED_LOCALES = ['en-US', 'ja-JP'] as const;
const BASE_LOCALE = 'en-US';

export function discoverPrerenderRoutes(options?: { rootDir?: string }): string[] {
  const { rootDir } = options ?? {};
  const baseRoutes = discoverStaticRoutes({
    exclude: prerenderExcludedRoutes,
    ...(rootDir === undefined ? {} : { rootDir }),
  });

  // Explicitly add the index route since discoverStaticRoutes relies on file names
  if (!baseRoutes.includes('/')) {
    baseRoutes.push('/');
  }

  // Generate locale-prefixed routes for SSG pages
  const localePrefixedRoutes: string[] = [];
  for (const route of baseRoutes) {
    for (const locale of SUPPORTED_LOCALES) {
      if (locale === BASE_LOCALE) {
        // Base locale: /en-US/about, /en-US/holy-grail, etc.
        localePrefixedRoutes.push(`/${locale}${route === '/' ? '' : route}`);
      } else {
        // Other locales: /ja-JP/about, /ja-JP/holy-grail, etc.
        localePrefixedRoutes.push(`/${locale}${route === '/' ? '' : route}`);
      }
    }
  }

  return localePrefixedRoutes;
}
```

### Result

For the current route structure, prerender generates:

```
/en-US                    ← home (SSG)
/en-US/about              ← about (SSG)
/en-US/holy-grail         ← holy-grail (SSG)
/en-US/errors             ← errors index (SSG)
/ja-JP                    ← home (SSG)
/ja-JP/about              ← about (SSG)
/ja-JP/holy-grail         ← holy-grail (SSG)
/ja-JP/errors             ← errors index (SSG)
```

**NOT prerendered** (SSR, rendered per-request):
- `/en-US/ssr`, `/ja-JP/ssr` — has loader, SSR on every request
- `/en-US/hono-rpc`, `/ja-JP/hono-rpc` — has clientLoader, SSR
- `/en-US/errors/:code`, `/ja-JP/errors/:code` — dynamic params, SSR

---

## Step 13: Testing

### Unit Tests

- Verify Paraglide compiles correctly with ICU plugin
- Test `m.greeting({ name: 'Test' })` output
- Test `m.items_in_cart({ count: 0 })` / `m.items_in_cart({ count: 5 })` pluralization
- Test locale switching via `setLocale()`

### Integration Tests

- Verify `/en-US/about` renders English content (SSG, prerendered)
- Verify `/ja-JP/about` renders Japanese content (SSG, prerendered)
- Verify `/about` (no prefix) redirects to `/en-US/about` or detects from cookie
- Verify `/en-US/ssr` renders with loader data (SSR, per-request)
- Verify `/ja-JP/ssr` renders with loader data (SSR, per-request)
- Verify locale persists in cookie across navigations
- Verify prerendered SSG pages have correct `lang` attribute

### Manual Verification

```bash
# Start dev server
deno task dev:app

# Test English (SSG page)
curl -s http://localhost:5173/en-US/about | grep 'lang='

# Test Japanese (SSG page)
curl -s http://localhost:5173/ja-JP/about | grep 'lang='

# Test SSR page
curl -s http://localhost:5173/en-US/ssr | grep 'lang='
curl -s http://localhost:5173/ja-JP/ssr | grep 'lang='

# Test base locale (no prefix) — should redirect or use cookie
curl -s -I http://localhost:5173/about | head -5

# Test health check (should not be affected)
curl -s http://localhost:5173/healthz
```

---

## Step 14: Production Build

### Pre-build: Pull Translations

```bash
deno task pull:i18n
```

### Build

```bash
deno task build
```

The build pipeline now includes:
1. Pull translations from i18nexus → `messages/*.json`
2. Paraglide compiler reads `messages/*.json` + ICU plugin → generates `app/paraglide/`
3. React Router builds routes with `:locale?` prefix
4. **SSG pages** prerendered for each locale: `/en-US/about`, `/ja-JP/about`, etc.
5. **SSR pages** NOT prerendered — rendered on every request via loaders
6. Worker bundle includes Paraglide server runtime

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `project.inlang/settings.json` | **Create** | Paraglide project config with ICU plugin |
| `messages/en-US.json` | **Create** | Base language translations (ICU format) |
| `messages/ja-JP.json` | **Create** | Japanese translations |
| `package.json` | **Edit** | Add `@inlang/paraglide-js`, `@i18nexus/cli` |
| `deno.json` | **Edit** | Add `pull:i18n` task |
| `packages/frontend/react-router.config.ts` | **Edit** | Enable `v8_middleware`, update prerender |
| `packages/frontend/vite.config.ts` | **Edit** | Add `paraglideVitePlugin` |
| `packages/frontend/vite.react-router.config.ts` | **Edit** | Add `paraglideVitePlugin` |
| `packages/frontend/app/root.tsx` | **Edit** | Add middleware, dynamic `lang` attr |
| `packages/frontend/app/routes.ts` | **Edit** | Wrap routes in `prefix(':locale?', ...)` |
| `packages/frontend/app/components/language-switcher.tsx` | **Create** | Language switcher component |
| `packages/frontend/app/routes/home.tsx` | **Edit** | Use `m.*()` functions |
| `packages/frontend/app/routes/about.tsx` | **Edit** | Use `m.*()` functions |
| `packages/frontend/app/routes/*.tsx` | **Edit** | Replace hardcoded strings |
| `scripts/pull-translations.ts` | **Create** | i18nexus API pull script |
| `.env.local` | **Edit** | Add `I18NEXUS_API_KEY` |
| `.i18nexusrc.json` | **Create** (optional) | CLI config |

---

## Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| **Cloudflare Workers: no Node.js AsyncLocalStorage** | Paraglide's `paraglideMiddleware` uses Web Standard APIs; verify in dev |
| **Vite plugin compatibility with Cloudflare Vite plugin** | Test dev mode early; the Paraglide plugin runs in the Vite transform pipeline, not Workers runtime |
| **SSG prerendering locale-prefixed routes** | `discoverPrerenderRoutes()` generates `/en-US/*` and `/ja-JP/*` for each static route |
| **SSR pages with locale prefix** | Routes like `/ssr` and `/hono-rpc` are excluded from prerendering; locale detected via middleware per-request |
| **i18nexus API rate limits** | Pull at build time, not runtime; cache locally |
| **CSP nonce interaction with Paraglide middleware** | Paraglide middleware doesn't inject scripts; no CSP impact expected |
| **Bundle size increase from Paraglide runtime** | Offset by tree-shaking (Paraglide compiles away unused messages) |

---

## References

- [Paraglide JS + React Router v7](https://paraglidejs.com/react-router)
- [Paraglide JS + Vite](https://paraglidejs.com/vite)
- [Paraglide Strategy (URL routing)](https://paraglidejs.com/strategy)
- [Paraglide i18n Routing](https://paraglidejs.com/i18n-routing)
- [ICU MessageFormat v1 Plugin](https://inlang.com/m/p7c8m1d2/plugin-inlang-icu-messageformat-1)
- [i18nexus REST API](https://i18nexus.com/docs/api)
- [i18nexus CLI](https://www.npmjs.com/package/@i18nexus/cli)
- [React Router v7 Middleware](https://reactrouter.com/explanation/route-module#middleware)
