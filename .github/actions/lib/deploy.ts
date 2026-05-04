export function writeLine(message: string): void {
  Deno.stdout.writeSync(new TextEncoder().encode(`${message}\n`));
}

export async function withLogGroup<T>(title: string, fn: () => Promise<T> | T): Promise<T> {
  writeLine(`::group::${title}`);

  try {
    return await fn();
  } finally {
    writeLine('::endgroup::');
  }
}

const RETRY_DELAY_MS = 2000;
const URL_RE = /https?:\/\/[^\s"'<>`]+/g;

type CommandOptions = {
  cwd?: string;
  env?: Record<string, string>;
};

type CommandCapture = {
  code: number;
  stderr: string;
  stdout: string;
};

function createCommand(
  cmd: string[],
  opts: CommandOptions | undefined,
  captureOutput: boolean
): Deno.Command {
  const [command, ...args] = cmd;

  if (!command) {
    throw new Error('Command is required');
  }

  const commandOptions = {
    args,
    ...(opts?.cwd
      ? {
          cwd: opts.cwd,
        }
      : {}),
    ...(opts?.env
      ? {
          env: {
            ...Deno.env.toObject(),
            ...opts.env,
          },
        }
      : {}),
    stderr: captureOutput ? 'piped' : 'inherit',
    stdout: captureOutput ? 'piped' : 'inherit',
  } satisfies Deno.CommandOptions;

  return new Deno.Command(command, commandOptions);
}

function writeCapturedOutput(stdout: Uint8Array, stderr: Uint8Array): void {
  if (stdout.length > 0) {
    Deno.stdout.writeSync(stdout);
  }

  if (stderr.length > 0) {
    Deno.stderr.writeSync(stderr);
  }
}

async function executeCommand(
  cmd: string[],
  opts: CommandOptions | undefined,
  captureOutput: boolean
): Promise<CommandCapture> {
  const proc = createCommand(cmd, opts, captureOutput).spawn();

  if (!captureOutput) {
    const { code } = await proc.status;
    return {
      code,
      stderr: '' as const,
      stdout: '' as const,
    };
  }

  const { code, stderr, stdout } = await proc.output();
  const stdoutText = decode(stdout);
  const stderrText = decode(stderr);

  writeCapturedOutput(stdout, stderr);

  return {
    code,
    stderr: stderrText,
    stdout: stdoutText,
  };
}

function decode(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function readEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

export async function run(cmd: string[], opts?: CommandOptions): Promise<number> {
  const { code } = await executeCommand(cmd, opts, false);
  return code;
}

export function runCapture(cmd: string[], opts?: CommandOptions): Promise<CommandCapture> {
  return executeCommand(cmd, opts, true);
}

export async function runOrDie(cmd: string[], opts?: CommandOptions): Promise<void> {
  const code = await run(cmd, opts);
  if (code !== 0) {
    writeLine(`Failed: ${cmd.join(' ')} (exit ${code})`);
    Deno.exit(code);
  }
}

export function retry(maxRetries: number): (cmd: string[], opts?: CommandOptions) => Promise<void> {
  return async (cmd, opts): Promise<void> => {
    const commandLabel = cmd.join(' ');

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const attemptNumber = attempt + 1;
      const totalAttempts = maxRetries + 1;
      const attemptLabel = `Attempt ${attemptNumber}/${totalAttempts}: ${commandLabel}`;

      let code = 1;

      await withLogGroup(attemptLabel, async () => {
        try {
          code = await run(cmd, opts);

          if (code !== 0) {
            writeLine(
              `Failed: ${commandLabel} (exit ${code}), attempt ${attemptNumber}/${totalAttempts}`
            );
          }
        } catch (error) {
          writeLine(
            `Failed: ${commandLabel} (${error instanceof Error ? error.message : String(error)}), attempt ${attemptNumber}/${totalAttempts}`
          );
          code = 1;
        }
      });

      if (code === 0) {
        return;
      }

      if (attempt === maxRetries) {
        break;
      }

      const nextAttempt = attempt + 1;
      const delayMs = RETRY_DELAY_MS * nextAttempt;

      writeLine(
        `Retrying ${commandLabel} in ${delayMs}ms (attempt ${nextAttempt + 1}/${maxRetries + 1})...`
      );
      await sleep(delayMs);
    }

    writeLine(`Failed: ${commandLabel} after ${maxRetries + 1} attempts`);
    Deno.exit(1);
  };
}

export function extractUrls(text: string): string[] {
  return [
    ...new Set(text.match(URL_RE) ?? []),
  ];
}

export async function appendSummary(lines: string[]): Promise<void> {
  const path = Deno.env.get('GITHUB_STEP_SUMMARY');
  if (!path) return;
  await Deno.writeTextFile(path, `${lines.join('\n')}\n`, {
    append: true,
  });
}
