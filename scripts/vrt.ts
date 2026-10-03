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

import { expect } from '@playwright/test';
import {
  type Browser,
  type BrowserContext,
  chromium,
  type Page as PlaywrightPage,
} from 'playwright';

import { discoverPrerenderRoutes } from '../vite-utils/route-discovery.ts';
import { clearPorts } from './dev-ports.ts';

const BASE_URL = 'http://localhost:8787';
const FRONTEND_DIR = new URL('../packages/frontend', import.meta.url).pathname;
const GATEWAY_DIR = new URL('../packages/gateway', import.meta.url).pathname;
const OUTPUT_DIR = new URL('../__screenshots__/', import.meta.url).pathname;
const BROWSER_COUNT = 2;

/*
 * How many consecutive captures must match before the frame is accepted,
 * and how far apart they are sampled.
 *
 * A single capture is taken at an arbitrary instant, so any paint that
 * lands after the waits below is baked into the file. Sentry compares
 * snapshots byte for byte, so those one-off differences surface as
 * changed snapshots on PRs that touch no UI at all. Two identical
 * captures in a row prove the frame has settled.
 *
 * The gap between attempts is what makes this work. Capturing twice in
 * quick succession can match while the page is still mid-transition,
 * because nothing changed during those few milliseconds. The footer
 * LocaleSwitcher alone sits in a Suspense fallback for roughly 400ms
 * during hydration, so back-to-back captures happily agreed on the
 * wrong frame. Spacing the samples wider than that window turns the
 * check into a real observation of stability.
 */
const SCREENSHOT_STABILITY_ATTEMPTS = 6;
const SCREENSHOT_SETTLE_INTERVAL_MS = 500;

/*
 * How long to wait for the page to stop making network requests. The
 * hydration blink is caused by a React.lazy chunk, so going quiet is the
 * signal that the chunk has landed.
 */
const NETWORK_IDLE_TIMEOUT_MS = 10_000;

/*
 * Block until everything the page paints from the network has decoded.
 *
 * `document.fonts.ready` only covers web fonts. It says nothing about
 * CSS `background-image` artwork, which every hero on this site uses
 * (`/assets/*-hero-{dark,light}.svg` behind `heroMedia`). Those decode
 * on their own schedule, so a capture taken early leaves a bare gradient
 * where the artwork belongs.
 *
 * This did not cause the flake investigated in the same change as the
 * settle loop, which turned out to be the hydration blink below. It stays
 * because a background image that has not painted is exactly the kind of
 * late arrival the settle loop is meant to catch, and on a cold runner
 * that timing is not guaranteed.
 */
