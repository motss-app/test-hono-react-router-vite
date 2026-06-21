# ve-css-text

A Vite plugin that enables true lazy-loading of Vanilla Extract CSS by inlining it via `adoptedStyleSheets` instead of extracting it into `<link>` tags.

## The problem

When you lazy-load a component with `React.lazy()`, Vite splits both the JS and CSS into separate chunks. But Vanilla Extract's default behavior extracts CSS into a `<link>` tag at build time. This means the CSS is loaded **eagerly** via the HTML `<head>`, even though the component that uses it hasn't been rendered yet.

Result: the JS is deferred, but the CSS arrives immediately — defeating the purpose of code splitting.

## How it works

The plugin intercepts `.css.ts` files that are **only reachable via dynamic imports** and changes how their CSS is delivered:

1. **Detection** — walks Vite's module graph backwards from each `.css.ts` file. If every static-import path to the application entry crosses at least one `import()` boundary, the module is considered dynamic-only.

2. **CSS interception** — for matched modules, the plugin returns `''` for the virtual `.vanilla.css` module, preventing Vanilla Extract from creating a `<link>` tag.

3. **CSS inlining** — in the `transform` hook, the plugin loads the CSS text and appends a side effect that creates a `CSSStyleSheet` and adds it to `document.adoptedStyleSheets`. This is CSP-safe (no `style` elements or `style` attributes).

All other `.css.ts` files are unaffected and go through normal Vanilla Extract extraction.

## Module graph detection

```
entry.client.tsx
  └── root.tsx ──────────────────────────────────────────────────────┐
       └── scroll-to-top-button-shell.tsx                            │
            └── lazy-scroll-to-top-button.tsx                        │
                 │                                                   │
                 │  import() ← dynamic import boundary               │
                 │                                                   │
                 └── scroll-to-top-button.tsx                        │
                      └── scroll-to-top-button.css.ts                │
                                                                       │
  Static path to entry? NO  ──────────────────────────────────────────┘
  → Plugin inlines CSS via adoptedStyleSheets
```

## Before vs After

```
 WITHOUT plugin (default VE)              WITH plugin
 ─────────────────────────────            ─────────────────────────────

 <head>                                   <head>
   <link href="button.css"> ← eager        (nothing — CSS deferred)
 </head>                                 </head>

 <body>                                   <body>
   ...                                     ...
   <script>                                <script>
     React.lazy(() => import('button'))      React.lazy(() => import('button'))
   </script>                              </script>
 </body>                                 </body>

                                           User scrolls → triggers lazy load:

                                           import('button')
                                             → JS chunk loads
                                             → adoptedStyleSheets injects CSS
                                             → component renders with styles
```

## Request waterfall comparison

```
 WITHOUT plugin                           WITH plugin
 ─────────────────                        ─────────────────

 Initial page load:                       Initial page load:
   GET index.html      ──→ 200              GET index.html      ──→ 200
   GET button.css      ──→ 200  ← wasted     (no CSS request)

 Later (lazy trigger):                   Later (lazy trigger):
   GET button.chunk.js ──→ 200              GET button.chunk.js ──→ 200
   (CSS already loaded)                      (CSS inlined in JS)

 Total requests: 3                        Total requests: 2
 Wasted bytes: CSS loaded upfront         Wasted bytes: none
```

## Usage

```ts
import { veCssTextPlugin } from '../../vite-plugins/ve-css-text/plugin.ts';

// in vite.config.ts plugins array:
veCssTextPlugin(),
```

No configuration needed — the plugin auto-detects dynamic-only modules.

## Limitations

- The module graph walk relies on `ModuleInfo.importers` and `ModuleInfo.dynamicImporters`, which are **not supported** in the Cloudflare Workers module runner. In that environment, the plugin silently falls back to no-op (all `.css.ts` files use normal VE extraction). This is fine because SSR bundles are built separately.
- The plugin only runs in dev mode (it's included in the dev plugins array, not in production build configs).
