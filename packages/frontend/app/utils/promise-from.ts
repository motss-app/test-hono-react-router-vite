function isPromiseLike<T>(value: unknown): value is Promise<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'then' in value &&
    typeof value.then === 'function'
  );
}

export function PromiseFrom<T>(value: T): Promise<Awaited<T>> {
  if (isPromiseLike<T>(value)) {
    return value as Promise<Awaited<T>>;
  }

  return Promise.resolve(value as Awaited<T>);
}
