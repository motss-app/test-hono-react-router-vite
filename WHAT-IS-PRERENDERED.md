# What Routes Are Being Prerendered? 📊

## Current Status (After Build)

Your app is currently prerendering **3 routes**:

```
✅ /           → build/client/index.html
✅ /about      → build/client/about/index.html  
✅ /errors     → build/client/errors/index.html + errors.data
```

---

## Configuration

**File:** `react-router.config.ts`

```typescript
export default {
  prerender() {
    return ['/', '/about', '/errors'];
  },
  ssr: true,
} satisfies Config;
```

---

## What Each Route Does

### ✅ `/` (Home Page) - PRERENDERED

**Speed:** ⚡⚡⚡ **Instant** (Static HTML)

**What it does:**
- Shows home page with navigation links
- No dynamic data
- Same for all users

**File generated:** `build/client/index.html`

**Result:**
- Served as static HTML
- No server computation
- Fastest possible load time

---

### ✅ `/about` - PRERENDERED

**Speed:** ⚡⚡⚡ **Instant** (Static HTML)

**What it does:**
- Shows about page
- No dynamic data
- Same for all users

**File generated:** `build/client/about/index.html`

**Result:**
- Served as static HTML
- No server computation
- Fastest possible load time

---

### ✅ `/errors` - PRERENDERED (Base Page)

**Speed:** ⚡⚡⚡ **Instant** (Static HTML)

**What it does:**
- Shows error demo page with buttons
- Base page is static
- Error demos work via client-side navigation

**Files generated:**
- `build/client/errors/index.html` (HTML)
- `build/client/errors.data` (Loader data)

**Prerendered loader data:**
```json
{
  "message": "No error triggered"
}
```

**Result:**
- Initial page load: ⚡⚡⚡ Instant (static)
- Click error buttons: ⚡⚡ Fast (triggers loader on client)

---

### ❌ `/ssr` - NOT PRERENDERED (SSR Only)

**Speed:** ⚡⚡ **Fast** (Server-Side Rendered)

**Why NOT prerendered:**
- Shows current timestamp
- Shows user's User-Agent
- Measures server render time
- **Different for every request**

**How it works:**
1. User visits `/ssr`
2. Server runs loader (fetches timestamp, User-Agent)
3. Server renders HTML with current data
4. Sends HTML to browser

**This is intentional!** The whole point is to demonstrate SSR vs SSG.

---

### ❌ `/*` (404 Catch-All) - NOT PRERENDERED

**Speed:** ⚡⚡ **Fast** (Server-Side Rendered)

**Why NOT prerendered:**
- Shows the URL that was not found
- **Different for every 404 URL**

**How it works:**
1. User visits `/non-existent-page`
2. No route matches
3. Catch-all route runs loader
4. Shows 404 page with URL

---

## Build Output Explained

When you run `pnpm build`:

```bash
Prerender (html): / -> build/client/index.html
Prerender (html): /about -> build/client/about/index.html
Prerender (data): /errors -> build/client/errors.data
Prerender (html): /errors -> build/client/errors/index.html
✓ built in 94ms
```

**What this means:**

1. **`Prerender (html): /`**
   - Generates static HTML for home page
   - File: `build/client/index.html`

2. **`Prerender (html): /about`**
   - Generates static HTML for about page
   - File: `build/client/about/index.html`

3. **`Prerender (data): /errors`**
   - Runs loader at build time
   - Saves loader data to `errors.data`

4. **`Prerender (html): /errors`**
   - Generates static HTML for errors page
   - Uses data from step 3
   - File: `build/client/errors/index.html`

---

## Directory Structure

```
build/client/
├── index.html                    ← / (home)
├── about/
│   └── index.html                ← /about
├── errors/
│   └── index.html                ← /errors
├── errors.data                   ← /errors loader data
├── assets/                       ← JS, CSS bundles
│   ├── root-[hash].js
│   ├── home-[hash].js
│   └── ...
└── favicon.ico
```

---

## Routes You COULD Add to Prerender

### Currently Available Routes

| Route      | Currently Prerendered? | Could Be Prerendered? | Should You?            |
| ---------- | ---------------------- | --------------------- | ---------------------- |
| `/`        | ✅ YES                  | ✅ YES                 | ✅ YES                  |
| `/about`   | ✅ YES                  | ✅ YES                 | ✅ YES                  |
| `/errors`  | ✅ YES                  | ✅ YES                 | ✅ YES                  |
| `/ssr`     | ❌ NO                   | ❌ NO                  | ❌ NO (defeats purpose) |
| `/*` (404) | ❌ NO                   | ❌ NO                  | ❌ NO (dynamic)         |

---

## When to Add More Routes

### Add to Prerender If:

✅ **Static content** - Same HTML for all users
✅ **No auth required** - Public pages
✅ **Doesn't change often** - Updates at deploy time
✅ **SEO important** - Needs to be crawlable

