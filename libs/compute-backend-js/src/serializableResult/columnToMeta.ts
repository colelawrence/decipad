/* eslint-disable no-use-before-define */
import { all, map } from '@decipad/generator-utils';
import type { Result } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { getResultGenerator } from '@decipad/language-types';

export const columnToMeta =
  (column: Result.OneResult): (() => Result.ResultMetadataColumn) =>
  () => {
    const colGen = getResultGenerator(column);
    return {
      labels: Promise.all([all(map(colGen(), valueToMeta))]),
    };
  };

const valueToMeta = (value: Result.OneResult): string => {
  return value?.toString() ?? '';
};
