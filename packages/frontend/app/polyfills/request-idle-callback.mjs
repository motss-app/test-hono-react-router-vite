const idleWindow = globalThis;

if (!idleWindow.requestIdleCallback) {
  idleWindow.requestIdleCallback = (callback, options) => {
    const startedAt = performance.now();
    const providedTimeout = options?.timeout;

    return setTimeout(() => {
      const elapsed = performance.now() - startedAt;

      callback({
        didTimeout: providedTimeout !== undefined && elapsed >= providedTimeout,
        timeRemaining: () => Math.max(0, 50 - (performance.now() - startedAt)),
      });
    }, 1);
  };
}

if (!idleWindow.cancelIdleCallback) {
  idleWindow.cancelIdleCallback = handle => {
    clearTimeout(handle);
  };
}
