import { useMemo } from 'react';
import { Result, materializeOneResult } from '@decipad/remote-computer';
import { useResolved } from '@decipad/react-utils';

export const useMaterializedOneResult = <TResult extends Result.OneResult>(
  result: TResult | null | undefined
): Result.OneResult | undefined =>
  useResolved(
    useMemo(
      () => (result != null ? materializeOneResult(result) : undefined),
      [result]
    )
  );
