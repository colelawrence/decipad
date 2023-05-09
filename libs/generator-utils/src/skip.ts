export const skip = async function* skip<T>(
  gen: AsyncGenerator<T>,
  skipFirstN: number
): AsyncGenerator<T> {
  let n = -1;
  for await (const v of gen) {
    n += 1;
    if (n > skipFirstN) {
      yield v;
    }
  }
};
