# Rendering Modes

React Router v7 supports three rendering modes:

## SSG (Static Site Generation) ⚡

**Routes:** `/`, `/about`, `/holy-grail`, `/labs`, `/labs/mandelbrot`,
`/labs/dominant-color`, `/errors`

**How it works:**
- Pre-rendered at build time
- Static HTML files served instantly
- No server computation per request

**Config:**
```typescript
prerender() {
  return ['/', '/about', '/errors']; // SSG routes
}
```

**When to use:**
- Static content
- Public pages
- SEO-critical pages
- Fastest performance

## SSR (Server-Side Rendering) 🔄

**Routes:** `/ssr`, `/errors/:code`, `/*` (404)

**How it works:**
- Rendered on server for each request
- Fresh data every time
- Server runs loader functions

**Config:**
Routes with loaders not in prerender array.

**When to use:**
- Dynamic content
- User-specific data
- Real-time information
- Authentication required

## CSR (Client-Side Rendering) 💻

**How it works:**
- Initial HTML from server
- React hydrates on client
- Interactive updates in browser

**When to use:**
- Highly interactive UIs
- Real-time features
- Client-side state heavy apps

## Comparison

| Feature | SSG | SSR | CSR |
|---------|-----|-----|-----|
| Speed | ⚡⚡⚡ Instant | ⚡⚡ Fast | ⚡ Depends |
| Fresh data | ❌ Build time | ✅ Always | ✅ Can fetch |
| SEO | ✅ Perfect | ✅ Perfect | ⚠️ Needs hydration |
| Server load | ✅ None | ⚠️ Medium | ✅ None |

## Current Routes

| Route | Mode | Purpose |
|-------|------|---------|
| `/` | SSG | Home page |
| `/about` | SSG | About page |
| `/holy-grail` | SSG | Holy Grail layout page |
| `/labs` | SSG | Labs index |
| `/labs/mandelbrot` | SSG | Mandelbrot lab |
| `/labs/dominant-color` | SSG | Dominant color lab |
| `/errors` | SSG | Error demos |
| `/ssr` | SSR | SSR demo |
| `/errors/:code` | SSR | Dynamic error demo |
| `/api/*` | API | Hono endpoints |
| `/*` | SSR | 404 handler |

## Best Practices

- **Default to SSG** when possible
- **Use SSR** for personalized content
- **Use CSR** for interactive widgets
- **Mix modes** per route as needed
