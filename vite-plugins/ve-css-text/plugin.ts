import type { Plugin, Rolldown } from 'vite';

const VIRTUAL_EXT = '.vanilla.css';

/**
 * Walks the static-import graph backwards from `id`. If every path to an
 * application entry goes through at least one dynamic `import()` boundary,
 * the module is considered dynamic-only.
 *
 * Returns `false` if the module graph doesn't support the `importers` /
 * `dynamicImporters` properties (e.g. the Cloudflare Workers module runner).
 */
function isOnlyReachableViaDynamicImports(
  getModuleInfo: (id: string) => Rolldown.ModuleInfo | null,
  id: string,
  cache: Map<string, boolean>,
  visited: Set<string> = new Set()
): boolean {
  const cached = cache.get(id);
  if (cached !== undefined) return cached;
  if (visited.has(id)) return false;
  visited.add(id);

  try {
    const info = getModuleInfo(id);
    if (!info) {
      cache.set(id, false);
      return false;
    }

    // Accessing .importers or .dynamicImporters throws in the
    // Cloudflare Workers module runner — treat as unsupported.
    const importers: string[] = info.importers;
    const dynamicImporters: string[] = info.dynamicImporters;

    if (importers.length === 0) {
      const result = dynamicImporters.length > 0;
      cache.set(id, result);
      return result;
    }

    const allStaticImportersAreDynamic = importers.every(importer =>
      isOnlyReachableViaDynamicImports(getModuleInfo, importer, cache, new Set(visited))
    );

    cache.set(id, allStaticImportersAreDynamic);
    return allStaticImportersAreDynamic;
  } catch {
    // Module runner doesn't support graph traversal — fall back to no-op
    cache.set(id, false);
    return false;
  }
}

/**
 * Prevents Vite from extracting CSS from `.css.ts` files that are only
 * reachable via dynamic imports. Instead, the CSS is injected via
 * `adoptedStyleSheets` as a side effect (CSP-safe).
 *
 * Detection is automatic: the plugin walks Vite's module graph to find
 * `.css.ts` modules whose every static-import path to the entry crosses
 * at least one `import()` boundary. All other `.css.ts` files go through
 * normal Vanilla Extract extraction.
 */
export function veCssTextPlugin(): Plugin {
  const cache = new Map<string, boolean>();

  function isDynamicOnly(
    getModuleInfo: (id: string) => Rolldown.ModuleInfo | null,
    rawId: string
  ): boolean {
    const q = rawId.indexOf('?');
    const cleanId = q === -1 ? rawId : rawId.slice(0, q);
    const sourceId = cleanId.endsWith(VIRTUAL_EXT)
      ? cleanId.slice(0, -VIRTUAL_EXT.length)
      : cleanId;
    if (!sourceId.endsWith('.css.ts')) return false;
    return isOnlyReachableViaDynamicImports(getModuleInfo, sourceId, cache);
  }

  return {
    enforce: 'post',
    load(id) {
      const q = id.indexOf('?');
      const cleanId = q === -1 ? id : id.slice(0, q);
      if (cleanId.endsWith(VIRTUAL_EXT) && isDynamicOnly(this.getModuleInfo.bind(this), id)) {
        return '';
      }
      return undefined;
    },
    name: 've-css-text',
    async transform(code, id) {
      if (!id.endsWith('.css.ts')) return undefined;
      if (!isDynamicOnly(this.getModuleInfo.bind(this), id)) return undefined;

      const virtualCssId = `${id}${VIRTUAL_EXT}`;

      try {
        const loaded = await this.load({
          id: virtualCssId,
          resolveDependencies: false,
        });

        if (!loaded?.code) return undefined;

        const cssText = loaded.code;

        const sideEffect = [
          '',
          'if (typeof document !== "undefined") {',
          '  const __veSheet = new CSSStyleSheet();',
          `  __veSheet.replaceSync(${JSON.stringify(cssText)});`,
          '  document.adoptedStyleSheets = [...document.adoptedStyleSheets, __veSheet];',
          '}',
          '',
        ].join('\n');

        return {
          code: code + sideEffect,
          map: null,
        };
      } catch {
        return undefined;
      }
    },
  };
}
