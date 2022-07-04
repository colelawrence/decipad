import { build as t } from '../type';
import { Date as IDate, FractionValue } from '../interpreter/Value';
import { parseUTCDate, Time, TimeQuantity } from '../date';
import { overloadBuiltin } from './overloadBuiltin';
import {
  dateOverloads,
  dateAndTimeQuantityFunctor,
  timeQuantityBinopFunctor,
  addDateAndTimeQuantity,
} from './dateOverloads';
import { F, U } from '../utils';

const plus = overloadBuiltin('+', 2, dateOverloads['+']);
const minus = overloadBuiltin('-', 2, dateOverloads['-']);

describe('common functions', () => {
  it('dateAndTimeQuantityFunctor', () => {
    expect(
      dateAndTimeQuantityFunctor([t.date('month'), t.timeQuantity(['day'])])
        .errorCause
    ).toMatchInlineSnapshot(`[Error: Inference Error: mismatched-specificity]`);

    expect(
      dateAndTimeQuantityFunctor([t.date('day'), t.timeQuantity(['quarter'])])
        .date
    ).toMatchInlineSnapshot(`"day"`);

    expect(
      dateAndTimeQuantityFunctor([t.date('second'), t.timeQuantity(['minute'])])
        .date
    ).toMatchInlineSnapshot(`"second"`);

    expect(
      dateAndTimeQuantityFunctor([t.date('second'), t.timeQuantity(['minute'])])
        .date
    ).toMatchInlineSnapshot(`"second"`);
  });

  it('timeQuantityBinopFunctor', () => {
    expect(
      timeQuantityBinopFunctor([
        t.timeQuantity(['day', 'month']),
        t.timeQuantity(['quarter']),
      ]).unit
    ).toMatchInlineSnapshot(`
      Object {
        "args": Array [
          Object {
            "exp": Fraction(1),
            "known": true,
            "multiplier": Fraction(1),
            "unit": "day",
          },
          Object {
            "exp": Fraction(1),
            "known": true,
            "multiplier": Fraction(1),
            "unit": "month",
          },
          Object {
            "exp": Fraction(1),
            "known": true,
            "multiplier": Fraction(1),
            "unit": "quarter",
          },
        ],
        "type": "units",
      }
    `);
  });

  it('addDateAndTimeQuantity', () => {
    expect(
      addDateAndTimeQuantity(
        IDate.fromDateAndSpecificity(parseUTCDate('2020'), 'year'),
        new TimeQuantity({ year: 1n })
      ).getData()
    ).toEqual(parseUTCDate('2021'));

    expect(
      addDateAndTimeQuantity(
        IDate.fromDateAndSpecificity(parseUTCDate('2020-01-01'), 'day'),
        new TimeQuantity({ year: -1n, month: 1n })
      ).getData()
    ).toEqual(parseUTCDate('2019-02-01'));

    expect(
      addDateAndTimeQuantity(
        IDate.fromDateAndSpecificity(
          parseUTCDate('2020-01-01 10:30'),
          'minute'
        ),
        new TimeQuantity({ hour: 1n })
      ).getData()
    ).toEqual(parseUTCDate('2020-01-01 11:30'));
  });
});

it('date + number', () => {
  expect(
    plus.functor!([t.date('month'), t.number(U('day'))]).errorCause
  ).toMatchInlineSnapshot(`[Error: Inference Error: mismatched-specificity]`);
  expect(
    plus.functor!([t.date('month'), t.number(U('year'))]).date
  ).toMatchInlineSnapshot(`"month"`);
  expect(
    plus.functor!([t.date('day'), t.number(U('year'))]).date
  ).toMatchInlineSnapshot(`"day"`);

  expect(
    plus.fnValues?.(
      [
        IDate.fromDateAndSpecificity(
          BigInt(Number(new Date('2020-01-01'))),
          'day'
        ),
        new FractionValue(F(1)),
      ],
      [t.date('day'), t.number(U('month'))]
    )
  ).toMatchInlineSnapshot(`DeciDate(day 2020-02-01)`);
});

it('date - number', () => {
  expect(
    minus.functor!([t.date('day'), t.number(U('day'))]).date
  ).toMatchInlineSnapshot(`"day"`);

  expect(
    minus.fnValues?.(
      [
        IDate.fromDateAndSpecificity(
          parseUTCDate('2020-01-01T10:30'),
          'minute'
        ),

        FractionValue.fromValue(60),
      ],

      [t.date('minute'), t.number(U('minute'))]
    )
  ).toMatchInlineSnapshot(`DeciDate(minute 2020-01-01 09:30)`);
});

it('date - date => time-quantity', () => {
  expect(minus.functor!([t.date('day'), t.date('day')]).unit)
    .toMatchInlineSnapshot(`
    Object {
      "args": Array [
        Object {
          "exp": Fraction(1),
          "known": true,
          "multiplier": Fraction(1),
          "unit": "day",
        },
      ],
      "type": "units",
    }
  `);
  expect(minus.functor!([t.date('minute'), t.date('minute')]).unit)
    .toMatchInlineSnapshot(`
    Object {
      "args": Array [
        Object {
          "exp": Fraction(1),
          "known": true,
          "multiplier": Fraction(1),
          "unit": "minute",
        },
      ],
      "type": "units",
    }
  `);

  const testDateMinus = (
    date1: string,
    date1Specificity: Time.Specificity,
    date2: string,
    date2Specificity: Time.Specificity
  ) =>
    (
      minus.fnValues?.([
        IDate.fromDateAndSpecificity(parseUTCDate(date1), date1Specificity),
        IDate.fromDateAndSpecificity(parseUTCDate(date2), date2Specificity),
      ]) as FractionValue
    ).value;

  expect(
    testDateMinus('2021-01', 'year', '2021-01', 'year')
  ).toMatchInlineSnapshot(`Fraction(0)`);

  expect(
    testDateMinus('2022-01', 'year', '2021-01', 'year')
  ).toMatchInlineSnapshot(`Fraction(12)`);

  expect(
    testDateMinus('2021-02', 'month', '2021-01', 'month')
  ).toMatchInlineSnapshot(`Fraction(1)`);

  expect(
    testDateMinus('2022-02', 'month', '2021-01', 'month')
  ).toMatchInlineSnapshot(`Fraction(13)`);

  expect(
    testDateMinus('2021-02-01', 'day', '2021-01-01', 'day')
  ).toMatchInlineSnapshot(`Fraction(2678400)`);

  expect(
    testDateMinus('2021-02-01', 'day', '2022-01-01', 'day')
  ).toMatchInlineSnapshot(`Fraction(-28857600)`);

  expect(
    testDateMinus(
      '2021-02-01T10:30',
      'millisecond',
      '2021-02-01T10:31',
      'millisecond'
    )
  ).toMatchInlineSnapshot(`Fraction(-60)`);
});
