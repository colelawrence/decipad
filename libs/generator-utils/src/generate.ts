import { PromiseOrType } from '@decipad/utils';

export const DONE = Symbol('done');

type GenerateFunction<T> = (
  done: typeof DONE
) => PromiseOrType<T | typeof DONE>;

export const generate = async function* generate<T>(
  generateFn: GenerateFunction<T>
): AsyncGenerator<T> {
  let done = false;
  do {
    // eslint-disable-next-line no-await-in-loop
    const value = await generateFn(DONE);
    if (value === DONE) {
      done = true;
      break;
    }
    yield value;
  } while (!done);
};
