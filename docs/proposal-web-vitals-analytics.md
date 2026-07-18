# Proposal: Product Analytics with Amplitude + Web Vitals

## Goal

Track page views and Core Web Vitals (LCP, CLS, INP, FCP, TTFB) in **Amplitude** using the `analytics` abstraction layer (`getanalytics.io`).

## Data Flow

```mermaid
flowchart TD
    subgraph Browser
        A[React Router renders page]
        B[analytics.page&#40;&#41;]
        C[web-vitals listeners]
        D[analytics.track&#40;'Web Vitals', ...&#41;]
    end

    subgraph abstraction ["analytics.js abstraction"]
        E[analytics core]
        F[@analytics/amplitude plugin]
    end

    subgraph destination ["Analytics Backend"]
        G[Amplitude API]
    end

    A --> B
    C --> D
    B --> E
    D --> E
    E --> F
    F --> G
```

All tracking stays in the **browser** — no Worker/SSR changes needed. The `analytics` library normalises calls and forwards them to Amplitude via its plugin.

---

## Proposed Setup

### 1. Install dependencies

```sh
deno install npm:analytics npm:@analytics/amplitude npm:web-vitals
```

### 2. Analytics client module

Create a shared analytics instance so every part of the app uses the same configuration.

```ts
// packages/frontend/app/utils/analytics.ts
import Analytics from 'analytics';
import amplitudePlugin from '@analytics/amplitude';

export const analytics = Analytics({
  app: 'test-hono-react-router-vite',
  plugins: [
    amplitudePlugin({
      apiKey: import.meta.env.VITE_AMPLITUDE_API_KEY,
      options: {
        // Respect Do Not Track — opt-in only
        trackingOptions: {
          ip_address: false,
        },
      },
    }),
  ],
});
```

### 3. Wire web vitals into entry.client.tsx

Use the `web-vitals` library to capture metrics and send them to Amplitude as a structured event.

```ts
// packages/frontend/app/entry.client.tsx
// — add these imports —
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';
import { analytics } from './utils/analytics';

// — add after the Sentry init block (around line 101) —
const webVitalsHandler = (metric: { name: string; value: number; rating: string }) => {
  analytics.track('Web Vitals', {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    path: window.location.pathname,
  });
};

onLCP(webVitalsHandler);
onCLS(webVitalsHandler);
onINP(webVitalsHandler);
onFCP(webVitalsHandler);
onTTFB(webVitalsHandler);
```

### 4. Track page views

Call `analytics.page()` once in the root layout or a dedicated effect so every route navigation records a page view.

```ts
// packages/frontend/app/root.tsx
import { useEffect } from 'react';
import { analytics } from './utils/analytics';

export function layout() {
  useEffect(() => {
    analytics.page();
  }, []);

  return (
    <html>
      {/* ... */}
    </html>
  );
}
```

> **Why a single `useEffect` instead of a React Router middleware?**  
> `analytics.page()` is cheap and idempotent. The `@analytics/amplitude` plugin deduplicates internally, so a single mount effect is sufficient for the SPA case. If you need route-level granularity later, you can move the call into a React Router middleware.

---

## Amplitude Free Plan — Feasibility

| Item | Free Plan |
|---|---|
| **Monthly events** | 2 million |
| **Cost** | $0 forever |
| **Credit card** | Not required |
| **Seats** | Unlimited |

With ~10 events per visit (1 page view + a few interactions + 5 web vital metrics), the free tier covers roughly **200,000 visits/month** (~6,600/day). More than enough for a typical website.

---

## Why `analytics` (getanalytics.io) instead of the raw Amplitude SDK?

| Concern | Raw Amplitude SDK | `analytics` abstraction |
|---|---|---|
| **Vendor lock-in** | Full lock-in | Swap providers by changing one plugin |
| **API surface** | Amplitude-specific | Simple `page()`, `track()`, `identify()` |
| **Switching cost** | Rewrite all calls | Change plugin, keep calls |
| **Bundle size** | ~35 kB min | ~5 kB core + ~3 kB plugin |
| **Debugging** | Amplitude debug tools | Built-in `debug: true` mode + lifecycle hooks |

If you never plan to switch providers, the raw Amplitude SDK is simpler (fewer deps). The abstraction pays for itself the moment you want to dual-write to a second provider or migrate.

---

## Files to create / modify

| File | Action |
|---|---|
| `packages/frontend/app/utils/analytics.ts` | **Create** — analytics client instance |
| `packages/frontend/app/entry.client.tsx` | **Edit** — add web-vitals listeners |
| `packages/frontend/app/root.tsx` | **Edit** — add page view tracking |
| `.env.example` / deploy secrets | Add `VITE_AMPLITUDE_API_KEY` |

No Worker, SSR, or build config changes required.
