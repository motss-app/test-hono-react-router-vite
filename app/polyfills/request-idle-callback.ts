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
    const timeout = options?.timeout ?? 1;

    return setTimeout(() => {
      callback({
        didTimeout: Boolean(options?.timeout),
        timeRemaining: () => Math.max(0, 50 - (Date.now() - startedAt)),
      });
    }, timeout);
  };
}

if (!idleWindow.cancelIdleCallback) {
  idleWindow.cancelIdleCallback = handle => {
    clearTimeout(handle);
  };
}
