export function unique<T>(from: Iterable<T>): Array<T> {
  return Array.from(new Set(from));
}
