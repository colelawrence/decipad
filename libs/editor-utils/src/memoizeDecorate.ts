import { MyDecorate, MyElement } from '@decipad/editor-types';
import { memoize } from '@decipad/utils';

// Memoize uses the first argument to as the cache key, we don't use it in any other way.
const cacheFnByElement = memoize(<T>(_: MyElement, fn: () => T) => fn());

export const memoizeDecorate =
  (decorate: MyDecorate): MyDecorate =>
  (...args) =>
  (entry) =>
    cacheFnByElement(entry[0] as MyElement, () => decorate(...args)(entry));
