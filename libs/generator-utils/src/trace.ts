import { getInstanceof } from '@decipad/utils';

export const trace = async function* trace<T>(
  gen: AsyncGenerator<T>,
  desc: string
): AsyncGenerator<T> {
  try {
    for await (const value of gen) {
      yield value;
    }
  } catch (err) {
    getInstanceof(err, Error).message += `\n  > ${desc}`;
    throw err;
  }
};
