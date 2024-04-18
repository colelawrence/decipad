export async function* observe<T>(
  gen: AsyncGenerator<T>,
  valueObserver?: (v: T) => unknown,
  endObserver?: () => unknown
): AsyncGenerator<T> {
  for await (const value of gen) {
    valueObserver?.(value);
    yield value;
  }
  endObserver?.();
}
