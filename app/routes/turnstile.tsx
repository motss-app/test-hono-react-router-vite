import { create, props } from '@stylexjs/stylex';
import type { FormEvent, JSX, RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useRouteLoaderData } from 'react-router';

import { Link } from '../components/Link.tsx';
import { IconArrowLeft, IconCheck, IconShield, IconTriangleExclamation } from '../icons.ts';
import { iconStyles } from '../styles/icon.stylex.ts';
import { colorTokens, fontWeightTokens } from '../styles/tokens.stylex.ts';
import {
  hasConfiguredTurnstileValue,
  turnstileAction,
  turnstileExplicitScriptSrc,
  turnstileOrigin,
} from '../utils/turnstile.ts';
import type { Route } from './+types/turnstile.ts';

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

interface SubmissionResponse {
  message?: string;
}

interface RootLoaderData {
  cspNonce?: string | undefined;
}

interface TurnstileWidgetApi {
  getResponse(widgetId: string): string;
  remove(widgetId: string): void;
  render(
    container: HTMLElement,
    options: {
      action?: string;
      sitekey: string;
    }
  ): string;
  reset(widgetId: string): void;
}

type TurnstileGlobal = typeof globalThis & {
  turnstile?: TurnstileWidgetApi;
};

const turnstileDevelopmentSiteKey = '1x00000000000000000000AA';
const configuredTurnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
const turnstileSiteKey =
  (hasConfiguredTurnstileValue(configuredTurnstileSiteKey)
    ? configuredTurnstileSiteKey.trim()
    : undefined) || (import.meta.env.DEV ? turnstileDevelopmentSiteKey : '');

export const links: Route.LinksFunction = () => [
  {
    crossOrigin: 'anonymous',
    href: turnstileOrigin,
    rel: 'preconnect',
  },
];

export function meta(): Route.MetaDescriptors {
  return [
    {
      title: 'Turnstile Protection Demo',
    },
    {
      content:
        'A protected form that uses Cloudflare Turnstile, server-side validation, and CSP-safe loading.',
      name: 'description',
    },
  ];
}

