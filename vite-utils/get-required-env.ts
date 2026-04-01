export function getRequiredEnv(
  name: string,
  options: GetRequiredEnvOptions = {}
): string | undefined {
  const value = Deno.env.get(name);
  const isDeploymentBuild = Deno.env.get('DEPLOYMENT_BUILD') === 'true';

  if (isDeploymentBuild && (value === undefined || value === '')) {
    throw new Error(`${options.source ?? 'Environment'} requires ${name} to be defined.`);
  }

  return value ?? undefined;
}

interface GetRequiredEnvOptions {
  source?: string;
}
