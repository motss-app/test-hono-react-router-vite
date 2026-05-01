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

export async function deploy(
  cmd: string[],
  logPath: string,
  cwd?: string,
  retries = 2
): Promise<void> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      writeLine(`Retrying deploy (attempt ${attempt + 1})...`);
      await new Promise(r => setTimeout(r, 2000 * attempt));
    }

    const proc = new Deno.Command(cmd[0]!, {
      args: cmd.slice(1),
      ...(cwd
        ? {
            cwd,
          }
        : {}),
      stderr: 'piped',
      stdout: 'piped',
    }).spawn();
    const { code, stdout, stderr } = await proc.output();
    const output = new TextDecoder().decode(stdout) + new TextDecoder().decode(stderr);

    if (code === 0) {
      writeLine(output);
      writeLine(`Deploy succeeded, log: ${logPath}`);
      return;
    }

    await Deno.writeTextFile(logPath, output);
    writeLine(`Deploy failed (exit ${code}), log: ${logPath}, attempt ${attempt + 1}`);
    writeLine(output);
  }

  writeLine(`Deploy failed after ${retries + 1} attempts`);
  Deno.exit(1);
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

export async function warmRoutes(base: string, paths: string[], retries = 2): Promise<void> {
  let failures = 0;

  for (const path of paths) {
    const url = `${base}/${path}`.replace(/\/+$/, '');
    let ok = false;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(url, {
          redirect: 'follow',
        });
        if (res.status === 200) {
          writeLine(`✅ ${url}`);
          ok = true;
          break;
        }
        writeLine(`⚠️ ${url} (${res.status}), attempt ${attempt + 1}`);
      } catch (err) {
        writeLine(`⚠️ ${url} (${err instanceof Error ? err.message : err}), attempt ${attempt + 1}`);
      }
      if (attempt < retries) await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }

    if (!ok) {
      failures++;
    }
  }

  if (failures > 0) {
    writeLine(`${failures} route(s) failed to warm up after ${retries + 1} attempts`);
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
