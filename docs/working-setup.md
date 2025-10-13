# Working Setup

Final architecture summary for React Router + Hono + Vite.

## Development Mode (Port 5173)

- **Vite Dev Server** with HMR
- **React Router** handles page routes (`/*`)
- **Hono** handles API routes (`/api/*`)
- **Hot reload** for components and API

## Production Mode (Port 3000)

- **Hono server** serves everything
- **Static files** for SSG routes
- **SSR** for dynamic routes
- **SPA fallback** for client routing

## Architecture

### Dev Request Flow
```
http://localhost:5173/api/test  → Hono API
http://localhost:5173/          → React Router (HMR)
```

### Prod Request Flow
```
http://localhost:3000/api/test  → Hono API
http://localhost:3000/          → Static HTML (SSG)
http://localhost:3000/ssr       → Server-rendered (SSR)
```

## Key Integration

### `vite.config.ts`
Custom middleware intercepts `/api/*` → Hono, else → React Router

### `app/server.ts`
- **Dev**: API routes only
- **Prod**: Static file serving + SSR + API

## Features Working

✅ Hot Module Replacement (HMR)  
✅ Server-Side Rendering (SSR)  
✅ Static Site Generation (SSG)  
✅ API routes with Hono  
✅ Production builds  
✅ Docker deployment  

## Testing

- **Dev**: `pnpm dev` → http://localhost:5173
- **Prod**: `pnpm build && pnpm start` → http://localhost:3000
- **API**: Visit `/api/test` in both modes

## Success Criteria

- [x] Dev server starts without errors
- [x] Pages load with HMR
- [x] API routes work
- [x] Production build succeeds
- [x] All routes work in production
