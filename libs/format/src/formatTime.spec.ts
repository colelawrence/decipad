import { formatTime, fromTimeUnitToTimeBase } from './formatTime';
import { parseMilliseconds, parseMonths } from './parseMs';
import { F, makeFractionUnitTuple } from './testUtils';

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
      const [u] = fromTimeUnitToTimeBase(unit, value);
      expect(u).toBeNull();
    });

    it('1 second = 1000 ms', () => {
      const [value, unit] = makeFractionUnitTuple(F(1), 'second');
      const [u, res] = fromTimeUnitToTimeBase(unit, value);
      expect(res.valueOf()).toEqual(1000);
      expect(u && u[0].baseQuantity).toBe('second');
    });
    it('1 year = 12 months', () => {
      const [value, unit] = makeFractionUnitTuple(F(1), 'year');
      const [u, res] = fromTimeUnitToTimeBase(unit, value);
      expect(res.valueOf()).toEqual(12);
      expect(u && u[0].baseQuantity).toBe('month');
    });
  });
  describe('formatTime', () => {
    it('1 banana is not formatted as time', () => {
      const [value, unit] = makeFractionUnitTuple(F(1), 'banana');
      expect(() => formatTime('en-US', unit, value)).toThrow();
    });
    it('1 second = 1s', () => {
      const [value, unit] = makeFractionUnitTuple(F(1), 'second');
      const res = formatTime('en-US', unit, value);
      expect(res).toEqual({
        asStringPrecise: '1 second',
        isPrecise: false,
        partsOf: [
          { type: 'integer', value: '1' },
          { type: 'unit', value: 's' },
        ],
        value: 1,
      });
    });

    it('1/1000 second = 1 ms', () => {
      const [value, unit] = makeFractionUnitTuple(F(1, 1000), 'second');
      const res = formatTime('en-US', unit, value);
      expect(res).toEqual({
        asStringPrecise: '0.001 seconds',
        isPrecise: false,
        partsOf: [
          { type: 'integer', value: '1' },
          { type: 'unit', value: 'ms' },
        ],
        value: 0.001,
      });
    });

    it('1 millisecond = 1ms', () => {
      const [value, unit] = makeFractionUnitTuple(F(1), 'millisecond');
      const res = formatTime('en-US', unit, value);
      expect(res).toEqual({
        asStringPrecise: '1 millisecond',
        isPrecise: false,
        partsOf: [
          { type: 'integer', value: '1' },
          { type: 'unit', value: 'ms' },
        ],
        value: 0.001,
      });
    });

    it('60 second = 1m', () => {
      const [value, unit] = makeFractionUnitTuple(F(60), 'second');
      const res = formatTime('en-US', unit, value);
      expect(res).toEqual({
        asStringPrecise: '60 seconds',
        isPrecise: false,
        partsOf: [
          { type: 'integer', value: '1' },
          { type: 'unit', value: 'm' },
        ],
        value: 60,
      });
    });

    it('90 second = 1m 30s', () => {
      const [value, unit] = makeFractionUnitTuple(F(90), 'second');
      const res = formatTime('en-US', unit, value);
      expect(res).toEqual({
        asStringPrecise: '90 seconds',
        isPrecise: false,
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
      const res = formatTime('en-US', unit, value);
      expect(res).toEqual({
        asStringPrecise: '1.5 hours',
        isPrecise: false,
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
      const res = formatTime('en-US', unit, value);
      expect(res).toEqual({
        asStringPrecise: '1.9 days',
        isPrecise: false,
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

    it('2 weeks = 14 d', () => {
      const [value, unit] = makeFractionUnitTuple(F(2), 'weeks');
      const res = formatTime('en-US', unit, value);
      expect(res).toEqual({
        asStringPrecise: '2 weeks',
        isPrecise: false,
        partsOf: [
          { type: 'integer', value: '14' },
          { type: 'unit', value: 'd' },
        ],
        value: 1209600,
      });
    });

    it('1.5 month = 1.5 mon', () => {
      const [value, unit] = makeFractionUnitTuple(F(3, 2), 'months');
      const res = formatTime('en-US', unit, value);
      expect(res).toEqual({
        asStringPrecise: '1.5 months',
        isPrecise: false,
        partsOf: [
          { type: 'integer', value: '1.5' },
          { type: 'unit', value: 'mon' },
        ],
        value: 1.5,
      });
    });

    it('1500 months = 1cen 2dec 5yea', () => {
      const [value, unit] = makeFractionUnitTuple(F(1500), 'months');
      const res = formatTime('en-US', unit, value);
      expect(res).toEqual({
        asStringPrecise: '1500 months',
        isPrecise: false,
        partsOf: [
          { type: 'integer', value: '1' },
          { type: 'unit', value: 'cen' },
          { type: 'literal', value: ' ' },
          { type: 'integer', value: '2' },
          { type: 'unit', value: 'dec' },
          { type: 'literal', value: ' ' },
          { type: 'integer', value: '5' },
          { type: 'unit', value: 'yea' },
        ],
        value: 1500,
      });
    });

    it('12000 months = 1mil', () => {
      const [value, unit] = makeFractionUnitTuple(F(12000), 'months');
      const res = formatTime('en-US', unit, value);
      expect(res).toEqual({
        asStringPrecise: '12000 months',
        isPrecise: false,
        partsOf: [
          { type: 'integer', value: '1' },
          { type: 'unit', value: 'mil' },
        ],
        value: 12000,
      });
    });

    it('18000 months = 1 mil 5 cen', () => {
      const [value, unit] = makeFractionUnitTuple(F(18000), 'months');
      const res = formatTime('en-US', unit, value);
      expect(res).toEqual({
        asStringPrecise: '18000 months',
        isPrecise: false,
        partsOf: [
          { type: 'integer', value: '1' },
          { type: 'unit', value: 'mil' },
          { type: 'literal', value: ' ' },
          { type: 'integer', value: '5' },
          { type: 'unit', value: 'cen' },
        ],
        value: 18000,
      });
    });

    it('17999 months = 1 mil 4 cen 9 dec 9 yea 11 mon', () => {
      const [value, unit] = makeFractionUnitTuple(F(17999), 'months');
      const res = formatTime('en-US', unit, value);
      expect(res).toEqual({
        asStringPrecise: '17999 months',
        isPrecise: false,
        partsOf: [
          { type: 'integer', value: '1' },
          { type: 'unit', value: 'mil' },
          { type: 'literal', value: ' ' },
          { type: 'integer', value: '4' },
          { type: 'unit', value: 'cen' },
          { type: 'literal', value: ' ' },
          { type: 'integer', value: '9' },
          { type: 'unit', value: 'dec' },
          { type: 'literal', value: ' ' },
          { type: 'integer', value: '9' },
          { type: 'unit', value: 'yea' },
          { type: 'literal', value: ' ' },
          { type: 'integer', value: '11' },
          { type: 'unit', value: 'mon' },
        ],
        value: 17999,
      });
    });

    it('2 seconds in colon = 0:02', () => {
      const [value, unit] = makeFractionUnitTuple(F(2), 'seconds');
      const res = formatTime('en-US', unit, value, { colonNotation: true });
      expect(res).toEqual({
        asStringPrecise: '2 seconds',
        isPrecise: false,
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
      const res = formatTime('en-US', unit, value, { formatSubTime: true });
      expect(res).toEqual({
        asStringPrecise: '0.000001 seconds',
        isPrecise: true,
        partsOf: [
          { type: 'integer', value: '1' },
          { type: 'unit', value: 'µs' },
        ],
        value: 0.000001,
      });
    });

    it('12 months = 1 yea', () => {
      const [value, unit] = makeFractionUnitTuple(F(12), 'months');
      const res = formatTime('en-US', unit, value, { colonNotation: true });
      expect(res).toEqual({
        asStringPrecise: '12 months',
        isPrecise: false,
        partsOf: [
          { type: 'integer', value: '1' },
          { type: 'unit', value: 'yea' },
        ],
        value: 12,
      });
    });
  });
});
