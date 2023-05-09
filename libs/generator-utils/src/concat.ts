/* eslint-disable no-await-in-loop */
export const concat = async function* concat<T>(
  generators: Array<AsyncGenerator<T>>
): AsyncGenerator<T> {
  for (const gen of generators) {
    for await (const value of gen) {
      yield value;
    }
  }
};
