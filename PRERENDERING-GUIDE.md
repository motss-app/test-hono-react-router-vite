# Prerendering Guide

## Current Configuration

Your `react-router.config.ts` currently prerenders:
```typescript
prerender() {
  return ['/', '/about'];
}
```

---

## What Can Be Prerendered? ✅

### ✅ Routes You CAN Prerender

| Route      | Can Prerender? | Why                          | Currently? |
| ---------- | -------------- | ---------------------------- | ---------- |
| `/` (home) | ✅ YES          | No loader, static content    | ✅ YES      |
| `/about`   | ✅ YES          | No loader, static content    | ✅ YES      |
| `/errors`  | ⚠️ CONDITIONAL  | Has loader but can be static | ❌ NO       |

### ❌ Routes You CANNOT Prerender

| Route           | Can Prerender? | Why                                           |
| --------------- | -------------- | --------------------------------------------- |
| `/ssr`          | ❌ NO           | Loader runs on every request, shows timestamp |
| `*` (catch-all) | ❌ NO           | Dynamic 404 handler                           |

---

## Detailed Analysis

### ✅ `/` (Home Page) - ALREADY PRERENDERED

**File:** `app/routes/home.tsx`

**Why it can be prerendered:**
- ❌ No loader
- ❌ No dynamic data
- ✅ Pure static content
- ✅ Same HTML for all users

**Result:**
- Built as static HTML at build time
- Served instantly from CDN/static files
- No server computation needed

---

### ✅ `/about` - ALREADY PRERENDERED

**File:** `app/routes/about.tsx`

**Why it can be prerendered:**
- ❌ No loader
- ❌ No dynamic data
- ✅ Pure static content
- ✅ Same HTML for all users

**Result:**
- Built as static HTML at build time
- Served instantly from CDN/static files
- No server computation needed

---

### ⚠️ `/errors` - CAN BE PRERENDERED (WITH CHANGES)

**File:** `app/routes/errors.tsx`

**Current state:**
- ✅ Has a loader that checks query params
- ⚠️ Without query params, shows static demo page
- ✅ Could be prerendered if loader returns default state

**How to make it prerenderable:**

#### Option 1: Keep Dynamic (Current - Don't Prerender)
Leave it as-is. The error demos need the loader to work properly.

**Pros:**
- Error demos work correctly
- Interactive buttons trigger loaders

**Cons:**
- Requires SSR on first visit
- Slightly slower initial load

#### Option 2: Prerender Base Page (Recommended)
Modify the loader to be prerender-friendly:

```typescript
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const errorType = url.searchParams.get('type');

  // Allow prerendering when no query param
  if (!errorType) {
    return { message: 'No error triggered', isPrerendered: true };
  }

  // Dynamic error handling for query params
  switch (errorType) {
    case '404':
      throw new Response('Not Found', { status: 404 });
    // ... rest of cases
  }
}
```

Then add to prerender config:
```typescript
prerender() {
  return ['/', '/about', '/errors'];
}
```

**Pros:**
- Fast initial page load (prerendered)
- Error demos still work when clicking buttons
- Best of both worlds

**Cons:**
- Error demos require JavaScript to work (buttons use navigation)

---

### ❌ `/ssr` - CANNOT BE PRERENDERED

**File:** `app/routes/ssr.tsx`

**Why it CANNOT be prerendered:**
```typescript
export async function loader({ request }: Route.LoaderArgs) {
  const startTime = performance.now();
  
  // Fetches NEW data on EVERY request
  const timestamp = new Date().toISOString();
  const userAgent = request.headers.get('user-agent') || 'Unknown';
  
  // ... returns different data each time
}
```

**Characteristics:**
- ✅ Runs on EVERY request
- ✅ Shows current timestamp
- ✅ Shows user's User-Agent
- ✅ Measures render time
- ❌ Cannot be static HTML

**This is the WHOLE POINT of this route** - to demonstrate SSR vs SSG!

---

### ❌ `*` (Catch-all 404) - CANNOT BE PRERENDERED

**File:** `app/routes/$.tsx`

**Why it CANNOT be prerendered:**
```typescript
export function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  
  // Dynamic - depends on which URL user visits
  return { url: url.pathname, silent: false };
}
```

**Characteristics:**
- ✅ Handles ANY non-matching route
- ✅ Shows the URL that was not found
- ❌ Different for every 404 URL
- ❌ Cannot predict all possible 404s

---

## Recommended Prerender Configuration

### Current (Working) ✅

```typescript
// react-router.config.ts
export default {
  prerender() {
    return ['/', '/about'];
  },
  ssr: true,
} satisfies Config;
```

**Result:**
- ✅ `/` - Prerendered (static HTML)
- ✅ `/about` - Prerendered (static HTML)
- ✅ `/errors` - SSR (rendered on request)
- ✅ `/ssr` - SSR (rendered on request)
- ✅ `/*` - SSR (404 handler)

---

### Option: Add `/errors` ⚠️

```typescript
export default {
  prerender() {
    return ['/', '/about', '/errors'];
  },
  ssr: true,
} satisfies Config;
```

**Result:**
- ✅ `/errors` loads faster (static HTML)
- ✅ Error demo buttons still work (client-side navigation triggers loader)
- ⚠️ Slight trade-off: first load is static, demos need JS

---

## When to Prerender vs SSR

