import { N } from '@decipad/number';
import { once } from 'ramda';
import { fromJS, Value } from '../value';
import { Type, buildType as t } from '../type';
import { u } from '../utils';

export interface Constant {
  type: Type;
  value: Value;
}

const builtinConstants = once((): Record<string, Constant> => {
  const pi = {
    type: t.number(),
    value: fromJS(N(3141592653589793, 10 ** 15)),
  };
  const thousand = {
    type: t.number(),
    value: fromJS(N(1_000)),
  };
  const million = {
    type: t.number(),
    value: fromJS(N(1_000_000)),
  };
  const billion = {
    type: t.number(),
    value: fromJS(N(1_000_000_000)),
  };
  const km = {
    type: t.number([
      u('meter', { known: true, baseQuantity: 'length', multiplier: N(1000) }),
    ]),
    value: fromJS(N(1000)),
  };
  return {
    e: {
      type: t.number(),
      value: fromJS(N(2718281828459045, 10 ** 15)),
    },
    pi,
    π: pi,
    thousand,
    thousands: thousand,
    k: thousand,
    million,
    millions: million,
    m: million,
    billion,
    billions: billion,
    b: billion,
    km,
  };
});

export const getConstantByName = (name: string): undefined | Constant => {
  return builtinConstants()[name.toLowerCase()];
};
