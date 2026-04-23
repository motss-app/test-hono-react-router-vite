import { clearPortsInUse } from './dev-ports.ts';

const appPort = 5173;

await clearPortsInUse([
  appPort,
]);

await new Deno.Command(Deno.execPath(), {
  args: [
    'run',
    '-A',
    'npm:vite',
  ],
  stderr: 'inherit',
  stdin: 'inherit',
  stdout: 'inherit',
}).spawn().status;
