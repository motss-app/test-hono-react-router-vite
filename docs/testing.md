# Testing Guide

Test your React Router + Hono + Vite setup.

## Development Tests

### 1. Page Loading
- Visit http://localhost:5173
- Click navigation links
- ✅ Pages load and routing works

### 2. Hot Reload
- Edit `app/routes/home.tsx`
- Save file
- ✅ Browser updates instantly (no refresh)

### 3. API Routes
- Visit http://localhost:5173/api/test
- ✅ Returns JSON response

### 4. API Changes
- Edit `app/server.ts`
- Refresh browser
- ✅ API updates (may need refresh)

## Production Tests

### Build Check
```bash
pnpm build
ls build/client/     # Should see HTML files
ls build/server/     # Should see index.js
```

### Production Run
```bash
pnpm start           # Runs on port 3000
# Visit http://localhost:3000
# ✅ All routes work
# ✅ API endpoints work
```

## Common Issues

- **Dev server fails**: Check port 5173 availability
- **API not working**: Ensure `/api/*` prefix
- **Build fails**: Run `pnpm typecheck`
- **HMR broken**: Check for TypeScript errors

## Quick Checklist

- [ ] `pnpm dev` starts successfully
- [ ] Pages load at localhost:5173
- [ ] Hot reload works
- [ ] API routes return JSON
- [ ] `pnpm build` completes
- [ ] Production serves correctly
