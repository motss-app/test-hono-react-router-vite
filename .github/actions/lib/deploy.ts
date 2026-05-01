export function writeLine(message: string): void {
  Deno.stdout.writeSync(new TextEncoder().encode(`${message}\n`));
}

const RETRY_DELAY_MS = 2000;
const TRAILING_SLASHES_RE = /\/+$/;

type CommandOptions = {
  cwd?: string;
  env?: Record<string, string>;
};

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
      // biome-ignore lint/performance/noAwaitInLoops: retry attempts are intentionally sequential.
      const code = await run(cmd, opts);

      if (code === 0) {
        return;
      }

      writeLine(`Failed: ${commandLabel} (exit ${code}), attempt ${attempt + 1}/${maxRetries + 1}`);

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

export async function purgeCache(hosts: string[]): Promise<void> {
  const zoneId = readEnv('CLOUDFLARE_ZONE_ID');
  const token = readEnv('CLOUDFLARE_API_TOKEN');

  const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/cache/purge`, {
    body: JSON.stringify({
      hosts,
    }),
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    method: 'DELETE',
  });

  if (!res.ok) {
    writeLine(`Cache purge failed: ${res.status}`);
    return;
  }
  writeLine('Cache purged');
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
