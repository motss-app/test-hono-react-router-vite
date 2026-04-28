type CommandExecutionOptions = {
  cwd?: string;
  env?: Record<string, string>;
};

type CommandResult = {
  code: number;
  output: string;
};

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();
const wranglerLogPathPattern = /Logs were written to "([^"]+)"/;
const cloudflareZoneIdPattern = /^[a-f0-9]{32}$/i;
const trailingSlashPattern = /\/$/;

type CloudflareZoneLookupResponse = {
  errors?: Array<{
    code: number;
    message: string;
  }>;
  success: boolean;
  result?: Array<{
    id: string;
  }>;
};

function decodeCommandOutput(bytes: Uint8Array): string {
  return textDecoder.decode(bytes);
}

function writeStdoutText(text: string): void {
  Deno.stdout.writeSync(textEncoder.encode(text));
}

export function writeStdoutLine(message: string): void {
  writeStdoutText(`${message}\n`);
}

function writeStderrLine(message: string): void {
  Deno.stderr.writeSync(textEncoder.encode(`${message}\n`));
}

export function readRequiredEnv(name: string): string {
  const value = Deno.env.get(name);

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function buildCommandEnv(options?: CommandExecutionOptions): Record<string, string> | undefined {
  const extraEnv = options?.env;

  if (!extraEnv) {
    return;
  }

  return {
    ...Deno.env.toObject(),
    ...extraEnv,
  };
}

export async function runCommand(
  command: [
    string,
    ...string[],
  ],
  options?: CommandExecutionOptions
): Promise<CommandResult> {
  const [executable, ...args] = command;
  const env = buildCommandEnv(options);

  const child = new Deno.Command(executable, {
    args,
    ...(options?.cwd
      ? {
          cwd: options.cwd,
        }
      : {}),
    ...(env
      ? {
          env,
        }
      : {}),
    stderr: 'piped',
    stdout: 'piped',
  });

  const { code, stderr, stdout } = await child.output();
  const output = `${decodeCommandOutput(stdout)}${decodeCommandOutput(stderr)}`.trimEnd();

  return {
    code,
    output,
  };
}

export async function writeLogFile(logFilePath: string, output: string): Promise<void> {
  await Deno.writeTextFile(logFilePath, `${output}\n`);
}

export function extractWranglerLogPath(output: string): string | null {
  const match = output.match(wranglerLogPathPattern);

  return match?.[1] ?? null;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await Deno.stat(path);
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return false;
    }

    throw error;
  }
}

export async function printWranglerNestedLogIfPresent(output: string): Promise<void> {
  const wranglerLogPath = extractWranglerLogPath(output);

  if (!wranglerLogPath) {
    return;
  }

  if (!(await fileExists(wranglerLogPath))) {
    return;
  }

  writeStdoutLine(`🪵 Showing Wrangler log: ${wranglerLogPath}`);
  const nestedLog = await Deno.readTextFile(wranglerLogPath);
  writeStdoutText(nestedLog.endsWith('\n') ? nestedLog : `${nestedLog}\n`);
}

export function printOutput(output: string): void {
  if (output.length === 0) {
    return;
  }

  writeStdoutText(`${output}\n`);
}

export async function runStep(
  message: string,
  command: [
    string,
    ...string[],
  ],
  options?: CommandExecutionOptions
): Promise<void> {
  writeStdoutLine(message);

  const result = await runCommand(command, options);
  printOutput(result.output);

  if (result.code !== 0) {
    Deno.exit(result.code);
  }
}

export async function runDeployStep(
  message: string,
  command: [
    string,
    ...string[],
  ],
  logFilePath: string,
  options?: CommandExecutionOptions
): Promise<void> {
  writeStdoutLine(message);

  const result = await runCommand(command, options);
  await writeLogFile(logFilePath, result.output);
  printOutput(result.output);

  if (result.code !== 0) {
    await printWranglerNestedLogIfPresent(result.output);
    Deno.exit(result.code);
  }
}

export async function appendStepSummary(lines: string[]): Promise<void> {
  const summaryPath = Deno.env.get('GITHUB_STEP_SUMMARY');

  if (!summaryPath) {
    return;
  }

  await Deno.writeTextFile(summaryPath, `${lines.join('\n')}\n`, {
    append: true,
  });
}

function isCloudflareZoneId(value: string): boolean {
  return cloudflareZoneIdPattern.test(value);
}

async function resolveCloudflareZoneId(
  zoneIdentifier: string,
  apiToken: string
): Promise<string | null> {
  if (isCloudflareZoneId(zoneIdentifier)) {
    return zoneIdentifier;
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones?name=${encodeURIComponent(zoneIdentifier)}&status=active&per_page=1`,
    {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      method: 'GET',
    }
  );

  if (!response.ok) {
    writeStderrLine(
      `⚠️ Cloudflare zone lookup failed with status ${response.status}; skipping cache purge.`
    );
    writeStderrLine(await response.text());
    return null;
  }

  const body = (await response.json()) as CloudflareZoneLookupResponse;

  if (!body.success) {
    writeStderrLine(`⚠️ Cloudflare zone lookup failed for "${zoneIdentifier}"; skipping cache purge.`);

    if (body.errors?.length) {
      writeStderrLine(JSON.stringify(body.errors, null, 2));
    }

    return null;
  }

  const zoneId = body.result?.[0]?.id;

  if (!zoneId) {
    writeStderrLine(`⚠️ No active Cloudflare zone found for "${zoneIdentifier}"; skipping cache purge.`);
    return null;
  }

  return zoneId;
}

export async function purgeCloudflareCache(hosts: string[]): Promise<void> {
  const zoneIdentifier = readRequiredEnv('CLOUDFLARE_ZONE_ID');
  const apiToken = readRequiredEnv('CLOUDFLARE_API_TOKEN');
  const zoneId = await resolveCloudflareZoneId(zoneIdentifier, apiToken);

  if (!zoneId) {
    return;
  }

  const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/cache/purge`, {
    body: JSON.stringify({
      hosts,
    }),
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    method: 'DELETE',
  });

  if (!response.ok) {
    writeStderrLine(
      `⚠️ Cloudflare cache purge failed with status ${response.status}; continuing without purge.`
    );
    writeStderrLine(await response.text());
  }
}

export async function warmRoutes(baseUrl: string, routes: string[]): Promise<void> {
  const results = await Promise.all(
    routes.map(async route => {
      const target = `${baseUrl}/${route}`.replace(trailingSlashPattern, '');
      writeStdoutLine(`Fetching ${target}...`);

      try {
        const response = await fetch(target, {
          redirect: 'follow',
        });

        return {
          status: response.status,
          target,
        };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : String(error),
          target,
        };
      }
    })
  );

  let allOk = true;

  for (const result of results) {
    if ('error' in result) {
      writeStderrLine(`⚠️ Failed to fetch ${result.target} (${result.error})`);
      allOk = false;
      continue;
    }

    if (result.status === 200) {
      writeStdoutLine(`✅ ${result.target} is up!`);
      continue;
    }

    writeStderrLine(`⚠️ Failed to fetch ${result.target} (status ${result.status})`);
    allOk = false;
  }

  if (!allOk) {
    Deno.exit(1);
  }
}
