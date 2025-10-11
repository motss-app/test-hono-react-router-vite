# Error Handling - Quick Start

## Overview

Your app now has comprehensive error handling for all error types:
- ✅ 404 Not Found
- ✅ 401 Unauthorized  
- ✅ 403 Forbidden
- ✅ 500 Internal Server Error
- ✅ 502 Bad Gateway
- ✅ 503 Service Unavailable
- ✅ 505 HTTP Version Not Supported
- ✅ Runtime errors (JavaScript exceptions)

---

## Try It Now

**Demo Page:** http://localhost:5174/errors

Click any button to see how different errors are handled!

---

## How to Use in Your Code

### 1. Throw HTTP Errors in Loaders

```typescript
export async function loader({ request, params }: Route.LoaderArgs) {
  // Check authentication
  const user = await getUser(request);
  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  // Check permissions
  if (!user.isAdmin) {
    throw new Response("Forbidden", { status: 403 });
  }

  // Check if resource exists
  const post = await getPost(params.id);
  if (!post) {
    throw new Response("Not Found", { status: 404 });
  }

  // Handle errors
  try {
    const data = await fetchData();
    return { data };
  } catch (error) {
    throw new Response("Internal Server Error", { status: 500 });
  }
}
```

### 2. Throw HTTP Errors in Actions

```typescript
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const title = formData.get('title');

  // Validate input
  if (!title) {
    throw new Response("Bad Request", { status: 400 });
  }

  // Save data
  try {
    await savePost({ title });
    return redirect('/posts');
  } catch (error) {
    throw new Response("Internal Server Error", { status: 500 });
  }
}
```

### 3. Runtime Errors Are Automatically Caught

```typescript
export default function Component({ loaderData }) {
  // If loaderData.user is undefined, ErrorBoundary catches it
  return <div>{loaderData.user.name}</div>;
}
```

---

## Where Errors Are Handled

### 1. Root ErrorBoundary (`app/root.tsx`)

Catches ALL errors and shows appropriate error pages based on status code.

**Handles:**
- 401 Unauthorized
- 403 Forbidden  
- 404 Not Found
- 500 Internal Server Error
- 502 Bad Gateway
- 503 Service Unavailable
- 505 HTTP Version Not Supported
- Runtime errors (with stack trace in dev mode)

### 2. Catch-All Route (`app/routes/$.tsx`)

Handles 404s for non-existent routes.

**Also silently handles:**
- `.well-known/appspecific` (Chrome DevTools)
- Other system requests

### 3. Route-Specific ErrorBoundary (Optional)

You can add custom error handling to any route:

```typescript
// app/routes/profile.tsx
export function ErrorBoundary({ error }) {
  if (isRouteErrorResponse(error) && error.status === 404) {
    return <div>Profile not found!</div>;
  }
  throw error; // Let root handle other errors
}
```

---

## Testing

### Test Different Errors

Visit the demo page: http://localhost:5174/errors

### Test 404

Visit any non-existent URL:
- http://localhost:5174/this-doesnt-exist
- http://localhost:5174/foo/bar/baz

### Test in Your Code

Create a test loader:

```typescript
export async function loader({ request }) {
  const url = new URL(request.url);
  const test = url.searchParams.get('test');
  
  if (test === '401') throw new Response("Unauthorized", { status: 401 });
  if (test === '500') throw new Response("Server Error", { status: 500 });
  
  return { data: 'normal' };
}
```

Then visit: `/your-route?test=401`

---

## Key Files

| File                    | Purpose                                 |
| ----------------------- | --------------------------------------- |
| `app/root.tsx`          | Root ErrorBoundary - handles all errors |
| `app/routes/$.tsx`      | 404 catch-all route                     |
| `app/routes/errors.tsx` | Error demo page                         |
| `ERROR-HANDLING.md`     | Full documentation                      |

---

## Common Patterns

### Authentication

```typescript
if (!user) {
  throw new Response("Unauthorized", { status: 401 });
}
```

### Authorization

```typescript
if (!user.hasPermission) {
  throw new Response("Forbidden", { status: 403 });
}
```

### Not Found

```typescript
if (!resource) {
  throw new Response("Not Found", { status: 404 });
}
```

### Server Error

```typescript
try {
  await doSomething();
} catch (error) {
  throw new Response("Internal Server Error", { status: 500 });
}
```

---

## Visual Guide

```
User visits URL
    ↓
Does route exist?
    ├─ No → $.tsx (404 page)
    └─ Yes → Run loader
        ↓
    Loader throws error?
        ├─ No → Render component
        └─ Yes → ErrorBoundary
            ├─ Route has ErrorBoundary? → Custom error page
            └─ No → Root ErrorBoundary → Status-specific page
```

---

## Next Steps

1. ✅ **Test the demo page:** http://localhost:5174/errors
2. ✅ **Try breaking things:** Visit /non-existent-page
3. ✅ **Add error handling to your loaders/actions**
4. ✅ **Customize error pages if needed**
5. 📖 **Read full docs:** ERROR-HANDLING.md

---

## Summary

You now have **production-ready error handling** that:
- ✅ Handles all HTTP status codes
- ✅ Catches runtime errors
- ✅ Shows appropriate error messages
- ✅ Displays stack traces in dev mode only
- ✅ Silences system requests
- ✅ Provides user-friendly error pages

**Just throw errors with status codes and let the ErrorBoundary handle the rest!** 🎉
