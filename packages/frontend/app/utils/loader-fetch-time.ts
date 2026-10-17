type FetchTimingEntry = Pick<PerformanceEntry, 'entryType' | 'name' | 'startTime'> & {
  serverTiming?: ReadonlyArray<Pick<PerformanceServerTiming, 'duration' | 'name'>>;
};

function getServerFetchTime(
  entries: FetchTimingEntry[],
  requestUrl: URL,
  startedAt: number
): number | null {
  const dataPath = `${requestUrl.pathname.replace(/\/$/, '')}.data`;

  for (const entry of entries) {
    if (entry.entryType !== 'resource' || entry.startTime < startedAt) {
      continue;
    }

    const url = new URL(entry.name);
    if (url.origin !== requestUrl.origin || url.pathname !== dataPath) {
      continue;
    }

    const duration = entry.serverTiming?.find(metric => metric.name === 'frontend')?.duration;
    if (duration !== undefined && Number.isFinite(duration) && duration >= 0) {
      return duration;
    }
  }

  return null;
}

export async function loadWithFetchTime<T>(request: Request, load: () => Promise<T>) {
  const requestUrl = new URL(request.url);
  const startedAt = performance.now();
  let serverTime: number | null = null;
  let resolveTiming: () => void;
  const timingReady = new Promise<void>(resolve => {
    resolveTiming = resolve;
  });
  const observer =
    typeof PerformanceObserver !== 'undefined' &&
    PerformanceObserver.supportedEntryTypes.includes('resource')
      ? new PerformanceObserver(list => {
          serverTime = getServerFetchTime(list.getEntries(), requestUrl, startedAt) ?? serverTime;
          if (serverTime !== null) {
            resolveTiming();
          }
        })
      : null;

  /* Observe before loading, including when the Resource Timing buffer is full. */
  observer?.observe({
    type: 'resource',
  });

  try {
    const response = await load();
    const elapsed = performance.now() - startedAt;
    serverTime ??= getServerFetchTime(
      [
        ...(observer?.takeRecords() ?? []),
        ...performance.getEntriesByType('resource'),
      ],
      requestUrl,
      startedAt
    );
    /*
     * Resource Timing delivery can follow decoding by several browser tasks.
     * Wait briefly for it without counting that wait in the fallback duration.
     */
    if (observer && serverTime === null) {
      let timeout: ReturnType<typeof setTimeout> | undefined;
      await Promise.race([
        timingReady,
        new Promise<void>(resolve => {
          timeout = setTimeout(resolve, 100);
        }),
      ]);
      clearTimeout(timeout);
    }

    return {
      fetchTime: Number((serverTime ?? elapsed).toFixed(5)),
      response,
    };
  } finally {
    observer?.disconnect();
  }
}
