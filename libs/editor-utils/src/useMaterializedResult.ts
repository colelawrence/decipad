import { useMemo } from 'react';
import type { Result } from '@decipad/remote-computer';
import { materializeResult } from '@decipad/remote-computer';
import { useResolved } from '@decipad/react-utils';

export const useMaterializedResult = <TResult extends Result.AnyResult>(
  result: TResult | undefined
): Result.Result | undefined =>
  useResolved(
    useMemo(
      () => (result != null ? materializeResult(result) : undefined),
      [result]
    )
  );
