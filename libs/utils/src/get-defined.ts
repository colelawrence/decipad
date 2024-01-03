export function getDefined<T>(
  o: T | null | undefined | void,
  message: string | (() => string) = 'is not defined'
): T {
  if (o == null) {
    throw new TypeError(typeof message === 'string' ? message : message());
  }
  return o;
}
