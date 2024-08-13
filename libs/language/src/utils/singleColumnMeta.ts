import { all, map } from '@decipad/generator-utils';
import { Result } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { getResultGenerator } from '@decipad/language-types';
import { ColumnLikeValue } from 'libs/language-interfaces/src/Value';

export const singleColumnMeta = (
  column: ColumnLikeValue
): Result.Result['meta'] => {
  const meta = column.meta?.bind(column);
  return () => {
    const metaValue = meta?.();
    if (metaValue?.labels) {
      return metaValue;
    }
    return {
      labels: Promise.all([
        column
          .getData()
          .then(async (data) =>
            all(map(getResultGenerator(data)(), (v) => v?.toString() ?? ''))
          ),
      ]),
    };
  };
};
