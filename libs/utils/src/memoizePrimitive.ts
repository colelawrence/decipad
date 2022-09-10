/**
 * Memoize a function using a Map
 *
 * The first parameter is used as the key of the Map
 */
export function memoizePrimitive<Key, Args extends unknown[], Ret>(
  func: (k: Key, ...a: Args) => Ret
): typeof func {
  const cache = new Map<Key, Ret>();

  return (key, ...args) => {
    if (cache.has(key)) {
      return cache.get(key) as Ret;
    }
    const value = func(key, ...args);

    cache.set(key, value);

    return value;
  };
}
