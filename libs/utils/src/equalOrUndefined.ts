export function equalOrUndefined<T>(
  a: T | null | undefined,
  b: T | null | undefined
) {
  if (a == null || b == null) {
    return true;
  }
  return a === b;
}
