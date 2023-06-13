// eslint-disable-next-line no-restricted-imports
import deepequal from 'fast-deep-equal/es6';
import isPromise from 'is-promise';

export const dequal = (foo: unknown, bar: unknown): boolean => {
  try {
    // IMPORTANT: deepequal thinks any two promises are equal
    if (isPromise(foo) || isPromise(bar)) {
      return foo === bar;
    }
    return deepequal(foo, bar);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Dequal errored', foo, bar);
    throw err;
  }
};
