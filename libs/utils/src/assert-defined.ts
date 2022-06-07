export function assertDefined<T>(
  value: T | null | undefined | false,
  message?: string
): asserts value is NonNullable<T> {
  if (value == null || value === false) {
    throw new TypeError(message || `expected value to not be ${value}`);
  }
}
