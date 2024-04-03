/* eslint-disable @typescript-eslint/promise-function-async */
// eslint-disable-next-line no-restricted-imports
import {
  Result,
  SerializedTypeKind,
  materializeOneResult,
} from '@decipad/language-types';
import { PromiseOrType, bind } from '@decipad/utils';

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
