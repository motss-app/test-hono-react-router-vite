import { clearPorts } from './dev-ports.ts';

function parseCommandLine(args: string[]): {
  command: string;
  commandArgs: string[];
  ports: number[];
} {
  const separatorIndex = args.indexOf('--');

  if (separatorIndex === -1) {
    throw new Error('Expected `--` between port list and command.');
  }

  const portArgs = args.slice(0, separatorIndex);
  const commandArgs = args.slice(separatorIndex + 1);

  if (portArgs.length === 0) {
    throw new Error('At least one port must be provided before `--`.');
  }

  if (commandArgs.length === 0) {
    throw new Error('A command must be provided after `--`.');
  }

  const ports = [
    ...new Set(
      portArgs.map(value => Number(value)).filter(value => Number.isInteger(value) && value > 0)
    ),
  ];

  if (ports.length === 0) {
    throw new Error('No valid ports were provided.');
  }

  const command = commandArgs[0];

  if (command === undefined) {
    throw new Error('A command must be provided after `--`.');
  }

  return {
    command,
    commandArgs: commandArgs.slice(1),
    ports,
  };
}

const { command, commandArgs, ports } = parseCommandLine(Deno.args);

await clearPorts(ports);

const child = new Deno.Command(command, {
  args: commandArgs,
  stderr: 'inherit',
  stdin: 'inherit',
  stdout: 'inherit',
}).spawn();

const status = await child.status;

if (!status.success) {
  Deno.exit(status.code ?? 1);
}
