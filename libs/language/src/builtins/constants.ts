import { toFraction } from '@decipad/fraction';
import { once } from 'ramda';
import { fromJS, Value } from '../interpreter';
import { Type, build as T } from '../type';

export interface Constant {
  type: Type;
  value: Value;
}

const builtinConstants = once((): Record<string, Constant> => {
  const pi = {
    type: T.number(),
    value: fromJS(toFraction(Math.PI)),
  };
  return {
    e: {
      type: T.number(),
      value: fromJS(toFraction(Math.E)),
    },
    pi,
    π: pi,
  };
});

export const getConstantByName = (name: string): undefined | Constant => {
  return builtinConstants()[name.toLowerCase()];
};
