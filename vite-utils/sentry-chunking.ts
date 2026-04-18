const sentryModulePrefix = '@sentry';

const sentryViewHierarchyLazyIntegrationModulePattern = '/integrations/view-hierarchy.js';
const sentryBrowserProfilingLazyIntegrationModulePattern = '/profiling/integration.js';

const sentryLazyIntegrationModulePatterns = [
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
