import { Interpreter } from '@decipad/computer';
import Fraction, { from as fractionFrom } from '@decipad/fraction';
import { Aggregator } from '../types';

const rawMaxReducer = (
  previousMax: Fraction | number,
  element: Fraction
): Fraction | number => {
  if (previousMax instanceof Fraction) {
    const diff = previousMax.compare(element);
    if (diff < 0) {
      return element;
    }
  }
  return element;
};

const maxReducerForNumbers = (
  input: Interpreter.ResultNumber[]
): Fraction | undefined => {
  const result = input.map(fractionFrom).reduce(rawMaxReducer, -Infinity);
  if (result instanceof Fraction) {
    return result;
  }
  return undefined;
};

export const max: Aggregator = (input) => {
  switch (input.type.kind) {
    case 'number':
      const value = maxReducerForNumbers(
        input.value.values as Interpreter.ResultNumber[]
      );
      if (value == null) {
        return undefined;
      }
      return {
        type: input.type,
        value,
      };
  }
  throw new Error(`Don't know how to average input of type ${input.type.kind}`);
};