### ✅ Prerender (SSG) When:

1. **Content is static**
   - Marketing pages
   - About/Contact pages
   - Documentation
   - Blog posts (if content doesn't change often)

2. **Same for all users**
   - No authentication required
   - No personalization
   - No user-specific data

3. **Doesn't change frequently**
   - Changes at deploy time, not runtime
   - Updates are intentional (deploy new version)

4. **SEO is critical**
   - Faster initial load = better SEO
   - Fully crawlable by bots

### ❌ Use SSR When:

1. **Content is dynamic**
   - User dashboards
   - Admin panels
   - Real-time data

2. **Personalized**
   - Shows user name
   - Different content per user
   - Authentication required

3. **Frequently changing**
   - Live feeds
   - Stock prices
   - Chat applications

4. **Request-specific**
   - Depends on headers (User-Agent, cookies)
   - Depends on query params
   - Depends on POST data

### 🎯 Use CSR (Client-Side) When:

1. **Highly interactive**
   - SPAs with lots of state
   - Complex forms
   - Real-time updates

2. **No SEO needed**
   - Behind login
   - Private dashboards
   - Internal tools

3. **JavaScript-heavy**
   - Games
   - Rich editors
   - Data visualization

---

## Prerendering Advanced Options

### Async Prerendering

If you need to fetch data to determine routes:

```typescript
export default {
  async prerender() {
    // Fetch blog posts from API/database
    const posts = await fetchBlogPosts();
    
    return [
      '/',
      '/about',
      ...posts.map(post => `/blog/${post.slug}`)
    ];
  },
  ssr: true,
} satisfies Config;
```

### Prerender with Loaders

Routes with loaders CAN be prerendered if the loader:
1. Returns static data
2. Doesn't depend on request headers
3. Doesn't use request-specific data

**Example:**

```typescript
// ✅ Can be prerendered
export async function loader() {
  const posts = await fetchBlogPosts();
  return { posts };
}

// ❌ Cannot be prerendered
export async function loader({ request }) {
  const user = await getUser(request); // Depends on cookies
  return { user };
}
```

---

## Your Routes Summary

### Current Setup

```
┌─────────────┬───────────────┬────────────────┐
│ Route       │ Rendering     │ Speed          │
├─────────────┼───────────────┼────────────────┤
│ /           │ SSG (Pre)     │ ⚡⚡⚡ Instant │
│ /about      │ SSG (Pre)     │ ⚡⚡⚡ Instant │
│ /errors     │ SSR (Dynamic) │ ⚡⚡ Fast      │
│ /ssr        │ SSR (Dynamic) │ ⚡⚡ Fast      │
│ /* (404)    │ SSR (Dynamic) │ ⚡⚡ Fast      │
└─────────────┴───────────────┴────────────────┘
```

### If You Add `/errors` to Prerender

```
┌─────────────┬───────────────┬────────────────┐
│ Route       │ Rendering     │ Speed          │
├─────────────┼───────────────┼────────────────┤
│ /           │ SSG (Pre)     │ ⚡⚡⚡ Instant │
│ /about      │ SSG (Pre)     │ ⚡⚡⚡ Instant │
│ /errors     │ SSG (Pre)     │ ⚡⚡⚡ Instant │
│ /ssr        │ SSR (Dynamic) │ ⚡⚡ Fast      │
│ /* (404)    │ SSR (Dynamic) │ ⚡⚡ Fast      │
└─────────────┴───────────────┴────────────────┘
```

---

## Testing Prerendering

### Build and Check Output

```bash
pnpm build
```

Look for:
```
vite v7.1.9 building for production...
✓ built in 2.34s

Prerendering 2 routes with React Router...
├ / -> build/client/index.html
├ /about -> build/client/about/index.html
✓ prerendered 2 routes in 1.23s
```

### Check Generated Files

```bash
ls -la build/client/
# Should see:
# index.html        <- / route
# about/
#   index.html      <- /about route
```

### Verify in Production

```bash
pnpm start
```

Visit:
- http://localhost:3000/ (should load instantly, no SSR)
- http://localhost:3000/about (should load instantly, no SSR)
- http://localhost:3000/ssr (should show timestamp, SSR each time)

---

## Recommendation for Your App

**Keep current configuration** ✅

```typescript
prerender() {
  return ['/', '/about'];
}
```

**Why:**
- ✅ Home and About are perfect for prerendering
- ✅ `/ssr` MUST be SSR (that's its purpose)
- ✅ `/errors` works fine with SSR (demo functionality)
- ✅ Clear distinction between SSG and SSR routes

**Optional:** If you want `/errors` to load slightly faster, you can add it to prerender, but the current setup is optimal.

---

## Summary

### ✅ CAN Prerender:
- `/` - Already prerendered ✅
- `/about` - Already prerendered ✅
- `/errors` - Could add, but SSR is fine ⚠️

### ❌ CANNOT Prerender:
- `/ssr` - Must be SSR (shows timestamp) ❌
- `/*` (404) - Must be SSR (dynamic URL) ❌

### Your Current Setup is Perfect! 🎉

You have a **hybrid rendering** setup:
- **SSG** for static pages (/, /about)
- **SSR** for dynamic pages (/ssr, /errors, 404)
- **CSR** for interactivity (React components work everywhere)

This is the **best of all worlds**! 🚀
