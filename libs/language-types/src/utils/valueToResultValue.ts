import { Value, Result, Unknown } from '@decipad/language-interfaces';

export const valueToResultValue = async (
  value: Value.Value
): Promise<Result.OneResult> => value?.getData() ?? Unknown;
