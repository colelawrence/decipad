/* eslint-disable @typescript-eslint/promise-function-async */
import { PromiseOrType, bind } from '@decipad/utils';
import { Result } from '../result';
import { materializeOneResult } from './materializeOneResult';
import { SerializedTypeKind } from '../type';

export const materializeResult = <T extends SerializedTypeKind>(
  _result: PromiseOrType<Result<T>>
): PromiseOrType<Result> =>
  bind(_result, (result) => {
    const valueP =
      result.value != null ? materializeOneResult(result.value) : null;

    return bind(valueP, (value) => ({
      ...result,
      value,
    }));
  });
