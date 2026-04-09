export const turnstileAction = 'protected-contact';
export const turnstileOrigin = 'https://challenges.cloudflare.com';
export const turnstileScriptSrc = `${turnstileOrigin}/turnstile/v0/api.js`;
export const turnstileExplicitScriptSrc = `${turnstileOrigin}/turnstile/v0/api.js?render=explicit`;
export const turnstileVerifyUrl = `${turnstileOrigin}/turnstile/v0/siteverify`;

export function hasConfiguredTurnstileValue(value: string | undefined): value is string {
  const trimmed = value?.trim();

  return Boolean(trimmed && !trimmed.startsWith('$') && !trimmed.includes('TURNSTILE_'));
}
