import { identity } from '../utils';
import { UnitOfMeasure } from './known-units';

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
    toBaseQuantity: (pascals) => pascals.div(101325),
    fromBaseQuantity: (atmospheres) => atmospheres.mul(101325),
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
    abbreviations: ['torr'],
    toBaseQuantity: (mmhg) => mmhg.div(760),
    fromBaseQuantity: (atmospheres) => atmospheres.mul(760),
  },
  {
    name: 'psi',
    baseQuantity: 'pressure',
    toBaseQuantity: (psi) => psi.div(14.696),
    fromBaseQuantity: (atmospheres) => atmospheres.mul(14.696),
  },
];
