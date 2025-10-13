# Server Timing

Monitor SSR performance with Server-Timing headers.

## Viewing Render Time

### Browser DevTools
1. Visit http://localhost:5173/ssr
2. Open DevTools → Network tab
3. Refresh page
4. Click document request → Response Headers
5. Find `Server-Timing: ssr;dur=102.45`

### On the Page
Render time displayed directly: **Render Time: 102.45ms**

### Command Line
```bash
curl -I http://localhost:5173/ssr | grep Server-Timing
# Server-Timing: ssr;dur=102.45
```

## Implementation

```typescript
// In route loader
export function headers({ loaderHeaders }) {
  return {
    'Server-Timing': `ssr;dur=${renderTime}`,
  };
}
```

## What It Measures

- **SSR render time** in milliseconds
- **Server computation** duration
- **Performance monitoring** for optimization

## Browser Support

✅ Chrome/Edge (Network tab)  
✅ Firefox (Network Monitor)  
✅ Safari (Web Inspector)

## Use Cases

- **Performance monitoring**
- **Debugging slow renders**
- **Optimization tracking**
- **Production analytics**

## Advanced Metrics

```typescript
// Multiple metrics
'Server-Timing': [
  `db;dur=45.2;desc="Database"`,
  `api;dur=234.1;desc="API Call"`,
  `render;dur=89.3;desc="React SSR"`
].join(', ')
```

Track database queries, external APIs, and render performance separately.
