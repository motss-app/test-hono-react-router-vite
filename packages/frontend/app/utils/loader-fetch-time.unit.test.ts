import { afterEach, describe, expect, it, vi } from 'vite-plus/test';

import { loadWithFetchTime } from './loader-fetch-time.ts';

const request = new Request('https://example.com/en-US/ssr');

function entry(name: string, startTime: number, duration: number) {
  return {
    entryType: 'resource',
    name,
    serverTiming: [
      {
        duration: 900,
        name: 'total',
      },
      {
        duration,
        name: 'frontend',
      },
    ],
    startTime,
  };
}

function setup(entries: ReturnType<typeof entry>[]) {
  vi.stubGlobal('PerformanceObserver', undefined);
  vi.stubGlobal('performance', {
    getEntriesByType: () => entries,
    now: vi.fn().mockReturnValueOnce(10).mockReturnValueOnce(100.123456789),
  });
}

function setupObserver() {
  setup([]);
  vi.useFakeTimers({
    toFake: [
      'setTimeout',
      'clearTimeout',
    ],
  });
  let publish: ((list: { getEntries: () => ReturnType<typeof entry>[] }) => void) | undefined;
  const disconnect = vi.fn();
  vi.stubGlobal(
    'PerformanceObserver',
    class {
      static supportedEntryTypes = [
        'resource',
      ];

      constructor(callback: NonNullable<typeof publish>) {
        publish = callback;
      }

      observe = vi.fn();
      takeRecords() {
        return [];
      }
      disconnect = disconnect;
    }
  );
  return {
    disconnect,
    publish: (entries: ReturnType<typeof entry>[]) =>
      publish?.({
        getEntries: () => entries,
      }),
  };
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('loadWithFetchTime', () => {
  it('prefers the frontend metric and rounds it to at most five decimal places', async () => {
    setup([
      entry('https://example.com/en-US/ssr.data?_routes=routes%2Fssr', 11, 42.123456789),
    ]);
    const response = {
      renderTime: 0.123456789,
    };
    expect(await loadWithFetchTime(request, async () => response)).toEqual({
      fetchTime: 42.12346,
      response,
    });
  });

  it('preserves a valid server duration of zero', async () => {
    setup([
      entry('https://example.com/en-US/ssr.data', 11, 0),
    ]);
    expect((await loadWithFetchTime(request, async () => null)).fetchTime).toBe(0);
  });

  it('falls back to elapsed browser time when no server metric is available', async () => {
    setup([]);
    expect((await loadWithFetchTime(request, async () => null)).fetchTime).toBe(90.12346);
  });

  it('ignores timings from earlier requests, other routes, and other origins', async () => {
    setup([
      entry('https://example.com/en-US/ssr.data', 9, 1),
      entry('https://example.com/en-US/about.data', 11, 2),
      entry('https://other.example/en-US/ssr.data', 11, 3),
    ]);
    expect((await loadWithFetchTime(request, async () => null)).fetchTime).toBe(90.12346);
  });

  it('rejects invalid durations and preserves loader errors', async () => {
    setup([
      entry('https://example.com/en-US/ssr.data', 11, Number.NaN),
    ]);
    expect((await loadWithFetchTime(request, async () => null)).fetchTime).toBe(90.12346);
    setup([]);
    await expect(
      loadWithFetchTime(request, () => Promise.reject(new Error('Loader failed')))
    ).rejects.toThrow('Loader failed');
  });

  it('waits for timing delivered after decoding and disconnects the observer', async () => {
    const observer = setupObserver();
    const pending = loadWithFetchTime(request, async () => null);
    await vi.advanceTimersByTimeAsync(10);
    observer.publish([
      entry('https://example.com/en-US/ssr.data', 11, 42.123456789),
    ]);
    expect((await pending).fetchTime).toBe(42.12346);
    expect(observer.disconnect).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('bounds the timing wait and excludes it from the fallback measurement', async () => {
    const observer = setupObserver();
    const pending = loadWithFetchTime(request, async () => null);
    await vi.advanceTimersByTimeAsync(100);
    expect((await pending).fetchTime).toBe(90.12346);
    expect(observer.disconnect).toHaveBeenCalledOnce();
  });
});
