import { Result } from '@decipad/computer';
import { from as fractionFrom } from '@decipad/fraction';
import { Aggregator } from '../types';
import { sum } from './sum';

export const average: Aggregator = (input) => {
  switch (input.type.kind) {
    case 'number':
      const { type, value } = sum(input) as Result.Result<'number'>;
      return {
        type,
        value: fractionFrom(value).div(input.value.rowCount),
      };
  }
  throw new Error(`Don't know how to average input of type ${input.type.kind}`);
};
