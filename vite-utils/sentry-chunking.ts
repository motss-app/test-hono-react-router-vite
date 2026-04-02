export const sentryCodeSplittingGroup = {
  name: 'sentry',
  test: (moduleId: string) => moduleId.includes('@sentry'),
};
