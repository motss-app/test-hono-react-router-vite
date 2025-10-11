# Testing Guide

## Test 1: Page Loads (React Router)

1. Open http://localhost:5173
2. You should see "Home" heading
3. Click "About" link
4. You should navigate to /about page

✅ **Expected**: Pages load and navigation works

## Test 2: Hot Reload

1. Open `app/routes/home.tsx`
2. Change the `<h1>Home</h1>` to `<h1>Home - Hot Reload Works!</h1>`
3. Save the file
4. Check browser - it should update instantly without refresh

✅ **Expected**: Changes appear immediately without page reload

## Test 3: API Routes (Hono)

1. Open http://localhost:5173/api/test
2. You should see JSON: `{"message":"Hello from API"}`

✅ **Expected**: API returns JSON response

## Test 4: API Hot Reload

1. Open `app/server.ts`
2. Change the message to `"Hello from API - Updated!"`
3. Save the file
4. Refresh http://localhost:5173/api/test
5. You should see the updated message

✅ **Expected**: API changes are reflected (may need a browser refresh)

## Test 5: Production Build

```bash
# Build
pnpm build

# Check build output
ls build/client      # Should see index.html, about/index.html
ls build/server      # Should see index.js

# Preview
pnpm preview
```

Visit http://localhost:3000
- Pages should work
- /api/test should work

✅ **Expected**: Production build works correctly

## Common Issues

### Issue: "Nothing works"
**Check**:
- Is dev server running? (`pnpm dev`)
- Check terminal for errors
- Open browser console (F12) for JavaScript errors

### Issue: Hot reload not working
**Check**:
- Vite dev server is running
- No TypeScript errors in the file
- Browser console for errors

### Issue: API routes not working
**Check**:
- URL is `/api/test` (not `/test`)
- Server is running
- Check `app/server.ts` for syntax errors

### Issue: Build fails
**Check**:
- Run `pnpm typecheck` to find type errors
- Check that prerendered routes exist
- Ensure `build` folder is not corrupted (delete and rebuild)
