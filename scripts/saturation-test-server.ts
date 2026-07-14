#!/usr/bin/env -S deno run -A

/**
 * Minimal Deno HTTP server for saturation testing.
 *
 * Returns a small JSON response to isolate network/IO overhead
 * and determine the max concurrent connections Deno.serve() can
 * handle before latency spikes.
 */

const port = Number(Deno.env.get('PORT') ?? 9999);

Deno.serve(
  {
    hostname: '127.0.0.1',
    port,
  },
  () =>
    new Response(
      JSON.stringify({
        ok: true,
      }),
      {
        headers: {
          'content-type': 'application/json',
        },
      }
    )
);
