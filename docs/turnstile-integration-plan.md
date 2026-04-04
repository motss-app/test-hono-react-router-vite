# Cloudflare Turnstile integration plan

## Goal
Protect the chosen form submission flow with Cloudflare Turnstile while keeping the implementation CSP-compliant and the secret key server-side only.

## Flow overview

```text
Visitor browser
  |
  | 1. Loads the page and the Turnstile widget script
  v
Cloudflare Turnstile widget
  |
  | 2. Solves the challenge and stores cf-turnstile-response
  v
Protected form submission
  |
  | 3. Browser submits form data + token to the app
  v
Hono API endpoint
  |
  | 4. Reads TURNSTILE_SECRET_KEY from server-only env/bindings
  | 5. Posts token to /turnstile/v0/siteverify
  v
Cloudflare Siteverify
  |
  | 6. Returns success / failure
  v
App response
  |
  | 7. Accepts valid submissions, rejects missing/expired/reused tokens
  v
Visitor sees success or a generic 400-level error
```

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
- `app/server.ts` if local Deno development needs the secret threaded into request handling
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

## Managed Challenge vs Turnstile

If you are using a Cloudflare **Managed Challenge** for the whole site, Cloudflare may still serve its own challenge page with JavaScript when it decides a visitor needs to prove they are human. That JavaScript lives on Cloudflare's challenge page, not inside your origin HTML.

Use this section to tell the difference:

- If the response HTML contains `cdn-cgi/challenge-platform` or `window.__CF$cv$params`, Cloudflare served a challenge page before your app response.
- If the visitor is sent to a Cloudflare challenge page first, your app does **not** need to verify a Turnstile token afterward.
- If you see inline JS inside your own page response, check whether another Cloudflare feature is rewriting the page, such as a challenge rule, and inspect the rule action in the Cloudflare dashboard.

What to check in Cloudflare:

1. Security dashboard rules that use `Managed Challenge` or `JS Challenge`
2. Bot-related features that can trigger challenge pages
3. Any page rule or custom rule that applies a challenge action to the affected path

How to identify the source of injected Cloudflare script:

- `cdn-cgi/challenge-platform` or `window.__CF$cv$params` usually means a Cloudflare challenge page, not your origin HTML.
- `rocket-loader.min.js` or `data-cfasync="false"` points to Rocket Loader.
- `__cf_email__` or `email-decode.min.js` points to Cloudflare email obfuscation.
- `zaraz` or `zaraz.js` points to Zaraz.
- A script tag added only after the response reaches the browser often comes from a Cloudflare edge feature rather than your app bundle.

What happens after the challenge is solved:

- Cloudflare sets the clearance cookie for the browser
- The browser retries the request
- Your app usually does not need to do anything special

## References

1. client side integration: https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/
1. server side integration: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
