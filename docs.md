# Project Documentation

A modern full-stack web application using React Router v7, Hono, and Vite with hybrid rendering (SSG + SSR + CSR).

## Quick Start

```bash
pnpm install
pnpm dev  # Development at http://localhost:5173
pnpm build && pnpm start  # Production at http://localhost:3000
```

## Architecture

### Development Mode
- **Port**: 5173
- **Server**: Vite dev server with HMR
- **API**: Hono handles `/api/*` routes
- **Pages**: React Router handles all other routes

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
| `/api/*` | API | Hono endpoints |
| `/*` | SSR | 404 catch-all |

## Setup & Configuration

### Project Structure
```
app/
├── server.ts          # Hono API server
├── root.tsx           # Root layout
├── routes.ts          # Route definitions
└── routes/            # Page components
    ├── home.tsx
    ├── about.tsx
    └── ...

vite.config.ts         # Vite + React Router config
react-router.config.ts # Rendering config
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

**`vite.config.ts`**: Integrates React Router and Hono dev server.

**`app/server.ts`**: Hono app with API routes and production static file serving.

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
- [ ] `pnpm dev` starts without errors
- [ ] Pages load at http://localhost:5173
- [ ] API works at `/api/test`
- [ ] `pnpm build` completes
- [ ] `pnpm start` serves production

### Common Issues
- **Dev server won't start**: Check port 5173 availability
- **API not working**: Ensure `/api/*` prefix
- **Build fails**: Run `pnpm typecheck`
- **HMR not working**: Check for TypeScript errors

## Deployment

### Docker
```dockerfile
FROM node:20-alpine
COPY . /app
RUN pnpm install && pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

### Production Checklist
- [ ] Environment variables set
- [ ] Database connections configured
- [ ] Error logging enabled
- [ ] HTTPS enabled
- [ ] CDN for static assets

## API Routes

Define in `app/server.ts`:

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
   pnpm add -D @fortawesome/pro-regular-svg-icons @fortawesome/pro-solid-svg-icons @fortawesome/pro-thin-svg-icons @fortawesome/pro-light-svg-icons @fortawesome/pro-duotone-svg-icons
   ```

4. Uncomment the code in `scripts/convert-fa-pro.ts` (follow the instructions in the file)

5. Generate the Iconify JSON files:
   ```bash
   pnpm run convert-fa-pro
   # or
   deno task convert-fa-pro
   ```

6. Uncomment the Pro icon collections in `unocss.config.ts`

The Pro icons will be available as `fal-`, `fad-`, `fat-`, `far-`, `fas-` classes in addition to the free `fa-`, `fab-`, `fas-`.

See `scripts/convert-fa-pro.ts` for detailed setup instructions and reference to [Iconify documentation](https://iconify.design/docs/libraries/tools/examples/import-fa-pro.html#using-the-fontawesome-pro-npm-libraries).
