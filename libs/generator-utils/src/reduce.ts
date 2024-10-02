export const reduce = async <T, V>(
  gen: AsyncGenerator<T>,
  fn: (acc: V, v: T) => V,
  initial: V
): Promise<V> => {
  let acc = initial;
  for await (const v of gen) {
    acc = fn(acc, v);
  }
  return acc;
};
