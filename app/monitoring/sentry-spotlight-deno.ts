import { createTransport } from '@sentry/deno';

type SpotlightDenoTransportOptions = Parameters<typeof createTransport>[0];

export type { SpotlightDenoTransportOptions };

export function createSpotlightDenoTransport(
  options: SpotlightDenoTransportOptions,
  sidecarUrl: string
) {
  return createTransport(options, async request => {
    const response = await fetch(sidecarUrl, {
      body: request.body as BodyInit,
      headers: {
        'Content-Type': 'application/x-sentry-envelope',
      },
      method: 'POST',
    });

    return {
      headers: {
        'retry-after': response.headers.get('Retry-After'),
        'x-sentry-rate-limits': response.headers.get('X-Sentry-Rate-Limits'),
      },
      statusCode: response.status,
    };
  });
}
