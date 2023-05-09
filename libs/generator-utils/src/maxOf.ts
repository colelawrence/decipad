export const maxOf = async function* maxOf<T>(
  gen: AsyncGenerator<T>,
  max: number
): AsyncGenerator<T> {
  let n = 0;
  for await (const v of gen) {
    n += 1;
    if (n === max) {
      break;
    }
    yield v;
  }
};
