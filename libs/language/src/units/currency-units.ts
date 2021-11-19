import { UnitOfMeasure } from './known-units';
import { identity } from '../utils';

export const units: UnitOfMeasure[] = [
  {
    name: 'euro',
    abbreviations: ['eur', '€'],
    baseQuantity: '$EUR',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
  {
    name: 'usdollar',
    abbreviations: ['$', 'usd', 'dollar'],
    baseQuantity: '$USD',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
  {
    name: 'britishpound',
    abbreviations: ['£', 'gbp'],
    baseQuantity: '$GBP',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
  {
    name: 'swedishkrona',
    abbreviations: ['sek'],
    baseQuantity: '$SEK',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
];
