#!/usr/bin/env node
import process from 'node:process';

import { clearPorts } from './dev-ports.ts';

const DEFAULT_PORTS = [
  5173,
  8787,
  3000,
];

function parseArgs(args: string[]): {
  ports: number[];
  verbose: boolean;
} {
  const ports: number[] = [];
  let verbose = false;

  for (const arg of args) {
    if (arg === '--verbose' || arg === '-v') {
      verbose = true;
    } else {
      const n = Number(arg);
      if (Number.isInteger(n) && n > 0) {
        ports.push(n);
      }
    }
  }

  return {
    ports: ports.length > 0 ? ports : DEFAULT_PORTS,
    verbose,
  };
}

const { ports, verbose } = parseArgs(process.argv.slice(2));

if (verbose) {
  // Verbose logging is not implemented yet.
}

await clearPorts(ports);

if (verbose) {
  // Verbose logging is not implemented yet.
}