**Examples:**
- Marketing pages
- Documentation
- Blog posts (if they don't change)
- Landing pages
- Legal pages (Terms, Privacy)

### Keep as SSR If:

❌ **Dynamic data** - Different per user
❌ **Authentication** - Behind login
❌ **Personalized** - User-specific content
❌ **Real-time** - Data changes frequently
❌ **Request-specific** - Depends on headers/cookies

**Examples:**
- User dashboards
- Admin panels
- User profiles
- Real-time feeds
- Shopping carts

---

## Adding More Routes

### Example: Add a Contact Page

#### 1. Create Route

```typescript
// app/routes/contact.tsx
export default function Contact() {
  return (
    <div>
      <h1>Contact Us</h1>
      <p>Email: hello@example.com</p>
    </div>
  );
}
```

#### 2. Add to Routes

```typescript
// app/routes.ts
export default [
  index("routes/home.tsx"),
  route("/about", "./routes/about.tsx"),
  route("/contact", "./routes/contact.tsx"), // ← Add this
  route("/ssr", "./routes/ssr.tsx"),
  route("/errors", "./routes/errors.tsx"),
  route("*", "./routes/$.tsx"),
] satisfies RouteConfig;
```

#### 3. Add to Prerender Config

```typescript
// react-router.config.ts
export default {
  prerender() {
    return ['/', '/about', '/contact', '/errors']; // ← Add /contact
  },
  ssr: true,
} satisfies Config;
```

#### 4. Build

```bash
pnpm build
```

**Output:**
```
Prerender (html): / -> build/client/index.html
Prerender (html): /about -> build/client/about/index.html
Prerender (html): /contact -> build/client/contact/index.html  ← New!
Prerender (html): /errors -> build/client/errors/index.html
```

---

## Advanced: Prerender with Dynamic Routes

### Example: Blog Posts

```typescript
// react-router.config.ts
export default {
  async prerender() {
    // Fetch all blog posts at build time
    const posts = [
      { slug: 'hello-world' },
      { slug: 'react-router-tips' },
      { slug: 'vite-guide' },
    ];
    
    return [
      '/',
      '/about',
      '/errors',
      '/blog',
      ...posts.map(post => `/blog/${post.slug}`),
    ];
  },
  ssr: true,
} satisfies Config;
```

**Result:**
```
Prerender (html): / -> build/client/index.html
Prerender (html): /about -> build/client/about/index.html
Prerender (html): /blog -> build/client/blog/index.html
Prerender (html): /blog/hello-world -> build/client/blog/hello-world/index.html
Prerender (html): /blog/react-router-tips -> build/client/blog/react-router-tips/index.html
Prerender (html): /blog/vite-guide -> build/client/blog/vite-guide/index.html
```

---

## Testing Prerendering

### 1. Build the App

```bash
pnpm build
```

### 2. Check Generated Files

```bash
ls -la build/client/
ls -la build/client/about/
ls -la build/client/errors/
```

### 3. Start Production Server

```bash
pnpm start
```

### 4. Test Routes

**Prerendered routes (instant load):**
- http://localhost:3000/
- http://localhost:3000/about
- http://localhost:3000/errors

**SSR routes (fast load):**
- http://localhost:3000/ssr

### 5. Verify in DevTools

Open Network tab:
- Prerendered: Shows HTML file with status 200 (from disk)
- SSR: Shows HTML with Server-Timing header

---

## Performance Comparison

### Prerendered (`/`, `/about`, `/errors`)

```
Request → Static File Server → HTML (instant)
         ⚡ 0-50ms
```

**Characteristics:**
- ⚡⚡⚡ Fastest possible
- ✅ Can be served from CDN
- ✅ No server computation
- ✅ Perfect for SEO

### SSR (`/ssr`)

```
Request → Node Server → Run Loader → Render React → HTML
         ⚡⚡ 50-200ms
```

**Characteristics:**
- ⚡⚡ Fast but slower than static
- ❌ Requires Node server
- ✅ Always fresh data
- ✅ User-specific content

---

## Summary

### Your Current Setup ✅

```
Prerendered (SSG):     3 routes
├─ /                   ⚡⚡⚡ Instant
├─ /about              ⚡⚡⚡ Instant
└─ /errors             ⚡⚡⚡ Instant

Server-Rendered (SSR): 2 routes
├─ /ssr                ⚡⚡ Fast (dynamic)
└─ /* (404)            ⚡⚡ Fast (dynamic)
```

### This is Perfect! 🎉

You have:
- ✅ **Static pages** for marketing/info pages
- ✅ **Dynamic pages** for interactive demos
- ✅ **Best of both worlds** - Hybrid rendering
- ✅ **Optimal performance** - Fast everywhere

---

## Quick Reference

### Check What's Prerendered

```bash
# Build and see output
pnpm build | grep Prerender

# Check files
ls build/client/
```

### Add Route to Prerender

```typescript
// 1. Make sure route has no dynamic loader
// 2. Add to react-router.config.ts
prerender() {
  return ['/', '/about', '/your-route'];
}
```

### Remove Route from Prerender

```typescript
// Remove from array
prerender() {
  return ['/', '/about']; // removed '/errors'
}
```

### Test Prerendering

```bash
pnpm build && pnpm start
# Visit routes and check Network tab
```

---

## Need Help?

See full documentation:
- **PRERENDERING-GUIDE.md** - Complete guide
- **RENDERING-MODES.md** - SSG vs SSR vs CSR explained
- **SETUP.md** - Initial setup guide
