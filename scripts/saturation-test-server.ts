#!/usr/bin/env node
import { createServer } from 'node:http';
import process from 'node:process';

/**
 * Minimal Node HTTP server for saturation testing.
 *
 * Returns a small JSON response to isolate network/IO overhead
 * and determine the max concurrent connections the server can
 * handle before latency spikes.
 */

const port = Number(process.env.PORT ?? 9999);

createServer((_request, response) => {
  response.setHeader('content-type', 'application/json');
  response.end(
    JSON.stringify({
      ok: true,
    })
  );
}).listen(port, '127.0.0.1', () => {
  console.log(`saturation test server listening on http://127.0.0.1:${port}`);
});
