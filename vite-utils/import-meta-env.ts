export function createImportMetaEnvDefine(values: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      `import.meta.env.${key}`,
      JSON.stringify(value ?? ''),
    ])
  );
}
