import DeciNumber from '@decipad/number';
import { buildResult, type Result } from '@decipad/remote-computer';

type OutputValue = Result.OneResult | string;

const outputValue = (value: Result.OneResult): OutputValue => {
  if (value instanceof DeciNumber) {
    return value.toString(5);
  }
  if (Array.isArray(value)) {
    return value.map(outputValue) as OutputValue;
  }
  return value;
};

export const outputResult = (result: Result.Result): Result.Result => {
  return buildResult(
    result.type,
    outputValue(result.value as Result.OneResult),
    false
  );
};
