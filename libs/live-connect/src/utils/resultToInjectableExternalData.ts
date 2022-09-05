import {
  deserializeType,
  InjectableExternalData,
  Result,
} from '@decipad/computer';

export const resultToInjectableExternalData = (
  result: Result.Result
): InjectableExternalData => {
  return {
    type: deserializeType(result.type),
    value: Result.resultToValue(result),
  };
};
