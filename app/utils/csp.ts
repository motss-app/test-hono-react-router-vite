// ============================================================================
// Typings
// ============================================================================

interface ContentSecurityPolicyOptions {
  connectSrc?: string[] | null;
  nonce?: string | null;
  scriptSrc?: string[] | null;
  scriptHashes?: string[] | null;
  styleHashes?: string[] | null;
}

interface CspResult {
  buildPolicy(options: ContentSecurityPolicyOptions): string;
  createDigestToken(value: string): Promise<string>;
  createNonce(): string;
  getNonce(request: Request): string | undefined;
  setNonce(headers: Headers, nonce: string | null | undefined): void;
}

// ============================================================================
// Constants
// ============================================================================

const cspDigestAlgorithm = 'SHA-384';
const cspNonceByteLength = 16;
const base64ChunkSize = 0x80_00;
const cspNonceRequestHeader = 'x-internal-csp-nonce';
const defaultConnectSrc = [
  "'self'",
  'https://cloudflareinsights.com',
];
const defaultScriptSrc = [
  "'self'",
  'https://static.cloudflareinsights.com',
];

// ============================================================================
// Functions
// ============================================================================

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += base64ChunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + base64ChunkSize));
  }
  return btoa(binary);
}

async function digestBase64(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(cspDigestAlgorithm, new TextEncoder().encode(value));
  return toBase64(new Uint8Array(digest));
}

function uniqueSources(values: readonly string[]): string[] {
  return [
    ...new Set(values.filter(Boolean)),
  ];
}

async function createDigestToken(value: string): Promise<string> {
  return `sha384-${await digestBase64(value)}`;
}

function createNonce(): string {
  return toBase64(crypto.getRandomValues(new Uint8Array(cspNonceByteLength)));
}

function getNonce(request: Request): string | undefined {
  return request.headers.get(cspNonceRequestHeader) ?? undefined;
}

function setNonce(headers: Headers, nonce: string | null | undefined): void {
  if (nonce) {
    headers.set(cspNonceRequestHeader, nonce);
  } else {
    headers.delete(cspNonceRequestHeader);
  }
}

function buildPolicy(options: ContentSecurityPolicyOptions): string {
  const resolvedConnectSrc = options.connectSrc ?? defaultConnectSrc;
  const resolvedScriptSrc = options.scriptSrc ?? defaultScriptSrc;
  const resolvedScriptHashes = options.scriptHashes ?? [];
  const resolvedStyleHashes = options.styleHashes ?? [];
  const nonce = options.nonce ?? undefined;
  const scriptSources = uniqueSources([
    ...resolvedScriptSrc,
    ...(nonce
      ? [
          `'nonce-${nonce}'`,
        ]
      : []),
    ...resolvedScriptHashes,
  ]);
  const styleSources = uniqueSources([
    "'self'",
    ...(nonce
      ? [
          `'nonce-${nonce}'`,
        ]
      : []),
    ...resolvedStyleHashes,
  ]);

  return [
    `default-src 'self'`,
    `base-uri 'self'`,
    `object-src 'none'`,
    `frame-ancestors 'none'`,
    `form-action 'self'`,
    `script-src ${scriptSources.join(' ')}`,
    `style-src ${styleSources.join(' ')}`,
    `font-src 'self'`,
    `img-src 'self' data:`,
    `connect-src ${uniqueSources(resolvedConnectSrc).join(' ')}`,
  ].join('; ');
}

// ============================================================================
// Exports
// ============================================================================

export const csp = {
  buildPolicy,
  createDigestToken,
  createNonce,
  getNonce,
  setNonce,
} satisfies CspResult;
