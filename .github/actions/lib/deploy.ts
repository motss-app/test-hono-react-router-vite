export function writeLine(message: string): void {
  Deno.stdout.writeSync(new TextEncoder().encode(`${message}\n`));
}

export function readEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

export async function run(command: string[], cwd?: string): Promise<number> {
  const proc = new Deno.Command(command[0], {
    args: command.slice(1),
    cwd,
    stdout: 'inherit',
    stderr: 'inherit',
  }).spawn();
  const { code } = await proc.status;
  return code;
}

export async function runOrDie(command: string[], cwd?: string): Promise<void> {
  const code = await run(command, cwd);
  if (code !== 0) {
    writeLine(`Command failed with exit code ${code}`);
    Deno.exit(code);
  }
}

export async function deploy(command: string[], logPath: string, cwd?: string): Promise<void> {
  const proc = new Deno.Command(command[0], {
    args: command.slice(1),
    cwd,
    stdout: 'piped',
    stderr: 'piped',
  }).spawn();
  const { code, stdout, stderr } = await proc.output();
  const output = new TextDecoder().decode(stdout) + new TextDecoder().decode(stderr);

  if (code !== 0) {
    await Deno.writeTextFile(logPath, output);
    writeLine(`Deploy failed (exit ${code}), log: ${logPath}`);
    writeLine(output);
    Deno.exit(code);
  }

  writeLine(output);
  writeLine(`Deploy succeeded, log: ${logPath}`);
}

export async function purgeCache(hosts: string[]): Promise<void> {
  const zoneId = readEnv('CLOUDFLARE_ZONE_ID');
  const token = readEnv('CLOUDFLARE_API_TOKEN');

  const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/cache/purge`, {
    body: JSON.stringify({ hosts }),
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    method: 'DELETE',
  });

  if (!res.ok) {
    writeLine(`Cache purge failed: ${res.status}`);
    return;
  }
  writeLine('Cache purged');
}

export async function warmRoutes(base: string, paths: string[]): Promise<void> {
  let failures = 0;
  for (const path of paths) {
    const url = `${base}/${path}`.replace(/\/+$/, '');
    try {
      const res = await fetch(url, { redirect: 'follow' });
      if (res.status === 200) {
        writeLine(`✅ ${url}`);
      } else {
        writeLine(`⚠️ ${url} (${res.status})`);
        failures++;
      }
    } catch (err) {
      writeLine(`⚠️ ${url} (${err instanceof Error ? err.message : err})`);
      failures++;
    }
  }
  if (failures > 0) {
    writeLine(`${failures} route(s) failed to warm up`);
    Deno.exit(1);
  }
}

export async function appendSummary(lines: string[]): Promise<void> {
  const path = Deno.env.get('GITHUB_STEP_SUMMARY');
  if (!path) return;
  await Deno.writeTextFile(path, `${lines.join('\n')}\n`, { append: true });
}
