import { PromiseOrType } from '@decipad/utils';

/* eslint-disable no-await-in-loop */
type GenerateFunction<T> = (done: () => void) => PromiseOrType<T>;

export const generate = async function* generate<T>(
  generateFn: GenerateFunction<T>
): AsyncGenerator<T> {
  let done = false;
  const setDone = () => {
    done = true;
  };
  do {
    yield await generateFn(setDone);
  } while (!done);
};
