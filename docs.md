# Project Documentation

A modern full-stack web application using React Router v7, Hono, and Vite with hybrid rendering (SSG + SSR + CSR).

## Quick Start

```bash
deno install
deno task dev      # Gateway + frontend worker + BFF + Spotlight
deno task build && deno task start  # Production at http://localhost:3000
```

## Architecture

### Development Mode
- **Port**: 5173
- **Server**: Cloudflare Vite dev server with HMR + Spotlight sidecar
- **API**: Gateway forwards `/api/*` routes to the BFF worker
- **Pages**: React Router handles all other routes
- **Worker parity**: use `deno task preview:worker` when you want to run the app and API inside local Cloudflare `workerd` instead of the Deno dev server

### Production Mode
- **Port**: 3000
- **Server**: Hono serving static files + SSR
- **Rendering**: Hybrid SSG/SSR/CSR

## Routes Overview

| Route | Mode | Description |
|-------|------|-------------|
| `/` | SSG | Home page (prerendered) |
| `/about` | SSG | About page (prerendered) |
| `/errors` | SSG | Error demo page |
| `/ssr` | SSR | Server-rendered demo |
| `/errors/:code` | SSR | Dynamic error demo |
| `/api/*` | API | Hono endpoints |
| `/*` | SSR | 404 catch-all |

## Setup & Configuration

### Project Structure
```
app/
├── root.tsx           # Root layout
├── routes.ts          # Route definitions
└── routes/            # Page components
  ├── home.tsx
  ├── about.tsx
  └── ...

packages/frontend/
├── worker.ts               # Frontend Cloudflare Worker entrypoint
├── vite.config.ts          # Frontend Cloudflare Vite dev config
└── wrangler.jsonc          # Frontend Worker deploy config

packages/gateway/
├── src/worker.ts           # Public gateway Worker entrypoint
├── vite.config.ts          # Gateway dev config + BFF auxiliary worker wiring
└── wrangler.jsonc          # Gateway deploy config

react-router.config.ts      # Rendering config
```

### Key Config Files

**`react-router.config.ts`**:
```typescript
export default {
  ssr: true,
  prerender() {
    return ['/', '/about', '/errors'];
  },
} satisfies Config;
```

**`vite.config.ts`**: Integrates React Router and the Cloudflare Vite dev plugin.

**`packages/bff/src/api.ts`**: Hono API routes for `/api/*`.

## Error Handling

### HTTP Status Errors
Throw responses with status codes in loaders/actions:

```typescript
// 401 Unauthorized
throw new Response("Login required", { status: 401 });

// 403 Forbidden
throw new Response("Access denied", { status: 403 });

// 404 Not Found
throw new Response("Not found", { status: 404 });

// 500 Server Error
throw new Response("Server error", { status: 500 });
```

### Handled vs Unexpected Failures
- Use `throw new Response(...)` for intended, user-facing failures that the route boundary should handle.
- Use `throw new Error(...)` only when you want to report an unexpected bug or crash.
- If a route needs to build the same `Response` pattern repeatedly, a local helper like `throwRouteResponse(...)` keeps the intent clear and avoids misleading `Unexpected Server Error` telemetry in production.
- If you intentionally demo a real runtime crash, log the same event on the server or worker with the current `app.session_id` so you can match it to the browser issue without capturing a second exception.

### Error Boundary
Catches all errors in `app/root.tsx`:

```typescript
export function ErrorBoundary({ error }) {
  if (isRouteErrorResponse(error)) {
    return <div>Error {error.status}: {error.statusText}</div>;
  }
  return <div>Runtime error: {error.message}</div>;
}
```

### Common Patterns
- **Auth check**: Throw 401 if no user
- **Permissions**: Throw 403 if unauthorized
- **Validation**: Throw 400 for bad input
- **Not found**: Throw 404 for missing resources
- **Server errors**: Throw 500 for exceptions

## Rendering Modes

### Static Site Generation (SSG)
- **When**: Static content, no user data
- **Speed**: ⚡⚡⚡ Instant (pre-built HTML)
- **Routes**: `/`, `/about`, `/errors`
- **Config**: Listed in `prerender()` array

### Server-Side Rendering (SSR)
- **When**: Dynamic data, user-specific content
- **Speed**: ⚡⚡ Fast (rendered per request)
- **Routes**: `/ssr`, `/*` (404)
- **Config**: Routes with loaders not in prerender

