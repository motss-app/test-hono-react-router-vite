export function writeLine(message: string): void {
  Deno.stdout.writeSync(new TextEncoder().encode(`${message}\n`));
}

export function readEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

export async function run(
  cmd: string[],
  opts?: {
    cwd?: string;
    env?: Record<string, string>;
  }
): Promise<number> {
  const proc = new Deno.Command(cmd[0]!, {
    args: cmd.slice(1),
    ...(opts?.cwd ? { cwd: opts.cwd } : {}),
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

export async function runOrDie(
  cmd: string[],
  opts?: {
    cwd?: string;
    env?: Record<string, string>;
  }
): Promise<void> {
  const code = await run(cmd, opts);
  if (code !== 0) {
    writeLine('Failed: ' + cmd.join(' ') + ' (exit ' + code + ')');
    Deno.exit(code);
  }
}

export async function purgeCache(hosts: string[]): Promise<void> {
  const zoneId = readEnv('CLOUDFLARE_ZONE_ID');
  const token = readEnv('CLOUDFLARE_API_TOKEN');

  const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/cache/purge`, {
    body: JSON.stringify({ hosts }),
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
  const results = await Promise.all(
    paths.map(path => {
      const url = `${base}/${path}`.replace(/\/+$/, '');
      return fetch(url, { redirect: 'follow' }).then(
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
