import { dirname, join, resolve } from 'node:path';
import type { Plugin } from 'vite';

import {
  getSentryConnectSrc,
  getSentryEnvironment,
} from '../packages/frontend/app/monitoring/sentry.ts';
import {
  cloudflareAnalyticsStyleHashes,
  collectInlineHashes,
  createSentryCspReportingConfig,
  csp,
  inlineScriptPattern,
  inlineStylePattern,
} from '../packages/frontend/app/utils/csp.ts';
import { readRequiredEnv } from '../vite-utils/get-required-env.ts';
import { discoverPrerenderRoutes } from '../vite-utils/route-discovery.ts';
import { createBuildSentryEnvSnapshot } from '../vite-utils/sentry-build-env-log.ts';

interface HeadersCopyPluginOptions {
  dest: string;
  headersDir: string;
  mode: string;
  rootDir?: string;
}

interface ProcessStaticRouteOptions {
  clientDir: string;
  includeCloudflareAnalyticsStyleHashes: boolean;
  routePath: string;
  sentryDsn: string;
  sentryCspReportingConfig: ReturnType<typeof createSentryCspReportingConfig>;
}

interface HeadersCopyPluginContext {
  includeCloudflareAnalyticsStyleHashes: boolean;
  sentryCspReportingConfig: ReturnType<typeof createSentryCspReportingConfig>;
  sentryDsn: string;
}

const staticPageCacheControl =
  'public, max-age=900, s-maxage=3600, stale-while-revalidate=180, stale-if-error=86400, no-transform';

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

function htmlFilePathFromRoute(clientDir: string, routePath: string): string {
  if (routePath === '/') {
    return join(clientDir, 'index.html');
  }

  return join(clientDir, routePath.slice(1), 'index.html');
}

function createHeadersCopyPluginContext(mode: string): HeadersCopyPluginContext {
  const includeCloudflareAnalyticsStyleHashes = mode !== 'development';

  Deno.stderr.writeSync(
    new TextEncoder().encode(
      `[vite-plugins/copy-headers.ts] Sentry env snapshot ${JSON.stringify(createBuildSentryEnvSnapshot('vite-plugins/copy-headers.ts', mode))}\n`
    )
  );

  const sentryDsn = readRequiredEnv('SENTRY_DSN', {
    source: 'vite-plugins/copy-headers.ts',
  });
  const sentryRelease = readRequiredEnv('SENTRY_RELEASE', {
    source: 'vite-plugins/copy-headers.ts',
  });
  const sentryEnvironment = getSentryEnvironment(mode);

  return {
    includeCloudflareAnalyticsStyleHashes,
    sentryCspReportingConfig: createSentryCspReportingConfig({
      dsn: sentryDsn,
      environment: sentryEnvironment,
      release: sentryRelease,
    }),
    sentryDsn,
  };
}

function buildStaticRouteHeaders(
  routePath: string,
  cspDirective: string,
  stylesheetPreloadLinks: readonly string[],
  sentryCspReportingConfig: ReturnType<typeof createSentryCspReportingConfig>
): string {
  return [
    routePath,
    '  ! Cache-Control',
    `  Cache-Control: ${staticPageCacheControl}`,
    ...stylesheetPreloadLinks.map(link => `  Link: ${link}`),
    `  Content-Security-Policy: ${cspDirective}; report-uri ${sentryCspReportingConfig.reportUri}; report-to csp-endpoint`,
    `  Report-To: ${sentryCspReportingConfig.reportTo}`,
    `  Reporting-Endpoints: ${sentryCspReportingConfig.reportingEndpoints}`,
    `  Document-Policy: ${csp.buildDocumentPolicy()}`,
  ].join('\n');
}

function extractStylesheetPreloadLinks(html: string): string[] {
  const stylesheetPreloadLinks: string[] = [];
  const linkTagPattern = /<link\b[^>]*>/gi;
  const attributePattern = /([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;

  for (const linkTag of html.matchAll(linkTagPattern)) {
    const attributes = new Map<string, string>();

    for (const attribute of linkTag[0].matchAll(attributePattern)) {
      const name = attribute[1]?.toLowerCase();
      const value = attribute[2] ?? attribute[3] ?? attribute[4] ?? '';

      if (name) {
        attributes.set(name, value);
      }
    }

    const rel = attributes
      .get('rel')
      ?.split(/\s+/)
      .map(value => value.toLowerCase());
    const href = attributes.get('href');

    if (rel?.includes('stylesheet') && href?.startsWith('/') && !href.startsWith('//')) {
      stylesheetPreloadLinks.push(`<${href}>; rel=preload; as=style`);
    }
  }

  return stylesheetPreloadLinks;
}

async function processStaticRoute({
  clientDir,
  includeCloudflareAnalyticsStyleHashes,
  routePath,
  sentryDsn,
  sentryCspReportingConfig,
}: ProcessStaticRouteOptions): Promise<string | null> {
  const htmlFile = htmlFilePathFromRoute(clientDir, routePath);

  if (!fileExists(htmlFile)) {
    // Return null if the prerendered HTML doesn't exist
    return null;
  }

  const html = await Deno.readTextFile(htmlFile);
  const stylesheetPreloadLinks = extractStylesheetPreloadLinks(html);
  const [scriptHashes, styleHashes] = await Promise.all([
    collectInlineHashes(html, inlineScriptPattern),
    collectInlineHashes(html, inlineStylePattern),
  ]);

  return buildStaticRouteHeaders(
    routePath,
    csp.buildPolicy({
      connectSrc: getSentryConnectSrc(sentryDsn),
      scriptHashes,
      styleHashes: [
        ...styleHashes,
        ...(includeCloudflareAnalyticsStyleHashes ? cloudflareAnalyticsStyleHashes : []),
      ],
    }),
    stylesheetPreloadLinks,
    sentryCspReportingConfig
  );
}

export function headersCopyPlugin(options: HeadersCopyPluginOptions): Plugin {
  const rootDir = options.rootDir ?? Deno.cwd();
  const headersDir = resolve(rootDir, options.headersDir);
  const destPath = resolve(rootDir, options.dest);
  const clientDir = dirname(destPath);
  const mode = options.mode;
  const { includeCloudflareAnalyticsStyleHashes, sentryCspReportingConfig, sentryDsn } =
    createHeadersCopyPluginContext(mode);

  return {
    apply: 'build',
    /**
     * Run AFTER React Router's prerender step. In `react-router@8.1.0` the
     * prerender moved into a dedicated `prerender` plugin that fires in
     * `config.builder.buildApp` with `order: "post"`, which executes after
     * the per-environment `closeBundle` hooks. The previous `closeBundle`
     * hook here therefore ran before any prerendered HTML was written, so it
     * saw zero routes and emitted no CSP headers.
     *
     * Using `buildApp` (with `order: "post"`) re-orders this plugin to run
     * after React Router's prerender so the prerendered HTML files exist on
     * disk when we read them to compute per-route CSP hashes.
     */
    buildApp: {
      async handler(): Promise<void> {
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
          prerenderRoutes.map(routePath =>
            processStaticRoute({
              clientDir,
              includeCloudflareAnalyticsStyleHashes,
              routePath,
              sentryCspReportingConfig,
              sentryDsn,
            })
          )
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
      order: 'post',
    },
    name: 'vite:copy-headers',
  };
}
