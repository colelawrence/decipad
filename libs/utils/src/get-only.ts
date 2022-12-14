/** Return the only item in the array. Crashes if it has zero items, or more than 1 */
export function getOnly<T>(array: T[], message?: string): T {
  if (array.length !== 1) {
    throw new TypeError(
      message ??
        `panic: getOnly() expected an array with a single item, got ${array.length}`
    );
  }
  return array[0];
}
