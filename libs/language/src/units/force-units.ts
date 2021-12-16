import { UnitOfMeasure } from './known-units';
import { identity } from '../utils';

export const units: UnitOfMeasure[] = [
  {
    name: 'newton',
    abbreviations: ['n'],
    pretty: 'N',
    baseQuantity: 'force',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
];
