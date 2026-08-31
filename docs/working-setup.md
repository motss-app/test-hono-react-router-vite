# Working Setup

Final architecture summary for React Router + Hono + Vite.

## Development Mode

- **Gateway Worker** on `8787`
- **Frontend Worker** on `5173`
- **Gateway** forwards page requests to the frontend worker and `/api/*` to the BFF worker
- **Hot reload** for frontend changes, plus local Worker execution through the Cloudflare Vite plugin
- **Cloudflare auxiliary Workers** are already used for the internal gateway -> BFF hop, but the
	frontend still runs as a separate full-stack dev process rather than as an auxiliary Worker

## Production Mode

- **Gateway Worker** is the public entrypoint
- **Frontend Worker** serves static files for SSG routes and SSR for dynamic routes
- **BFF Worker** handles `/api/*`

## Architecture

### Auxiliary Worker status

The local setup is intentionally hybrid rather than fully single-process:

- `packages/gateway/vite.config.ts` runs the **gateway** as the entry Worker
- that same gateway config attaches the **BFF** as an auxiliary Worker during local development
- `packages/frontend/vite.config.ts` still runs the **frontend** separately on `5173`

That means the repo already uses Cloudflare's auxiliary Worker model where it fits cleanly, but it
 has not yet moved the frontend into that same model.

### Dev Request Flow
```
http://localhost:8787/api/test  → Gateway → BFF worker
http://localhost:8787/          → Gateway → frontend worker
http://localhost:5173/          → Frontend worker directly
```

### Why the frontend is not an auxiliary Worker yet

The frontend package owns more than just a Worker entrypoint: it also owns the React Router dev
 environment, HMR, StyleX, and other frontend-specific Vite plugins. Because of that, moving the
 frontend under the gateway's `auxiliaryWorkers` list would require a real configuration refactor,
 not just adding one more `configPath`.

If the repo ever does that refactor, the likely goal would be to keep the gateway as the single
 entry Worker and have both the frontend and BFF reached through service bindings in dev and prod.

### Prod Request Flow
```
https://<gateway-domain>/api/test  → Gateway → BFF worker
https://<gateway-domain>/          → Gateway → frontend worker
https://<gateway-domain>/ssr       → Gateway → frontend worker SSR
```

## Key Integration

### `packages/gateway/vite.config.ts`
Runs the gateway worker and attaches the BFF worker as an auxiliary worker during local dev.

### `packages/frontend/worker.ts`
- **Dev**: Frontend worker handles the page shell, SSR, and static assets
- **Prod**: Static file serving + SSR

## Features Working

✅ Hot Module Replacement (HMR)  
✅ Server-Side Rendering (SSR)  
✅ Static Site Generation (SSG)  
✅ API routes with the BFF worker behind the gateway  
✅ Production builds  
✅ Cloudflare Worker deployment  

## Testing

- **Dev**: `deno task dev` → gateway + frontend worker + BFF + Spotlight on http://localhost:8787
- **Prod**: `deno task build && deno task start` → preview the built worker stack locally
- **API**: Visit `/api/test` in both modes

## Success Criteria

- [x] Dev server starts without errors
- [x] Pages load with HMR
- [x] API routes work
- [x] Production build succeeds
- [x] All routes work in production
