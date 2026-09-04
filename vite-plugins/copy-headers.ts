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
  headerRoutePath: string;
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
  'public, max-age=0, s-maxage=900, stale-while-revalidate=180, stale-if-error=86400, no-transform';

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

function internalHtmlFilePathFromRoute(clientDir: string, routePath: string): string {
  return join(
    clientDir,
    '_ssg',
    routePath === '/' ? 'index.html' : routePath.slice(1),
    'index.html'
  );
}

function internalRoutePath(routePath: string): string {
  return `/_ssg${routePath}`;
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
  sentryCspReportingConfig: ReturnType<typeof createSentryCspReportingConfig>
): string {
  return [
    routePath,
    '  ! Cache-Control',
    `  Cache-Control: ${staticPageCacheControl}`,
    `  Content-Security-Policy: ${cspDirective}; report-uri ${sentryCspReportingConfig.reportUri}; report-to csp-endpoint`,
    `  Report-To: ${sentryCspReportingConfig.reportTo}`,
    `  Reporting-Endpoints: ${sentryCspReportingConfig.reportingEndpoints}`,
    `  Document-Policy: ${csp.buildDocumentPolicy()}`,
  ].join('\n');
}

async function processStaticRoute({
  clientDir,
  includeCloudflareAnalyticsStyleHashes,
  headerRoutePath,
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
  const [scriptHashes, styleHashes] = await Promise.all([
    collectInlineHashes(html, inlineScriptPattern),
    collectInlineHashes(html, inlineStylePattern),
  ]);

  return buildStaticRouteHeaders(
    headerRoutePath,
    csp.buildPolicy({
      connectSrc: getSentryConnectSrc(sentryDsn),
      scriptHashes,
      styleHashes: [
        ...styleHashes,
        ...(includeCloudflareAnalyticsStyleHashes ? cloudflareAnalyticsStyleHashes : []),
      ],
    }),
    sentryCspReportingConfig
  );
}

async function gzipStaticRoute(clientDir: string, routePath: string): Promise<boolean> {
  const htmlFile = htmlFilePathFromRoute(clientDir, routePath);
  const internalHtmlFile = internalHtmlFilePathFromRoute(clientDir, routePath);

  if (!fileExists(htmlFile)) {
    return false;
  }

  Deno.mkdirSync(dirname(internalHtmlFile), {
    recursive: true,
  });
  await Deno.rename(htmlFile, internalHtmlFile);

  const input = await Deno.readFile(internalHtmlFile);
  const command = new Deno.Command('/usr/bin/gzip', {
    args: [
      '-n',
      '-9',
      '-c',
    ],
    stderr: 'piped',
    stdin: 'piped',
    stdout: 'piped',
  });
  const child = command.spawn();
  const writer = child.stdin.getWriter();
  await writer.write(input);
  await writer.close();

  const output = await child.output();

  if (!output.success) {
    const error = new TextDecoder().decode(output.stderr).trim();
    throw new Error(`gzip failed for ${internalHtmlFile}: ${error || `exit code ${output.code}`}`);
  }

  await Deno.writeFile(`${internalHtmlFile}.gz`, output.stdout);
  return true;
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
        const prerenderRoutes = discoverPrerenderRoutes({
          rootDir,
        });
        const staticRouteHeadersResults = await Promise.all(
          prerenderRoutes.map(routePath =>
            processStaticRoute({
              clientDir,
              headerRoutePath: internalRoutePath(routePath),
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
        const compressedRoutes = await Promise.all(
          prerenderRoutes.map(routePath => gzipStaticRoute(clientDir, routePath))
        );

        headersText = `${headersText.trimEnd()}\n\n${staticRouteHeaders.join('\n\n')}\n`;

        await Deno.writeTextFile(destPath, headersText);

        this.info(
          `Generated static CSP headers for ${staticRouteHeaders.length} prerendered route(s) at ${destPath}`
        );
        this.info(
          `Generated gzip files for ${compressedRoutes.filter(Boolean).length} pre-rendered route(s)`
        );
      },
      order: 'post',
    },
    name: 'vite:copy-headers',
  };
}
