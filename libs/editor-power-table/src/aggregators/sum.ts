import { Interpreter } from '@decipad/computer';
import Fraction, { F, from as fractionFrom } from '@decipad/fraction';
import { Aggregator } from '../types';

const rawSumReducer = (sum: Fraction, element: Fraction): Fraction =>
  sum.add(element);

const sumReducerForNumbers = (input: Interpreter.ResultNumber[]): Fraction =>
  input.map(fractionFrom).reduce(rawSumReducer, F(0));

export const sum: Aggregator = (input) => {
  switch (input.type.kind) {
    case 'number': {
      return {
        type: input.type,
        value: sumReducerForNumbers(
          input.value.values as Interpreter.ResultNumber[]
        ),
      };
    }
  }
  throw new Error(`Don't know how to average input of type ${input.type.kind}`);
};
