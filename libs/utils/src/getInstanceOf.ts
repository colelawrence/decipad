import type { Class } from 'utility-types';

export const getInstanceof = <T>(
  thing: T | unknown,
  cls: Class<T>,
  message?: string
): T => {
  if (thing instanceof cls) {
    return thing as T;
  }
  throw new Error(
    `panic: ${
      message ??
      `getInstanceof expected an instance of ${
        cls?.name ?? 'a specific class'
      } and got ${
        (thing as { constructor: { name: string } })?.constructor?.name
      }`
    }`
  );
};
