import { UnitOfMeasure } from './known-units';
import { identity } from '../utils';

export const units: UnitOfMeasure[] = [
  {
    name: 'squaremeter',
    abbreviations: ['m2'],
    baseQuantity: 'area',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
  {
    name: 'acre',
    baseQuantity: 'area',
    toBaseQuantity: (acres) => acres.mul(404686).div(100),
    fromBaseQuantity: (sqm) => sqm.mul(100).div(404686),
  },
  {
    name: 'are',
    abbreviations: ['a'],
    baseQuantity: 'area',
    toBaseQuantity: (ares) => ares.mul(100),
    fromBaseQuantity: (sqm) => sqm.div(100),
  },
];
