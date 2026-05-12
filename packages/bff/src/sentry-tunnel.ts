import { Hono } from 'hono';
import { problemDetails } from 'hono-problem-details';

import type { BffBindings } from './bindings.ts';

const envelopeContentType = 'application/x-sentry-envelope';
const envelopeLineFeed = 10;
// Spotlight still expects raw Sentry envelopes on `/stream`. The browser never posts directly to
// this sidecar URL; it uses same-origin `/api/stream`, and the BFF forwards only after validating
// that the envelope belongs to the configured DSN/project.
const spotlightStreamUrl = new URL('http://localhost:8969/stream');
const textDecoder = new TextDecoder();

interface SentryEnvelopeHeader {
  dsn?: string;
}

interface ParsedSentryDsn {
  origin: string;
  projectId: string;
}

function parseSentryDsn(dsn: string): ParsedSentryDsn | undefined {
  try {
    const url = new URL(dsn);
    const projectId = url.pathname.replace(/^\/+/, '').split('/')[0];

    if (!projectId) {
      return;
    }

    return {
      origin: url.origin,
      projectId,
    };
  } catch {
    return;
  }
}

async function readFirstEnvelopeLine(request: Request): Promise<string | undefined> {
  const body = request.clone().body;

  if (!body) {
    return;
  }

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let byteLength = 0;
  let sawLineBreak = false;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      if (!value) {
        continue;
      }

      const lineBreakIndex = value.indexOf(envelopeLineFeed);

      if (lineBreakIndex === -1) {
        chunks.push(value);
        byteLength += value.byteLength;
        continue;
      }

      if (lineBreakIndex > 0) {
        chunks.push(value.slice(0, lineBreakIndex));
        byteLength += lineBreakIndex;
      }

      sawLineBreak = true;
      break;
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }

  if (!sawLineBreak || byteLength === 0) {
    return;
  }

  const firstLine = new Uint8Array(byteLength);
  let offset = 0;

  for (const chunk of chunks) {
    firstLine.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return textDecoder.decode(firstLine).replace(/\r$/, '');
}

function createUpstreamEnvelopeUrl(dsn: ParsedSentryDsn): URL {
  return new URL(`/api/${dsn.projectId}/envelope/`, dsn.origin);
}

/**
 * Validate only the envelope header line first so we can reject cross-project traffic without
 * eagerly reading and buffering the full payload.
 */
async function validateEnvelopeRequest(
  request: Request,
  configuredDsn?: string
): Promise<ParsedSentryDsn> {
  if (!configuredDsn) {
    throw problemDetails({ status: 503, title: 'Sentry tunnel DSN is unavailable.' });
  }

  const expectedDsn = parseSentryDsn(configuredDsn);

  if (!expectedDsn) {
    throw problemDetails({ status: 503, title: 'Sentry tunnel DSN is invalid.' });
  }

  const envelopeHeaderLine = await readFirstEnvelopeLine(request);

  if (!envelopeHeaderLine) {
    throw problemDetails({ status: 400, title: 'Missing Sentry envelope header.' });
  }

  let envelopeHeader: SentryEnvelopeHeader;

  try {
    envelopeHeader = JSON.parse(envelopeHeaderLine) as SentryEnvelopeHeader;
  } catch {
    throw problemDetails({ status: 400, title: 'Invalid Sentry envelope header.' });
  }

  const envelopeDsn =
    typeof envelopeHeader.dsn === 'string' ? parseSentryDsn(envelopeHeader.dsn) : undefined;

  if (!envelopeDsn) {
    throw problemDetails({ status: 400, title: 'Missing or invalid envelope DSN.' });
  }

  if (!isMatchingSentryDsn(expectedDsn, envelopeDsn)) {
    throw problemDetails({ status: 403, title: 'Envelope DSN does not match the configured Sentry project.' });
  }

  return expectedDsn;
}

function isMatchingSentryDsn(expected: ParsedSentryDsn, actual: ParsedSentryDsn): boolean {
  return expected.origin === actual.origin && expected.projectId === actual.projectId;
}

function createForwardRequest(request: Request, url: URL): Request {
  const headers = new Headers(request.headers);
  headers.delete('Content-Length');
  headers.set('Content-Type', envelopeContentType);

  return new Request(url, {
    body: request.body,
    headers,
    method: request.method,
  });
}

export const sentryTunnelApp = new Hono<{
  Bindings: BffBindings;
}>().post('/', async c => {
  const parsedDsn = await validateEnvelopeRequest(c.req.raw, c.env.SENTRY_DSN);

  try {
    return await fetch(
      createForwardRequest(c.req.raw, createUpstreamEnvelopeUrl(parsedDsn))
    );
  } catch {
    return problemDetails({ status: 502, title: 'Failed to forward Sentry envelope.' }).getResponse();
  }
});

export const sentrySpotlightStreamApp = new Hono<{
  Bindings: BffBindings;
}>().post('/', async c => {
  // `/api/stream` only exists for local development. Deployed environments should continue to use
  // the private `/api/tunnel` path that forwards to real Sentry ingest instead of a local sidecar.
  if (!import.meta.env.DEV) {
    return problemDetails({ status: 404, title: 'Spotlight stream is only available in local development.' }).getResponse();
  }

  await validateEnvelopeRequest(c.req.raw, c.env.SENTRY_DSN);

  try {
    return await fetch(createForwardRequest(c.req.raw, spotlightStreamUrl));
  } catch {
    return problemDetails({ status: 502, title: 'Failed to forward Sentry envelope to Spotlight.' }).getResponse();
  }
});
