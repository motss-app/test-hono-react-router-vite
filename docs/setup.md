# Setup Guide

Complete setup for React Router v7 + Hono + Vite integration.

## Architecture

### Development
- **Gateway Worker** on `8787`
- **Frontend Worker** on `5173`
- **BFF Worker** mounted as an auxiliary worker behind the gateway
- **Features**: Hot reload, Fast Refresh, Spotlight sidecar, and local Worker runtime parity

### Production
- **Gateway Worker** as the public entrypoint
- **Frontend Worker** for page shell, SSR, and assets
- **BFF Worker** for `/api/*`
- **Hybrid rendering**: SSG + SSR + CSR

## Key Files

```
app/
├── root.tsx           # Root layout
├── routes.ts          # Route definitions
└── routes/            # Page components

packages/frontend/vite.config.ts  # Frontend Cloudflare Vite dev config
packages/gateway/vite.config.ts   # Gateway Cloudflare Vite dev config + BFF auxiliary worker
react-router.config.ts            # Rendering config
```

## Configuration

### `react-router.config.ts`
```typescript
export default {
  ssr: true,
  prerender() {
    return ['/', '/about', '/errors']; // SSG routes
  },
} satisfies Config;
```

### `packages/frontend/vite.config.ts`
- Integrates the Cloudflare Vite plugin for the frontend worker
- Enables React Router, StyleX, and HMR for local development

### `packages/gateway/vite.config.ts`
- Integrates the Cloudflare Vite plugin for the gateway worker
- Registers the BFF worker as an auxiliary worker during local dev

### `packages/frontend/worker.ts`
- **Dev**: Cloudflare Vite dev server handles the frontend worker, SSR, and static assets
- **Prod**: Serves static files + handles SSR

## Request Flow

### Development
```
http://localhost:8787/api/test  → Gateway → BFF worker
http://localhost:8787/          → Gateway → frontend worker
http://localhost:5173/          → Frontend worker directly (useful for debugging)
```

### Production
```
https://<gateway-domain>/api/test  → Gateway → BFF worker
https://<gateway-domain>/          → Gateway → frontend worker
https://<gateway-domain>/ssr       → Gateway → frontend worker SSR
```

## Scripts

```bash
deno task dev      # Gateway + frontend worker + BFF + Spotlight
deno task build    # Production build
deno task start    # Preview the built worker stack locally
deno task preview  # Preview build locally
```

## Adding Routes

### API Route
```typescript
// packages/bff/src/api.ts
app.get('/api/users', (c) => {
  return c.json({ users: [] });
});
```

### Page Route
```typescript
// app/routes/contact.tsx
export default function Contact() {
  return <div>Contact Page</div>;
}

// app/routes.ts
route("/contact", "./routes/contact.tsx"),
```

### SSG Route
Add to `prerender()` array in `react-router.config.ts`

## Development Workflow

1. **Edit components** → Instant HMR updates
2. **Edit API routes** → Refresh browser
3. **Edit config** → Restart dev server
4. **Test production** → `deno task build && deno task start`

## Troubleshooting

- **Dev server won't start**: Check ports 8787, 5173, and 8969
- **API not working**: Use `/api/*` prefix
- **Build fails**: Run `deno check`
- **HMR not working**: Check for TypeScript errors
