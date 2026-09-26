/**
 * WebP integration regression against the running gateway and Rust WASM Worker.
 * Build image-optimize-rust with worker-build and start the dev stack first.
 * Uses installed Chrome by default. WEBP_BROWSER_CHANNEL=chromium uses the
 * Playwright browser in CI. No deployment or existing browser session is used.
 */
import { Buffer } from 'node:buffer';
import { expect } from '@playwright/test';
import { chromium } from 'playwright';

const baseUrl = Deno.env.get('WEBP_TEST_URL') ?? 'http://localhost:8787';
const channel = Deno.env.get('WEBP_BROWSER_CHANNEL') ?? 'chrome';
const browser = await chromium.launch({
  channel,
});
const context = await browser.newContext();
const page = await context.newPage();

try {
  await page.goto(`${baseUrl}/en-US/labs/image-optimize`);
  const colors = await page.evaluate(async () => {
    const results: {
      color: string;
      width: number;
      height: number;
      pixels: number[];
      quality: string | null;
      encoding: string | null;
    }[] = [];
    for (const color of [
      '#ff0000',
      '#00ff00',
      '#0000ff',
    ]) {
      const canvas = document.createElement('canvas');
      canvas.width = 17;
      canvas.height = 19;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas unavailable');
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 17, 19);
      const input = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('PNG encode failed'))));
      });
      const query = new URLSearchParams({
        f: 'webp',
        q: '85',
        w: '17',
      });
      const response = await fetch(`/api/rust/image-optimize/resize?${query}`, {
        body: input,
        method: 'POST',
      });
      if (!response.ok) throw new Error(await response.text());
      const bitmap = await createImageBitmap(await response.blob());
      ctx.clearRect(0, 0, 17, 19);
      ctx.drawImage(bitmap, 0, 0);
      results.push({
        color,
        encoding: response.headers.get('x-image-encoding'),
        height: bitmap.height,
        pixels: Array.from(ctx.getImageData(0, 0, 17, 19).data),
        quality: response.headers.get('x-image-quality'),
        width: bitmap.width,
      });
      bitmap.close();
    }
    return results;
  });
  for (const [index, result] of colors.entries()) {
    expect(result.width).toBe(17);
    expect(result.height).toBe(19);
    expect(result.quality).toBe('85');
    expect(result.encoding).toBe('lossy');
    for (let offset = 0; offset < result.pixels.length; offset += 4) {
      for (let component = 0; component < 3; component++) {
        expect(
          Math.abs((result.pixels[offset + component] ?? -999) - (index === component ? 255 : 0))
        ).toBeLessThanOrEqual(16);
      }
      expect(result.pixels[offset + 3]).toBe(255);
    }
  }
  console.log(`${channel}: saturated RGB survives the Worker WASM and browser decoder`);

  const fixture = await Deno.readFile(
    new URL('../packages/image-optimize-rust/tests/fixtures/iphone-duo.png', import.meta.url)
  );
  const outputs = new Map<string, Buffer>();
  for (const [query, quality] of [
    [
      '',
      '85',
    ],
    [
      '&q=20',
      '20',
    ],
    [
      '&q=85',
      '85',
    ],
    [
      '&quality=85',
      '85',
    ],
    [
      '&q=100',
      '100',
    ],
  ]) {
    const response = await context.request.post(
      `${baseUrl}/api/rust/image-optimize/resize?f=webp&w=100&h=100${query}`,
      {
        data: Buffer.from(fixture),
        headers: {
          'content-type': 'image/png',
        },
        timeout: 120_000,
      }
    );
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe('image/webp');
    expect(response.headers()['x-image-quality']).toBe(quality);
    expect(response.headers()['x-image-encoding']).toBe('lossy');
    outputs.set(query ?? '', await response.body());
  }
  expect(outputs.get('')).toEqual(outputs.get('&q=85'));
  expect(outputs.get('&quality=85')).toEqual(outputs.get('&q=85'));
  expect(outputs.get('&q=20')?.length).toBeLessThan(outputs.get('&q=85')?.length ?? 0);
  for (const query of [
    '&q=0',
    '&q=101',
    '&q=1.5',
    '&q=abc',
    // biome-ignore lint/security/noSecrets: conflicting query aliases
    '&q=20&quality=85',
    '&q=20&q=85',
    '&lossless=true',
  ]) {
    const response = await context.request.post(
      `${baseUrl}/api/rust/image-optimize/resize?f=webp&w=100${query}`,
      {
        data: Buffer.from(fixture),
      }
    );
    expect(response.status(), query).toBe(400);
  }
  const alpha = await page.evaluate(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 17;
    canvas.height = 19;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas unavailable');
    const source = ctx.createImageData(17, 19);
    for (let i = 0; i < source.data.length; i += 4) {
      source.data.set(
        [
          220,
          40,
          80,
          (i / 4) % 256,
        ],
        i
      );
    }
    ctx.putImageData(source, 0, 0);
    const png = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('PNG encode failed'))));
    });
    const query = new URLSearchParams({
      f: 'webp',
      q: '1',
      w: '17',
    });
    const response = await fetch(`/api/rust/image-optimize/resize?${query}`, {
      body: png,
      method: 'POST',
    });
    if (!response.ok) throw new Error(await response.text());
    const bitmap = await createImageBitmap(await response.blob());
    ctx.clearRect(0, 0, 17, 19);
    ctx.drawImage(bitmap, 0, 0);
    const actual = ctx.getImageData(0, 0, 17, 19).data;
    bitmap.close();
    return Array.from(actual).filter((_, i) => i % 4 === 3);
  });
  expect(alpha).toEqual(
    Array.from(
      {
        length: 17 * 19,
      },
      (_, i) => i % 256
    )
  );
  console.log(
    'API: default quality, alias, validation, and exact alpha passed',
    Object.fromEntries(
      Array.from(outputs, ([query, bytes]) => [
        query || 'default',
        bytes.length,
      ])
    )
  );

  if (Deno.env.get('WEBP_API_ONLY') !== 'true') {
    // biome-ignore lint/security/noSecrets: file input selector
    await page.locator('input[type="file"]').setInputFiles({
      buffer: Buffer.from(fixture),
      mimeType: 'image/png',
      name: 'iphone-duo.png',
    });
    await expect(
      page.getByRole('radio', {
        exact: true,
        name: 'WEBP',
      })
    ).toBeChecked();
    const quality = page.getByRole('slider', {
      exact: true,
      name: 'Quality',
    });
    await expect(quality).toBeEnabled();
    await quality.fill('40');
    await page.getByRole('spinbutton').nth(0).fill('100');
    await page.getByRole('spinbutton').nth(1).fill('100');
    const responsePromise = page.waitForResponse(candidate =>
      candidate.url().includes('/api/rust/image-optimize/resize?')
    );
    await page
      .getByRole('button', {
        exact: true,
        name: 'Optimize image',
      })
      .click();
    const response = await responsePromise;
    expect(new URL(response.url()).searchParams.get('q')).toBe('40');
    expect(response.status()).toBe(200);
    expect(response.headers()['x-image-quality']).toBe('40');
    await expect(
      page.getByText('Lossless output', {
        exact: true,
      })
    ).toHaveCount(0);
    const output = page.getByRole('img', {
      exact: true,
      name: 'Resized output',
    });
    await expect(output).toBeVisible();
    await expect(
      page
        .getByText('Quality', {
          exact: true,
        })
        .last()
        .locator('..')
    ).toHaveText('Quality40');
    expect(
      await output.evaluate(
        image => image instanceof HTMLImageElement && image.complete && image.naturalWidth === 100
      )
    ).toBe(true);
    console.log('UI: enabled WebP slider submits q=40 and renders the result');
  }
} finally {
  await context.close();
  await browser.close();
}
