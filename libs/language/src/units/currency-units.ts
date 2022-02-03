import { UnitOfMeasure } from './known-units';
import { identity } from '../utils';

export const units: UnitOfMeasure[] = [
  {
    name: 'euro',
    symbols: ['€', 'eur'],
    baseQuantity: 'EUR',
    pretty: '€',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
  {
    name: 'usdollar',
    symbols: ['$', 'usd'],
    aliases: ['dollar'],
    baseQuantity: 'USD',
    pretty: '$',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
  {
    name: 'britishpound',
    symbols: ['£', 'gbp'],
    baseQuantity: 'GBP',
    pretty: '£',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
  {
    name: 'swedishkrona',
    symbols: ['sek'],
    baseQuantity: 'SEK',
    pretty: 'kr',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
  {
    name: 'scarab',
    symbols: ['¤', 'xxx'],
    baseQuantity: 'XXX',
    pretty: '¤',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
  {
    name: 'norwegiankrona',
    symbols: ['nok'],
    baseQuantity: 'NOK',
    pretty: 'kr',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
];
