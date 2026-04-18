const sentryLazyIntegrationModulePatterns = [
  '/integrations/view-hierarchy.js',
  '/profiling/integration.js',
] as const;

function isSentryLazyIntegrationModule(moduleId: string): boolean {
  return sentryLazyIntegrationModulePatterns.some(pattern => moduleId.includes(pattern));
}

export const sentryViewHierarchyCodeSplittingGroup = {
  name: 'sentry-view-hierarchy',
  test: (moduleId: string) =>
    moduleId.includes('@sentry') && moduleId.includes('/integrations/view-hierarchy.js'),
};

export const sentryBrowserProfilingCodeSplittingGroup = {
  name: 'sentry-browser-profiling',
  test: (moduleId: string) =>
    moduleId.includes('@sentry') && moduleId.includes('/profiling/integration.js'),
};

export const sentryCodeSplittingGroup = {
  name: 'sentry',
  test: (moduleId: string) =>
    moduleId.includes('@sentry') && !isSentryLazyIntegrationModule(moduleId),
};
