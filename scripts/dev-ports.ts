async function clearPort(port: number): Promise<void> {
  const result = await new Deno.Command('sh', {
    args: [
      '-c',
      `pids="$(lsof -tiTCP:${port} -sTCP:LISTEN 2>/dev/null || true)"; if [ -n "$pids" ]; then kill -TERM $pids 2>/dev/null || true; sleep 0.15; pids="$(lsof -tiTCP:${port} -sTCP:LISTEN 2>/dev/null || true)"; if [ -n "$pids" ]; then kill -KILL $pids 2>/dev/null || true; fi; fi`,
    ],
    stderr: 'null',
    stdout: 'null',
  }).output();

  if (!result.success) {
    throw new Error(`Unable to clear port ${port}; the \`lsof\` command is required.`);
  }
}

export async function clearPortsInUse(ports: readonly number[]): Promise<void> {
  await Promise.all(ports.map(port => clearPort(port)));
}
