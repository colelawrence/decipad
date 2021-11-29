import { identity } from '../utils';
import { UnitOfMeasure } from './known-units';

export const units: UnitOfMeasure[] = [
  {
    name: 'kelvin',
    abbreviations: ['k'],
    baseQuantity: 'temperature',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
  {
    name: 'celsius',
    abbreviations: ['°c'],
    baseQuantity: 'temperature',
    doesNotScaleOnConversion: true,
    toBaseQuantity: (celsius) => celsius.add(273.15),
    fromBaseQuantity: (kelvin) => kelvin.sub(273.15),
  },
  {
    name: 'fahrenheit',
    abbreviations: ['°f'],
    baseQuantity: 'temperature',
    doesNotScaleOnConversion: true,
    toBaseQuantity: (fahrenheit) =>
      fahrenheit.sub(32).mul(5).div(9).add(273.15),
    fromBaseQuantity: (kelvin) => kelvin.sub(273.15).mul(9).div(5).add(32),
  },
];
