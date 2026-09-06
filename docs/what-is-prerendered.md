# Prerendered Routes

Current prerendering status and what gets built.

## Current Configuration

```typescript
// react-router.config.ts
prerender() {
  return discoverPrerenderRoutes();
}
```

## Prerendered Routes

| Route | Status | Output |
|-------|--------|--------|
| `/` | ✅ SSG | `build/client/index.html` |
| `/about` | ✅ SSG | `build/client/about/index.html` |
| `/errors` | ✅ SSG | `build/client/errors/index.html` + `errors.data` |
| `/holy-grail` | ✅ SSG | `build/client/holy-grail/index.html` |
| `/labs` | ✅ SSG | `build/client/labs/index.html` |
| `/labs/mandelbrot` | ✅ SSG | `build/client/labs/mandelbrot/index.html` |
| `/labs/dominant-color` | ✅ SSG | `build/client/labs/dominant-color/index.html` |

## What Gets Built

After `deno task build`:

```
build/client/
├── index.html           # / route
├── about/
│   └── index.html       # /about route
├── errors/
│   ├── index.html       # /errors route
│   └── errors.data      # Loader data
├── assets/              # JS/CSS bundles
└── ...
```

## Route Details

### `/` (Home)
- **Speed**: ⚡⚡⚡ Instant
- **Content**: Static navigation
- **No loader**: Pure SSG

### `/about` (About)
- **Speed**: ⚡⚡⚡ Instant
- **Content**: Static page
- **No loader**: Pure SSG

### `/errors` (Error Demo)
- **Speed**: ⚡⚡⚡ Instant (base page)
- **Content**: Interactive error demos
- **Loader data**: Cached at build time
- **JavaScript**: Enables button interactions

## Non-Prerendered Routes

| Route | Mode | Reason |
|-------|------|--------|
| `/ssr` | SSR | Dynamic timestamp |
| `/errors/:code` | SSR | Dynamic loader-driven error demo |
| `/*` | SSR | Dynamic 404 URLs |

## Performance

- **Prerendered**: ⚡⚡⚡ Instant (static HTML)
- **SSR**: ⚡⚡ Fast (server-rendered per request)

## Testing

```bash
deno task build
ls build/client/  # Check generated files
deno task start        # Test in production
```

Visit prerendered routes - they load instantly!