### Client-Side Rendering (CSR)
- **When**: Interactive components, real-time updates
- **Speed**: ⚡ Depends on client
- **Implementation**: React hooks in components

## Performance Monitoring

### Server Timing
Monitor SSR performance with `Server-Timing` headers:

```typescript
export function headers({ loaderHeaders }) {
  return {
    'Server-Timing': `ssr;dur=${renderTime}`,
  };
}
```

View in Chrome DevTools → Network tab → Response Headers.

### Prerendering Decisions
- **Prerender if**: Static, public, SEO-critical
- **SSR if**: Dynamic, personalized, real-time
- **CSR if**: Interactive, client-state heavy

## Development & Testing

### Hot Reload
- Edit React components → instant updates
- Edit API routes → refresh browser
- Edit config → restart dev server

### Testing Checklist
- [ ] `deno task dev` starts without errors
- [ ] Pages load at http://localhost:5173
- [ ] API works at `/api/test`
- [ ] `deno task build` completes
- [ ] `deno task start` serves production

### Common Issues
- **Dev server won't start**: Check port 5173 availability
- **API not working**: Ensure `/api/*` prefix
- **Build fails**: Run `deno check`
- **HMR not working**: Check for TypeScript errors

## Deployment

### Cloudflare Workers

This repo is deployed through Cloudflare Workers and the workspace build tasks, not through a standalone Docker runtime.

- build locally with `deno task build`
- preview the built worker stack with `deno task preview` or `deno task start`
- keep the Cloudflare worker configs in `packages/frontend/` and `packages/gateway/` as the source of truth

### Production Checklist
- [ ] Environment variables set
- [ ] Database connections configured
- [ ] Error logging enabled
- [ ] HTTPS enabled
- [ ] CDN for static assets

## API Routes

Define in `packages/bff/src/api.ts`:

```typescript
const app = new Hono();

app.get('/api/test', (c) => {
  return c.json({ message: 'Hello from API' });
});

app.post('/api/users', async (c) => {
  const data = await c.req.json();
  // Process data
  return c.json({ success: true });
});
```

Access at `/api/*` in both dev and production.

## Chrome DevTools

The request `/.well-known/appspecific/com.chrome.devtools.json` is normal - Chrome checks for custom DevTools extensions. Handled silently by the 404 catch-all route.

## File Structure

```
docs/                    # Documentation
├── index.md            # This file
├── SETUP.md            # Detailed setup
├── ERROR-HANDLING.md   # Full error guide
├── RENDERING-MODES.md  # Rendering details
└── ...                 # Other guides

build/                  # Production build
├── server/             # SSR code
├── client/             # Static assets
└── index.js            # Hono server
```

## Contributing

1. Follow TypeScript strict mode
2. Add error handling to new routes
3. Test both dev and production modes
4. Update documentation for new features

## Resources

- [React Router Docs](https://reactrouter.com/)
- [Hono Docs](https://hono.dev/)
- [Vite Docs](https://vitejs.dev/)

## FontAwesome Pro Icons Setup

To use FontAwesome 7 Pro icons with UnoCSS:

1. Obtain your FontAwesome Pro token from [FontAwesome](https://fontawesome.com/)

2. Configure npm to access FontAwesome Pro packages:
   ```bash
   npm config set @fortawesome:registry https://npm.fontawesome.com/
   npm config set //npm.fontawesome.com/:_authToken YOUR_FA_PRO_TOKEN
   ```

3. Install the Pro icon packages:
   ```bash
   deno add npm:@fortawesome/pro-regular-svg-icons npm:@fortawesome/pro-solid-svg-icons npm:@fortawesome/pro-thin-svg-icons npm:@fortawesome/pro-light-svg-icons npm:@fortawesome/pro-duotone-svg-icons
   ```

4. Uncomment the code in `scripts/convert-fa-pro.ts` (follow the instructions in the file)

5. Generate the Iconify JSON files:
   ```bash
   deno task convert-fa-pro
   ```

6. Uncomment the Pro icon collections in `unocss.config.ts`

The Pro icons will be available as `fal-`, `fad-`, `fat-`, `far-`, `fas-` classes in addition to the free `fa-`, `fab-`, `fas-`.

See `scripts/convert-fa-pro.ts` for detailed setup instructions and reference to [Iconify documentation](https://iconify.design/docs/libraries/tools/examples/import-fa-pro.html#using-the-fontawesome-pro-npm-libraries).
