import { UnitOfMeasure } from './known-units';
import { identity, invert } from '../utils';

type Converter = UnitOfMeasure['toBaseQuantity'];
const pascal: Converter = (x) => x.div(101_325);
const bar: Converter = (x) => x.div(101_325).mul(1e5);
const mmhg: Converter = (x) => x.div(760);
const psi: Converter = (x) => x.div(14_696).mul(1e3);

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
    toBaseQuantity: pascal,
    fromBaseQuantity: invert(pascal),
  },
  {
    name: 'bar',
    abbreviations: ['ba'],
    baseQuantity: 'pressure',
    toBaseQuantity: bar,
    fromBaseQuantity: invert(bar),
  },
  {
    name: 'mmhg',
    baseQuantity: 'pressure',
    abbreviations: ['torr'],
    toBaseQuantity: mmhg,
    fromBaseQuantity: invert(mmhg),
  },
  {
    name: 'psi',
    baseQuantity: 'pressure',
    toBaseQuantity: psi,
    fromBaseQuantity: invert(psi),
  },
];
