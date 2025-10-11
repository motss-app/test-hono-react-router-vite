# Server Timing Guide

## How to View Server Render Time

### Method 1: Browser DevTools (Recommended)

1. Open the SSR page: http://localhost:5173/ssr
2. Open DevTools (F12 or Cmd+Opt+I on Mac)
3. Go to **Network** tab
4. Refresh the page
5. Click on the document request (usually first item named `ssr`)
6. Look at **Response Headers**
7. Find `Server-Timing` header

You'll see something like:
```
Server-Timing: ssr;dur=102.45
```

This means the server took 102.45ms to render the page.

### Method 2: On the Page

The render time is also displayed directly on the page:
- **Render Time:** 102.45ms

### Method 3: Using curl

```bash
curl -I http://localhost:5173/ssr | grep -i server-timing
```

Output:
```
Server-Timing: ssr;dur=102.45
```

---

## Understanding Server-Timing Header

The `Server-Timing` header is a standard HTTP header that allows servers to communicate performance metrics to the browser.

### Format:
```
Server-Timing: <metric>;dur=<duration>;desc="<description>"
```

### Our Implementation:
```typescript
export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return {
    'Server-Timing': `ssr;dur=${duration}`,
  };
}
```

### Browser Support:
✅ Chrome/Edge (DevTools Network tab)  
✅ Firefox (Network Monitor)  
✅ Safari (Web Inspector)  

---

## Chrome DevTools Error - FIXED

### The Error:
```
Error: No route matches URL "/.well-known/appspecific/com.chrome.devtools.json"
```

### What It Is:
- Chrome DevTools checking if there's a browser extension/devtools for your app
- Completely harmless, but noisy in console
- Standard Chrome behavior

### The Fix:
Created a catch-all 404 route (`app/routes/$.tsx`) that:
1. Silently handles special paths like `.well-known/*`
2. Shows a nice 404 page for actual missing routes
3. Prevents error logs for Chrome DevTools requests

### Result:
✅ No more error messages in console  
✅ Proper 404 handling for real missing pages  
✅ Chrome DevTools can still work normally  

---

## Performance Metrics You Can Add

### 1. Database Query Time
```typescript
export async function loader() {
  const dbStart = performance.now();
  const data = await db.query();
  const dbEnd = performance.now();
  
  return Response.json(data, {
    headers: {
      'Server-Timing': `db;dur=${(dbEnd - dbStart).toFixed(2)};desc="Database"`,
    },
  });
}
```

### 2. Multiple Metrics
```typescript
const timings = [
  `db;dur=${dbTime};desc="Database Query"`,
  `api;dur=${apiTime};desc="External API"`,
  `render;dur=${renderTime};desc="React Render"`,
];

return Response.json(data, {
  headers: {
    'Server-Timing': timings.join(', '),
  },
});
```

### 3. Cache Hit/Miss
```typescript
const cacheHit = await cache.get(key);
return Response.json(data, {
  headers: {
    'Server-Timing': `cache;dur=0;desc="${cacheHit ? 'Hit' : 'Miss'}"`,
  },
});
```

---

## Viewing Server-Timing in Different Browsers

### Chrome DevTools
1. Network tab → Select request
2. Headers → Response Headers → `Server-Timing`
3. **Timing** tab → See visual breakdown

### Firefox DevTools
1. Network Monitor → Select request
2. Headers → Response Headers → `Server-Timing`
3. Timings → Server timing section

### Safari Web Inspector
1. Network → Select request
2. Headers → Response → `Server-Timing`

---

## Production Monitoring

In production, you can:

1. **Send to Analytics:**
```typescript
// Send Server-Timing to your analytics
analytics.track('ssr_render_time', {
  duration: renderTime,
  route: '/ssr',
});
```

2. **Log to Server:**
```typescript
console.log(`[SSR] Rendered /ssr in ${renderTime}ms`);
```

3. **Alert on Slow Renders:**
```typescript
if (renderTime > 1000) {
  alert.notify(`Slow SSR: ${renderTime}ms`);
}
```

---

## Best Practices

1. ✅ **Use Server-Timing** for all SSR routes
2. ✅ **Track database queries** separately
3. ✅ **Monitor external API calls**
4. ✅ **Set performance budgets** (e.g., < 500ms)
5. ✅ **Cache aggressively** when possible
6. ✅ **Use CDN** for static assets

---

## Example Real-World Metrics

```
Server-Timing: 
  db;dur=45.2;desc="User Query",
  auth;dur=12.5;desc="Auth Check",
  api;dur=234.1;desc="Stripe API",
  render;dur=89.3;desc="React SSR",
  total;dur=381.1;desc="Total"
```

This tells you exactly where time is spent!
