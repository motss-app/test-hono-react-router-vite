const sentryModulePrefix = '@sentry';

const sentryHttpClientLazyIntegrationModulePattern = '/integrations/httpclient.js';
const sentryExtraErrorDataLazyIntegrationModulePattern = '/integrations/extraerrordata.js';
const sentryContextLinesLazyIntegrationModulePattern = '/integrations/contextlines.js';
const sentryViewHierarchyLazyIntegrationModulePattern = '/integrations/view-hierarchy.js';
const sentryBrowserProfilingLazyIntegrationModulePattern = '/profiling/integration.js';

const sentryLazyIntegrationModulePatterns = [
  sentryHttpClientLazyIntegrationModulePattern,
  sentryExtraErrorDataLazyIntegrationModulePattern,
  sentryContextLinesLazyIntegrationModulePattern,
  sentryViewHierarchyLazyIntegrationModulePattern,
  sentryBrowserProfilingLazyIntegrationModulePattern,
] as const;

function isSentryModule(moduleId: string): boolean {
  return moduleId.includes(sentryModulePrefix);
}

function isSentryLazyIntegrationModule(moduleId: string): boolean {
  return sentryLazyIntegrationModulePatterns.some(pattern => moduleId.includes(pattern));
}

export const sentryViewHierarchyCodeSplittingGroup = {
  name: 'sentry-view-hierarchy',
  test: (moduleId: string) =>
    isSentryModule(moduleId) && moduleId.includes(sentryViewHierarchyLazyIntegrationModulePattern),
};

export const sentryHttpClientCodeSplittingGroup = {
  name: 'sentry-http-client',
  test: (moduleId: string) =>
    isSentryModule(moduleId) && moduleId.includes(sentryHttpClientLazyIntegrationModulePattern),
};

export const sentryExtraErrorDataCodeSplittingGroup = {
  name: 'sentry-extra-error-data',
  test: (moduleId: string) =>
    isSentryModule(moduleId) && moduleId.includes(sentryExtraErrorDataLazyIntegrationModulePattern),
};

export const sentryContextLinesCodeSplittingGroup = {
  name: 'sentry-context-lines',
  test: (moduleId: string) =>
    isSentryModule(moduleId) && moduleId.includes(sentryContextLinesLazyIntegrationModulePattern),
};

export const sentryBrowserProfilingCodeSplittingGroup = {
  name: 'sentry-browser-profiling',
  test: (moduleId: string) =>
    isSentryModule(moduleId) &&
    moduleId.includes(sentryBrowserProfilingLazyIntegrationModulePattern),
};

export const sentryCodeSplittingGroup = {
  name: 'sentry',
  test: (moduleId: string) => isSentryModule(moduleId) && !isSentryLazyIntegrationModule(moduleId),
};
