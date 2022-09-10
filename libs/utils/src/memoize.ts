/**
 * Memoize a function using a WeakMap
 *
 * The first parameter is used as the key of the WeakMap and must extend Object
 */
export function memoize<Key extends object, Args extends unknown[], Ret>(
  func: (key: Key, ...a: Args) => Ret
): typeof func {
  const cache = new WeakMap<Key, Ret>();
  return (key, ...args) => {
    if (cache.has(key)) {
      return cache.get(key) as Ret;
    }
    const value = func(key, ...args);

    cache.set(key, value);

    return value;
  };
}
