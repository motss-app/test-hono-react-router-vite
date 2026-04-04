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
import { getIsolationScope, logger } from '@sentry/cloudflare';
import {
  captureException,
  injectTraceMetaTags,
  SEMANTIC_ATTRIBUTE_SENTRY_OP,
  SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN,
  setHttpStatus,
  startSpan,
  wrapSentryHandleRequest,
} from '@sentry/react-router/cloudflare';
import { isbot } from 'isbot';
import { renderToReadableStream } from 'react-dom/server';
import type {
  EntryContext,
  HandleErrorFunction,
  unstable_InstrumentationHandlerResult,
  unstable_ServerInstrumentation,
} from 'react-router';
import { ServerRouter } from 'react-router';

import { appSessionIdTagName } from './monitoring/app-session.ts';
import { isDevelopmentSentryMode } from './monitoring/sentry.ts';
import { csp } from './utils/csp.ts';

const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;
const runtimeDemoErrorPrefix = 'Runtime error for code:';
const reactRouterInstrumentationOrigin = 'auto.function.react_router.instrumentation_api';

type RouteInstrumentationOperation =
  | 'function.react_router.action'
  | 'function.react_router.lazy'
  | 'function.react_router.loader'
  | 'function.react_router.middleware';

function getCurrentAppSessionId(): string | undefined {
  return getIsolationScope().getScopeData().tags[appSessionIdTagName] as string | undefined;
}

function createRouteSpanAttributes(
  route: {
    id: string;
    index: boolean | undefined;
    path: string | undefined;
  },
  info?: {
    request?: {
      method: string;
      url: string;
    };
    unstable_pattern?: string;
  }
): Record<string, boolean | string> {
  return {
    ...(info?.unstable_pattern
      ? {
          'http.route': info.unstable_pattern,
        }
      : {}),
    ...(info?.request
      ? {
          'http.method': info.request.method,
          'http.url': info.request.url,
        }
      : {}),
    ...(route.index
      ? {
          'react_router.route.index': true,
        }
      : {}),
    ...(route.path
      ? {
          'react_router.route.path': route.path,
        }
      : {}),
    'react_router.route.id': route.id,
  };
}

function instrumentRouteSpan(
  operation: RouteInstrumentationOperation,
  name: string,
  attributes: Record<string, boolean | string>,
  handler: () => Promise<unstable_InstrumentationHandlerResult>
): Promise<void> {
  return startSpan(
    {
      attributes: {
        [SEMANTIC_ATTRIBUTE_SENTRY_OP]: operation,
        [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: reactRouterInstrumentationOrigin,
        ...attributes,
      },
      name,
    },
    async span => {
      const result = await handler();

      if (result.status === 'error') {
        setHttpStatus(span, 500);
      }
    }
  );
}

export const unstable_instrumentations = [
  {
    route(route) {
      route.instrument({
        action(callAction, info) {
          return instrumentRouteSpan(
            'function.react_router.action',
            info.unstable_pattern ?? route.path ?? route.id,
            createRouteSpanAttributes(route, info),
            callAction
          );
        },
        lazy(callLazy) {
          return instrumentRouteSpan(
            'function.react_router.lazy',
            route.path ?? route.id,
            createRouteSpanAttributes(route),
            callLazy
          );
        },
        loader(callLoader, info) {
          return instrumentRouteSpan(
            'function.react_router.loader',
            info.unstable_pattern ?? route.path ?? route.id,
            createRouteSpanAttributes(route, info),
            callLoader
          );
        },
        middleware(callMiddleware, info) {
          return instrumentRouteSpan(
            'function.react_router.middleware',
            info.unstable_pattern ?? route.path ?? route.id,
            createRouteSpanAttributes(route, info),
            callMiddleware
          );
        },
      });
    },
  },
] satisfies readonly unstable_ServerInstrumentation[];

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

  const body = await renderToReadableStream(<ServerRouter {...serverRouterProps} />, {
    onError(error: unknown) {
      status = HTTP_STATUS_INTERNAL_SERVER_ERROR;
      // Log streaming rendering errors from inside the shell. Don't log
      // errors encountered during initial shell rendering since they'll
      // reject and get logged in handleDocumentRequest.
      if (shellRendered) {
        console.error(error);
      }
    },
  });
  shellRendered = true;

  if ((userAgent && isbot(userAgent)) || routerContext.isSpaMode) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');

  return new Response(injectTraceMetaTags(body), {
    headers: responseHeaders,
    status,
  });
});
