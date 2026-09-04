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

import { type BrowserContext, chromium } from 'playwright';

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

async function main() {
  // Check dev server is running
  try {
    const res = await fetch(BASE_URL, {
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch {
    Deno.exit(1);
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
  }
}

main();
