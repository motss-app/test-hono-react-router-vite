const idleWindow = globalThis as Window & typeof globalThis;

/**
 * requestIdleCallback polyfill that falls back to setTimeout.
 *
 * Based on Chrome for Developers guidance:
 * https://developer.chrome.com/blog/using-requestidlecallback
 */
if (!idleWindow.requestIdleCallback) {
  idleWindow.requestIdleCallback = (callback, options) => {
    const startedAt = Date.now();
    const providedTimeout = options?.timeout;

    return setTimeout(() => {
      const elapsed = Date.now() - startedAt;

      callback({
        didTimeout: providedTimeout !== undefined && elapsed >= providedTimeout,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - startedAt)),
      });
    }, 1);
  };

  if (!idleWindow.cancelIdleCallback) {
    idleWindow.cancelIdleCallback = handle => {
      clearTimeout(handle);
    };
  }
}
