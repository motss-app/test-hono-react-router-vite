# Build Setup

Project builds everything into a single `build/` folder for easy deployment.

## Build Structure

```
build/
├── index.js              # Hono server (production entry)
├── assets/               # Server bundle assets
├── client/               # React Router client build
│   ├── index.html        # SSG pages
│   ├── assets/           # JS/CSS bundles
│   └── ...
└── server/               # React Router SSR build
    └── index.js
```

## Build Process

```bash
deno task build  # Runs: react-router build && vite build --mode server
```

1. **React Router build**: Creates client + SSR bundles
2. **Vite server build**: Compiles `app/server.ts` to `build/index.js`

## Configuration

### `vite.config.ts`
- `--mode server` triggers Hono server build
- `emptyOutDir: false` preserves React Router builds

### Production Start
```bash
deno task start  # NODE_ENV=production node ./build/index.js
```

## Docker Deployment

- **Base**: Deno runtime
- **Package manager**: Deno
- **Multi-stage build**: Optimized for size
- **Deployment**: Only `build/`

## Key Features

- ✅ **Single folder deployment**
- ✅ **No tsx runtime** (pre-compiled)
- ✅ **Bun compatible** (use Node.js for React 19 SSR)
- ✅ **Static file serving** + API + SSR
