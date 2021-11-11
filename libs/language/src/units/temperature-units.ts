import { identity } from '../utils';
import { UnitOfMeasure } from './known-units';

export const baseUnit = 'kelvin';

export const units: UnitOfMeasure[] = [
  {
    name: 'kelvin',
    baseQuantity: 'temperature',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
  {
    name: 'celsius',
    baseQuantity: 'temperature',
    toBaseQuantity: (celsius) => celsius + 273.15,
    fromBaseQuantity: (kelvin) => kelvin - 273.15,
  },
  {
    name: 'fahrenheit',
    baseQuantity: 'temperature',
    toBaseQuantity: (fahrenheit) => (fahrenheit - 32) * (5 / 9) + 273.15,
    fromBaseQuantity: (kelvin) => ((kelvin - 273.15) * 9) / 5 + 32,
  },
];
