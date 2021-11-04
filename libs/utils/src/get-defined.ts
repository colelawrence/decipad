export function getDefined<T>(
  o: T | null | undefined | void,
  message = 'is not defined'
): T {
  if (o == null) {
    throw new TypeError(message);
  }
  return o;
}
