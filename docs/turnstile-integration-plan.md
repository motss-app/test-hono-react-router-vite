# Cloudflare Turnstile integration plan

## Goal
Protect the chosen form submission flow with Cloudflare Turnstile while keeping the implementation CSP-compliant and the secret key server-side only.

## Inputs
- Public site key: use the supplied Turnstile site key on the client
- Secret key: store only in server-side env/bindings as `TURNSTILE_SECRET_KEY`
- Never commit the secret key to the repository

## Client-side integration
- Pick the route or component that owns the protected form
- Prefer **implicit rendering** if the form is simple and present on page load
- Load the exact Turnstile script URL:
  - `https://challenges.cloudflare.com/turnstile/v0/api.js`
- Add a widget container such as:
  - `<div class="cf-turnstile" data-sitekey="..."></div>`
- Let Turnstile create the default hidden response field (`cf-turnstile-response`)
- Use **explicit rendering** only if the form is dynamic, conditional, or SPA-like
- Keep all widget callbacks in bundled TS/React code, not inline `<script>` tags
- Optional but recommended:
  - add `rel="preconnect"` for `https://challenges.cloudflare.com`
  - set `data-action` for the protected flow
  - set `data-theme`, `data-size`, or `data-appearance` only if needed

## Server-side validation
- Read the token from submitted form data
- Validate by POSTing to:
  - `https://challenges.cloudflare.com/turnstile/v0/siteverify`
- Send these fields:
  - `secret`
  - `response`
  - optional `remoteip`
  - optional `idempotency_key` if you implement retries
- Reject the request if validation fails or the token is missing
- Treat tokens as:
  - valid for 300 seconds
  - single-use only
- Validate `action` and `hostname` when they are configured
- Return a generic 400-level response to the user on failure
- Log validation failures privately, without exposing the secret or token

## CSP requirements
See [CSP for SSG and SSR](csp-ssg-ssr-guide.md) for general CSP patterns; the following requirements are Turnstile-specific.

- Update the shared CSP builder in `app/utils/csp.ts` to allow `https://challenges.cloudflare.com` in:
  - `script-src`
  - `frame-src`
- Avoid inline Turnstile bootstrap scripts so the widget stays CSP-friendly
- Start conservative:
  - do not widen `connect-src` unless browser testing proves Turnstile needs it
- Verify both runtime SSR headers and prerendered `_headers` output stay in sync

## Likely repo touch points
- `app/utils/csp.ts`
- `app/types/vite-env.d.ts`
- `app/types/hono.types.ts`
- `app/apis/mod.ts` or a new `app/apis/turnstile.ts`
- the route/component that renders the protected form
- `packages/bff/src/api.ts` if local Worker development needs the secret threaded into request handling
- `app/ssr-handler.ts` and `vite-plugins/copy-headers.ts` if the CSP allowlist needs to flow through the shared header generation path

## Validation checklist
- Widget renders without CSP violations
- The form submits a token
- Server rejects missing, expired, and reused tokens
- Server accepts a valid token
- SSR and prerendered pages both emit the updated CSP
- Run `deno task check`
- Run the relevant lint and build tasks

## Notes
- The public site key can live in a client-exposed env var such as `VITE_TURNSTILE_SITE_KEY`
- The secret key should stay server-only and be loaded from env or a worker binding
- If the protected form is currently only a React Router route, prefer moving verification to a Hono API endpoint instead of trying to read the secret from a loader

## References

1. client side integration: https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/
1. server side integration: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
