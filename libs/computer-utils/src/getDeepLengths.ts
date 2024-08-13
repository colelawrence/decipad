import { Result } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { count, first } from '@decipad/generator-utils';
// eslint-disable-next-line no-restricted-imports
import { isResultGenerator } from '@decipad/language-types';

export const getDeepLengths = async (
  value: Result.OneResult
): Promise<number[]> => {
  if (isResultGenerator(value)) {
    const firstCount = await count(value());
    if (firstCount === 0) {
      return [0];
    }
    return [firstCount, ...(await getDeepLengths(await first(value())))];
  }
  return Array.isArray(value)
    ? [value.length, ...(await getDeepLengths(value[0]))]
    : [];
};
