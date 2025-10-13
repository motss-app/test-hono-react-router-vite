# Setup Guide

Complete setup for React Router v7 + Hono + Vite integration.

## Architecture

### Development (Port 5173)
- **Vite Dev Server** with HMR
- **Hono** handles `/api/*` routes
- **React Router** handles all page routes
- **Features**: Hot reload, Fast Refresh, instant updates

### Production (Port 3000)
- **Hono server** with Node.js
- **Hybrid rendering**: SSG + SSR + CSR
- **Static files** served from `build/client`

## Key Files

```
app/
├── server.ts          # Hono API server
├── root.tsx           # Root layout
├── routes.ts          # Route definitions
└── routes/            # Page components

vite.config.ts         # Vite + React Router + Hono
react-router.config.ts # Rendering config
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

### `vite.config.ts`
- Integrates React Router plugin
- Configures Hono dev server for API routes
- Enables hot reload in development

### `app/server.ts`
- **Dev**: Hono handles `/api/*` routes only
- **Prod**: Serves static files + handles SSR

## Request Flow

### Development
```
http://localhost:5173/api/test  → Hono API
http://localhost:5173/          → React Router (HMR)
http://localhost:5173/about     → React Router (HMR)
```

### Production
```
http://localhost:3000/api/test  → Hono API
http://localhost:3000/          → Static HTML (SSG)
http://localhost:3000/ssr       → Server-rendered (SSR)
```

## Scripts

```bash
pnpm dev      # Development with HMR
pnpm build    # Production build
pnpm start    # Production server
pnpm preview  # Preview build locally
```

## Adding Routes

### API Route
```typescript
// app/server.ts
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
4. **Test production** → `pnpm build && pnpm start`

## Troubleshooting

- **Dev server won't start**: Check port 5173
- **API not working**: Use `/api/*` prefix
- **Build fails**: Run `pnpm typecheck`
- **HMR not working**: Check for TypeScript errors
