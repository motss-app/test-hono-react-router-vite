# ve-css-text

Inlines CSS from lazy-loaded Vanilla Extract components via `adoptedStyleSheets` instead of `<link>` tags.

## Problem

`React.lazy()` splits JS and CSS into chunks, but VE extracts CSS eagerly into `<head>`. The JS is deferred; the CSS arrives immediately.

## How it works

1. **Detect** — walks the module graph backwards. If every static path to entry crosses an `import()`, it's dynamic-only.
2. **Intercept** — returns `''` for the virtual `.vanilla.css` module, blocking VE's `<link>` extraction.
3. **Inline** — appends a `CSSStyleSheet` to `document.adoptedStyleSheets` (CSP-safe).

## Module graph detection

```
entry.client.tsx
  └── root.tsx ─────────────────────────────────────────┐
       └── shell.tsx                                    │
            └── lazy-button.tsx                         │
                 │                                      │
                 │  import() ← dynamic boundary         │
                 │                                      │
                 └── button.tsx                         │
                      └── button.css.ts                 │
                                                        │
  Static path to entry? NO  ────────────────────────────┘
  → inline CSS via adoptedStyleSheets
```

## Before vs After

```
 WITHOUT plugin                        WITH plugin
 ─────────────────                     ─────────────────

 <head>                                <head>
   <link href="button.css"> ← eager     (nothing — deferred)
 </head>                              </head>

                                        User scrolls → lazy trigger:
                                          import('button')
                                            → JS loads
                                            → CSS injected via adoptedStyleSheets
```

## Request waterfall

```
 WITHOUT plugin                        WITH plugin
 ─────────────────                     ─────────────────

 Initial:                              Initial:
   GET index.html  ──→ 200               GET index.html  ──→ 200
   GET button.css  ──→ 200 ← wasted      (no CSS request)

 Lazy trigger:                         Lazy trigger:
   GET button.js   ──→ 200               GET button.js   ──→ 200

 Requests: 3                           Requests: 2
```

## Usage

```ts
veCssTextPlugin(), // no config — auto-detects dynamic-only modules
```

## Limitations

- **Cloudflare Workers module runner** — the SSR runtime is a lightweight proxy that doesn't maintain a full import graph. Accessing `ModuleInfo.importers` throws `The "importers" property of ModuleInfo is not supported`. The plugin catches this and falls back to no-op. This is fine because CSS delivery to the browser is handled by the **client build** (which has the full module graph), not the SSR build.
