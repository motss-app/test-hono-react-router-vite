import { dirname, join, resolve } from 'node:path';
import type { Plugin } from 'vite';

import { getSentryConnectSrc, getSentryEnvironment } from '../app/monitoring/sentry.ts';
import {
  cloudflareAnalyticsStyleHashes,
  collectInlineHashes,
  createSentryCspReportingConfig,
  csp,
  inlineScriptPattern,
  inlineStylePattern,
} from '../app/utils/csp.ts';
import { readRequiredEnv } from '../vite-utils/get-required-env.ts';
import { discoverPrerenderRoutes } from '../vite-utils/route-discovery.ts';
import { createBuildSentryEnvSnapshot } from '../vite-utils/sentry-env-log.ts';

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
  staticPageCacheControl: string;
}

interface HeadersCopyPluginContext {
  includeCloudflareAnalyticsStyleHashes: boolean;
  sentryCspReportingConfig: ReturnType<typeof createSentryCspReportingConfig>;
  sentryDsn: string;
}

const staticPageCacheControl =
  'public, max-age=600, s-maxage=3600, stale-while-revalidate=180, must-revalidate';

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
  sentryCspReportingConfig: ReturnType<typeof createSentryCspReportingConfig>,
  staticPageCacheControl: string
): string {
  return [
    routePath,
    '  ! Cache-Control',
    `  Cache-Control: ${staticPageCacheControl}`,
    `  Content-Security-Policy: ${cspDirective}`,
    `  Content-Security-Policy-Report-Only: ${cspDirective}; report-uri ${sentryCspReportingConfig.reportUri}; report-to csp-endpoint`,
    `  Report-To: ${sentryCspReportingConfig.reportTo}`,
    `  Reporting-Endpoints: ${sentryCspReportingConfig.reportingEndpoints}`,
    `  Document-Policy: ${csp.buildDocumentPolicy()}`,
  ].join('\n');
}

async function processStaticRoute({
  clientDir,
  includeCloudflareAnalyticsStyleHashes,
  routePath,
  sentryDsn,
  sentryCspReportingConfig,
  staticPageCacheControl,
}: ProcessStaticRouteOptions): Promise<string | null> {
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
      connectSrc: getSentryConnectSrc(sentryDsn),
      scriptHashes,
      styleHashes: [
        ...styleHashes,
        ...(includeCloudflareAnalyticsStyleHashes ? cloudflareAnalyticsStyleHashes : []),
      ],
    }),
    sentryCspReportingConfig,
    staticPageCacheControl
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
    async closeBundle(): Promise<void> {
      const src = resolve(headersDir, `_headers.${mode}`);

      if (!fileExists(src)) {
        this.error(`Unable to find headers for mode '${mode}' (looked for ${src})`);
      }

      Deno.mkdirSync(dirname(destPath), {
        recursive: true,
      });

      let headersText = await Deno.readTextFile(src);
      const prerenderRoutes = discoverPrerenderRoutes({
        rootDir,
      });
      const staticRouteHeadersResults = await Promise.all(
        prerenderRoutes.map(routePath =>
          processStaticRoute({
            clientDir,
            includeCloudflareAnalyticsStyleHashes,
            routePath,
            sentryCspReportingConfig,
            sentryDsn,
            staticPageCacheControl,
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
    name: 'vite:copy-headers',
  };
}
