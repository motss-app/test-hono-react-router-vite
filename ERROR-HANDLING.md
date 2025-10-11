# Error Handling Guide

This guide covers all types of error handling in the React Router + Hono application.

## Table of Contents

1. [Error Types](#error-types)
2. [404 Not Found](#404-not-found)
3. [HTTP Status Errors (401, 403, 500, etc.)](#http-status-errors)
4. [Runtime Errors](#runtime-errors)
5. [Error Boundaries](#error-boundaries)
6. [Best Practices](#best-practices)

---

## Error Types

### 1. Route Not Found (404)

**When it happens:** User visits a URL that doesn't match any route

**How it's handled:** Catch-all route in `app/routes/$.tsx`

**Example:**
```
User visits: /non-existent-page
Result: Custom 404 page
```

### 2. HTTP Status Errors (4xx, 5xx)

**When it happens:** Loader or action throws a Response with an error status

**How it's handled:** ErrorBoundary in `root.tsx`

**Example:**
```typescript
throw new Response("Unauthorized", { status: 401 });
```

### 3. Runtime Errors

**When it happens:** JavaScript error occurs during rendering or in loader/action

**How it's handled:** ErrorBoundary catches and displays error details

**Example:**
```typescript
throw new Error("Something went wrong!");
```

---

## 404 Not Found

### How It Works

The catch-all route (`*` in `routes.ts`) matches any URL that doesn't match other routes.

### Implementation

```typescript
// app/routes/$.tsx
export function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  
  // Silently handle system requests
  const silentPaths = ['.well-known/appspecific'];
  if (silentPaths.some(path => url.pathname.includes(path))) {
    return { url: url.pathname, silent: true };
  }
  
  return { url: url.pathname, silent: false };
}

export default function NotFound({ loaderData }) {
  if (loaderData.silent) return null;
  
  return (
    <div>
      <h1>404</h1>
      <p>Page {loaderData.url} not found</p>
      <Link to="/">Go home</Link>
    </div>
  );
}
```

### Testing

Visit any non-existent URL:
- http://localhost:5173/this-doesnt-exist
- http://localhost:5173/foo/bar/baz

---

## HTTP Status Errors

### Common Status Codes

| Code | Name                       | Use Case                 |
| ---- | -------------------------- | ------------------------ |
| 400  | Bad Request                | Invalid user input       |
| 401  | Unauthorized               | User not logged in       |
| 403  | Forbidden                  | User lacks permission    |
| 404  | Not Found                  | Resource doesn't exist   |
| 500  | Internal Server Error      | Server-side error        |
| 502  | Bad Gateway                | Upstream server error    |
| 503  | Service Unavailable        | Service temporarily down |
| 505  | HTTP Version Not Supported | Rare protocol error      |

### How to Throw HTTP Errors

#### In Loaders

```typescript
export async function loader({ params }: Route.LoaderArgs) {
  // Example: Check authentication
  const user = await getUser();
  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  // Example: Check permissions
  if (!user.isAdmin) {
    throw new Response("Forbidden", { status: 403 });
  }

  // Example: Resource not found
  const post = await getPost(params.id);
  if (!post) {
    throw new Response("Not Found", { status: 404 });
  }

  // Example: External API error
  try {
    const data = await fetch('https://api.example.com/data');
    if (!data.ok) {
      throw new Response("Bad Gateway", { status: 502 });
    }
    return await data.json();
  } catch (error) {
    throw new Response("Internal Server Error", { 
      status: 500,
      statusText: error.message 
    });
  }
}
```

#### In Actions

```typescript
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const title = formData.get('title');

  // Validate input
  if (!title) {
    throw new Response("Bad Request: Title is required", { status: 400 });
  }

  // Save to database
  try {
    await savePost({ title });
    return redirect('/posts');
  } catch (error) {
    throw new Response("Internal Server Error", { status: 500 });
  }
}
```

### Custom Error Messages

```typescript
throw new Response(JSON.stringify({
  error: "Forbidden",
  message: "You need to be an admin to access this resource",
  code: "ADMIN_REQUIRED"
}), {
  status: 403,
  headers: {
    "Content-Type": "application/json"
  }
});
```

Then in your ErrorBoundary:

```typescript
if (isRouteErrorResponse(error)) {
  let data;
  try {
    data = typeof error.data === 'string' ? JSON.parse(error.data) : error.data;
  } catch {
    data = { message: error.data };
  }
  
  details = data.message || error.statusText;
}
```

---

## Runtime Errors

### What Are Runtime Errors?

Errors that occur during code execution:
- `TypeError`: Accessing undefined properties
- `ReferenceError`: Using undefined variables
- `Error`: Generic errors you throw
- Async errors: Promises that reject

### Examples

#### Synchronous Error

```typescript
export default function Component({ loaderData }) {
  // This will throw if loaderData.user is undefined
  const userName = loaderData.user.name;
  
  return <div>{userName}</div>;
}
```

#### Async Error in Loader

```typescript
export async function loader() {
  // This promise rejection will be caught
  const data = await fetchSomething(); // throws
  return { data };
}
```

#### Manual Error

```typescript
export async function loader({ params }) {
  if (params.id === 'invalid') {
    throw new Error("Invalid ID format");
  }
  return { id: params.id };
}
```

---

## Error Boundaries

### Root Error Boundary

Located in `app/root.tsx`, catches ALL errors not handled by route-specific boundaries.

```typescript
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    // HTTP status errors (404, 500, etc.)
    return <div>Error {error.status}: {error.statusText}</div>;
  }
  
  if (error instanceof Error) {
    // Runtime errors
    return <div>Error: {error.message}</div>;
  }
  
  // Unknown errors
  return <div>Unknown error occurred</div>;
}
```

### Route-Specific Error Boundary

Override error handling for specific routes:

```typescript
// app/routes/profile.tsx
export function ErrorBoundary({ error }) {
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <div>
        <h1>Profile Not Found</h1>
        <p>This user doesn't exist.</p>
        <Link to="/users">View all users</Link>
      </div>
    );
  }
  
  // Fall back to root error boundary
  throw error;
}
```

### Error Boundary Hierarchy

```
Root ErrorBoundary (catches all)
  └─ Layout ErrorBoundary (optional)
      └─ Route ErrorBoundary (optional)
```

If a route doesn't have an ErrorBoundary, it bubbles up to the parent.

---

## Best Practices

### 1. Use Appropriate Status Codes

```typescript
// ✅ Good
throw new Response("Unauthorized", { status: 401 });

// ❌ Bad
throw new Error("Unauthorized"); // No status code
```

### 2. Provide Helpful Error Messages

```typescript
// ✅ Good
throw new Response("Post not found. It may have been deleted.", { 
  status: 404 
});

// ❌ Bad
throw new Response("Error", { status: 404 });
```

### 3. Log Errors in Production

```typescript
export function ErrorBoundary({ error }) {
  // Log to error tracking service
  if (!import.meta.env.DEV) {
    logErrorToService(error);
  }
  
  return <ErrorPage error={error} />;
}
```

### 4. Show Stack Traces Only in Dev

```typescript
{import.meta.env.DEV && error instanceof Error && (
  <pre>{error.stack}</pre>
)}
```

### 5. Validate Data Early

```typescript
export async function loader({ params }) {
  // Validate params immediately
  if (!params.id || isNaN(Number(params.id))) {
    throw new Response("Invalid ID", { status: 400 });
  }
  
  // Now safe to use params.id
  const item = await getItem(Number(params.id));
  if (!item) {
    throw new Response("Not Found", { status: 404 });
  }
  
  return { item };
}
```

### 6. Handle Async Errors

```typescript
export async function loader() {
  try {
    const data = await fetchData();
    return { data };
  } catch (error) {
    // Convert to proper HTTP error
    if (error.code === 'ENOTFOUND') {
      throw new Response("Service Unavailable", { status: 503 });
    }
    throw new Response("Internal Server Error", { status: 500 });
  }
}
```

### 7. Test Error States

```typescript
// Create a test route that triggers errors
export async function loader({ request }) {
  const url = new URL(request.url);
  const errorType = url.searchParams.get('error');
  
  if (errorType === '500') {
    throw new Response("Test Error", { status: 500 });
  }
  
  return { data: 'normal' };
}
```

---

## Error Handling Checklist

### For Every Route:

- [ ] Handle missing/invalid params
- [ ] Validate user authentication
- [ ] Check user permissions
- [ ] Handle database errors
- [ ] Handle external API errors
- [ ] Provide user-friendly messages
- [ ] Log errors in production

### For The App:

- [ ] Root ErrorBoundary handles all errors
- [ ] 404 catch-all route exists
- [ ] Error pages styled consistently
- [ ] Stack traces hidden in production
- [ ] Error tracking configured
- [ ] Silent handling for system requests

---

## Testing Errors

### Visit the Demo Page

http://localhost:5173/errors

This page lets you trigger all error types to see how they're handled.

### Manual Testing

```bash
# Test 404
curl http://localhost:5173/nonexistent

# Test with error query param
curl http://localhost:5173/errors?type=500

# Test API errors
curl http://localhost:5173/api/nonexistent
```

---

## Common Patterns

### Authentication Check

```typescript
export async function loader({ request }) {
  const user = await getUser(request);
  if (!user) {
    throw new Response("Please log in", { status: 401 });
  }
  return { user };
}
```

### Permission Check

```typescript
export async function action({ request }) {
  const user = await getUser(request);
  if (!user.isAdmin) {
    throw new Response("Admin access required", { status: 403 });
  }
  // ... perform admin action
}
```

### Resource Not Found

```typescript
export async function loader({ params }) {
  const item = await db.items.findById(params.id);
  if (!item) {
    throw new Response("Item not found", { status: 404 });
  }
  return { item };
}
```

### Rate Limiting

```typescript
export async function action({ request }) {
  const ip = request.headers.get('x-forwarded-for');
  if (isRateLimited(ip)) {
    throw new Response("Too many requests", { status: 429 });
  }
  // ... process action
}
```

### Service Down

```typescript
export async function loader() {
  if (!isServiceHealthy()) {
    throw new Response("Service temporarily unavailable", { status: 503 });
  }
  return await fetchData();
}
```

---

## Summary

### Error Handling Flow

```
1. User action/navigation
   ↓
2. Route loader/action executes
   ↓
3. Error occurs?
   ├─ No → Render component
   └─ Yes → ErrorBoundary
       ├─ Route-specific? → Custom error page
       └─ No → Root ErrorBoundary
           ├─ HTTP error (401, 404, 500) → Status page
           ├─ Runtime error → Error message + stack (dev only)
           └─ Unknown → Generic error page
```

### Key Files

- `app/root.tsx` - Root ErrorBoundary
- `app/routes/$.tsx` - 404 catch-all
- `app/routes/errors.tsx` - Error demo page

### Quick Reference

```typescript
// Throw HTTP error
throw new Response("Message", { status: 401 });

// Throw runtime error
throw new Error("Something broke");

// Check error type
if (isRouteErrorResponse(error)) { /* HTTP error */ }
if (error instanceof Error) { /* Runtime error */ }

// Get error details
error.status    // HTTP status code
error.data      // Response body
error.message   // Error message (Error objects)
error.stack     // Stack trace (Error objects)
```
