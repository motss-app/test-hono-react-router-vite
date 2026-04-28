type CommandExecutionOptions = {
  cwd?: string;
  env?: Record<string, string>;
};

type CommandResult = {
  code: number;
  output: string;
};

const textDecoder = new TextDecoder();

function decodeCommandOutput(bytes: Uint8Array): string {
  return textDecoder.decode(bytes);
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
  const match = output.match(/Logs were written to "([^"]+)"/);

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

  console.log(`🪵 Showing Wrangler log: ${wranglerLogPath}`);
  console.log(await Deno.readTextFile(wranglerLogPath));
}

export function printOutput(output: string): void {
  if (output.length === 0) {
    return;
  }

  console.log(output);
}

export async function runStep(
  message: string,
  command: [
    string,
    ...string[],
  ],
  options?: CommandExecutionOptions
): Promise<void> {
  console.log(message);

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
  console.log(message);

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

export async function purgeCloudflareCache(hosts: string[]): Promise<void> {
  const zoneId = readRequiredEnv('CLOUDFLARE_ZONE_ID');
  const apiToken = readRequiredEnv('CLOUDFLARE_API_TOKEN');

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
    throw new Error(
      `Cloudflare cache purge failed with status ${response.status}: ${await response.text()}`
    );
  }
}

export async function warmRoutes(baseUrl: string, routes: string[]): Promise<void> {
  let allOk = true;

  for (const route of routes) {
    const target = `${baseUrl}/${route}`.replace(/\/$/, '');
    console.log(`Fetching ${target}...`);

    const response = await fetch(target, {
      redirect: 'follow',
    });

    if (response.status === 200) {
      console.log(`✅ ${target} is up!`);
      continue;
    }

    console.log(`⚠️ Failed to fetch ${target} (status ${response.status})`);
    allOk = false;
  }

  if (!allOk) {
    Deno.exit(1);
  }
}
