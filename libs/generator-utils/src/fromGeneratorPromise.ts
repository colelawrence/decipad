export const fromGeneratorPromise = async function* fromGeneratorPromise<T>(
  genP: Promise<AsyncGenerator<T>>
): AsyncGenerator<T> {
  for await (const v of await genP) {
    yield v;
  }
};
