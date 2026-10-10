/**
 * Narrow an unknown thrown value to a Node `Error` carrying an errno code.
 *
 * Node reports `fs` failures as `Error` instances with a `code` property rather
 * than as distinct subclasses, so comparing `code` is the portable way to detect
 * conditions such as a missing file.
 */
export function isErrnoException(error: unknown, code: string): error is NodeJS.ErrnoException {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as NodeJS.ErrnoException).code === code
  );
}
