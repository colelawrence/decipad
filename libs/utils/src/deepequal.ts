// eslint-disable-next-line no-restricted-imports
import deepequal from 'fast-deep-equal/es6';

export const dequal = (foo: unknown, bar: unknown): boolean => {
  try {
    return deepequal(foo, bar);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Dequal errored', foo, bar);
    throw err;
  }
};
