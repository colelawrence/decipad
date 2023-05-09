export const count = async <T>(gen: AsyncGenerator<T>): Promise<number> => {
  let counter = 0;
  // eslint-disable-next-line no-underscore-dangle, @typescript-eslint/no-unused-vars
  for await (const _v of gen) {
    counter += 1;
  }
  return counter;
};
