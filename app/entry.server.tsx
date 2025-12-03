/**
 * Server Entry Point for React Router
 *
 * Purpose:
 * This file tells React Router how to render the React component tree into an HTML stream
 * for Server-Side Rendering (SSR) and Static Site Generation (SSG).
 *
 * Why it is needed:
 * 1. Web Standards Support: We use `renderToReadableStream` instead of Node.js's
 *    `renderToPipeableStream`. This is REQUIRED for Cloudflare Workers and Deno,
 *    as they rely on the Web Streams API.
 * 2. Cross-Runtime Compatibility: This single file works for both Deno (local dev/prod)
 *    and Cloudflare Workers (edge prod) because both support Web Standards.
 * 3. SEO & Performance: It handles bot detection (isbot) to ensure crawlers see the
 *    full content immediately.
 */
import { isbot } from 'isbot';
import { renderToReadableStream } from 'react-dom/server';
import type { AppLoadContext, EntryContext } from 'react-router';
import { ServerRouter } from 'react-router';

const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  _loadContext: AppLoadContext
) {
  let shellRendered = false;
  let status = responseStatusCode;
  const userAgent = request.headers.get('user-agent');

  const body = await renderToReadableStream(
    <ServerRouter
      context={routerContext}
      url={request.url}
    />,
    {
      onError(error: unknown) {
        status = HTTP_STATUS_INTERNAL_SERVER_ERROR;
        // Log streaming rendering errors from inside the shell. Don't log
        // errors encountered during initial shell rendering since they'll
        // reject and get logged in handleDocumentRequest.
        if (shellRendered) {
          console.error(error);
        }
      },
    }
  );
  shellRendered = true;

  if (userAgent && isbot(userAgent)) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');

  return new Response(body, {
    headers: responseHeaders,
    status,
  });
}
