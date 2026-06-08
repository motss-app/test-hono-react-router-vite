import type { Types } from '@amplitude/analytics-browser';

type RuntimeMode = 'canary' | 'development' | 'production' | string;

type AmplitudeUserPropertyValue =
  | boolean
  | number
  | string
  | readonly (boolean | number | string)[];

interface AmplitudeUserPropertyOptions {
  mode: RuntimeMode;
  release?: string | undefined;
}

const amplitudeAnalyticsOrigin = 'https://*.amplitude.com';

export function getAmplitudeApiKey(envApiKey: string | undefined): string | undefined {
  return envApiKey?.trim() || undefined;
}

export function getAmplitudeReleaseChannel(mode: RuntimeMode): string {
  if (mode === 'canary' || mode === 'production') {
    return mode;
  }

  return 'development';
}

export function createAmplitudeOptions(_mode: RuntimeMode): Types.BrowserOptions {
  return {
    autocapture: {
      webVitals: true,
    },
  };
}

/**
 * Plain map of Amplitude user properties seeded at boot. The entry.client.tsx applies these to a
 * fresh `Identify` instance so this module stays free of any direct Amplitude SDK imports.
 *
 * `Consent Status`, `User Type`, and `Feature Flags` are seeded with safe defaults because this
 * app does not yet have a consent prompt, authenticated users, or a feature-flag service.
 */
export function createAmplitudeUserPropertyMap(
  options: AmplitudeUserPropertyOptions
): Record<string, AmplitudeUserPropertyValue> {
  const { mode, release } = options;
  const releaseChannel = getAmplitudeReleaseChannel(mode);

  return {
    'App Version': release?.trim() ? release : 'unreleased',
    'Consent Status': 'implicit_granted',
    Environment: releaseChannel,
    'Feature Flags': [],
    'Release Channel': releaseChannel,
    'User Type': 'external',
  };
}

/**
 * Amplitude Analytics endpoints that must be allowed by the document CSP so the browser SDK can
 * transport events. Returned as a list so callers can merge with other connect-src sources.
 */
export function getAmplitudeConnectSrc(): string[] {
  return [
    amplitudeAnalyticsOrigin,
  ];
}
