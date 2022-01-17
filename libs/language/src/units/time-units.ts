import { UnitOfMeasure } from './known-units';
import { identity, invert } from '../utils';

type Converter = UnitOfMeasure['toBaseQuantity'];
// base: second
const ms: Converter = (x) => x.div(1000);
const minute: Converter = (x) => x.mul(60);
const hour: Converter = (x) => x.mul(3600); // 60*60
const day: Converter = (x) => x.mul(86_400); // 60*60*24
const week: Converter = (x) => x.mul(604_800); // 60*60*24*7
// base: month
const year: Converter = (x) => x.mul(12); // months * 12
const decade: Converter = (x) => x.mul(10 * 12); // year * 10
const century: Converter = (x) => x.mul(100 * 12); // year * 100
const millennium: Converter = (x) => x.mul(1000 * 12); // year * 1000

export const units: UnitOfMeasure[] = [
  {
    name: 'second',
    baseQuantity: 'second',
    abbreviations: ['sec', 's'],
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
  {
    name: 'millisecond',
    baseQuantity: 'second',
    abbreviations: ['ms'],
    toBaseQuantity: ms,
    fromBaseQuantity: invert(ms),
  },
  {
    name: 'minute',
    abbreviations: ['min'],
    baseQuantity: 'second',
    toBaseQuantity: minute,
    fromBaseQuantity: invert(minute),
  },
  {
    name: 'hour',
    abbreviations: ['h'],
    baseQuantity: 'second',
    toBaseQuantity: hour,
    fromBaseQuantity: invert(hour),
  },
  {
    name: 'day',
    baseQuantity: 'second',
    toBaseQuantity: day,
    fromBaseQuantity: invert(day),
  },
  {
    name: 'week',
    baseQuantity: 'second',
    toBaseQuantity: week,
    fromBaseQuantity: invert(week),
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
    toBaseQuantity: year,
    fromBaseQuantity: invert(year),
  },
  {
    name: 'decade',
    baseQuantity: 'month',
    toBaseQuantity: decade,
    fromBaseQuantity: invert(decade),
  },
  {
    name: 'century',
    baseQuantity: 'month',
    toBaseQuantity: century,
    fromBaseQuantity: invert(century),
  },
  {
    name: 'millennium',
    abbreviations: ['millenniums'],
    baseQuantity: 'month',
    toBaseQuantity: millennium,
    fromBaseQuantity: invert(millennium),
  },
];
