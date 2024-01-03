import { formatAnyUnit } from './formatNumber';
import { formatTime, fromTimeUnitToTimeBase } from './formatTime';
import { parseMilliseconds, parseMonths } from './parseMs';
import { F, makeFractionUnitTuple } from './testUtils';

const partsOfWeek = [{ type: 'unit', base: 'second', value: 'weeks' }];
const partsOfMonth = [{ type: 'unit', base: 'month', value: 'months' }];
const partsOfSecond = [{ type: 'unit', base: 'second', value: 'seconds' }];
const partsOfMillisecond = [
  { type: 'unit', base: 'second', value: 'milliseconds' },
];

describe('formatTime', () => {
  describe('parse(Months|Milliseconds)', () => {
    it('can parse zero months', () => {
      expect(parseMonths(0)).toEqual({
        century: 0,
        decade: 0,
        millennium: 0,
        year: 0,
      });
    });
    it('can parse 450 months', () => {
      expect(parseMonths(450)).toEqual({
        century: 0,
        decade: 3,
        millennium: 0,
        year: 7,
      });
    });
    it('can parse 5400000 months', () => {
      expect(parseMonths(5400000)).toEqual({
        century: 0,
        decade: 0,
        millennium: 450,
        year: 0,
      });
    });
    it('can parse 12 months', () => {
      expect(parseMonths(12)).toEqual({
        century: 0,
        decade: 0,
        millennium: 0,
        year: 1,
      });
    });
    it('can parse 36 months', () => {
      expect(parseMonths(36)).toEqual({
        century: 0,
        decade: 0,
        millennium: 0,
        year: 3,
      });
    });
    it('can parse 12036 months', () => {
      expect(parseMonths(12036)).toEqual({
        century: 0,
        decade: 0,
        millennium: 1,
        year: 3,
      });
    });
    it('can parse 12156 months', () => {
      expect(parseMonths(12156)).toEqual({
        century: 0,
        decade: 1,
        millennium: 1,
        year: 3,
      });
    });
    it('can parse 13356 months', () => {
      expect(parseMonths(13356)).toEqual({
        century: 1,
        decade: 1,
        millennium: 1,
        year: 3,
      });
    });

    it('can parse 13358 months', () => {
      expect(parseMonths(13358)).toEqual({
        century: 1,
        decade: 1,
        millennium: 1,
        year: 3,
      });
    });
    it('can parse zero milliseconds', () => {
      expect(parseMilliseconds(0)).toEqual({
        days: 0,
        hours: 0,
        microseconds: 0,
        milliseconds: 0,
        minutes: 0,
        nanoseconds: 0,
        seconds: 0,
      });
    });
  });
  describe('fromTimeUnitToTimeBase', () => {
    it('1 dog = ?', () => {
      const [value, unit] = makeFractionUnitTuple(F(1), 'dog');
      expect(() => fromTimeUnitToTimeBase(unit, value)).toThrow();
    });

    it('1 second = 1000 ms', () => {
      const [value, unit] = makeFractionUnitTuple(F(1), 'second');
      const [res, simplify] = fromTimeUnitToTimeBase(unit, value);
      expect(res.valueOf()).toEqual(1000);
      expect(simplify).toEqual(true);
    });

    it('1 year = 1 year', () => {
      const [value, unit] = makeFractionUnitTuple(F(1), 'year');
      const [res, simplify] = fromTimeUnitToTimeBase(unit, value);
      expect(res.valueOf()).toEqual(1);
      expect(simplify).toEqual(false);
    });

    it('1 week = 1 week', () => {
      const [value, unit] = makeFractionUnitTuple(F(1), 'year');
      const [res, simplify] = fromTimeUnitToTimeBase(unit, value);
      expect(res.valueOf()).toEqual(1);
      expect(simplify).toEqual(false);
    });
  });
  describe('formatTime', () => {
    it('1 banana is not formatted as time', () => {
      const [value, unit] = makeFractionUnitTuple(F(1), 'banana');
      expect(() =>
        formatTime('en-US', unit, value, {}, formatAnyUnit)
      ).toThrow();
    });

    it('1 second = 1s', () => {
      const [value, unit] = makeFractionUnitTuple(F(1), 'second');
      const res = formatTime('en-US', unit, value, {}, formatAnyUnit);
      expect(res).toEqual({
        asStringPrecise: '1 second',
        formatOptions: null,
        isPrecise: true,
        partsOf: [
          { type: 'integer', value: '1' },
          { type: 'unit', value: 's' },
        ],
        value: 1,
      });
    });

    it('1/1000 second = 1 ms', () => {
      const [value, unit] = makeFractionUnitTuple(F(1, 1000), 'second');
      const res = formatTime('en-US', unit, value, {}, formatAnyUnit);
      expect(res).toEqual({
        asStringPrecise: '0.001 seconds',
        formatOptions: null,
        isPrecise: true,
        partsOf: [
          { type: 'integer', value: '1' },
          { type: 'unit', value: 'ms' },
        ],
        value: 0.001,
      });
    });

    it('0 millisecond = 0 milliseconds', () => {
      const [value, unit] = makeFractionUnitTuple(F(0), 'millisecond');
      const res = formatTime('en-US', unit, value, {}, formatAnyUnit);
      expect(res).toEqual({
        asStringPrecise: '0 milliseconds',
        formatOptions: null,
        isPrecise: true,
        partsOf: [
          { type: 'integer', value: '0' },
          { type: 'unit', value: 'milliseconds', partsOf: partsOfMillisecond },
        ],
        value: 0,
      });
    });

    it('0 second = 0 seconds', () => {
      const [value, unit] = makeFractionUnitTuple(F(0), 'second');
      const res = formatTime('en-US', unit, value, {}, formatAnyUnit);
      expect(res).toEqual({
        asStringPrecise: '0 seconds',
        formatOptions: null,
        isPrecise: true,
        partsOf: [
          { type: 'integer', value: '0' },
          { type: 'unit', value: 'seconds', partsOf: partsOfSecond },
        ],
        value: 0,
      });
    });

    it('1 millisecond = 1ms', () => {
      const [value, unit] = makeFractionUnitTuple(F(1), 'millisecond');
      const res = formatTime('en-US', unit, value, {}, formatAnyUnit);
      expect(res).toEqual({
        asStringPrecise: '1 millisecond',
        formatOptions: null,
        isPrecise: true,
        partsOf: [
          { type: 'integer', value: '1' },
          { type: 'unit', value: 'ms' },
        ],
        value: 0.001,
      });
    });

    it('60 second = 1m', () => {
      const [value, unit] = makeFractionUnitTuple(F(60), 'second');
      const res = formatTime('en-US', unit, value, {}, formatAnyUnit);
      expect(res).toEqual({
        asStringPrecise: '60 seconds',
        formatOptions: null,
        isPrecise: true,
        partsOf: [
          { type: 'integer', value: '1' },
          { type: 'unit', value: 'm' },
        ],
        value: 60,
      });
    });

    it('90 second = 1m 30s', () => {
      const [value, unit] = makeFractionUnitTuple(F(90), 'second');
      const res = formatTime('en-US', unit, value, {}, formatAnyUnit);
      expect(res).toEqual({
        asStringPrecise: '90 seconds',
        formatOptions: null,
        isPrecise: true,
        partsOf: [
          { type: 'integer', value: '1' },
          { type: 'unit', value: 'm' },
          { type: 'literal', value: ' ' },
          { type: 'integer', value: '30' },
          { type: 'unit', value: 's' },
        ],
        value: 90,
      });
    });

    it('1.5 hour = 1h 30m', () => {
      const [value, unit] = makeFractionUnitTuple(F(3, 2), 'hour');
      const res = formatTime('en-US', unit, value, {}, formatAnyUnit);
      expect(res).toEqual({
        asStringPrecise: '1.5 hours',
        formatOptions: null,
        isPrecise: true,
        partsOf: [
          { type: 'integer', value: '1' },
          { type: 'unit', value: 'h' },
          { type: 'literal', value: ' ' },
          { type: 'integer', value: '30' },
          { type: 'unit', value: 'm' },
        ],
        value: 5400,
      });
    });

    it('1.9 days = 1d 21h 36m', () => {
      const [value, unit] = makeFractionUnitTuple(F(19, 10), 'days');
      const res = formatTime('en-US', unit, value, {}, formatAnyUnit);
      expect(res).toEqual({
        asStringPrecise: '1.9 days',
        formatOptions: null,
        isPrecise: true,
        partsOf: [
          { type: 'integer', value: '1' },
          { type: 'unit', value: 'd' },
          { type: 'literal', value: ' ' },
          { type: 'integer', value: '21' },
          { type: 'unit', value: 'h' },
          { type: 'literal', value: ' ' },
          { type: 'integer', value: '36' },
          { type: 'unit', value: 'm' },
        ],
        value: 164160,
      });
    });

    it('14 days = 14 days', () => {
      const [value, unit] = makeFractionUnitTuple(F(14), 'days');
      const res = formatTime('en-US', unit, value, {}, formatAnyUnit);
      expect(res).toEqual({
        asStringPrecise: '14 days',
        formatOptions: null,
        isPrecise: true,
        partsOf: [
          { type: 'integer', value: '14' },
          { type: 'unit', value: 'd' },
        ],
        value: 1209600,
      });
    });

    it('2 weeks = 2 weeks', () => {
      const [value, unit] = makeFractionUnitTuple(F(2), 'weeks');
      const res = formatTime('en-US', unit, value, {}, formatAnyUnit);
      expect(res).toEqual({
        asStringPrecise: '2 weeks',
        formatOptions: null,
        isPrecise: true,
        partsOf: [
          { type: 'integer', value: '2' },
          { type: 'unit', value: 'weeks', partsOf: partsOfWeek },
        ],
        value: 2,
      });
    });

    it('1.5 month = 1.5 mon', () => {
      const [value, unit] = makeFractionUnitTuple(F(3, 2), 'months');
      const res = formatTime('en-US', unit, value, {}, formatAnyUnit);
      expect(res).toEqual({
        asStringPrecise: '1.5 months',
        formatOptions: null,
        isPrecise: true,
        partsOf: [
          { type: 'integer', value: '1' },
          { type: 'decimal', value: '.' },
          { type: 'fraction', value: '5' },
          { type: 'unit', value: 'months', partsOf: partsOfMonth },
        ],
        value: 1.5,
      });
    });

    it('2 seconds in colon = 0:02', () => {
      const [value, unit] = makeFractionUnitTuple(F(2), 'seconds');
      const res = formatTime(
        'en-US',
        unit,
        value,
        { colonNotation: true },
        formatAnyUnit
      );
      expect(res).toEqual({
        asStringPrecise: '2 seconds',
        formatOptions: null,
        isPrecise: true,
        partsOf: [
          { type: 'integer', value: '0' },
          { originalValue: 'second', type: 'unit', value: ':' },
          { type: 'integer', value: '02' },
        ],
        value: 2,
      });
    });

    it('1/1000000 seconds in subtime = 1µs', () => {
      const [value, unit] = makeFractionUnitTuple(F(1, 1000000), 'seconds');
      const res = formatTime('en-US', unit, value, {}, formatAnyUnit);
      expect(res).toEqual({
        asStringPrecise: '0.000001 seconds',
        formatOptions: null,
        isPrecise: true,
        partsOf: [
          { type: 'integer', value: '1' },
          { type: 'unit', value: 'µs' },
        ],
        value: 0.000001,
      });
    });

    it('12 months = 12 months', () => {
      const [value, unit] = makeFractionUnitTuple(F(12), 'months');
      const res = formatTime(
        'en-US',
        unit,
        value,
        { colonNotation: true },
        formatAnyUnit
      );
      expect(res).toEqual({
        asStringPrecise: '12 months',
        formatOptions: null,
        isPrecise: true,
        partsOf: [
          { type: 'integer', value: '12' },
          { type: 'unit', value: 'months', partsOf: partsOfMonth },
        ],
        value: 12,
      });
    });
  });
});
