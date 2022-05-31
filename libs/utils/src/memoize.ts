/**
 * Memoize a function using a WeakMap
 *
 * The first parameter is used as the key of the WeakMap and must extend Object
 */
export function memoize<Args extends unknown[], Ret>(
  func: (...a: Args) => Ret
): typeof func {
  const cache = new WeakMap<object, Ret>();
  return (...args) => {
    const key = args[0];
    if (key == null || typeof key !== 'object') {
      throw new Error(`memoize: invalid cache key ${key}`);
    } else if (cache.has(key)) {
      return cache.get(key) as Ret;
    } else {
      const value = func(...args);

      cache.set(key, value);

      return value;
    }
  };
}
