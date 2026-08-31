# Dev URLs

All URLs assume the gateway runs on `localhost:8787` and the frontend dev server on `localhost:5173`.

## Health checks

| URL | Expected | Worker |
|---|---|---|
| `GET /healthz` | `"gateway ok"` | Gateway |
| `GET /api/healthz` | `"bff ok"` | BFF (via gateway proxy) |
| `GET /fe/healthz` | `"frontend ok"` | Frontend (via gateway proxy) |
| `GET /rust/healthz` | `"gateway rust ok"` | Healthz Rust (via gateway service binding) |

## Direct frontend access

| URL | Expected |
|---|---|
| `GET http://localhost:5173/healthz` | `"frontend ok"` |

## SSR pages (via gateway)

| URL | Expected |
|---|---|
| `GET /` | 200, HTML |
| `GET /hono-rpc` | 200, HTML |
| `GET /about` | 200, HTML |
| `GET /home` | 200, HTML |
| `GET /ssr` | 200, HTML |
| `GET /errors` | 200, HTML |

## API endpoints (via gateway)

| URL | Expected |
|---|---|
| `GET /api/healthz` | `"bff ok"` |
| `GET /api/rpc/hello` | `{"message":"Hello, World!","server":"Hono RPC","timestamp":"..."}` |
| `GET /api/test` | `{"message":"Hello from /api/test endpoint!"}` |
