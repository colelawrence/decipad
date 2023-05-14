import {
  Result,
  SerializedTypeKind,
  materializeResult,
} from '@decipad/computer';
import { PromiseOrType } from '@decipad/utils';
import { useEffect, useState } from 'react';

export const useMaterializedResult = <T extends SerializedTypeKind>(
  result: PromiseOrType<Result.Result<T>> | undefined
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
