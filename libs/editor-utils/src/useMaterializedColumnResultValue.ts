import { Result } from '@decipad/computer';
import { all } from '@decipad/generator-utils';
import { useResolved } from '@decipad/react-utils';
import { useMemo } from 'react';

export const useMaterializedColumnResultValue = (
  value: Result.Result<'column' | 'materialized-column'>['value'] | undefined,
  start = 0,
  end = Infinity
): Result.Result<'materialized-column'>['value'] | undefined => {
  return useResolved(
    useMemo(
      () =>
        value != null
          ? typeof value === 'function'
            ? all(value(start, end))
            : value
          : value,
      [end, value, start]
    )
  );
};
