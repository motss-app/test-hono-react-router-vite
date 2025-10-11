# Rendering Modes in This Project

This project demonstrates all three rendering modes supported by React Router v7:

## 1. SSG (Static Site Generation) ⚡

**Routes:** `/` (home), `/about`

**How it works:**
- Pre-rendered at **build time** (`pnpm build`)
- Creates static HTML files: `build/client/index.html`, `build/client/about/index.html`
- Served instantly from disk (no server rendering)
- Perfect for content that doesn't change often

**Configuration:**
```typescript
// react-router.config.ts
export default {
  ssr: true,
  prerender() {
    return ['/', '/about'];  // These routes are pre-rendered
  },
}
```

**Code:**
```typescript
// app/routes/home.tsx - NO loader = SSG
export default function Home() {
  return <div>Home Page</div>;
}
```

**When to use:**
- Landing pages
- Marketing pages
- Documentation
- Blog posts (with build on content change)

---

## 2. SSR (Server-Side Rendering) 🔄

**Routes:** `/ssr`

**How it works:**
- Rendered on the **server for EVERY request**
- Fresh data on each page load
- Server runs the `loader` function
- HTML is generated dynamically

**Configuration:**
```typescript
// react-router.config.ts
export default {
  ssr: true,  // Enables SSR capability
  prerender() {
    return ['/', '/about'];  // /ssr is NOT in this list
  },
}
```

**Code:**
```typescript
// app/routes/ssr.tsx - HAS loader = SSR
export async function loader({ request }) {
  // This runs on the server for every request
  return {
    timestamp: new Date().toISOString(),
    data: await fetchDynamicData(),
  };
}

export default function SSRPage({ loaderData }) {
  return <div>{loaderData.timestamp}</div>;
}
```

**When to use:**
- User dashboards
- Personalized content
- Real-time data
- Authentication-required pages
- Dynamic content that changes frequently

---

## 3. CSR (Client-Side Rendering) 💻

**How it works:**
- Initial HTML shell from server
- React hydrates on the client
- All rendering happens in the browser
- Client-side navigation (SPA-like)

**Code:**
```typescript
// Any route without a loader and not prerendered
export default function ClientPage() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}
```

**When to use:**
- Highly interactive UIs
- Forms with complex state
- Real-time updates (WebSocket)
- Client-side only features

---

## Comparison Table

| Feature            | SSG               | SSR            | CSR                     |
| ------------------ | ----------------- | -------------- | ----------------------- |
| **When rendered**  | Build time        | Every request  | Client browser          |
| **Performance**    | ⚡ Fastest         | 🔄 Dynamic      | 💻 Depends on client     |
| **Fresh data**     | ❌ Only on rebuild | ✅ Always fresh | ✅ Can fetch client-side |
| **SEO**            | ✅ Perfect         | ✅ Perfect      | ⚠️ Needs hydration       |
| **Server load**    | ✅ None (static)   | ⚠️ Medium       | ✅ None                  |
| **Has loader**     | ❌ No              | ✅ Yes          | Optional                |
| **In prerender()** | ✅ Yes             | ❌ No           | ❌ No                    |

---

## How to Choose

### Use SSG when:
- Content rarely changes
- Same content for all users
- Maximum performance needed
- SEO critical

### Use SSR when:
- Content changes frequently
- Personalized per user
- Need fresh data on every load
- SEO critical + dynamic content

### Use CSR when:
- Highly interactive
- User-specific state
- No SEO needed
- Real-time updates

---

## Development vs Production

### Development Mode (`pnpm dev`)
- All routes work with HMR
- SSR routes are rendered on request (simulated)
- SSG routes behave like SSR (for dev experience)

### Production Mode (`pnpm build` + `pnpm start`)
- SSG routes → Pre-rendered static HTML files
- SSR routes → Rendered on each request by server
- CSR routes → Hydrated on client

---

## Testing Different Modes

### Test SSG (/)
```bash
# Build
pnpm build

# Check that static file was created
ls build/client/index.html

# Start production server
pnpm start

# Visit http://localhost:3000
# Refresh multiple times - timestamp doesn't change (static)
```

### Test SSR (/ssr)
```bash
# Visit http://localhost:5173/ssr (dev) or http://localhost:3000/ssr (prod)
# Refresh multiple times - timestamp DOES change (server-rendered)
```

### Test CSR
```bash
# Add useState hooks and interactive elements
# See updates happen instantly on client without server round-trip
```

---

## Current Routes in This Project

| Route       | Mode | Description                    |
| ----------- | ---- | ------------------------------ |
| `/`         | SSG  | Home page (pre-rendered)       |
| `/about`    | SSG  | About page (pre-rendered)      |
| `/ssr`      | SSR  | Server-rendered page (dynamic) |
| `/api/test` | -    | Hono API endpoint (JSON)       |

---

## Migration Examples

### Convert SSG → SSR
```typescript
// Before (SSG)
export default function Page() {
  return <div>Static</div>;
}

// After (SSR)
export async function loader() {
  return { data: await fetchData() };
}

export default function Page({ loaderData }) {
  return <div>{loaderData.data}</div>;
}

// Also remove from prerender() array in react-router.config.ts
```

### Convert SSR → SSG
```typescript
// Add to prerender() array in react-router.config.ts
prerender() {
  return ['/', '/about', '/your-route'];
}

// Remove or simplify loader (data will be fetched at build time)
```

---

## Best Practices

1. **Default to SSG** when possible (fastest)
2. **Use SSR** for personalized/dynamic content
3. **Use CSR** for interactive widgets
4. **Mix modes** - SSG page with CSR components
5. **Test production build** to verify rendering mode

---

## Performance Tips

### SSG
- ✅ Use for maximum performance
- ✅ Serve from CDN
- ✅ Cache forever (with versioned assets)

### SSR
- ✅ Cache loader responses when possible
- ✅ Use `stale-while-revalidate` caching
- ✅ Minimize database queries in loaders

### CSR
- ✅ Use React.lazy() for code splitting
- ✅ Implement loading states
- ✅ Cache API responses client-side
