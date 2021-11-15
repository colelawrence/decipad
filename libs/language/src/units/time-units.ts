import { identity } from '../utils';
import { UnitOfMeasure } from './known-units';

export const baseUnit = 'second';

export const units: UnitOfMeasure[] = [
  {
    name: 'millisecond',
    baseQuantity: 'time',
    abbreviations: ['ms'],
    toBaseQuantity: (ms) => ms / 1000,
    fromBaseQuantity: (seconds) => seconds * 1000,
  },
  {
    name: 'second',
    baseQuantity: 'time',
    abbreviations: ['sec', 's'],
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
  {
    name: 'minute',
    baseQuantity: 'time',
    toBaseQuantity: (minutes) => minutes * 60,
    fromBaseQuantity: (seconds) => seconds / 60,
  },
  {
    name: 'hour',
    baseQuantity: 'time',
    toBaseQuantity: (hours) => hours * 3600,
    fromBaseQuantity: (seconds) => seconds / 3600,
  },
  {
    name: 'day',
    baseQuantity: 'time',
    toBaseQuantity: (days) => days * 86400,
    fromBaseQuantity: (seconds) => seconds / 86400,
  },
  {
    name: 'week',
    baseQuantity: 'time',
    toBaseQuantity: (weeks) => weeks * 604800,
    fromBaseQuantity: (seconds) => seconds / 604800,
  },
  {
    name: 'month',
    baseQuantity: 'time',
    toBaseQuantity: () => {
      throw new TypeError(`Don't know how to convert months to seconds`);
    },
    fromBaseQuantity: () => {
      throw new TypeError(`Don't know how to seconds to months`);
    },
  },
  {
    name: 'year',
    baseQuantity: 'time',
    toBaseQuantity: () => {
      throw new TypeError(`Don't know how to convert years to seconds`);
    },
    fromBaseQuantity: () => {
      throw new TypeError(`Don't know how to seconds to years`);
    },
  },
];
