import { useSentryToolbar } from '@sentry/toolbar';

import {
  getSentryEnvironment,
  isSentryToolbarEnabled,
  sentryOrganization,
  sentryOrigin,
  sentryProject,
} from '../monitoring/sentry.ts';

export function SentryToolbar(): null {
  const mode = import.meta.env.MODE;

  useSentryToolbar({
    enabled: isSentryToolbarEnabled(mode),
    initProps: {
      environment: [
        getSentryEnvironment(mode),
      ],
      organizationSlug: sentryOrganization,
      projectIdOrSlug: sentryProject,
      sentryOrigin,
    },
  });

  return null;
}
