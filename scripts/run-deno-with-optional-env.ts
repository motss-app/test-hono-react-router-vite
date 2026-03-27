function envFileExists(path: string): boolean {
  try {
    Deno.statSync(path);
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return false;
    }

    throw error;
  }
}

const envFilePath = '.env';
const child = new Deno.Command('deno', {
  args: [
    'run',
    ...(envFileExists(envFilePath)
      ? [
          `--env-file=${envFilePath}`,
        ]
      : []),
    ...Deno.args,
  ],
  stderr: 'inherit',
  stdin: 'inherit',
  stdout: 'inherit',
}).spawn();

const status = await child.status;

if (!status.success) {
  Deno.exit(status.code ?? 1);
}
