# Error Handling

Complete guide to error handling in React Router + Hono applications.

## Quick Start

Visit `/errors` to see all error types in action.

## Throwing Errors

### HTTP Status Errors
```typescript
throw new Response("Message", { status: 401 });
throw new Response("Forbidden", { status: 403 });
throw new Response("Not found", { status: 404 });
throw new Response("Server error", { status: 500 });
```

### With JSON Details
```typescript
throw new Response(JSON.stringify({
  error: "Forbidden",
  message: "Admin access required",
  code: "ADMIN_REQUIRED"
}), {
  status: 403,
  headers: { "Content-Type": "application/json" }
});
```

### Runtime Errors
```typescript
throw new Error("Something broke");
```

## Status Codes

| Code | Name | Use Case |
|------|------|----------|
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Not logged in |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource missing |
| 429 | Too Many Requests | Rate limiting |
| 500 | Internal Server Error | Server error |
| 502 | Bad Gateway | External API failed |
| 503 | Service Unavailable | Service down |

## Common Patterns

### Authentication
```typescript
const user = await getUser(request);
if (!user) throw new Response("Login required", { status: 401 });
```

### Authorization
```typescript
if (!user.isAdmin) throw new Response("Forbidden", { status: 403 });
```

### Resource Not Found
```typescript
const item = await db.find(id);
if (!item) throw new Response("Not found", { status: 404 });
```

### Validation
```typescript
if (!email) throw new Response("Email required", { status: 400 });
```

### External API
```typescript
try {
  const res = await fetch('https://api.example.com');
  if (!res.ok) throw new Response("API failed", { status: 502 });
} catch {
  throw new Response("Service unavailable", { status: 503 });
}
```

### Try-Catch
```typescript
try {
  await riskyOperation();
  return { success: true };
} catch (error) {
  throw new Response("Server error", { status: 500 });
}
```

## Error Boundaries

### Root Boundary (`app/root.tsx`)
```typescript
export function ErrorBoundary({ error }) {
  if (isRouteErrorResponse(error)) {
    return <div>Error {error.status}: {error.statusText}</div>;
  }
  if (error instanceof Error) {
    return <div>Error: {error.message}</div>;
  }
  return <div>Unknown error</div>;
}
```

### Route-Specific Boundaries
```typescript
export function ErrorBoundary({ error }) {
  if (isRouteErrorResponse(error) && error.status === 404) {
    return <div>Custom 404 page</div>;
  }
  throw error; // Let root handle
}
```

## Best Practices

- ✅ Use appropriate HTTP status codes
- ✅ Provide user-friendly messages
- ✅ Validate input early
- ✅ Handle async errors
- ✅ Hide stack traces in production
- ✅ Log errors for monitoring

## Testing

Visit `/errors` for interactive demos of all error types.

## Files

- `app/root.tsx` - Root ErrorBoundary
- `app/routes/$.tsx` - 404 catch-all
- `app/routes/errors.tsx` - Error demo page
