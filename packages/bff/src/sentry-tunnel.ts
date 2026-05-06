import { Hono } from 'hono';

import type { BffBindings } from './bindings.ts';

const envelopeContentType = 'application/x-sentry-envelope';
const envelopeLineFeed = 10;
const textDecoder = new TextDecoder();

interface SentryEnvelopeHeader {
  dsn?: string;
}

interface ParsedSentryDsn {
  origin: string;
  projectId: string;
}

function createTunnelResponse(status: number, message: string): Response {
  return new Response(message, {
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'text/plain; charset=utf-8',
    },
    status,
  });
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

function isMatchingSentryDsn(expected: ParsedSentryDsn, actual: ParsedSentryDsn): boolean {
  return expected.origin === actual.origin && expected.projectId === actual.projectId;
}

function createForwardRequest(request: Request, url: URL): Request {
  const headers = new Headers(request.headers);
  headers.set('Content-Type', envelopeContentType);

  return new Request(url, {
    body: request.body,
    headers,
    method: request.method,
  });
}

export const sentryTunnelApp = new Hono<{ Bindings: BffBindings }>().post('/', async c => {
  const configuredDsn = c.env.SENTRY_DSN;

  if (!configuredDsn) {
    return createTunnelResponse(503, 'Sentry tunnel DSN is unavailable.');
  }

  const expectedDsn = parseSentryDsn(configuredDsn);

  if (!expectedDsn) {
    return createTunnelResponse(503, 'Sentry tunnel DSN is invalid.');
  }

  const envelopeHeaderLine = await readFirstEnvelopeLine(c.req.raw);

  if (!envelopeHeaderLine) {
    return createTunnelResponse(400, 'Missing Sentry envelope header.');
  }

  let envelopeHeader: SentryEnvelopeHeader;

  try {
    envelopeHeader = JSON.parse(envelopeHeaderLine) as SentryEnvelopeHeader;
  } catch {
    return createTunnelResponse(400, 'Invalid Sentry envelope header.');
  }

  const envelopeDsn =
    typeof envelopeHeader.dsn === 'string' ? parseSentryDsn(envelopeHeader.dsn) : undefined;

  if (!envelopeDsn) {
    return createTunnelResponse(400, 'Missing or invalid envelope DSN.');
  }

  if (!isMatchingSentryDsn(expectedDsn, envelopeDsn)) {
    return createTunnelResponse(403, 'Envelope DSN does not match the configured Sentry project.');
  }

  try {
    return await fetch(createForwardRequest(c.req.raw, createUpstreamEnvelopeUrl(expectedDsn)));
  } catch {
    return createTunnelResponse(502, 'Failed to forward Sentry envelope.');
  }
});
