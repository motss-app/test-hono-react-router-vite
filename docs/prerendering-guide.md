# Prerendering Guide

When and how to prerender routes for optimal performance.

## Current Config

```typescript
// react-router.config.ts
prerender() {
  return ['/', '/about', '/errors'];
}
```

## What Gets Prerendered

| Route | Status | Reason |
|-------|--------|--------|
| `/` | ✅ SSG | Static content, no loader |
| `/about` | ✅ SSG | Static content, no loader |
| `/errors` | ✅ SSG | Static base page |
| `/ssr` | ❌ SSR | Dynamic timestamp |
| `/*` | ❌ SSR | Dynamic 404 URLs |

## When to Prerender

### ✅ Good Candidates
- Static content
- Public pages
- Marketing pages
- Documentation
- Blog posts (if not too dynamic)

### ❌ Not Good Candidates
- User-specific content
- Real-time data
- Authentication required
- Dynamic per request

## How It Works

1. **Build time**: Routes in prerender array generate static HTML
2. **Runtime**: Static files served instantly from disk/CDN
3. **No server computation** per request

## Adding Routes

```typescript
// Add to prerender array
prerender() {
  return ['/', '/about', '/contact']; // Added /contact
}

// Create route without loader
export default function Contact() {
  return <div>Contact Page</div>;
}
```

## Performance Benefits

- ⚡⚡⚡ **Instant loading** (no server wait)
- ✅ **CDN friendly** (cache forever)
- ✅ **SEO perfect** (full HTML available)
- ✅ **Low server load** (static files)

## Testing

```bash
pnpm build
ls build/client/  # Check generated HTML files
pnpm start        # Test in production
```

Visit prerendered routes - should load instantly!
