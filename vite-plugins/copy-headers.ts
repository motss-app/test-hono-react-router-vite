import { dirname, join, resolve } from '@std/path';
import type { Plugin } from 'vite';

import { csp } from '../app/utils/csp.ts';
import { discoverPrerenderRoutes } from '../vite-utils/route-discovery.ts';

interface HeadersCopyPluginOptions {
  dest: string;
  headersDir: string;
  mode: string;
}

const staticPageCacheControl =
  'public, max-age=600, s-maxage=3600, stale-while-revalidate=180, must-revalidate';
const inlineScriptPattern = /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
const inlineStylePattern = /<style\b[^>]*>([\s\S]*?)<\/style>/g;

function fileExists(path: string): boolean {
  try {
    Deno.statSync(path);
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return false;
    }
    throw error;
  }
}

function collectInlineHashes(html: string, pattern: RegExp): Promise<string[]> {
  const inlineContents = [
    ...html.matchAll(pattern),
  ]
    .map(match => match[1])
    .filter((inlineContent): inlineContent is string => Boolean(inlineContent?.trim()));

  return Promise.all(
    inlineContents.map(async inlineContent => `'${await csp.createDigestToken(inlineContent)}'`)
  );
}

function htmlFilePathFromRoute(clientDir: string, routePath: string): string {
  if (routePath === '/') {
    return join(clientDir, 'index.html');
  }

  return join(clientDir, routePath.slice(1), 'index.html');
}

function buildStaticRouteHeaders(routePath: string, cspDirective: string): string {
  return [
    routePath,
    '  ! Cache-Control',
    `  Cache-Control: ${staticPageCacheControl}`,
    `  Content-Security-Policy: ${cspDirective}`,
  ].join('\n');
}

async function processStaticRoute(routePath: string, clientDir: string): Promise<string | null> {
  const htmlFile = htmlFilePathFromRoute(clientDir, routePath);

  if (!fileExists(htmlFile)) {
    // Return null if the prerendered HTML doesn't exist
    return null;
  }

  const html = await Deno.readTextFile(htmlFile);
  const [scriptHashes, styleHashes] = await Promise.all([
    collectInlineHashes(html, inlineScriptPattern),
    collectInlineHashes(html, inlineStylePattern),
  ]);

  return buildStaticRouteHeaders(
    routePath,
    csp.buildPolicy({
      scriptHashes,
      styleHashes,
    })
  );
}

export function headersCopyPlugin(options: HeadersCopyPluginOptions): Plugin {
  const headersDir = resolve(Deno.cwd(), options.headersDir);
  const destPath = resolve(Deno.cwd(), options.dest);
  const clientDir = dirname(destPath);
  const mode = options.mode;

  return {
    apply: 'build',
    async closeBundle(): Promise<void> {
      const src = resolve(headersDir, `_headers.${mode}`);

      if (!fileExists(src)) {
        this.error(`Unable to find headers for mode '${mode}' (looked for ${src})`);
      }

      Deno.mkdirSync(dirname(destPath), {
        recursive: true,
      });

      let headersText = await Deno.readTextFile(src);
      const prerenderRoutes = discoverPrerenderRoutes();
      const staticRouteHeadersResults = await Promise.all(
        prerenderRoutes.map(routePath => processStaticRoute(routePath, clientDir))
      );
      const staticRouteHeaders = staticRouteHeadersResults.filter(
        (header): header is string => header !== null
      );

      headersText = `${headersText.trimEnd()}\n\n${staticRouteHeaders.join('\n\n')}\n`;

      await Deno.writeTextFile(destPath, headersText);

      this.info(
        `Generated static CSP headers for ${staticRouteHeaders.length} prerendered route(s) at ${destPath}`
      );
    },
    name: 'vite:copy-headers',
  };
}
