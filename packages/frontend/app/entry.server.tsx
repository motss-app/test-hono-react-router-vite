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

import { getIsolationScope, logger } from '@sentry/cloudflare/nodejs_compat';
import {
  captureException,
  injectTraceMetaTags,
  wrapSentryHandleRequest,
} from '@sentry/react-router/cloudflare';
import { isbot } from 'isbot';
import { renderToReadableStream } from 'react-dom/server.edge';
import type { EntryContext, HandleErrorFunction } from 'react-router';
import { ServerRouter } from 'react-router';

import { openSansFontPreloadHrefs } from './font-preloads.ts';
import { appSessionIdTagName } from './monitoring/app-session.ts';
import { isDevelopmentSentryMode } from './monitoring/sentry.ts';
import { csp } from './utils/csp.ts';

const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;
const runtimeDemoErrorPrefix = 'Runtime error for code:';

function appendStylesheetPreloadLinks(responseHeaders: Headers, routerContext: EntryContext): void {
  const stylesheetHrefs = new Set<string>();

  for (const match of routerContext.staticHandlerContext.matches) {
    const route = routerContext.manifest.routes[match.route.id];

    for (const href of route?.css ?? []) {
      if (href.startsWith('/') && !href.startsWith('//')) {
        stylesheetHrefs.add(href);
      }
    }
  }

  for (const href of stylesheetHrefs) {
    responseHeaders.append('Link', `<${href}>; rel=preload; as=style`);
  }
}

function appendFontPreloadLinks(responseHeaders: Headers): void {
  for (const href of openSansFontPreloadHrefs) {
    responseHeaders.append(
      'Link',
      `<${href}>; rel=preload; as=font; type="font/woff2"; crossorigin="anonymous"`
    );
  }
}

function getCurrentAppSessionId(): string | undefined {
  return getIsolationScope().getScopeData().tags[appSessionIdTagName] as string | undefined;
}

export const handleError: HandleErrorFunction = (error, { request }) => {
  if (error instanceof Error) {
    if (error.message.startsWith(runtimeDemoErrorPrefix)) {
      logger.error('[app/entry.server.tsx] Runtime demo error', {
        appSessionId: getCurrentAppSessionId(),
        errorMessage: error.message,
        errorName: error.name,
        route: '/errors/runtime',
        source: 'app/routes/errors.$code.tsx',
      });
    }
  }

  if (!request.signal.aborted) {
    captureException(error);
  }

  if (isDevelopmentSentryMode(import.meta.env.MODE)) {
    console.error(error);
  }
};

export default wrapSentryHandleRequest(async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext
) {
  let shellRendered = false;
  let status = responseStatusCode;
  const userAgent = request.headers.get('user-agent');
  const nonce = csp.getNonce(request);
  const serverRouterProps = nonce
    ? {
        context: routerContext,
        nonce,
        url: request.url,
      }
    : {
        context: routerContext,
        url: request.url,
      };

  const renderOptions = {
    onError(error: unknown) {
      status = HTTP_STATUS_INTERNAL_SERVER_ERROR;
      // Log streaming rendering errors from inside the shell. Don't log
      // errors encountered during initial shell rendering since they'll
      // reject and get logged in handleDocumentRequest.
      if (shellRendered) {
        console.error(error);
      }
    },
  } satisfies Parameters<typeof renderToReadableStream>[1];

  const body = await renderToReadableStream(
    <ServerRouter {...serverRouterProps} />,
    nonce
      ? {
          ...renderOptions,
          nonce,
        }
      : renderOptions
  );
  shellRendered = true;

  if ((userAgent && isbot(userAgent)) || routerContext.isSpaMode) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  appendStylesheetPreloadLinks(responseHeaders, routerContext);
  appendFontPreloadLinks(responseHeaders);

  return new Response(injectTraceMetaTags(body), {
    headers: responseHeaders,
    status,
  });
});