const s = create({
  badge: {
    alignItems: 'center',
    background: 'rgba(14, 165, 233, 0.1)',
    borderRadius: '9999px',
    color: colorTokens.info,
    display: 'inline-flex',
    fontSize: '0.9rem',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    gap: '0.45rem',
    padding: '0.45rem 0.8rem',
    width: 'fit-content',
  },
  badgeIcon: {
    height: '1rem',
    width: '1rem',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.94)',
    border: '1px solid rgba(148, 163, 184, 0.3)',
    borderRadius: '1.5rem',
    boxShadow: '0 28px 80px rgba(15, 23, 42, 0.12)',
    padding: '1.5rem',
  },
  cardHeader: {
    display: 'grid',
    gap: '0.45rem',
    marginBottom: '1.25rem',
  },
  cardText: {
    color: colorTokens.slate700,
    fontSize: '0.98rem',
    lineHeight: '1.65',
    margin: 0,
  },
  cardTitle: {
    color: colorTokens.slate900,
    fontSize: '1.45rem',
    fontWeight: fontWeightTokens.fontWeightBold,
    letterSpacing: '-0.03em',
    lineHeight: '1.1',
    margin: 0,
  },
  field: {
    display: 'grid',
    gap: '0.45rem',
  },
  fieldInput: {
    background: 'rgba(255, 255, 255, 0.96)',
    border: '1px solid rgba(148, 163, 184, 0.42)',
    borderRadius: '1rem',
    color: colorTokens.slate900,
    fontSize: '1rem',
    padding: '0.95rem 1rem',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  fieldLabel: {
    color: colorTokens.slate700,
    fontSize: '0.95rem',
    fontWeight: fontWeightTokens.fontWeightSemibold,
  },
  fieldTextArea: {
    minHeight: '10rem',
    resize: 'vertical',
  },
  form: {
    display: 'grid',
    gap: '1rem',
  },
  hero: {
    display: 'grid',
    gap: '1.5rem',
  },
  heroCopy: {
    display: 'grid',
    gap: '1rem',
  },
  list: {
    color: colorTokens.slate700,
    display: 'grid',
    gap: '0.85rem',
    lineHeight: '1.6',
    margin: 0,
    paddingLeft: '1.15rem',
  },
  message: {
    fontSize: '1rem',
    lineHeight: '1.7',
    margin: 0,
    maxWidth: '34rem',
  },
  messageLead: {
    color: colorTokens.slate700,
    fontSize: '1rem',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    letterSpacing: '-0.02em',
    lineHeight: '1.6',
    margin: 0,
    maxWidth: '36rem',
  },
  page: {
    minWidth: 0,
    paddingBottom: '5rem',
    paddingLeft: '1rem',
    paddingRight: '1rem',
    paddingTop: '4rem',
  },
  pageTitle: {
    color: colorTokens.slate900,
    fontSize: 'clamp(3rem, 6vw, 4.6rem)',
    fontWeight: fontWeightTokens.fontWeightBold,
    letterSpacing: '-0.07em',
    lineHeight: '0.92',
    margin: 0,
    maxWidth: '8ch',
  },
  pageTitleAccent: {
    color: colorTokens.info,
    display: 'block',
  },
  resultActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  resultCard: {
    alignItems: 'start',
    display: 'grid',
    gap: '1rem',
    minWidth: 0,
    padding: '1.5rem',
  },
  resultCardError: {
    background: 'rgba(254, 242, 242, 0.94)',
    border: '1px solid rgba(248, 113, 113, 0.28)',
  },
  resultCardSuccess: {
    background: 'rgba(240, 253, 244, 0.96)',
    border: '1px solid rgba(74, 222, 128, 0.28)',
  },
  resultIcon: {
    alignItems: 'center',
    borderRadius: '9999px',
    display: 'inline-flex',
    height: '2.25rem',
    justifyContent: 'center',
    width: '2.25rem',
  },
  resultIconError: {
    color: '#dc2626',
  },
  resultIconSuccess: {
    color: '#16a34a',
  },
  resultText: {
    color: colorTokens.slate700,
    fontSize: '0.98rem',
    lineHeight: '1.65',
    margin: 0,
  },
  resultTitle: {
    color: colorTokens.slate900,
    fontSize: '1.45rem',
    fontWeight: fontWeightTokens.fontWeightBold,
    letterSpacing: '-0.03em',
    lineHeight: '1.1',
    margin: 0,
  },
  shell: {
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: '84rem',
  },
  submitButton: {
    alignItems: 'center',
    background: colorTokens.info,
    border: 'none',
    borderRadius: '9999px',
    color: colorTokens.white,
    cursor: 'pointer',
    display: 'inline-flex',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    gap: '0.5rem',
    justifyContent: 'center',
    padding: '0.92rem 1.45rem',
    transition: 'background-color 0.2s ease, transform 0.2s ease',
    width: '100%',
  },
  submitButtonInline: {
    width: 'auto',
  },
  submitButtonLoading: {
    background: colorTokens.slate400,
    color: colorTokens.slate100,
    cursor: 'wait',
  },
  submitButtonSecondary: {
    background: 'rgba(255, 255, 255, 0.9)',
    border: '1px solid rgba(148, 163, 184, 0.32)',
    color: colorTokens.slate900,
  },
  submitNote: {
    color: colorTokens.slate600,
    fontSize: '0.9rem',
    lineHeight: '1.6',
    margin: 0,
  },
  widget: {
    minHeight: '78px',
  },
});

interface TurnstileFormCardProps {
  isSubmitting: boolean;
  widgetContainerRef: RefObject<HTMLDivElement | null>;
  onSubmit(event: FormEvent<HTMLFormElement>): Promise<void>;
}

interface TurnstileResultCardProps {
  message: string;
  onReload(): void;
  status: 'success' | 'error';
}

interface TurnstileMissingConfigurationCardProps {
  onReload(): void;
}

interface TurnstileSubmissionCardProps {
  hasTurnstileSiteKey: boolean;
  isSubmitting: boolean;
  message: string;
  widgetContainerRef: RefObject<HTMLDivElement | null>;
  onReload(): void;
  onSubmit(event: FormEvent<HTMLFormElement>): Promise<void>;
  status: SubmissionStatus;
}

