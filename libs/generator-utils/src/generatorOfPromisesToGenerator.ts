export const generatorOfPromisesToGenerator =
  async function* generatorOfPromisesToGenerator<T>(
    gen: AsyncGenerator<Promise<T>>
  ): AsyncGenerator<T> {
    for await (const v of gen) {
      yield await v;
    }
  };
