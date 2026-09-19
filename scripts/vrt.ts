#!/usr/bin/env -S deno run -A

/**
 * Visual regression screenshot generator for Sentry Snapshots.
 *
 * Takes screenshots of every prerendered SSG page at mobile and desktop
 * viewports in both light and dark themes. Output goes to
 * __screenshots__/ for upload to Sentry Snapshots.
 *
 * If nothing is serving on :8787, the script starts the dev stack (frontend
 * on :5173 plus gateway on :8787, as the homepage needs both, see
 * startDevStack) and stops it when done (also on SIGINT / SIGTERM). A server
 * that is already serving on :8787 is reused as-is.
 *
 * Usage:
 *   deno run -A scripts/vrt.ts
 */

import { type Browser, type BrowserContext, chromium } from 'playwright';

import { discoverPrerenderRoutes } from '../vite-utils/route-discovery.ts';
import { clearPorts } from './dev-ports.ts';

const BASE_URL = 'http://localhost:8787';
const FRONTEND_DIR = new URL('../packages/frontend', import.meta.url).pathname;
const GATEWAY_DIR = new URL('../packages/gateway', import.meta.url).pathname;
const OUTPUT_DIR = new URL('../__screenshots__/', import.meta.url).pathname;
const BROWSER_COUNT = 2;

/**
 * Viewport definitions based on real-world devices.
 *
 * - mobile:  iPhone 14 Pro at 375x812 logical pixels (CSS) with 3x DPR
 * - desktop: Common laptop at 1280x720 logical pixels (CSS)
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
} as const;

const THEMES = [
  'light',
  'dark',
] as const;

interface Page {
  name: string;
  path: string;
}

function pageName(path: string): string {
  return path === '/'
    ? 'homepage'
    : path.replace(/^\//, '').replaceAll('/', '-').replaceAll('_', '-');
}

function discoverPages(): Page[] {
  return discoverPrerenderRoutes().map(path => ({
    name: pageName(path),
    path,
  }));
}

const PAGES = discoverPages();

async function screenshot(
  context: BrowserContext,
  page: (typeof PAGES)[number],
  viewportName: string,
  theme: string
) {
  const playwrightPage = await context.newPage();
  await playwrightPage.goto(`${BASE_URL}${page.path}`, {
    waitUntil: 'domcontentloaded',
  });

  // Wait for web fonts so text rendering is deterministic.
  await playwrightPage.evaluate(() => document.fonts.ready);

  /*
   * Wait for the lazy-loaded LocaleSwitcher to finish rendering. The
   * footer wraps LocaleSwitcherInner in React.lazy + Suspense; while
   * the chunk downloads, a plain "..." fallback is shown. On slow or
   * variable networks (like GHA runners) the chunk may not have arrived
   * by the time fonts finish loading, so the screenshot captures the
   * fallback text instead of the real locale selector. We assert the
   * trigger is visible and contains a known locale label, proving the
   * lazy Suspense boundary has fully resolved with real data.
   */
  const LOCALE_LABELS = [
    'English (US)',
    '日本語',
    // biome-ignore lint/security/noSecrets: CJK display names are not secrets
    '繁體中文（香港）',
    // biome-ignore lint/security/noSecrets: CJK display names are not secrets
    '繁體中文',
  ];
  const localeTrigger = playwrightPage.locator('.locale-switcher-trigger');

  /*
   * Only wait for the locale switcher if the page actually has one.
   * Checking count() first avoids a 15s timeout on pages without the
   * footer (e.g. future routes that omit the LocaleSwitcher).
   */
  if ((await localeTrigger.count()) > 0) {
    /*
     * waitForFunction polls the DOM until the trigger contains a known
     * locale label. This handles the race where the element is in the
     * document but React.lazy has not yet resolved the Select.Value
     * text content.
     */
    await playwrightPage.waitForFunction(
      (labels: string[]) => {
        const trigger = document.querySelector('.locale-switcher-trigger');
        if (!trigger) return false;
        const text = trigger.textContent ?? '';
        return labels.some(label => text.includes(label));
      },
      LOCALE_LABELS,
      {
        timeout: 15_000,
      }
    );
  }

  if (page.path.endsWith('/labs/mandelbrot')) {
    await playwrightPage.locator('[data-vrt-ready="true"]').waitFor({
      state: 'attached',
    });
  }

  const path = `${OUTPUT_DIR}/${page.name}-${viewportName}-${theme}.png`;
  await playwrightPage.screenshot({
    // Fast-forwards finite animations to their final state and cancels
    // infinite ones (such as the homepage artworkDrift hero animation) back
    // to their initial state. Without this, every run captures a different
    // animation frame and VRT reports false diffs.
    animations: 'disabled',
    fullPage: true,
    path,
  });

  await playwrightPage.close();
}

async function capturePages(browser: Browser, pages: readonly Page[]): Promise<void> {
  for (const page of pages) {
    for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
      for (const theme of THEMES) {
        const context = await browser.newContext({
          colorScheme: theme,
          viewport,
        });

        await screenshot(context, page, viewportName, theme);
        await context.close();
      }
    }
  }
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
      VRT: 'true',
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

async function waitForServer(timeoutMs = 150_000): Promise<void> {
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
      // Process already exited, so nothing is left to stop.
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

  const browsers = await Promise.all(
    Array.from(
      {
        length: Math.min(BROWSER_COUNT, PAGES.length),
      },
      () => chromium.launch()
    )
  );

  try {
    await Promise.all(
      browsers.map((browser, browserIndex) =>
        capturePages(
          browser,
          PAGES.filter((_, pageIndex) => pageIndex % browsers.length === browserIndex)
        )
      )
    );
  } finally {
    await Promise.all(browsers.map(browser => browser.close()));
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
