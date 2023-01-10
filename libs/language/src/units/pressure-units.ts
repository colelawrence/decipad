import { N } from '@decipad/number';
import { UnitOfMeasure } from './known-units';
import { identity, invert } from '../utils';

const N_760 = N(760);
const N_1E3 = N(1e3);
const N_14_696 = N(14_696);
const N_101_325 = N(101_325);
const N_1E5 = N(1e5);

type Converter = UnitOfMeasure['toBaseQuantity'];
const pascal: Converter = (x) => x.div(N_101_325);
const bar: Converter = (x) => x.div(N_101_325).mul(N_1E5);
const mmhg: Converter = (x) => x.div(N_760);
const psi: Converter = (x) => x.div(N_14_696).mul(N_1E3);

export const units: UnitOfMeasure[] = [
  {
    name: 'atmosphere',
    symbols: ['atm'],
    baseQuantity: 'pressure',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
  {
    name: 'pascal',
    symbols: ['pa'],
    baseQuantity: 'pressure',
    toBaseQuantity: pascal,
    fromBaseQuantity: invert(pascal),
  },
  {
    name: 'bar',
    symbols: ['ba'],
    baseQuantity: 'pressure',
    toBaseQuantity: bar,
    fromBaseQuantity: invert(bar),
  },
  {
    name: 'mmhg',
    baseQuantity: 'pressure',
    symbols: ['torr'],
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
