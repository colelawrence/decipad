/* eslint-disable no-underscore-dangle */
import { WithFromArray } from './types';

export const isLonger = async <T>(
  gen: WithFromArray<T> & AsyncGenerator<T>,
  max: number
): Promise<boolean> => {
  if (gen.__fromArray) {
    return (await gen.__fromArray).length >= max;
  }

  let counter = 0;
  // eslint-disable-next-line no-underscore-dangle, @typescript-eslint/no-unused-vars
  for await (const _v of gen) {
    counter += 1;

    if (counter === max) {
      return true;
    }
  }

  return false;
};
