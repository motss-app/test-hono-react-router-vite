#!/usr/bin/env -S deno run -A

/**
 * Visual regression screenshot generator for Sentry Snapshots.
 *
 * Takes screenshots of the homepage at mobile, tablet, and desktop viewports
 * in both light and dark themes. Output goes to __screenshots__/ for upload
 * to Sentry Snapshots.
 *
 * Usage:
 *   deno run -A scripts/vrt.ts
 */

import { chromium, type BrowserContext } from 'playwright';

const BASE_URL = 'http://localhost:8787';
const OUTPUT_DIR = new URL('../__screenshots__/', import.meta.url).pathname;

/**
 * Viewport definitions based on real-world devices.
 *
 * - mobile:  iPhone 14 Pro — 375×812 logical pixels (CSS), 3× DPR
 * - tablet:  iPad Mini — 768×1024 logical pixels (CSS), 2× DPR
 * - desktop: Common laptop — 1280×720 logical pixels (CSS)
 */
const VIEWPORTS = {
  mobile: {
    width: 375,
    height: 812,
  },
  tablet: {
    width: 768,
    height: 1024,
  },
  desktop: {
    width: 1280,
    height: 720,
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
  await page.waitForTimeout(1000);

  const path = `${OUTPUT_DIR}/homepage-${viewportName}-${theme}.png`;
  await page.screenshot({
    path,
    fullPage: true,
  });
  console.log(`✓ ${viewportName} ${theme} → ${path}`);

  await page.close();
}

async function main() {
  // Check dev server is running
  try {
    const res = await fetch(BASE_URL, {
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch {
    console.error(`Dev server not running at ${BASE_URL}. Start with: deno task dev`);
    Deno.exit(1);
  }

  const browser = await chromium.launch();

  try {
    for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
      for (const theme of THEMES) {
        const context = await browser.newContext({
          viewport,
          colorScheme: theme,
        });

        await screenshot(context, viewportName, theme);
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
}

main();
