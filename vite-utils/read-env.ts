type EnvironmentLike = Record<string, unknown> | undefined;

export interface ReadEnvOptions {
  env?: EnvironmentLike;
}

export function readEnv(name: string, options?: ReadEnvOptions): string | undefined {
  const value = options?.env?.[name];

  if (typeof value === 'string') {
    return value;
  }

  return Deno.env.get(name) ?? undefined;
}
