# Build Setup Summary

## ✅ What We Achieved

Successfully configured the project to build everything with Vite into a single `build/` folder for easy Docker deployment.

## 📁 Build Structure

```
build/
├── index.js              ← Hono server entry point (built by Vite)
├── assets/
│   └── index-*.js        ← Server bundle assets
├── client/               ← React Router client build
│   ├── index.html
│   ├── assets/
│   └── ...
└── server/               ← React Router SSR build
    └── index.js
```

## 🔧 Configuration

### Vite Config (`vite.config.ts`)
- Uses `--mode server` flag to trigger server build
- Regular mode: React Router client + SSR build
- Server mode: Builds `app/server.ts` to `build/index.js`
- Key setting: `emptyOutDir: false` to preserve React Router builds

### Build Command
```bash
pnpm build
# Runs: react-router build && vite build --mode server
```

### Start Command
```bash
pnpm start
# Runs: NODE_ENV=production node ./build/index.js
```

## 🐳 Docker Setup

The Dockerfile uses:
- Node.js 20 Alpine
- pnpm for package management
- Multi-stage build for optimization
- Only copies `build/` folder to final image

## 🔄 How It Works

1. **Development**: `pnpm dev` runs Vite with Hono dev server + React Router
2. **Build**:
   - React Router builds client assets to `build/client/`
   - React Router builds SSR to `build/server/`
   - Vite builds Hono server to `build/index.js`
3. **Production**: `node build/index.js` starts Hono server which:
   - Serves API routes at `/api/*`
   - Serves static files from `build/client/`
   - Handles React Router SSR for all other routes

## ⚠️ Notes

- **Bun**: Currently doesn't support React 19's `renderToPipeableStream`. Use Node.js for production.
- **No tsx needed**: Everything is pre-built by Vite
- **Single folder deployment**: Only `build/` + `node_modules` needed in production
