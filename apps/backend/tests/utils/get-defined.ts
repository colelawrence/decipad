/** Use of getDefined is discouraged. Use with care! */
export default function getDefined<T>(
  d: T | undefined | null,
  message = 'Not defined'
): T {
  if (d == null) {
    throw new TypeError(message);
  }
  return d;
}
