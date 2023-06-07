import { N } from '@decipad/number';
import { once } from '@decipad/utils';
import { fromJS, UnknownValue, Value } from '../value';
import { Type, buildType as t } from '../type';
import { u } from '../utils';

export interface Constant {
  name: string;
  type: Type;
  value: Value;
}

const builtinConstants = once((): Record<string, Constant> => {
  const pi = {
    name: 'π',
    type: t.number(),
    value: fromJS(N(3141592653589793, 10 ** 15)),
  };
  const thousand = {
    name: 'thousand',
    type: t.number(),
    value: fromJS(N(1_000)),
  };
  const million = {
    name: 'million',
    type: t.number(),
    value: fromJS(N(1_000_000)),
  };
  const billion = {
    name: 'billion',
    type: t.number(),
    value: fromJS(N(1_000_000_000)),
  };
  const km = {
    name: 'km',
    type: t.number([
      u('meter', { known: true, baseQuantity: 'length', multiplier: N(1000) }),
    ]),
    value: fromJS(N(1000)),
  };
  return {
    unknown: {
      name: 'unknown',
      type: t.nothing(),
      value: UnknownValue,
    },
    e: {
      name: 'e',
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
