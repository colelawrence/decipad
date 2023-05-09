import {
  Result,
  SerializedTypeKind,
  materializeResult,
} from '@decipad/computer';
import { useResolved } from '@decipad/react-utils';
import { useMemo } from 'react';

export const useMaterializedResult = <T extends SerializedTypeKind>(
  result: Result.Result<T> | undefined
): Result.Result | undefined => {
  return useResolved(
    useMemo(
      (): undefined | Promise<Result.Result> =>
        result != null ? materializeResult(result) : undefined,
      [result]
    )
  );
};