function TurnstileFormCard({
  isSubmitting,
  widgetContainerRef,
  onSubmit,
}: TurnstileFormCardProps): JSX.Element {
  return (
    <form
      action="/api/turnstile"
      method="post"
      onSubmit={onSubmit}
      {...props(s.form)}
    >
      <div {...props(s.cardHeader)}>
        <h2 {...props(s.cardTitle)}>Protected submission</h2>
        <p {...props(s.cardText)}>
          Solve the widget once, then submit the note. The server will reject the request if the
          token is missing, expired, or replayed.
        </p>
      </div>

      <label {...props(s.field)}>
        <span {...props(s.fieldLabel)}>Name</span>
        <input
          autoComplete="name"
          disabled={isSubmitting}
          maxLength={80}
          name="name"
          placeholder="Ada Lovelace"
          required
          {...props(s.fieldInput)}
        />
      </label>

      <label {...props(s.field)}>
        <span {...props(s.fieldLabel)}>Message</span>
        <textarea
          disabled={isSubmitting}
          maxLength={500}
          name="message"
          placeholder="Tell us what you want to submit after the Turnstile check passes."
          required
          {...props(s.fieldInput, s.fieldTextArea)}
        />
      </label>

      <div
        ref={widgetContainerRef}
        suppressHydrationWarning
        {...props(s.widget)}
      />

      <button
        disabled={isSubmitting}
        type="submit"
        {...props(s.submitButton, isSubmitting && s.submitButtonLoading)}
      >
        {isSubmitting ? 'Verifying…' : 'Verify and submit'}
      </button>

      <p {...props(s.submitNote)}>
        By submitting, you agree to let the server validate the Turnstile token before it accepts
        the request. No token, no party.
      </p>
    </form>
  );
}

function TurnstileResultCard({ message, onReload, status }: TurnstileResultCardProps): JSX.Element {
  const isSuccess = status === 'success';

  return (
    <div {...props(s.resultCard, isSuccess ? s.resultCardSuccess : s.resultCardError)}>
      <span {...props(s.resultIcon, isSuccess ? s.resultIconSuccess : s.resultIconError)}>
        {isSuccess ? (
          <IconCheck {...props(iconStyles.base)} />
        ) : (
          <IconTriangleExclamation {...props(iconStyles.base)} />
        )}
      </span>

      <div {...props(s.cardHeader)}>
        <h2 {...props(s.resultTitle)}>
          {isSuccess ? 'Submission accepted' : 'Submission blocked'}
        </h2>
        <p {...props(s.resultText)}>{message}</p>
      </div>

      <div {...props(s.resultActions)}>
        <button
          onClick={onReload}
          type="button"
          {...props(s.submitButton, s.submitButtonSecondary, s.submitButtonInline)}
        >
          Try again
        </button>
        <Link
          to="/"
          {...props(s.submitButton, s.submitButtonSecondary, s.submitButtonInline)}
        >
          <IconArrowLeft {...props(iconStyles.base)} />
          <span>Back home</span>
        </Link>
      </div>
    </div>
  );
}

function TurnstileMissingConfigurationCard({
  onReload,
}: TurnstileMissingConfigurationCardProps): JSX.Element {
  return (
    <div {...props(s.resultCard, s.resultCardError)}>
      <span {...props(s.resultIcon, s.resultIconError)}>
        <IconTriangleExclamation {...props(iconStyles.base)} />
      </span>

      <div {...props(s.cardHeader)}>
        <h2 {...props(s.resultTitle)}>Turnstile key missing</h2>
        <p {...props(s.resultText)}>
          Set <code>VITE_TURNSTILE_SITE_KEY</code> to render the widget, then submit the form again.
        </p>
      </div>

      <div {...props(s.resultActions)}>
        <button
          onClick={onReload}
          type="button"
          {...props(s.submitButton, s.submitButtonSecondary, s.submitButtonInline)}
        >
          Reload
        </button>
        <Link
          to="/"
          {...props(s.submitButton, s.submitButtonSecondary, s.submitButtonInline)}
        >
          <IconArrowLeft {...props(iconStyles.base)} />
          <span>Back home</span>
        </Link>
      </div>
    </div>
  );
}

function TurnstileSubmissionCard({
  hasTurnstileSiteKey,
  isSubmitting,
  message,
  widgetContainerRef,
  onReload,
  onSubmit,
  status,
}: TurnstileSubmissionCardProps): JSX.Element {
  if (status === 'success' || status === 'error') {
    return (
      <TurnstileResultCard
        message={message}
        onReload={onReload}
        status={status}
      />
    );
  }

  if (!hasTurnstileSiteKey) {
    return <TurnstileMissingConfigurationCard onReload={onReload} />;
  }

  return (
    <TurnstileFormCard
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      widgetContainerRef={widgetContainerRef}
    />
  );
}

