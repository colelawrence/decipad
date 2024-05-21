/* eslint-disable @typescript-eslint/promise-function-async */
import type { Result, SerializedTypeKind } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { materializeOneResult } from '@decipad/language-types';
import type { PromiseOrType } from '@decipad/utils';
import { bind } from '@decipad/utils';

export const materializeResult = <T extends SerializedTypeKind>(
  _result: PromiseOrType<Result.Result<T>>
): PromiseOrType<Result.Result> =>
  bind(_result, (result) => {
    const valueP =
      result.value != null ? materializeOneResult(result.value) : null;

    return bind(
      valueP,
      (value) =>
        ({
          ...result,
          value,
        } as Result.Result)
    );
  });
