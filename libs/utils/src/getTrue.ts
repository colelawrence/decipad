export function getTrue(
  o: boolean,
  message: string | (() => string) = 'is not true'
): boolean {
  if (!o) {
    throw new TypeError(typeof message === 'string' ? message : message());
  }
  return o;
}