async function waitForPaint(page: PlaywrightPage) {
  await page.evaluate(async () => {
    await document.fonts.ready;

    await Promise.all(
      Array.from(document.images)
        .filter(image => !image.complete)
        .map(image => image.decode().catch(() => undefined))
    );

    /*
     * Read the resolved `background-image` off every element rather than
     * the stylesheet source, so a media-gated variant contributes only
     * the one the current color scheme actually applies. Otherwise a
     * light capture would also wait on the dark asset and vice versa.
     */
    const sources = new Set<string>();
    for (const element of document.querySelectorAll('*')) {
      const { backgroundImage } = getComputedStyle(element);
      for (const [, , value] of backgroundImage.matchAll(/url\((['"]?)(.*?)\1\)/g)) {
        if (value && !value.startsWith('data:')) {
          sources.add(new URL(value, document.baseURI).href);
        }
      }
    }

    await Promise.all(
      Array.from(
        sources,
        src =>
          new Promise<void>(resolve => {
            const image = new Image();
            image.src = src;
            /*
             * `decode()` rejects for anything that fails to load. That
             * must not abort the capture, because the page still renders
             * with the background simply absent, and a timeout on one
             * asset should not fail the whole run.
             */
            image.decode().then(resolve, resolve);
          })
      )
    );
  });

  /*
   * Normalize scroll position. The gates above can leave the page
   * scrolled, and a scroll-triggered reveal that has already fired would
   * otherwise be captured in a different state than one that has not.
   */
  await page.evaluate(() => globalThis.scrollTo(0, 0));

  /*
   * Wait for the page to go quiet.
   *
   * The footer LocaleSwitcher is a React.lazy chunk. Hydration replaces
   * the server-rendered trigger with the Suspense fallback while that
   * chunk is in flight, shrinking the footer from 83px to 70px and the
   * page by 13px, then restoring it once the chunk lands. Any capture
   * inside that window records a page 13px shorter than the real one.
   *
   * Waiting for the network to settle puts the capture after the chunk
   * has arrived. A page that never goes quiet, such as one holding a
   * long-lived analytics connection, must not fail the run, so a timeout
   * falls through to the settle loop in the capture step.
   */
  try {
    await page.waitForLoadState('networkidle', {
      timeout: NETWORK_IDLE_TIMEOUT_MS,
    });
  } catch {
    // Never went idle. The settle loop still guarantees a consistent frame.
  }
}

/*
 * Capture until the frame stops changing, then hand back the bytes.
 *
 * Returns the first pair of byte-identical captures. When the page never
 * settles inside the attempt budget the last capture is returned and a
 * warning naming the page is logged, so a genuinely unstable page is
 * visible instead of silently writing whichever frame happened to be
 * first.
 */
async function captureStableScreenshot(
  page: PlaywrightPage,
  label: string,
  options: Parameters<PlaywrightPage['screenshot']>[0]
): Promise<Uint8Array> {
  const digest = async (bytes: Uint8Array) => {
    /*
     * Copy into a freshly allocated buffer first. Playwright hands back a
     * `Uint8Array<ArrayBufferLike>`, which `BufferSource` rejects because
     * it may be backed by a SharedArrayBuffer.
     */
    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);

    const hash = await crypto.subtle.digest('SHA-256', copy);
    return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
  };

  let previous: Uint8Array = await page.screenshot(options);

  for (let attempt = 1; attempt < SCREENSHOT_STABILITY_ATTEMPTS; attempt += 1) {
    await page.waitForTimeout(SCREENSHOT_SETTLE_INTERVAL_MS);

    const current: Uint8Array = await page.screenshot(options);
    if ((await digest(current)) === (await digest(previous))) {
      return current;
    }
    previous = current;
  }

  console.warn(
    `${label} did not settle after ${SCREENSHOT_STABILITY_ATTEMPTS} attempts, keeping the last capture.`
  );
  return previous;
}

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

  /*
   * Navigate to `load` rather than `domcontentloaded`. The hero artwork
   * is a CSS `background-image`, and `domcontentloaded` resolves as soon
   * as the HTML parses, long before the stylesheet has been applied and
   * the image requested.
   */
  await playwrightPage.goto(`${BASE_URL}${page.path}`, {
    timeout: 60_000,
    waitUntil: 'load',
  });

  /*
   * Wait for the lazy-loaded LocaleSwitcher to finish rendering. The
   * footer wraps LocaleSwitcherInner in React.lazy + Suspense. While
   * the chunk downloads, a plain "..." fallback is shown. On slow or
   * variable networks (like GHA runners) the chunk may not have arrived
   * by the time the paint gates below finish, so the screenshot captures
   * the fallback text instead of the real locale selector.
   *
   * Detect the locale switcher via the Suspense fallback element
   * (.locale-switcher-fallback), which exists while the lazy chunk
   * is loading. Checking the trigger element alone would miss this
   * case because the trigger does not exist until after React.lazy
   * resolves.
   */
  const localeFallback = playwrightPage.locator('.locale-switcher-fallback');
  const localeTrigger = playwrightPage.locator('.locale-switcher-trigger');

  if ((await localeFallback.count()) > 0 || (await localeTrigger.count()) > 0) {
    /*
     * expect(locator).toHaveText() polls with built-in retry until the
     * text matches. The regex asserts the trigger has real locale text
     * (at least one character) and does not contain the Suspense
     * fallback marker ("...").
     */
    await expect(localeTrigger).toHaveText(/^(?!.*\.\.\.).+/, {
      timeout: 15_000,
    });
  }
  if (page.path.endsWith('/labs/mandelbrot')) {
    await playwrightPage.locator('[data-vrt-ready="true"]').waitFor({
      state: 'attached',
    });
  }

  /*
   * Everything the page paints from the network is decoded before
   * capturing. This runs after the readiness gates above rather than
   * right after navigation, because a lazy chunk that has not resolved
   * yet can still introduce images and backgrounds of its own.
   */
  await waitForPaint(playwrightPage);

  /*
   * Wait for every finite CSS animation and transition to finish before
   * capturing.
   *
   * The reveal keyframes used by the lab pages animate
   * `transform: translateY(1rem)` to `translateY(0)`. A running transform
   * promotes the element to its own compositing layer, so a capture taken
   * mid-animation rasterises the antialiased edge of a rounded corner a
   * subpixel away from its final position. That showed up as six pixels
   * changing by one or two levels out of 3.3 million on the dominant-color
   * pages, which is enough for a byte comparison to fail.
   *
   * `animations: 'disabled'` alone is not enough because it only settles
   * animations that already exist at capture time, and whether a given
   * entry animation has started is itself a race.
   *
   * Infinite animations must be excluded, because their `finished` promise
   * never settles. The spec reports an infinite iteration count as `null`
   * rather than `Infinity`, so a plain `!== Infinity` test silently lets
   * the 18s artworkDrift loop through and changes what the homepage, about
   * and errors pages capture. The screenshot option below still cancels
   * those back to their first frame.
   */
  await playwrightPage.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter(animation => {
          const iterations = animation.effect?.getComputedTiming().iterations;
          return iterations !== null && Number.isFinite(iterations);
        })
        .map(animation => animation.finished.catch(() => undefined))
    )
  );

  const path = `${OUTPUT_DIR}/${page.name}-${viewportName}-${theme}.png`;
  const image = await captureStableScreenshot(
    playwrightPage,
    `${page.path} (${viewportName}, ${theme})`,
    {
      // Fast-forwards finite animations to their final state and cancels
      // infinite ones (such as the homepage artworkDrift hero animation) back
      // to their initial state. Without this, every run captures a different
      // animation frame and VRT reports false diffs.
      animations: 'disabled',
      // Hides the text caret in a focused control, which is otherwise drawn
      // or not depending on whether the field happened to hold focus.
      caret: 'hide',
      fullPage: true,
      /*
       * Mask every element the app tagged `data-vrt-volatile`. Those hold
       * wall-clock measurements (the Mandelbrot render time, the edge render
       * time, the JS/WASM/GPU race), which differ on every single run. They
       * used to make Sentry report changed snapshots on PRs that touched no
       * UI at all, because the readiness gate above waits for the measured
       * value to be painted before capturing.
       *
       * Readiness still keys off the real value via `data-vrt-ready`, so
       * masking never lets a half-rendered region into a baseline. Pages
       * without the attribute simply match nothing and are left untouched.
       */
      mask: [
        playwrightPage.locator('[data-vrt-volatile]'),
      ],
    }
  );

  /*
   * Written only after the frame settled, so a half-painted capture
   * never reaches the baseline.
   */
  await Deno.writeFile(path, image);

  await playwrightPage.close();
}

