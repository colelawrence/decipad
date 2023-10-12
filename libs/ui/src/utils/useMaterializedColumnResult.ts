import { Result } from '@decipad/remote-computer';
import { useMemo } from 'react';
import { useMaterializedColumnResultValue } from './useMaterializedColumnResultValue';

export const useMaterializedColumnResult = (
  result: Result.Result<'column'> | undefined,
  start = 0,
  end = Infinity
): Result.Result<'materialized-column'> | Result.Result<'pending'> => {
  if (end < start) {
    throw new Error('end needs to be >= start');
  }

  const newValue = useMaterializedColumnResultValue(result?.value);

  return useMemo(
    () =>
      result != null && newValue != null
        ? {
            type: {
              ...result.type,
              kind: 'materialized-column',
            },
            value: newValue,
          }
        : {
            type: {
              kind: 'pending',
            },
            value: Result.Unknown,
          },
    [newValue, result]
  );
};
