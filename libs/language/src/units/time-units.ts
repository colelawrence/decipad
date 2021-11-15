import { identity } from '../utils';
import { UnitOfMeasure } from './known-units';

export const baseUnit = 'second';

export const units: UnitOfMeasure[] = [
  {
    name: 'millisecond',
    baseQuantity: 'second',
    abbreviations: ['ms'],
    toBaseQuantity: (ms) => ms.div(1000),
    fromBaseQuantity: (seconds) => seconds.mul(1000),
  },
  {
    name: 'second',
    baseQuantity: 'second',
    abbreviations: ['sec', 's'],
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
  {
    name: 'minute',
    baseQuantity: 'second',
    toBaseQuantity: (minutes) => minutes.mul(60),
    fromBaseQuantity: (seconds) => seconds.div(60),
  },
  {
    name: 'hour',
    baseQuantity: 'second',
    toBaseQuantity: (hours) => hours.mul(3600),
    fromBaseQuantity: (seconds) => seconds.div(3600),
  },
  {
    name: 'day',
    baseQuantity: 'day',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
  {
    name: 'week',
    baseQuantity: 'day',
    toBaseQuantity: (weeks) => weeks.mul(7),
    fromBaseQuantity: (seconds) => seconds.div(7),
  },
  {
    name: 'month',
    baseQuantity: 'month',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
  {
    name: 'year',
    baseQuantity: 'month',
    toBaseQuantity: (years) => years.mul(12),
    fromBaseQuantity: (years) => years.div(12),
  },
];
