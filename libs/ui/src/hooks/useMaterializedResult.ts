import { Result, materializeOneResult } from '@decipad/computer';
import { useResolved } from '@decipad/react-utils';
import { useMemo } from 'react';

export const useMaterializedResult = <TResult extends Result.OneResult>(
  result: TResult
): TResult | undefined => {
  return useResolved(useMemo(() => materializeOneResult(result), [result])) as
    | TResult
    | undefined;
};
