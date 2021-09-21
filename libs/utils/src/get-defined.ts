export function getDefined<T>(
  o: T | null | undefined,
  message = 'is not defined'
): T {
  if (o == null) {
    throw new Error(message);
  }
  return o;
}
