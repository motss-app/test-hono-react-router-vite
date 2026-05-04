import path from 'node:path';

export function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.stack ?? error.message;
  }

  return String(error);
}

export function getThemeBootstrapEntryPoint(rootDir?: string): string {
  return path.resolve(rootDir ?? Deno.cwd(), 'app/critical/theme-bootstrap/bootstrap.ts');
}
