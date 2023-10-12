import { Result, materializeOneResult } from '@decipad/remote-computer';
import { useResolved } from '@decipad/react-utils';
import { useMemo } from 'react';

export const useMaterializedResult = <TResult extends Result.OneResult>(
  result: TResult | null
): TResult | undefined => {
  return useResolved(
    useMemo(
      // result `false` is ok, we support booleans in our language
      // this is for typecheck
      () => (result != null ? materializeOneResult(result) : undefined),
      [result]
    )
  ) as TResult | undefined;
};
