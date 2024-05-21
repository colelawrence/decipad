// eslint-disable-next-line no-restricted-imports
// eslint-disable-next-line no-restricted-imports
import { Value, buildType as t } from '@decipad/language-types';
import { N } from '@decipad/number';
import { once } from '@decipad/utils';
import type { Constant } from '@decipad/language-interfaces';

const builtinConstants = once((): Record<string, Constant> => {
  const pi = {
    name: 'π',
    type: t.number(),
    value: Value.fromJS(N(3141592653589793, 10 ** 15)),
  };
  const thousand = {
    name: 'thousand',
    type: t.number(),
    value: Value.fromJS(N(1_000)),
  };
  const million = {
    name: 'million',
    type: t.number(),
    value: Value.fromJS(N(1_000_000)),
  };
  const billion = {
    name: 'billion',
    type: t.number(),
    value: Value.fromJS(N(1_000_000_000)),
  };
  const km = {
    name: 'km',
    type: t.number([
      {
        unit: 'meter',
        exp: N(1),
        known: true,
        baseQuantity: 'length',
        multiplier: N(1000),
      },
    ]),
    value: Value.fromJS(N(1000)),
  };
  return {
    unknown: {
      name: 'unknown',
      type: t.nothing(),
      value: Value.UnknownValue,
    },
    e: {
      name: 'e',
      type: t.number(),
      value: Value.fromJS(N(2718281828459045, 10 ** 15)),
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
