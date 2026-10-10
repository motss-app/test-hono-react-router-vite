import { type ChildProcess, spawn } from 'node:child_process';
import { closeSync, openSync, readSync } from 'node:fs';
import { delimiter, join } from 'node:path';
import process from 'node:process';

export interface RunCommandOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  /**
   * `'pipe'` collects stdout and stderr so the caller can inspect them.
   * `'inherit'` and `'ignore'` leave the result strings empty.
   */
  stdio?: 'ignore' | 'inherit' | 'pipe';
}

export interface RunCommandResult {
  code: number;
  stderr: string;
  stdout: string;
}

/**
 * Locate a bare command name on `PATH`.
 *
 * Returns `undefined` when it is absent so the caller can let `spawn` report
 * the failure itself instead of substituting a different error.
 */
function findExecutable(command: string): string | undefined {
  if (command.includes('/') || command.includes('\\')) {
    return command;
  }

  const path = process.env.PATH;
  if (!path) {
    return undefined;
  }

  for (const dir of path.split(delimiter)) {
    if (dir) {
      const candidate = join(dir, command);
      try {
        closeSync(openSync(candidate, 'r'));
        return candidate;
      } catch {
        // Not present here, keep searching.
      }
    }
  }

  return undefined;
}

/**
 * Decide whether a command has to be handed to a shell in order to run.
 *
 * pnpm's launcher is deliberately shipped without a shebang: it is an `sh`
 * script that re-execs the native binary it downloads. POSIX shells recover
 * from `exec` failing with `ENOEXEC` by interpreting such a file as a script,
 * but `spawn` does not, so the command fails outright. Bare text therefore
 * goes through `sh`, while binaries and ordinary `#!` scripts are spawned
 * directly.
 */
function needsShell(command: string): boolean {
  const target = findExecutable(command);
  if (!target) {
    return false;
  }

  let handle: number;
  try {
    handle = openSync(target, 'r');
  } catch {
    return false;
  }

  try {
    const buffer = Buffer.alloc(256);
    const read = readSync(handle, buffer, 0, 256, 0);
    if (read < 2) {
      return false;
    }
    if (buffer[0] === 0x23 && buffer[1] === 0x21) {
      return false;
    }
    // A NUL byte means a binary the kernel can exec on its own.
    return !buffer.subarray(0, read).includes(0);
  } catch {
    return false;
  } finally {
    closeSync(handle);
  }
}

/**
 * Spawn a child process without letting a shell re-parse the command line.
 *
 * Passing the command and its arguments as separate values means nothing in
 * either is re-interpreted, so paths containing spaces or quotes survive
 * intact. When a command needs a shell to run at all, it is exec'd via
 * `sh -c` with `"$0"`/`"$@"` carrying the payload: `sh` receives those as its
 * own argv rather than as source to expand, so arguments stay literal.
 */
export function spawnCommand(
  command: string,
  args: readonly string[],
  options?: RunCommandOptions
): ChildProcess {
  const normalized = options ?? {};
  const useShell = needsShell(command);
  const spawnArgs = useShell
    ? [
        '-c',
        'exec "$0" "$@"',
        command,
        ...args,
      ]
    : [
        ...args,
      ];

  return spawn(useShell ? '/bin/sh' : command, spawnArgs, {
    cwd: normalized.cwd,
    env: normalized.env,
    stdio: normalized.stdio ?? 'ignore',
  });
}

/**
 * Run a command to completion and resolve with its exit code and output.
 *
 * A spawn failure such as a missing executable rejects. A command that starts
 * and then exits non-zero resolves with that code, which lets callers apply
 * their own policy instead of treating every non-zero exit as fatal.
 */
export function runCommand(
  command: string,
  args: readonly string[],
  options?: RunCommandOptions
): Promise<RunCommandResult> {
  const normalized = options ?? {};
  const child = spawnCommand(command, args, {
    ...normalized,
    stdio: normalized.stdio ?? 'pipe',
  });

  return new Promise((resolve, reject) => {
    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];

    child.stdout?.on('data', (chunk: Buffer) => stdoutChunks.push(chunk));
    child.stderr?.on('data', (chunk: Buffer) => stderrChunks.push(chunk));
    child.on('error', reject);
    child.on('close', code => {
      resolve({
        code: code ?? 1,
        stderr: Buffer.concat(stderrChunks).toString('utf8'),
        stdout: Buffer.concat(stdoutChunks).toString('utf8'),
      });
    });
  });
}
