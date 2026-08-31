# lazyWithPreload

ESM port of [`react-lazy-with-preload`](https://github.com/ianschmitz/react-lazy-with-preload) (MIT). Pure ESM — avoids CJS issues with Vite's SSR dep optimizer.

## Usage

```tsx
const Dashboard = lazyWithPreload(() => import("./Dashboard"));

// Optional: preload on hover
<button onMouseEnter={() => Dashboard.preload()}>Open</button>;

// Render (chunk downloads on first render if not preloaded)
<Suspense fallback={<Spinner />}>
  <Dashboard />
</Suspense>;
```

## Flow

```
preload()
  │
  ├─ first call → factory() → download chunk
  │                ├─ ✅ resolve → cache component
  │                └─ ❌ reject  → reset state, throw error
  │
  └─ next call → return cached promise (or retry if previous failed)

<Component />
  │
  ├─ PreloadedComponent exists? → render it (skip Suspense)
  └─ no? → React.lazy triggers Suspense fallback
```

## Features

- **Preload** — `.preload()` starts chunk download early (e.g. on hover)
- **Retry** — failed `preload()` resets state next call retries instead of returning cached rejection
- **Stable** — `useRef` ensures preloaded components don't unmount/remount

## API

```ts
lazyWithPreload(factory: () => Promise<{ default: ComponentType }>)
// Returns: LazyExoticComponent<T> & { preload: () => Promise<T> }
```
