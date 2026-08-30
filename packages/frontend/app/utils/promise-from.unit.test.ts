import { describe, expect, it } from 'vite-plus/test';

import { PromiseFrom } from './promise-from.ts';

describe('PromiseFrom', () => {
  it('wraps a plain value in a resolved promise', async () => {
    await expect(PromiseFrom(42)).resolves.toBe(42);
  });

  it('returns native promises unchanged', async () => {
    await expect(PromiseFrom(Promise.resolve('ok'))).resolves.toBe('ok');
  });

  it('awaits custom thenables', async () => {
    const thenable = {
      // biome-ignore lint/suspicious/noThenProperty: exercising thenable support
      then: (resolve: (value: string) => void) => {
        resolve('thenable');
      },
    };

    await expect(PromiseFrom(thenable)).resolves.toBe('thenable');
  });
});
