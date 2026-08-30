import { describe, expect, it } from 'vite-plus/test';

import { PromiseFrom } from './promise-from.ts';

describe('PromiseFrom (browser)', () => {
  it('runs inside a real browser environment', async () => {
    expect(typeof document).toBe('object');
    expect(typeof window).toBe('object');

    await expect(PromiseFrom('browser')).resolves.toBe('browser');
  });
});
