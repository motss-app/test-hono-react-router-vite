# React Router + Hono + Vite Setup Guide

## Architecture Overview

This project implements a hybrid rendering approach with hot reload in development and optimized static/SSR serving in production.

### Development Mode
- **Port**: 5173
- **Server**: Vite Dev Server with Hono + React Router integration
- **How it works**:
  - Hono handles **only** `/api/*` routes
  - React Router handles **all other routes** (pages, assets, etc.)
  - Both are integrated via `@hono/vite-dev-server` plugin
- **Features**:
  - ✅ Hot Module Replacement (HMR)
  - ✅ Fast Refresh for React components
  - ✅ API routes available at `/api/*`
  - ✅ All routes work with instant reload

### Production Mode
- **Port**: 3000
- **Server**: Hono with Node.js
- **Rendering Strategy**:
  - **SSG** (Static Site Generation): Pre-rendered routes (/, /about)
  - **SSR** (Server-Side Rendering): Routes with loaders (opt-in)
  - **CSR** (Client-Side Rendering): Client-side navigation + interactivity

## File Structure

```
app/
├── server.ts              # Hono server (dev + prod logic)
├── root.tsx               # Root layout
├── routes.ts              # Route configuration
└── routes/
    ├── home.tsx           # SSG route (prerendered)
    └── about.tsx          # SSG route (prerendered)

vite.config.ts             # Vite + React Router + Hono config
react-router.config.ts     # React Router config (SSR + prerender)
package.json               # Scripts and dependencies
```

## Configuration Files

### `react-router.config.ts`
```typescript
export default {
  ssr: true,  // Enable SSR capability
  prerender() {
    return ['/', '/about'];  // These become SSG routes
  },
} satisfies Config;
```

### `vite.config.ts`
- Integrates React Router plugin
- Configures Hono dev server
- Handles hot reload in development

### `app/server.ts`
- **Dev Mode**: 
  - Hono app is mounted by `@hono/vite-dev-server`
  - Only handles `/api/*` routes
  - React Router handles all page routes automatically
  - Both work together seamlessly via Vite plugins
- **Prod Mode**: 
  - Serves static files from `build/client`
  - Handles SSR with `remix-hono/handler`

## How Dev Mode Works

In development, two systems work together:

1. **`@hono/vite-dev-server` Plugin** (in `vite.config.ts`):
   - Mounts your Hono app (`app/server.ts`)
   - Routes matching `/api/*` → handled by Hono
   - All other routes → pass through to React Router

2. **`reactRouter()` Plugin** (in `vite.config.ts`):
   - Handles all page routes (/, /about, etc.)
   - Provides HMR and Fast Refresh
   - Serves assets and manages the build

**Request Flow in Dev**:
```
http://localhost:5173/api/test  → Hono app
http://localhost:5173/          → React Router dev
http://localhost:5173/about     → React Router dev
```

## Scripts

```bash
# Development (hot reload)
pnpm dev

# Build for production
pnpm build

# Preview production build locally
pnpm preview

# Run production server
pnpm start

# Type checking
pnpm typecheck
```

## Rendering Strategy

### Static Site Generation (SSG)
Routes listed in `prerender()` are pre-rendered at build time:

```typescript
// app/routes/about.tsx
export default function About() {
  return <div>About Page</div>;
}
```

**Build Output**: `build/client/about/index.html`  
**Runtime**: Served as static file (no SSR)

### Server-Side Rendering (SSR)
Routes with `loader` or `action` can be SSR (if not prerendered):

```typescript
// app/routes/dashboard.tsx
export async function loader() {
  return { user: await fetchUser() };
}

export default function Dashboard({ loaderData }) {
  return <div>Welcome {loaderData.user.name}</div>;
}
```

**Runtime**: Rendered on each request with fresh data

### Client-Side Rendering (CSR)
Routes without loaders (and not prerendered):

```typescript
// app/routes/counter.tsx
export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

**Runtime**: Hydrated on client, fully interactive

## Request Flow

### Development
```
Request → Vite Dev Server
├── /api/* → Hono handles
└── /* → React Router dev (HMR enabled)
```

### Production
```
Request → Hono Server
├── /api/* → Hono handles
├── /prerendered → Static HTML file (SSG)
└── /dynamic → React Router SSR handler
```

## API Routes

API routes are available in both dev and prod modes:

```typescript
// app/server.ts
const apiRoute = new Hono()
  .get('/test', (c) => {
    return c.json({ message: 'Hello from API' });
  });
```

**Access**: `http://localhost:5173/api/test` (dev) or `http://localhost:3000/api/test` (prod)

## Adding New Routes

### Static Route (SSG)
1. Create route file: `app/routes/pricing.tsx`
2. Add to prerender: `return ['/', '/about', '/pricing']`
3. Rebuild: `pnpm build`

### Dynamic Route (SSR)
1. Create route file: `app/routes/dashboard.tsx`
2. Add a `loader` or `action` function
3. Don't add to prerender array

### Interactive Route (CSR)
1. Create route file: `app/routes/game.tsx`
2. Use React hooks and state
3. Don't add loader, don't prerender

## Benefits

✅ **Hot Reload**: Instant feedback in development  
✅ **Performance**: Static files served directly in production  
✅ **Flexibility**: Choose SSG/SSR/CSR per route  
✅ **SEO**: Both SSG and SSR are crawlable  
✅ **API Support**: Hono API routes in both modes  
✅ **Type Safety**: Full TypeScript support  

## Troubleshooting

### Dev server not starting
- Check if port 5173 is available
- Run `pnpm install` to ensure dependencies are installed

### Production build errors
- Run `pnpm typecheck` to check for type errors
- Ensure all prerendered routes exist

### SSR not working
- Verify route has a `loader` or `action`
- Check that route is NOT in prerender array
- Ensure `ssr: true` in `react-router.config.ts`

## Next Steps

1. Add more routes to `app/routes/`
2. Configure route-specific loaders for dynamic data
3. Add API endpoints in `app/server.ts`
4. Deploy to production (Node.js hosting)
