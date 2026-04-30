**Title:** Bug: `Failed to recover TsconfigCache type from napi value` on Linux x86_64 with Vite 8 + React Router

**Description:**
When building a Vite 8 + React Router project on Linux (Ubuntu 24.04, x86_64), the build fails with an NAPI type recovery error related to `TsconfigCache`. The issue is platform-specific and doesn't occur on macOS (arm64).

**Tested Minimal Reproduction:**

This repro has been tested and builds successfully on macOS (arm64). On Linux x86_64, it triggers the `TsconfigCache` NAPI error.

**Steps to Reproduce:**

1. Create a new directory and initialize the project:
```bash
mkdir vite-rolldown-repro && cd vite-rolldown-repro
npm init -y
```

2. Install dependencies:
```bash
npm install react@19.2.5 react-dom@19.2.5 react-router@7.14.2
npm install -D @react-router/dev@7.14.2 typescript@6.0.3 vite@8.0.10
```

3. Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "skipLibCheck": true
  },
  "include": ["app/**/*"]
}
```

4. Create `vite.config.ts`:
```typescript
import { reactRouter } from "@react-router/dev/vite";
import type { UserConfig } from "vite";

export default function config(): UserConfig {
  return {
    plugins: [reactRouter()],
  };
}
```

5. Create `app/root.tsx`:
```tsx
import { Links, Meta, Outlet, Scripts } from "react-router";

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
```

6. Create `app/entry.client.tsx`:
```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./root";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

7. Create `app/routes/home.tsx`:
```tsx
export default function Home() {
  return <h1>Hello World</h1>;
}
```

8. Create `app/routes.ts`:
```typescript
import type { RouteConfig } from "react-router";

export default [
  {
    file: "routes/home.tsx",
    id: "home",
    path: "/",
  },
] satisfies RouteConfig;
```

9. Update `package.json` scripts:
```json
{
  "scripts": {
    "build": "react-router build"
  }
}
```

10. Run build on **Linux (Ubuntu 24.04, x86_64)**:
```bash
npm run build
```

**Expected Behavior:**
Build completes successfully (as it does on macOS).

**Actual Behavior (Linux x86_64 only):**
```
✗ Build failed in X.Xs

Build failed with 9 errors:

[plugin react-router:build-client-route] /app/routes/home.tsx?__react-router-build-client-route
Error: Failed to recover `TsconfigCache` type from napi value
    at transformSync (node_modules/rolldown/dist/shared/resolve-tsconfig-XXX.mjs:83:58)
    at transformWithOxc (node_modules/vite/dist/node/chunks/node.js:3326:17)
    at TransformPluginContext.transform (node_modules/vite/dist/node/chunks/node.js:3411:26)
    at EnvironmentPluginContainer.transform (node_modules/vite/dist/node/chunks/node.js:30164:51)
    at compileRouteFile (node_modules/@react-router/dev/dist/vite.js:2993:21)
    ...
```

**Environment:**
- **OS**: Ubuntu 24.04 (fails), macOS arm64 (works)
- **Architecture**: x86_64 (fails), arm64 (works)
- **Vite**: 8.0.10
- **Rolldown**: 1.0.0-rc.17
- **React Router**: 7.14.2
- **TypeScript**: 6.0.3

**Root Cause:**
The error occurs when rolldown's NAPI bindings try to convert the `TsconfigCache` JavaScript object back to a Rust type on Linux x86_64. The NAPI type recovery fails specifically on this platform.

**Workaround:**
1. **Downgrade to Vite 7.x** (uses esbuild instead of rolldown)
2. **Patch rolldown** to pass `null` instead of `cache` in `transformSync`:
   ```javascript
   // In node_modules/rolldown/dist/shared/resolve-tsconfig-*.mjs
   // Change:
   // const result = (0, import_binding.enhancedTransformSync)(filename, sourceText, options, cache, yarnPnp$1);
   // To:
   // const result = (0, import_binding.enhancedTransformSync)(filename, sourceText, options, null, yarnPnp$1);
   ```

**Additional Notes:**
- ✅ Tested: This repro builds successfully on macOS arm64
- ❌ Fails: Only on Linux x86_64 (Ubuntu 24.04)
- The issue is purely an NAPI type conversion problem in rolldown's Linux bindings
- React Router triggers this via `compileRouteFile` → `pluginContainer.transform()` → `transformSync` with `TsconfigCache`
