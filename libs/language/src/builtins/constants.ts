import { N } from '@decipad/number';
import { once } from 'ramda';
import { fromJS, Value } from '../value';
import { Type, build as t } from '../type';

export interface Constant {
  type: Type;
  value: Value;
}

const builtinConstants = once((): Record<string, Constant> => {
  const pi = {
    type: t.number(),
    value: fromJS(N(3141592653589793, 10 ** 15)),
  };
  return {
    e: {
      type: t.number(),
      value: fromJS(N(2718281828459045, 10 ** 15)),
    },
    pi,
    π: pi,
  };
});

export const getConstantByName = (name: string): undefined | Constant => {
  return builtinConstants()[name.toLowerCase()];
};
