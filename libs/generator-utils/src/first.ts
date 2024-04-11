import { all } from './all';

export const first = async function first<T>(
  gen: AsyncGenerator<T>
): Promise<T> {
  const val = await gen.next();
  // drain the generator
  (() => {
    all(gen);
  })();
  if (val.done) {
    throw new Error('Empty');
  }
  return val.value;
};
