import type { ChildProcess } from 'node:child_process';
import { once } from 'node:events';
import { existsSync } from 'node:fs';
import { appendFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { spawnCommand } from '../../../scripts/run-command.ts';

export function writeLine(message: string): void {
  process.stdout.write(`${message}\n`);
}

export async function withLogGroup<T>(title: string, fn: () => Promise<T> | T): Promise<T> {
  writeLine(`::group::${title}`);

  try {
    return await fn();
  } finally {
    writeLine('::endgroup::');
  }
}

const repoRootDir = dirname(fileURLToPath(new URL('../../../package.json', import.meta.url)));

function localBinPathIfExists(name: string): string | undefined {
  const binPath = join(repoRootDir, 'node_modules', '.bin', name);
  return existsSync(binPath) ? binPath : undefined;
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

/**
 * Resolve a workspace-installed binary to an absolute path.
 *
 * Composite action steps inherit a `PATH` that does not include the repo's
 * `node_modules/.bin`, so a bare `wrangler` would not be found. Anything not
 * installed locally, such as `pnpm`, falls back to the ambient `PATH`.
 */
function resolveExecutable(command: string): string {
  const localPath = localBinPathIfExists(command);
  return localPath ?? command;
}

function createCommand(
  cmd: string[],
  opts: CommandOptions | undefined,
  captureOutput: boolean
): ChildProcess {
  const [command, ...args] = cmd;

  if (!command) {
    throw new Error('Command is required');
  }

  return spawnCommand(resolveExecutable(command), args, {
    ...(opts?.cwd
      ? {
          cwd: opts.cwd,
        }
      : {}),
    env: opts?.env
      ? {
          ...process.env,
          ...opts.env,
        }
      : process.env,
    stdio: captureOutput ? 'pipe' : 'inherit',
  });
}

function writeCapturedOutput(stdout: Buffer, stderr: Buffer): void {
  if (stdout.length > 0) {
    process.stdout.write(stdout);
  }

  if (stderr.length > 0) {
    process.stderr.write(stderr);
  }
}

async function executeCommand(
  cmd: string[],
  opts: CommandOptions | undefined,
  captureOutput: boolean
): Promise<CommandCapture> {
  const proc = createCommand(cmd, opts, captureOutput);

  if (!captureOutput) {
    const [code] = await once(proc, 'close');
    return {
      code: code ?? 1,
      stderr: '' as const,
      stdout: '' as const,
    };
  }

  const stdoutChunks: Buffer[] = [];
  const stderrChunks: Buffer[] = [];
  proc.stdout?.on('data', (chunk: Buffer) => stdoutChunks.push(chunk));
  proc.stderr?.on('data', (chunk: Buffer) => stderrChunks.push(chunk));

  const [code] = await once(proc, 'close');
  const stdout = Buffer.concat(stdoutChunks);
  const stderr = Buffer.concat(stderrChunks);

  writeCapturedOutput(stdout, stderr);

  return {
    code: code ?? 1,
    stderr: stderr.toString('utf8'),
    stdout: stdout.toString('utf8'),
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function readEnv(name: string): string {
  const value = process.env[name];
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
    process.exit(code);
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
    process.exit(1);
  };
}

export function extractUrls(text: string): string[] {
  return [
    ...new Set(text.match(URL_RE) ?? []),
  ];
}

export async function appendSummary(lines: string[]): Promise<void> {
  const path = process.env.GITHUB_STEP_SUMMARY;
  if (!path) return;
  await appendFile(path, `${lines.join('\n')}\n`, 'utf8');
}
