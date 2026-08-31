// ============================================================================
// Typings
// ============================================================================

interface ContentSecurityPolicyOptions {
  connectSrc?: string[] | null;
  frameSrc?: string[] | null;
  nonce?: string | null;
  scriptSrc?: string[] | null;
  scriptHashes?: string[] | null;
  styleHashes?: string[] | null;
}

interface SentryCspReportingOptions {
  dsn: string;
  environment: string;
  release: string;
}

interface SentryCspReportingHeaders {
  contentSecurityPolicyReportOnly: string;
  reportTo: string;
  reportingEndpoints: string;
}

interface SentryCspReportingConfig {
  reportTo: string;
  reportUri: string;
  reportingEndpoints: string;
}

interface CspResult {
  buildPolicy(options: ContentSecurityPolicyOptions): string;
  buildDocumentPolicy(): string;
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
const sentryProjectIdLeadingSlashPattern = /^\/+/;
const defaultConnectSrc = [
  "'self'",
  'https://cloudflareinsights.com',
  'https://api.iconify.design',
  'https://*.posthog.com',
];
const defaultFrameSrc = [
  "'self'",
];
const defaultScriptSrc = [
  "'self'",
  'https://static.cloudflareinsights.com',
  'https://*.posthog.com',
];
export const cloudflareAnalyticsStyleHashes = [
  "'sha256-yA3qHWL4K3kukdLY/T+1vlN/z6FrxQQRjp6/L8l7snM='",
];

/**
 * SHA-256 hash of the deterministic <style> content injected by Base UI's
 * `styleDisableScrollbar` utility (used by Select, ScrollArea, etc.):
 *
 *   .base-ui-disable-scrollbar{scrollbar-width:none}
 *   .base-ui-disable-scrollbar::-webkit-scrollbar{display:none}
 *
 * @see https://github.com/mui/base-ui/blob/master/packages/react/src/utils/styles.tsx
 */
export const baseUiStyleHashes = [
  `'sha256-kLmvWqfziFavKtqHqRsb90f006UAK2Dmd0It5Iz2KFA='`,
] satisfies string[];

export const inlineScriptPattern = /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
export const inlineStylePattern = /<style\b[^>]*>([\s\S]*?)<\/style>/g;
const documentPolicy = 'js-profiling';

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

export async function collectInlineHashes(html: string, pattern: RegExp): Promise<string[]> {
  const inlineContents = [
    ...html.matchAll(pattern),
  ]
    .map(match => match[1])
    .filter((inlineContent): inlineContent is string => Boolean(inlineContent?.trim()));

  const tokens = inlineContents.map(inlineContent => createDigestToken(inlineContent));
  const digests = await Promise.all(tokens);

  return digests.map(token => `'${token}'`);
}

function createNonce(): string {
  return toBase64(crypto.getRandomValues(new Uint8Array(cspNonceByteLength)));
}

function createSentrySecurityReportUri({
  dsn,
  environment,
  release,
}: SentryCspReportingOptions): string {
  const sentryDsn = new URL(dsn);
  const sentryKey = sentryDsn.username;
  const sentryProjectId = sentryDsn.pathname.replace(sentryProjectIdLeadingSlashPattern, '');

  if (!sentryKey) {
    throw new Error('Sentry DSN is missing a public key for security reporting.');
  }

  if (!sentryProjectId) {
    throw new Error('Sentry DSN is missing a project id for security reporting.');
  }

  const reportUri = new URL(
    `/api/${sentryProjectId}/security/`,
    `${sentryDsn.protocol}//${sentryDsn.host}`
  );

  reportUri.searchParams.set('sentry_key', sentryKey);
  reportUri.searchParams.set('sentry_environment', environment);
  reportUri.searchParams.set('sentry_release', release);

  return reportUri.toString();
}

export function createSentryCspReportingConfig(
  options: SentryCspReportingOptions
): SentryCspReportingConfig {
  const reportUri = createSentrySecurityReportUri(options);

  return {
    reportingEndpoints: `csp-endpoint="${reportUri}"`,
    reportTo: JSON.stringify({
      endpoints: [
        {
          url: reportUri,
        },
      ],
      group: 'csp-endpoint',
      include_subdomains: true,
      max_age: 10_886_400,
    }),
    reportUri,
  };
}

export function createSentryCspReportingHeaders(
  contentSecurityPolicy: string,
  options: SentryCspReportingOptions
): SentryCspReportingHeaders {
  const reportingConfig = createSentryCspReportingConfig(options);

  return {
    contentSecurityPolicyReportOnly: `${contentSecurityPolicy}; report-uri ${reportingConfig.reportUri}; report-to csp-endpoint`,
    reportingEndpoints: reportingConfig.reportingEndpoints,
    reportTo: reportingConfig.reportTo,
  };
}

function buildDocumentPolicy(): string {
  return documentPolicy;
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
  const resolvedConnectSrc = uniqueSources([
    ...defaultConnectSrc,
    ...(options.connectSrc ?? []),
  ]);
  const resolvedFrameSrc = options.frameSrc ?? defaultFrameSrc;
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
    ...baseUiStyleHashes,
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
    `style-src-elem ${styleSources.join(' ')}`,
    `style-src-attr 'unsafe-inline'`,
    `font-src 'self'`,
    `img-src 'self' data:`,
    `frame-src ${uniqueSources(resolvedFrameSrc).join(' ')}`,
    `connect-src ${uniqueSources(resolvedConnectSrc).join(' ')}`,
    `worker-src 'self' blob: data:`,
  ].join('; ');
}

// ============================================================================
// Exports
// ============================================================================

export const csp = {
  buildDocumentPolicy,
  buildPolicy,
  createDigestToken,
  createNonce,
  getNonce,
  setNonce,
} satisfies CspResult;
