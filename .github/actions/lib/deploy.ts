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
const TRAILING_SLASHES_RE = /\/+$/;
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

type CloudflareApiErrorResponse = {
  errors?: Array<{
    code?: number;
    message?: string;
  }>;
  messages?: Array<{
    code?: number;
    message?: string;
  }>;
};

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
  const [command, ...args] = cmd;

  if (!command) {
    throw new Error('Command is required');
  }

  const proc = new Deno.Command(command, {
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
    stderr: 'inherit',
    stdout: 'inherit',
  }).spawn();
  const { code } = await proc.status;
  return code;
}

export async function runCapture(cmd: string[], opts?: CommandOptions): Promise<CommandCapture> {
  const [command, ...args] = cmd;

  if (!command) {
    throw new Error('Command is required');
  }

  const proc = new Deno.Command(command, {
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
    stderr: 'piped',
    stdout: 'piped',
  }).spawn();

  const { code, stderr, stdout } = await proc.output();
  const stdoutText = decode(stdout);
  const stderrText = decode(stderr);

  if (stdout.length > 0) {
    Deno.stdout.writeSync(stdout);
  }

  if (stderr.length > 0) {
    Deno.stderr.writeSync(stderr);
  }

  return {
    code,
    stderr: stderrText,
    stdout: stdoutText,
  };
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

export async function purgeCache(hosts: string[]): Promise<void> {
  const zoneId = readEnv('CLOUDFLARE_ZONE_ID');
  const token = readEnv('CLOUDFLARE_API_TOKEN');

  const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
    body: JSON.stringify({
      hosts,
    }),
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!res.ok) {
    const body = await res.text();
    const errorMessage = formatPurgeCacheError(res.status, res.statusText, body);

    writeLine(errorMessage);
    throw new Error(errorMessage);
  }
  writeLine('Cache purged');
}

function formatPurgeCacheError(status: number, statusText: string, body: string): string {
  const lines = [
    `Cache purge failed: ${status}${statusText ? ` ${statusText}` : ''}`,
  ];
  const responseDetails = formatCloudflareResponse(body);

  if (responseDetails) {
    lines.push(`Response: ${responseDetails}`);
  }

  return lines.join('\n');
}

function formatCloudflareResponse(body: string): string {
  const trimmedBody = body.trim();

  if (!trimmedBody) {
    return '';
  }

  try {
    const parsed = JSON.parse(trimmedBody) as CloudflareApiErrorResponse;
    const details = [
      ...(parsed.errors ?? []),
      ...(parsed.messages ?? []),
    ]
      .map(({ code, message }) => {
        const codeText = code === undefined ? '' : `${code}: `;
        return `${codeText}${message ?? ''}`.trim();
      })
      .filter(Boolean);

    if (details.length > 0) {
      return details.join(' | ');
    }
  } catch {
    // Fall through to the raw body snippet below.
  }

  return trimmedBody.slice(0, 500);
}

export async function warmRoutes(base: string, paths: string[]): Promise<void> {
  const normalizedBase = `${base.replace(TRAILING_SLASHES_RE, '')}/`;

  const results = await Promise.all(
    paths.map(path => {
      const url = new URL(path, normalizedBase).toString().replace(TRAILING_SLASHES_RE, '');
      return fetch(url, {
        redirect: 'follow',
      }).then(
        res => {
          if (res.status === 200) {
            writeLine(`✅ ${url}`);
            return true;
          }
          writeLine(`⚠️ ${url} (${res.status})`);
          return false;
        },
        err => {
          writeLine(`⚠️ ${url} (${err instanceof Error ? err.message : err})`);
          return false;
        }
      );
    })
  );

  const failures = results.filter(r => !r).length;
  if (failures > 0) {
    writeLine(`${failures} route(s) failed to warm up`);
    Deno.exit(1);
  }
}

export async function appendSummary(lines: string[]): Promise<void> {
  const path = Deno.env.get('GITHUB_STEP_SUMMARY');
  if (!path) return;
  await Deno.writeTextFile(path, `${lines.join('\n')}\n`, {
    append: true,
  });
}
