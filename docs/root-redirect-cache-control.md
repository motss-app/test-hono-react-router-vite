# Root Redirect Cache Control

The frontend Worker handles `GET /` by redirecting to the first configured locale, currently `/en-US`.

## Policy

```http
307 Temporary Redirect
Location: /en-US
Cache-Control: no-store
```

## Rationale

Use `307 Temporary Redirect` because it identifies a temporary redirect and preserves the request method and body. `301` and `308` communicate permanence and can become sticky in browsers and intermediaries while the destination is still subject to change.

The status code does not disable caching. `Cache-Control: no-store` prevents browsers and Cloudflare cache layers from retaining the redirect. `no-cache` still permits storage and requires revalidation.

The redirect deliberately has no `max-age` or `s-maxage` directive. The final locale page, such as `/en-US`, has its own response headers and cache policy.

## Cloudflare behavior

Zone Cache Rules and Workers Cache are separate. Disabling a zone Cache Rule or purging the zone cache does not necessarily remove an existing Workers Cache entry. An old entry must expire or be removed with a Worker-specific purge.

Cloudflare documents this behavior in [Workers Cache][workers-cache] and [Workers cache purging][workers-cache-purge].

## Verification

Inspect the root response without following the redirect:

```sh
curl -sS -D - -o /dev/null <root-url>/
```

Verify status `307`, a `Location` header for the base locale, and `Cache-Control: no-store`.

[workers-cache]: https://developers.cloudflare.com/workers/cache/
[workers-cache-purge]: https://developers.cloudflare.com/workers/cache/purge/
