import { PromiseOrType } from '@decipad/utils';
import { Result } from '../result';
import { materializeOneResult } from './materializeOneResult';
import { SerializedTypeKind } from '../type';

export const materializeResult = async <T extends SerializedTypeKind>(
  _result: PromiseOrType<Result<T>>
): Promise<Result> => {
  const result = await _result;
  const value =
    result.value != null ? await materializeOneResult(result.value) : null;
  return {
    ...result,
    value,
  };
};
