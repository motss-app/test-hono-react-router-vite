import { createTransport, suppressTracing } from '@sentry/react-router';

const maxKeepaliveBodySize = 60_000;
const maxKeepaliveRequestCount = 15;
let pendingKeepaliveRequestCount = 0;

type SpotlightBrowserTransportOptions = Parameters<typeof createTransport>[0];

export type { SpotlightBrowserTransportOptions };

export function createSpotlightBrowserTransport(
  options: SpotlightBrowserTransportOptions,
  sidecarUrl: string
) {
  return createTransport(options, async request => {
    const body = request.body as BodyInit;
    const bodySize = typeof body === 'string' ? body.length : 0;
    const shouldUseKeepalive =
      bodySize <= maxKeepaliveBodySize && pendingKeepaliveRequestCount < maxKeepaliveRequestCount;

    if (shouldUseKeepalive) {
      pendingKeepaliveRequestCount += 1;
    }

    try {
      const response = await suppressTracing(() =>
        fetch(sidecarUrl, {
          body,
          headers: {
            'Content-Type': 'application/x-sentry-envelope',
          },
          keepalive: shouldUseKeepalive,
          method: 'POST',
          mode: 'cors',
        })
      );

      return {
        headers: {
          'retry-after': response.headers.get('Retry-After'),
          'x-sentry-rate-limits': response.headers.get('X-Sentry-Rate-Limits'),
        },
        statusCode: response.status,
      };
    } finally {
      if (shouldUseKeepalive) {
        pendingKeepaliveRequestCount -= 1;
      }
    }
  });
}
