export const slice = async function* slice<T>(
  gen: AsyncGenerator<T>,
  start = 0,
  end = Infinity
): AsyncGenerator<T> {
  let n = -1;
  for await (const v of gen) {
    n += 1;
    if (n >= start && n < end) {
      yield v;
    }
  }
};
