import { identity } from '../utils';
import { UnitOfMeasure } from './known-units';

export const baseUnit = 'atmosphere';

export const units: UnitOfMeasure[] = [
  {
    name: 'atmosphere',
    abbreviations: ['atm'],
    baseQuantity: 'pressure',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
  {
    name: 'pascal',
    abbreviations: ['pa'],
    baseQuantity: 'pressure',
    toBaseQuantity: (pascals) => pascals.mul(9.86923e-6),
    fromBaseQuantity: (atmospheres) => atmospheres.div(9.86923e-6),
  },
  {
    name: 'bar',
    abbreviations: ['ba'],
    baseQuantity: 'pressure',
    toBaseQuantity: (bars) => bars.div(1.01325),
    fromBaseQuantity: (atmospheres) => atmospheres.mul(1.01325),
  },
  {
    name: 'mmhg',
    baseQuantity: 'pressure',
    toBaseQuantity: (mmhg) => mmhg.div(760),
    fromBaseQuantity: (atmospheres) => atmospheres.mul(760),
  },
];
