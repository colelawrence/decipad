import type { Result } from '@decipad/remote-computer';
import { materializeResult } from '@decipad/remote-computer';
import { useEffect, useState, useRef } from 'react';

export const useMaterializedResult = <TResult extends Result.AnyResult>(
  result: TResult | undefined
): Result.Result | undefined => {
  const [materializedResult, setMaterializedResult] = useState<
    Result.Result | undefined
  >();
  const latest = useRef<TResult | undefined>();

  useEffect(() => {
    if (result == null) {
      return;
    }
    if (latest.current === result) {
      return;
    }
    latest.current = result;
    (async () => {
      const newResult = await materializeResult(result);
      if (latest.current === result) {
        setMaterializedResult(newResult);
      }
    })();
  }, [result]);
  return materializedResult;
};
