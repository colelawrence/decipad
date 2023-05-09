import { PromiseOrType } from '@decipad/utils';

type FinderFunction<T> = (value: T) => PromiseOrType<boolean>;

export const findIndex = async <T>(
  gen: AsyncGenerator<T>,
  finder: FinderFunction<T>
): Promise<number> => {
  let index = -1;
  for await (const v of gen) {
    index += 1;
    if (await finder(v)) {
      return index;
    }
  }
  return -1;
};
