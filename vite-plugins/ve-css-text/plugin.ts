import type { Plugin } from 'vite';

const VIRTUAL_EXT = '.vanilla.css';

interface VeCssTextPluginOptions {
  /**
   * Glob pattern for `.css.ts` files whose CSS should be injected
   * via `adoptedStyleSheets` instead of extracted into a `<link>` tag.
   */
  include: string;
}

/** Convert a simple glob to a RegExp (supports `**`, `*`, and literal text). */
function globToRegExp(glob: string): RegExp {
  const escaped = glob
    .replace(/\./g, '\\.')
    .replace(/\*\*/g, '{{GLOBSTAR}}')
    .replace(/\*/g, '[^/]*')
    .replace(/\{\{GLOBSTAR\}\}/g, '.*');
  return new RegExp(`${escaped}$`);
}

/**
 * Prevents Vite from extracting CSS from matched `.css.ts` files into
 * separate requests. Instead, the CSS is injected via
 * `adoptedStyleSheets` as a side effect (CSP-safe).
 *
 * This allows components that import from matched `.css.ts` files to be
 * truly lazy-loaded — both JS and CSS are deferred until the component
 * is actually rendered.
 *
 * All other `.css.ts` files are unaffected and go through normal VE
 * extraction.
 */
export function veCssTextPlugin(options: VeCssTextPluginOptions): Plugin {
  const filter = globToRegExp(options.include);

  return {
    enforce: 'post',
    load(id) {
      const questionMark = id.indexOf('?');
      const cleanId = questionMark === -1 ? id : id.slice(0, questionMark);
      if (
        cleanId.endsWith(VIRTUAL_EXT) &&
        filter.test(cleanId.slice(0, -VIRTUAL_EXT.length))
      ) {
        return '';
      }
      return undefined;
    },
    name: 've-css-text',
    async transform(code, id) {
      if (!id.endsWith('.css.ts') || !filter.test(id)) {
        return undefined;
      }

      const virtualCssId = `${id}${VIRTUAL_EXT}`;

      try {
        const loaded = await this.load({
          id: virtualCssId,
          resolveDependencies: false,
        });

        if (!loaded?.code) {
          return undefined;
        }

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
