import { Interpreter } from '@decipad/computer';
import Fraction, { from as fractionFrom } from '@decipad/fraction';
import { Aggregator } from '../types';

const rawMinReducer = (
  previousMax: Fraction | number,
  element: Fraction
): Fraction | number => {
  if (previousMax instanceof Fraction) {
    const diff = previousMax.compare(element);
    if (diff < 0) {
      return previousMax;
    }
  }
  return element;
};

const minReducerForNumbers = (
  input: Interpreter.ResultNumber[]
): Fraction | undefined => {
  const result = input.map(fractionFrom).reduce(rawMinReducer, Infinity);
  if (result instanceof Fraction) {
    return result;
  }
  return undefined;
};

export const min: Aggregator = (input) => {
  const { type } = input;
  switch (type.kind) {
    case 'number':
      const value = minReducerForNumbers(
        input.value.values as Interpreter.ResultNumber[]
      );
      if (value == null) {
        return undefined;
      }
      return {
        type,
        value,
      };
  }
  throw new Error(`Don't know how to average input of type ${input.type.kind}`);
};
