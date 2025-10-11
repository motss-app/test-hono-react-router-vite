# Error Handling Cheat Sheet

## Quick Reference

### Throw Errors

```typescript
// HTTP Status Error
throw new Response("Message", { status: 401 });

// Runtime Error  
throw new Error("Something went wrong");

// With Details
throw new Response(JSON.stringify({
  error: "Forbidden",
  message: "You don't have permission",
  code: "PERMISSION_DENIED"
}), {
  status: 403,
  headers: { "Content-Type": "application/json" }
});
```

---

## Status Codes

| Code    | Name                  | When to Use                 |
| ------- | --------------------- | --------------------------- |
| **400** | Bad Request           | Invalid input from user     |
| **401** | Unauthorized          | Not logged in               |
| **403** | Forbidden             | Logged in but no permission |
| **404** | Not Found             | Resource doesn't exist      |
| **429** | Too Many Requests     | Rate limiting               |
| **500** | Internal Server Error | Unexpected server error     |
| **502** | Bad Gateway           | External API failed         |
| **503** | Service Unavailable   | Service down/maintenance    |

---

## Common Patterns

### Authentication

```typescript
const user = await getUser(request);
if (!user) {
  throw new Response("Please log in", { status: 401 });
}
```

### Authorization

```typescript
if (!user.isAdmin) {
  throw new Response("Admin only", { status: 403 });
}
```

### Not Found

```typescript
const item = await db.find(id);
if (!item) {
  throw new Response("Not found", { status: 404 });
}
```

### Validation

```typescript
if (!formData.get('email')) {
  throw new Response("Email required", { status: 400 });
}
```

### External API

```typescript
try {
  const res = await fetch('https://api.example.com');
  if (!res.ok) {
    throw new Response("External API failed", { status: 502 });
  }
} catch {
  throw new Response("Service unavailable", { status: 503 });
}
```

### Try-Catch

```typescript
try {
  await doSomething();
  return { success: true };
} catch (error) {
  throw new Response("Server error", { status: 500 });
}
```

---

## ErrorBoundary

### Check Error Type

```typescript
export function ErrorBoundary({ error }) {
  // HTTP status error (401, 404, 500, etc.)
  if (isRouteErrorResponse(error)) {
    return <div>Error {error.status}</div>;
  }
  
  // Runtime error (TypeError, ReferenceError, etc.)
  if (error instanceof Error) {
    return <div>{error.message}</div>;
  }
  
  // Unknown
  return <div>Unknown error</div>;
}
```

### Access Error Details

```typescript
if (isRouteErrorResponse(error)) {
  error.status      // 404, 500, etc.
  error.statusText  // "Not Found", "Internal Server Error"
  error.data        // Response body (string or JSON)
}

if (error instanceof Error) {
  error.message     // Error message
  error.stack       // Stack trace (dev only!)
  error.name        // "TypeError", "Error", etc.
}
```

---

## File Structure

```
app/
├── root.tsx                    # Root ErrorBoundary
├── routes/
│   ├── $.tsx                   # 404 catch-all
│   ├── errors.tsx              # Demo page
│   └── your-route.tsx          # Optional route-specific ErrorBoundary
```

---

## Testing

### Demo Page
http://localhost:5174/errors

### Manual Tests

```bash
# 404
curl http://localhost:5174/nonexistent

# With query param
curl http://localhost:5174/errors?type=500

# Check response
curl -i http://localhost:5174/errors?type=401
```

---

## Dev vs Prod

### Development
- Shows stack traces
- Shows detailed error messages
- Helps debugging

### Production
- Hides stack traces
- Shows user-friendly messages
- Logs errors to service

```typescript
{import.meta.env.DEV && (
  <pre>{error.stack}</pre>
)}
```

---

## Complete Example

```typescript
// app/routes/posts.$id.tsx
import type { Route } from "./+types/posts.$id";

export async function loader({ params, request }: Route.LoaderArgs) {
  // 1. Validate params
  if (!params.id || isNaN(Number(params.id))) {
    throw new Response("Invalid ID", { status: 400 });
  }

  // 2. Check auth
  const user = await getUser(request);
  if (!user) {
    throw new Response("Login required", { status: 401 });
  }

  // 3. Fetch resource
  const post = await db.posts.find(Number(params.id));
  if (!post) {
    throw new Response("Post not found", { status: 404 });
  }

  // 4. Check permissions
  if (post.private && post.authorId !== user.id) {
    throw new Response("Private post", { status: 403 });
  }

  // 5. Return data
  return { post, user };
}

export default function Post({ loaderData }: Route.ComponentProps) {
  return (
    <article>
      <h1>{loaderData.post.title}</h1>
      <p>{loaderData.post.content}</p>
    </article>
  );
}

// Optional: Custom error page for this route
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return (
        <div>
          <h1>Post Not Found</h1>
          <p>This post might have been deleted.</p>
          <a href="/posts">← View all posts</a>
        </div>
      );
    }
  }
  
  // Let root ErrorBoundary handle other errors
  throw error;
}
```

---

## Checklist

### For Every Route

- [ ] Validate params/input
- [ ] Check authentication
- [ ] Check permissions
- [ ] Handle missing resources (404)
- [ ] Wrap risky operations in try-catch
- [ ] Use appropriate status codes
- [ ] Provide helpful error messages

### For The App

- [ ] Root ErrorBoundary exists
- [ ] 404 catch-all route exists
- [ ] Error pages styled
- [ ] Stack traces hidden in prod
- [ ] Errors logged in prod

---

## Resources

- **Demo:** http://localhost:5174/errors
- **Quick Start:** ERROR-HANDLING-QUICKSTART.md
- **Full Docs:** ERROR-HANDLING.md

---

## Remember

1. **Always use status codes** - `throw new Response("...", { status: 401 })`
2. **Validate early** - Check auth/permissions before doing work
3. **Be specific** - Use correct status codes (401 vs 403, 502 vs 503)
4. **User-friendly messages** - "Login required" not "Unauthorized"
5. **Hide stack traces** - Only show in development
6. **Test error states** - Use the demo page!
