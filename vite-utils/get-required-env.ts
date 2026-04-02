import { type ReadEnvOptions, readEnv } from './read-env.ts';

interface ReadRequiredEnvOptions extends ReadEnvOptions {
  source: string;
}

export function readRequiredEnv(name: string, options: ReadRequiredEnvOptions): string {
  const value = readEnv(name, options);

  if (value === undefined || value === '') {
    throw new Error(`${options.source} requires ${name} to be defined.`);
  }

  return value;
}
