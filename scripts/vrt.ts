#!/usr/bin/env -S deno run -A

/**
 * Visual regression screenshot generator for Sentry Snapshots.
 *
 * Takes screenshots of the homepage at mobile, tablet, and desktop viewports
 * in both light and dark themes. Output goes to __screenshots__/ for upload
 * to Sentry Snapshots.
 *
 * If nothing is serving on :8787, the script starts the dev stack (frontend
 * on :5173 + gateway on :8787 — the homepage needs both, see startDevStack)
 * and stops it when done (also on SIGINT / SIGTERM). A server that is
 * already serving on :8787 is reused as-is.
 *
 * Usage:
 *   deno run -A scripts/vrt.ts
 */

import { type BrowserContext, chromium } from 'playwright';

import { clearPorts } from './dev-ports.ts';

const BASE_URL = 'http://localhost:8787';
const FRONTEND_DIR = new URL('../packages/frontend', import.meta.url).pathname;
const GATEWAY_DIR = new URL('../packages/gateway', import.meta.url).pathname;
const OUTPUT_DIR = new URL('../__screenshots__/', import.meta.url).pathname;

/**
 * Viewport definitions based on real-world devices.
 *
 * - mobile:  iPhone 14 Pro — 375×812 logical pixels (CSS), 3× DPR
 * - tablet:  iPad Mini — 768×1024 logical pixels (CSS), 2× DPR
 * - desktop: Common laptop — 1280×720 logical pixels (CSS)
 */
const VIEWPORTS = {
  desktop: {
    height: 720,
    width: 1280,
  },
  mobile: {
    height: 812,
    width: 375,
  },
  tablet: {
    height: 1024,
    width: 768,
  },
} as const;

const THEMES = [
  'light',
  'dark',
] as const;

async function screenshot(context: BrowserContext, viewportName: string, theme: string) {
  const page = await context.newPage();
  await page.goto(BASE_URL, {
    waitUntil: 'networkidle',
  });

  // Wait for web fonts so text rendering is deterministic.
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1000);

  const path = `${OUTPUT_DIR}/homepage-${viewportName}-${theme}.png`;
  await page.screenshot({
    // Fast-forwards finite animations to their final state and cancels
    // infinite ones (e.g. the homepage `artworkDrift` hero animation) back
    // to their initial state. Without this, every run captures a different
    // animation frame and VRT reports false diffs.
    animations: 'disabled',
    fullPage: true,
    path,
  });

  await page.close();
}

interface ManagedProcess {
  child: Deno.ChildProcess;
  name: string;
}

const managedProcesses: ManagedProcess[] = [];

type ServerState = 'down' | 'occupied' | 'up';

async function probeServer(): Promise<ServerState> {
  try {
    const res = await fetch(BASE_URL, {
      signal: AbortSignal.timeout(2000),
    });
    return res.ok ? 'up' : 'occupied';
  } catch {
    return 'down';
  }
}

function spawnDevWorker(name: string, cwd: string): void {
  /*
   * Mirrors `deno task dev:app` / `dev:gateway` but spawns the underlying
   * `vite` process directly, so SIGTERM reliably reaches it (killing a
   * `deno task` wrapper would orphan the vite child instead).
   */
  console.log(`Starting ${name} (vite dev)...`);
  const child = new Deno.Command('deno', {
    args: [
      'run',
      '-A',
      'npm:vite',
    ],
    cwd,
    env: {
      ...Deno.env.toObject(),
      CLOUDFLARE_ENV: 'dev',
    },
    stderr: 'inherit',
    stdout: 'inherit',
  }).spawn();
  managedProcesses.push({
    child,
    name,
  });
}

/*
 * The homepage needs the whole dev stack: the gateway proxies HTML to the
 * `frontend-app-dev` worker, which only exists while the frontend dev
 * server is running. A gateway-only session answers with 5xx.
 */
async function startDevStack(): Promise<void> {
  await clearPorts([
    5173,
    8787,
  ]);
  spawnDevWorker('frontend', FRONTEND_DIR);
  spawnDevWorker('gateway', GATEWAY_DIR);
  await waitForServer();
}

async function waitForServer(timeoutMs = 60_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if ((await probeServer()) === 'up') return;
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw new Error(`Server at ${BASE_URL} not ready within ${timeoutMs}ms`);
}

function stopManagedProcesses(): void {
  for (const { child, name } of managedProcesses) {
    try {
      child.kill('SIGTERM');
    } catch {
      // Process already exited — nothing left to stop.
    }
    console.log(`Stopped ${name}.`);
  }
  managedProcesses.length = 0;
}

async function main() {
  const state = await probeServer();

  if (state === 'occupied') {
    console.error(
      `Something is serving on ${BASE_URL} but returns errors (non-OK ` +
        'response). Stop it first, then re-run this script.'
    );
    Deno.exit(1);
  }

  const managedStack = state === 'down';
  if (managedStack) {
    /*
     * Stop the managed stack on Ctrl-C / SIGTERM as well. SIGKILL cannot
     * be intercepted, so the children would keep running in that case.
     */
    Deno.addSignalListener('SIGINT', () => {
      stopManagedProcesses();
      Deno.exit(130);
    });
    Deno.addSignalListener('SIGTERM', () => {
      stopManagedProcesses();
      Deno.exit(143);
    });

    await startDevStack();
  } else {
    console.log(`Reusing server already running at ${BASE_URL}.`);
  }

  const browser = await chromium.launch();

  try {
    for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
      for (const theme of THEMES) {
        const context = await browser.newContext({
          colorScheme: theme,
          viewport,
        });

        await screenshot(context, viewportName, theme);
        await context.close();
      }
    }
  } finally {
    await browser.close();
    if (managedStack) {
      stopManagedProcesses();
    }
  }
}

try {
  await main();
} catch (error) {
  stopManagedProcesses();
  console.error(error instanceof Error ? error.message : error);
  Deno.exit(1);
}
