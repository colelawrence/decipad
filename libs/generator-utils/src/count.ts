/* eslint-disable no-underscore-dangle */
import { WithFromArray } from './types';

export const count = async <T>(
  gen: WithFromArray<T> & AsyncGenerator<T>
): Promise<number> => {
  if (gen.__fromArray) {
    return (await gen.__fromArray).length;
  }
  let counter = 0;
  // eslint-disable-next-line no-underscore-dangle, @typescript-eslint/no-unused-vars
  for await (const _v of gen) {
    counter += 1;
  }
  return counter;
};
