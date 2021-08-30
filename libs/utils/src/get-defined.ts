export function getDefined<T>(
  o: T | null | undefined,
  message = 'is not defined'
): T {
  if (o === null || o === undefined) {
    throw new Error(message);
  }
  return o;
}
