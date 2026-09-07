// deno-lint-ignore-file no-explicit-any
/** biome-ignore-all lint/suspicious/noExplicitAny: React's own types (lazy, createElement, LazyExoticComponent, ComponentProps) all require ComponentType<any> in their generic constraints — no way to satisfy them without any */

import {
  type ComponentType,
  createElement,
  type LazyExoticComponent,
  lazy,
  type Ref,
  useRef,
} from 'react';

type Factory<T> = () => Promise<{
  default: T;
}>;

type VrtGlobal = typeof globalThis & {
  __vrtLazyPreloads__?: Promise<unknown>[];
};

type LazyWithPreloadProps<T extends ComponentType<any>> = React.ComponentProps<T> & {
  ref?: Ref<T>;
};

type LazyWithPreload<T extends ComponentType<any>> = LazyExoticComponent<T> & {
  preload: () => Promise<T>;
};

/**
 * ESM port of `react-lazy-with-preload` (MIT).
 *
 * Wraps `React.lazy` and attaches a `.preload()` method.
 * The component is lazy-loaded on first render. Calling `.preload()`
 * starts the download early (e.g., on hover) so the chunk is ready
 * when needed. Once resolved, the component stays cached via `useRef`
 * so subsequent renders skip Suspense entirely.
 *
 * Pure ESM — no CJS interop issues with Vite's SSR dep optimizer.
 *
 * @see https://github.com/ianschmitz/react-lazy-with-preload
 *
 * @example
 * ```tsx
 * const Dashboard = lazyWithPreload(() => import('./Dashboard'));
 *
 * // Optional: start download early
 * <button onMouseEnter={() => Dashboard.preload()}>Open</button>
 *
 * // Render (chunk downloads on first render if not preloaded)
 * <Suspense fallback={<Spinner />}><Dashboard /></Suspense>
 * ```
 */
export function lazyWithPreload<T extends ComponentType<any>>(
  factory: Factory<T>
): LazyWithPreload<T> {
  const ReactLazyComponent = lazy(factory) as LazyExoticComponent<T>;

  let PreloadedComponent: T | null = null;
  let factoryPromise: Promise<T> | null = null;

  function LazyWithPreload(props: LazyWithPreloadProps<T>) {
    /**
     * Once a resolved component is chosen (via preload or first render),
     * we must continue using it for all subsequent renders — otherwise
     * React will unmount and remount the component.
     */
    const ComponentToRender = useRef(PreloadedComponent ?? ReactLazyComponent);
    const { ref, ...rest } = props;

    return createElement(
      ComponentToRender.current as ComponentType<any>,
      {
        ...(ref
          ? {
              ref,
            }
          : {}),
        ...rest,
      } as React.ComponentProps<T>
    );
  }

  LazyWithPreload.displayName = 'LazyWithPreload';

  const preload = (): Promise<T> => {
    if (!factoryPromise) {
      factoryPromise = factory()
        .then(mod => {
          PreloadedComponent = mod.default;
          return PreloadedComponent;
        })
        .catch(error => {
          /**
           * Reset so the next preload() call re-invokes the factory
           * and retries the chunk download — the error propagates
           * to the caller (e.g. an error boundary).
           */
          factoryPromise = null;
          PreloadedComponent = null;
          throw error;
        });
    }
    return factoryPromise;
  };

  /*
   * Vite replaces import.meta.env.VRT at build time. Production builds
   * therefore erase this test-only registry, while VRT builds eagerly settle
   * every preload.
   */
  if (import.meta.env.VRT) {
    const vrtGlobal = globalThis as VrtGlobal;
    const preloadPromise = preload();

    if (vrtGlobal.__vrtLazyPreloads__) {
      vrtGlobal.__vrtLazyPreloads__.push(preloadPromise);
    } else {
      vrtGlobal.__vrtLazyPreloads__ = [
        preloadPromise,
      ];
    }
  }

  return Object.assign(LazyWithPreload, {
    preload,
  }) as unknown as LazyWithPreload<T>;
}
