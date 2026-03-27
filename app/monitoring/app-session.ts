const appSessionIdCookieName = 'app_session_id';

type AppSessionSpanDataValue =
  | Array<boolean | null | number | string | undefined>
  | boolean
  | number
  | string
  | undefined;

interface AppSessionSpanLike {
  data: Record<string, AppSessionSpanDataValue>;
}

interface BrowserAppSessionGlobal {
  __appSessionId__?: string;
}

export const appSessionIdTagName = 'app.session_id';

export function applyAppSessionIdToSpan<T extends AppSessionSpanLike>(
  span: T,
  appSessionId?: string
): T {
  if (!appSessionId || span.data[appSessionIdTagName] === appSessionId) {
    return span;
  }

  return {
    ...span,
    data: {
      ...span.data,
      [appSessionIdTagName]: appSessionId,
    },
  };
}

function getCookieValue(cookieHeader: string | undefined, cookieName: string): string | undefined {
  if (!cookieHeader) {
    return;
  }

  for (const cookiePart of cookieHeader.split(';')) {
    const [rawCookieName, ...rawCookieValueParts] = cookiePart.trim().split('=');

    if (rawCookieName !== cookieName || rawCookieValueParts.length === 0) {
      continue;
    }

    return rawCookieValueParts.join('=');
  }

  return;
}

function setBrowserAppSessionCookie(appSessionId: string): void {
  // biome-ignore lint/suspicious/noDocumentCookie: Browser-side session correlation needs a synchronous session cookie during Sentry init.
  document.cookie = createAppSessionSetCookieHeader(
    appSessionId,
    globalThis.location.protocol === 'https:'
  );
}

export function createAppSessionId(): string {
  return crypto.randomUUID();
}

export function createAppSessionSetCookieHeader(appSessionId: string, isSecure: boolean): string {
  return [
    `${appSessionIdCookieName}=${encodeURIComponent(appSessionId)}`,
    'Path=/',
    // biome-ignore lint/security/noSecrets: This is a cookie attribute, not a secret.
    'SameSite=Lax',
    ...(isSecure
      ? [
          'Secure',
        ]
      : []),
  ].join('; ');
}

export function getAppSessionIdFromCookieString(
  cookieHeader: string | undefined
): string | undefined {
  return getCookieValue(cookieHeader, appSessionIdCookieName);
}

export function attachAppSessionCookie(
  request: Request,
  response: Response,
  appSessionId: string,
  shouldSetAppSessionCookie: boolean
): Response {
  if (!shouldSetAppSessionCookie) {
    return response;
  }

  const headers = new Headers(response.headers);

  headers.append(
    'Set-Cookie',
    createAppSessionSetCookieHeader(appSessionId, new URL(request.url).protocol === 'https:')
  );

  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}

export function getBrowserAppSessionId(): string | undefined {
  if (typeof window === 'undefined') {
    return;
  }

  const browserAppSessionGlobal = globalThis as typeof globalThis & BrowserAppSessionGlobal;
  const appSessionIdFromCookie = getAppSessionIdFromCookieString(document.cookie);

  if (appSessionIdFromCookie) {
    browserAppSessionGlobal.__appSessionId__ = appSessionIdFromCookie;

    return appSessionIdFromCookie;
  }

  const appSessionId = createAppSessionId();

  setBrowserAppSessionCookie(appSessionId);
  browserAppSessionGlobal.__appSessionId__ = appSessionId;

  return appSessionId;
}
