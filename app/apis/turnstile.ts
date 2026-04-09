import { logger } from '@sentry/cloudflare';
import { type Context, Hono } from 'hono';

import type { HonoEnv } from '../types/hono.types.ts';
import {
  hasConfiguredTurnstileValue,
  turnstileAction,
  turnstileVerifyUrl,
} from '../utils/turnstile.ts';

interface TurnstileSiteVerifyResponse {
  action?: string;
  challenge_ts?: string;
  'error-codes'?: string[];
  hostname?: string;
  success: boolean;
}

interface TurnstileSubmitResponse {
  message: string;
}

interface TurnstileSubmissionFields {
  name: string;
  token: string;
}

const turnstileDevelopmentSecretKey = '1x0000000000000000000000000000000AA';
const turnstileMissingConfigurationMessage =
  'Turnstile is not configured yet. Please try again later.';
const turnstileSubmissionFailureMessage =
  'Verification failed. Please solve the Turnstile challenge again.';
const turnstileSubmissionSuccessMessage = 'Thanks, your protected message was accepted.';

function normalizeFormValue(value: FormDataEntryValue | null): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function getTurnstileSecretKey(bindings?: HonoEnv['Bindings']): string | undefined {
  const bindingSecret = bindings?.TURNSTILE_SECRET_KEY?.trim();

  if (hasConfiguredTurnstileValue(bindingSecret)) {
    return bindingSecret;
  }

  if (typeof Deno !== 'undefined') {
    const localSecret = Deno.env.get('TURNSTILE_SECRET_KEY')?.trim();

    if (hasConfiguredTurnstileValue(localSecret)) {
      return localSecret;
    }
  }

  return import.meta.env.DEV ? turnstileDevelopmentSecretKey : undefined;
}

function getRemoteIp(request: Request): string | undefined {
  const forwardedFor = request.headers.get('x-forwarded-for') ?? undefined;

  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || undefined;
  }

  return request.headers.get('CF-Connecting-IP') ?? undefined;
}

function createTurnstileResponse(
  c: Context<HonoEnv>,
  message: string,
  status: 200 | 400 | 503
): Response {
  return c.json(
    {
      message,
    } satisfies TurnstileSubmitResponse,
    status
  );
}

function createValidationFailureResponse(c: Context<HonoEnv>): Response {
  return createTurnstileResponse(c, turnstileSubmissionFailureMessage, 400);
}

async function verifyTurnstileToken({
  remoteIp,
  secretKey,
  token,
}: {
  remoteIp?: string | undefined;
  secretKey: string;
  token: string;
}): Promise<TurnstileSiteVerifyResponse | null> {
  const formData = new FormData();
  formData.append('secret', secretKey);
  formData.append('response', token);

  if (remoteIp) {
    formData.append('remoteip', remoteIp);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(turnstileVerifyUrl, {
      body: formData,
      method: 'POST',
      signal: controller.signal,
    });

    return (await response.json()) as TurnstileSiteVerifyResponse;
  } catch (error) {
    logger.error('[app/apis/turnstile.ts] Turnstile validation request failed', {
      error: error instanceof Error ? error.message : String(error),
    });

    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

function rejectTurnstileSubmission(c: Context<HonoEnv>): Response {
  return createValidationFailureResponse(c);
}

function createTurnstileSuccessResponse(c: Context<HonoEnv>, name: string): Response {
  return createTurnstileResponse(c, `${turnstileSubmissionSuccessMessage} Thanks, ${name}.`, 200);
}

function logValidationFailure(reason: string, details: Record<string, string | undefined>): void {
  logger.warn('[app/apis/turnstile.ts] Turnstile validation rejected submission', {
    reason,
    ...details,
  });
}

function readTurnstileFormData(formData: FormData): {
  message: string;
  name: string;
  token: string;
} {
  return {
    message: normalizeFormValue(formData.get('message')),
    name: normalizeFormValue(formData.get('name')),
    token: normalizeFormValue(formData.get('cf-turnstile-response')),
  };
}

async function readTurnstileSubmission(
  c: Context<HonoEnv>
): Promise<TurnstileSubmissionFields | Response> {
  const { message, name, token } = readTurnstileFormData(await c.req.formData());

  if (name.length === 0 || message.length === 0) {
    logValidationFailure('missing-form-fields', {
      message,
      name,
    });

    return createTurnstileResponse(
      c,
      'Please complete the form fields before submitting again.',
      400
    );
  }

  if (token.length === 0) {
    logValidationFailure('missing-turnstile-token', {
      name,
    });

    return rejectTurnstileSubmission(c);
  }

  return {
    name,
    token,
  };
}

function validateTurnstileMetadata({
  name,
  requestHostname,
  validation,
  c,
}: {
  c: Context<HonoEnv>;
  name: string;
  requestHostname: string;
  validation: TurnstileSiteVerifyResponse;
}): Response | null {
  const shouldValidateMetadata = import.meta.env.PROD;

  if (
    shouldValidateMetadata &&
    (validation.action !== turnstileAction || validation.hostname !== requestHostname)
  ) {
    logValidationFailure('turnstile-payload-mismatch', {
      action: validation.action,
      expectedAction: turnstileAction,
      hostname: validation.hostname,
      name,
      requestHostname,
    });

    return rejectTurnstileSubmission(c);
  }

  if (!shouldValidateMetadata && validation.action !== turnstileAction) {
    logValidationFailure('turnstile-action-mismatch', {
      action: validation.action,
      expectedAction: turnstileAction,
      hostname: validation.hostname,
      name,
      requestHostname,
    });
  }

  return null;
}

async function handleTurnstileRequest(c: Context<HonoEnv>): Promise<Response> {
  const secretKey = getTurnstileSecretKey(c.env);

  if (!secretKey) {
    logger.error('[app/apis/turnstile.ts] TURNSTILE_SECRET_KEY is missing');
    return createTurnstileResponse(c, turnstileMissingConfigurationMessage, 503);
  }

  const submission = await readTurnstileSubmission(c);

  if (submission instanceof Response) {
    return submission;
  }

  const validation = await verifyTurnstileToken({
    remoteIp: getRemoteIp(c.req.raw),
    secretKey,
    token: submission.token,
  });

  if (!validation?.success) {
    logValidationFailure('turnstile-validation-failed', {
      action: validation?.action,
      challengeTs: validation?.challenge_ts,
      errorCodes: validation?.['error-codes']?.join(', '),
      hostname: validation?.hostname,
      name: submission.name,
    });

    return rejectTurnstileSubmission(c);
  }

  const requestHostname = new URL(c.req.url).hostname;

  const metadataValidationResponse = validateTurnstileMetadata({
    c,
    name: submission.name,
    requestHostname,
    validation,
  });

  if (metadataValidationResponse) {
    return metadataValidationResponse;
  }

  return createTurnstileSuccessResponse(c, submission.name);
}

const turnstileApp = new Hono<HonoEnv>().post('/', handleTurnstileRequest);

export const turnstileApiApp = turnstileApp;
