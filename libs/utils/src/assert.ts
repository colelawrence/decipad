export function assert(
  condition: boolean,
  message?: string
): asserts condition {
  if (condition) {
    return;
  }

  if (message != null) {
    throw new Error(message);
  }

  throw new Error('Assertion failed');
}