export default function TurnstileRoute(): JSX.Element {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const widgetContainerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const rootLoaderData = useRouteLoaderData<RootLoaderData>('root');
  const cspNonce = rootLoaderData?.cspNonce ?? undefined;

  const handleReload = () => {
    globalThis.location.reload();
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setStatus('submitting');
    setMessage('');

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch('/api/turnstile', {
        body: formData,
        method: 'POST',
      });

      const responseBody = (await response.json().catch(() => ({}))) as SubmissionResponse;
      const nextMessage =
        responseBody.message?.trim() || 'The submission completed, but no message was returned.';

      if (!response.ok) {
        setMessage(nextMessage);
        setStatus('error');
        return;
      }

      form.reset();
      setMessage(nextMessage);
      setStatus('success');
    } catch {
      setMessage('The form could not reach the verification endpoint. Please try again.');
      setStatus('error');
    }
  }

  const isSubmitting = status === 'submitting';
  const hasTurnstileSiteKey = turnstileSiteKey.length > 0;

  useEffect(() => {
    if (!hasTurnstileSiteKey) {
      return;
    }

    const widgetContainer = widgetContainerRef.current;

    if (!widgetContainer) {
      return;
    }

    if (widgetIdRef.current) {
      return;
    }

    const renderWidget = () => {
      const turnstile = (globalThis as TurnstileGlobal).turnstile;

      if (!turnstile || widgetIdRef.current || !widgetContainerRef.current) {
        return;
      }

      widgetIdRef.current = turnstile.render(widgetContainerRef.current, {
        action: turnstileAction,
        sitekey: turnstileSiteKey,
      });
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${turnstileExplicitScriptSrc}"]`
    );

    if (existingScript) {
      if ((globalThis as TurnstileGlobal).turnstile) {
        renderWidget();
        return;
      }

      const handleLoad = () => {
        renderWidget();
      };

      existingScript.addEventListener('load', handleLoad, {
        once: true,
      });

      return () => {
        existingScript.removeEventListener('load', handleLoad);
      };
    }

    const scriptElement = document.createElement('script');
    scriptElement.async = true;
    scriptElement.defer = true;
    if (cspNonce) {
      scriptElement.nonce = cspNonce;
    }
    scriptElement.src = turnstileExplicitScriptSrc;

    const handleLoad = () => {
      renderWidget();
    };

    scriptElement.addEventListener('load', handleLoad, {
      once: true,
    });
    document.head.appendChild(scriptElement);

    return () => {
      scriptElement.removeEventListener('load', handleLoad);
    };
  }, [
    cspNonce,
    hasTurnstileSiteKey,
  ]);

  return (
    <main {...props(s.page)}>
      <section {...props(s.shell)}>
        <div {...props(s.hero)}>
          <div {...props(s.heroCopy)}>
            <span {...props(s.badge)}>
              <IconShield {...props(iconStyles.base, s.badgeIcon)} />
              <span>Cloudflare Turnstile</span>
            </span>

            <h1 {...props(s.pageTitle)}>
              Human checks that don’t
              <span {...props(s.pageTitleAccent)}>wreck the CSP</span>
            </h1>

            <p {...props(s.messageLead)}>
              This route loads the exact Turnstile widget script, validates the token on the Hono
              backend, and keeps the app’s shared CSP aligned for both SSR and prerendered pages.
            </p>

            <p {...props(s.message)}>
              It’s a small demo, but the wiring is the same pattern you’d use for a real protected
              form: client-visible site key, server-only secret, and no inline bootstrap scripts.
            </p>

            <ul {...props(s.list)}>
              <li>
                Widget script loads from `https://challenges.cloudflare.com/turnstile/v0/api.js`.
              </li>
              <li>The form posts the hidden `cf-turnstile-response` token to `/api/turnstile`.</li>
              <li>
                Server validation checks the token, action, and hostname before accepting input.
              </li>
            </ul>
          </div>

          <div {...props(s.card)}>
            <TurnstileSubmissionCard
              hasTurnstileSiteKey={hasTurnstileSiteKey}
              isSubmitting={isSubmitting}
              message={message}
              onReload={handleReload}
              onSubmit={handleSubmit}
              status={status}
              widgetContainerRef={widgetContainerRef}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
