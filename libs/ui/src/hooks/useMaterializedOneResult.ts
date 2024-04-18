import { useEffect, useRef, useState } from 'react';
import { Result, materializeOneResult } from '@decipad/remote-computer';

export const useMaterializedOneResult = <TResult extends Result.OneResult>(
  result: TResult | null | undefined
): TResult | undefined => {
  const [materializedResult, setMaterializedResult] = useState<
    Result.OneResult | undefined
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
      const newResult = await materializeOneResult(result);
      if (latest.current === result) {
        setMaterializedResult(newResult);
      }
    })();
  }, [result]);
  return materializedResult as TResult | undefined;
};
