import { N } from '@decipad/number';
import { identity } from '../utils';
import type { UnitOfMeasure } from './known-units';

export const units: UnitOfMeasure[] = [
  {
    name: 'kelvin',
    pretty: 'kelvin',
    baseQuantity: 'temperature',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
  {
    name: 'celsius',
    symbols: ['°c'],
    pretty: '°C',
    baseQuantity: 'temperature',
    doesNotScaleOnConversion: true,
    toBaseQuantity: (celsius) => celsius.add(N(27315, 100)),
    fromBaseQuantity: (kelvin) => kelvin.sub(N(27315, 100)),
  },
  {
    name: 'fahrenheit',
    symbols: ['°f'],
    baseQuantity: 'temperature',
    pretty: '°F',
    doesNotScaleOnConversion: true,
    toBaseQuantity: (fahrenheit) =>
      fahrenheit.sub(N(32)).mul(N(5)).div(N(9)).add(N(27315, 100)),
    fromBaseQuantity: (kelvin) =>
      kelvin.sub(N(27315, 100)).mul(N(9)).div(N(5)).add(N(32)),
  },
];
