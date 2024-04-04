import type { Result } from '@decipad/remote-computer';
import { materializeResult } from '@decipad/remote-computer';
import type { PromiseOrType } from '@decipad/utils';
import { useEffect, useState } from 'react';

export const useMaterializedResult = <TResult extends Result.AnyResult>(
  result: PromiseOrType<TResult> | undefined
): Result.Result | undefined => {
  const [materializedResult, setMaterializedResult] = useState<
    Result.Result | undefined
  >();
  useEffect(() => {
    (async () => {
      if (result != null) {
        setMaterializedResult(await materializeResult(await result));
      }
    })();
  }, [result]);
  return materializedResult;
};
