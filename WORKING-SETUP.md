# Final Working Setup Summary

## ✅ What's Working Now

### Development Mode (Port 5173)
- **React Router**: Handles all page routes (/, /about, etc.) with HMR
- **Hono API**: Handles `/api/*` routes via custom Vite middleware
- **Hot Reload**: Full HMR for React components ✅
- **API Routes**: Hono handles all `/api/*` endpoints ✅

### Production Mode (Port 3000)
- **Hono Server**: Serves everything
- **Static Files**: SSG pre-rendered pages (/, /about)
- **SPA Routing**: Falls back to index.html for client-side routes
- **API Routes**: Hono handles `/api/*` endpoints

## Architecture

```
┌──────────────────────────────────────┐
│       DEVELOPMENT (Port 5173)        │
├──────────────────────────────────────┤
│ Vite Dev Server                      │
│ ├─ Custom Middleware                 │
│ │  └─ /api/* → Hono (app/server.ts)  │
│ │                                    │
│ └─ /* → React Router Plugin          │
│    └─ HMR + Fast Refresh enabled     │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│       PRODUCTION (Port 3000)         │
├──────────────────────────────────────┤
│ Hono Server (app/server.ts)          │
│ ├─ /api/* → API handlers             │
│ └─ /* → serveStatic                  │
│    ├─ Static files (HTML, JS, CSS)   │
│    └─ Fallback to index.html (SPA)   │
└──────────────────────────────────────┘
```

## Key Files

### `vite.config.ts`
```typescript
// Custom middleware that:
// 1. Intercepts /api/* → sends to Hono
// 2. Everything else → React Router handles
function honoDevServer(): Plugin {
  // Mounts Hono app for API routes only
}

plugins: [
  honoDevServer(),  // API routes
  reactRouter(),    // Page routes + HMR
  tsconfigPaths(),
]
```

### `app/server.ts`
```typescript
// Hono app with API routes
app.get('/api/test', (c) => {
  return c.json({ message: 'Hello from API' });
});

// Production: serves static files
if (isProduction) {
  app.use('*', serveStatic({
    root: './build/client',
    rewriteRequestPath: (path) => {
      // SPA fallback to index.html
    },
  }));
}
```

### `react-router.config.ts`
```typescript
export default {
  ssr: true,  // SSR capability enabled
  prerender() {
    return ['/', '/about'];  // SSG routes
  },
} satisfies Config;
```

## How It Works

### Dev Mode Request Flow
```
http://localhost:5173/ 
  → Custom middleware checks: starts with /api? NO
  → Passes to next() 
  → React Router handles → Returns HTML with HMR

http://localhost:5173/api/test
  → Custom middleware checks: starts with /api? YES
  → Loads app/server.ts via Vite SSR
  → Hono handles → Returns JSON
```

### Prod Mode Request Flow
```
http://localhost:3000/
  → Hono serveStatic
  → Serves build/client/index.html (pre-rendered)

http://localhost:3000/api/test
  → Hono API handler
  → Returns JSON

http://localhost:3000/some-client-route
  → Hono serveStatic
  → No file found → rewriteRequestPath
  → Serves index.html (SPA routing)
```

## Testing

### Test React Router (Dev)
1. Open http://localhost:5173
2. Should see "Home" page
3. Edit `app/routes/home.tsx`
4. Should update instantly (HMR)

### Test API Routes (Dev)
1. Open http://localhost:5173/api/test
2. Should see: `{"message":"Hello from API"}`
3. Edit `app/server.ts` API response
4. Refresh → should see updated response

### Test Production Build
```bash
# Build
pnpm build

# Check output
ls build/client/       # index.html, about/index.html
ls build/client/assets # JS, CSS bundles

# Run production
pnpm start

# Test
curl http://localhost:3000/          # Pre-rendered HTML
curl http://localhost:3000/api/test  # API response
```

## Why This Works

1. **Custom Middleware Approach**: Instead of using `@hono/vite-dev-server` which tried to handle ALL requests, we created a custom plugin that ONLY intercepts `/api/*` routes.

2. **React Router Plugin Priority**: By checking for `/api/*` first and calling `next()` for everything else, React Router's plugin can handle all page routes naturally.

3. **SSR Loading in Dev**: Using `server.ssrLoadModule()` ensures Hono app is loaded with Vite's module graph, enabling hot reload for API changes too.

4. **Production Simplicity**: In production, Hono just serves static files and handles API - no complex proxying needed.

## Adding New Routes

### Add API Route (Hono)
```typescript
// app/server.ts
app.post('/api/users', async (c) => {
  const body = await c.req.json();
  return c.json({ success: true, data: body });
});
```

### Add Page Route (React Router)
```typescript
// app/routes/pricing.tsx
export default function Pricing() {
  return <div>Pricing Page</div>;
}

// app/routes.ts
route("/pricing", "./routes/pricing.tsx"),
```

### Add SSG Route (Pre-rendered)
```typescript
// react-router.config.ts
prerender() {
  return ['/', '/about', '/pricing'];  // Add new route
}
```

## Success Criteria ✅

- [x] Dev server starts without errors
- [x] `/` loads React Router page
- [x] `/api/test` returns JSON from Hono
- [x] Hot reload works for React components
- [x] API changes reflect (after refresh)
- [x] Production build completes
- [x] Production server serves static + API

## No More Issues!

The key insight was: **Don't try to make Hono handle everything in dev**. Let React Router do what it does best (pages + HMR), and only use Hono for what YOU want it for (API routes).