async function capturePages(browser: Browser, pages: readonly Page[]): Promise<void> {
  for (const page of pages) {
    for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
      for (const theme of THEMES) {
        const context = await browser.newContext({
          colorScheme: theme,
          /*
           * Emulate `prefers-reduced-motion: reduce`.
           *
           * Every animated rule on these pages ships a reduced-motion
           * override that collapses the duration to 1ms for a single
           * iteration, including the infinite 18s artworkDrift loop. The
           * page therefore reaches its final state immediately and
           * identically on every run, which removes the whole class of
           * capture-versus-animation races instead of patching them.
           *
           * This matters because the alternative loses. A one-shot wait for
           * `animation.finished` cannot help when the entry animation has
           * not been created yet: on a cold first pass the hero artwork was
           * photographed mid-reveal, at roughly a seventh of its real
           * contrast, which moved 16% of the pixels on the zh-TW errors
           * page.
           */
          reducedMotion: 'reduce',
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

  /*
   * Create the output directory up front.
   *
   * `__screenshots__` is gitignored, so it does not exist in a fresh CI
   * checkout. Playwright used to create it implicitly, because
   * `page.screenshot({ path })` makes any missing parent directories.
   * Capturing to a buffer and writing the bytes with `Deno.writeFile`
   * does not, and the first capture died on ENOENT before writing
   * anything. Creating it once here keeps that invariant in one place.
   */
  await Deno.mkdir(OUTPUT_DIR, {
    recursive: true,
  });

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
