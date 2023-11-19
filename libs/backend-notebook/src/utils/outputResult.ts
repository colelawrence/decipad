import DeciNumber from '@decipad/number';
import { type Result } from '@decipad/remote-computer';

type OutputValue = Result.Result['value'] | string;

const outputValue = (value: Result.Result['value']): OutputValue => {
  if (value instanceof DeciNumber) {
    return value.toString(5);
  }
  if (Array.isArray(value)) {
    return value.map(outputValue) as OutputValue;
  }
  return value;
};

export const outputResult = (result: Result.Result): Result.Result => {
  return {
    ...result,
    value: outputValue(result.value),
  };
};
