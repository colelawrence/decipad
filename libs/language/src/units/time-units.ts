import { N } from '@decipad/number';
import type { UnitOfMeasure } from './known-units';
import { identity, invert } from '../utils';

const N_10 = N(10);
const N_1000 = N(1000);
const oneMinute = N(60);
const oneHour = oneMinute.mul(N(60));
const oneDay = oneHour.mul(N(24));
const oneWeek = oneDay.mul(N(7));

const oneDecade = N_10;
const oneCentury = oneDecade.mul(N_10);
const oneMillennium = oneCentury.mul(N_10);

type Converter = UnitOfMeasure['toBaseQuantity'];
// base: second
const ms: Converter = (x) => x.div(N_1000);
const minute: Converter = (x) => x.mul(oneMinute);
const hour: Converter = (x) => x.mul(oneHour);
const day: Converter = (x) => x.mul(oneDay);
const week: Converter = (x) => x.mul(oneWeek);
// base: month
const decade: Converter = (x) => x.mul(oneDecade); // year * 10
const century: Converter = (x) => x.mul(oneCentury); // year * 100
const millennium: Converter = (x) => x.mul(oneMillennium); // year * 1000

export const units: UnitOfMeasure[] = [
  {
    name: 'second',
    baseQuantity: 'second',
    symbols: ['s'],
    aliases: ['sec'],
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
  },
  {
    name: 'millisecond',
    baseQuantity: 'second',
    symbols: ['ms'],
    toBaseQuantity: ms,
    fromBaseQuantity: invert(ms),
  },
  {
    name: 'minute',
    aliases: ['min'],
    baseQuantity: 'second',
    toBaseQuantity: minute,
    fromBaseQuantity: invert(minute),
  },
  {
    name: 'hour',
    symbols: ['h'],
    aliases: ['hr'],
    baseQuantity: 'second',
    toBaseQuantity: hour,
    fromBaseQuantity: invert(hour),
  },
  {
    name: 'day',
    symbols: ['d'],
    baseQuantity: 'second',
    toBaseQuantity: day,
    fromBaseQuantity: invert(day),
  },
  {
    name: 'week',
    aliases: ['wk'],
    baseQuantity: 'second',
    toBaseQuantity: week,
    fromBaseQuantity: invert(week),
  },
  {
    name: 'month',
    aliases: ['mo'],
    baseQuantity: 'month',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
    canConvertTo: (unit) => unit === 'year',
    convertTo: (unit, n) => {
      if (unit !== 'year') {
        throw new Error(`cannot convert month to ${unit}`);
      }
      return n.div(N(12));
    },
  },
  {
    name: 'year',
    aliases: ['yr'],
    baseQuantity: 'year',
    toBaseQuantity: identity,
    fromBaseQuantity: identity,
    canConvertTo: (unit) => unit === 'month',
    convertTo: (unit, n) => {
      if (unit !== 'month') {
        throw new Error(`cannot convert year to ${unit}`);
      }
      return n.mul(N(12));
    },
  },
  {
    name: 'decade',
    baseQuantity: 'year',
    toBaseQuantity: decade,
    fromBaseQuantity: invert(decade),
  },
  {
    name: 'century',
    baseQuantity: 'year',
    toBaseQuantity: century,
    fromBaseQuantity: invert(century),
  },
  {
    name: 'millennium',
    aliases: ['millenniums'],
    baseQuantity: 'year',
    toBaseQuantity: millennium,
    fromBaseQuantity: invert(millennium),
  },
];
