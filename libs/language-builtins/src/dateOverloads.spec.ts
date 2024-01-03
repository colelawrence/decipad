import { ONE, setupDeciNumberSnapshotSerializer } from '@decipad/number';
// eslint-disable-next-line no-restricted-imports
import {
  Value,
  buildType as t,
  Time,
  materializeOneResult,
} from '@decipad/language-types';
import { overloadBuiltin } from './overloadBuiltin';
import {
  dateOverloads,
  dateAndTimeQuantityFunctor,
  addDateAndTimeQuantity,
} from './dateOverloads';
import { U, makeContext } from './utils/testUtils';

setupDeciNumberSnapshotSerializer();

const plus = overloadBuiltin('+', 2, dateOverloads['+']);
const minus = overloadBuiltin('-', 2, dateOverloads['-']);

describe('date overloads common functions', () => {
  it('dateAndTimeQuantityFunctor', async () => {
    expect(
      (
        await dateAndTimeQuantityFunctor([
          t.date('month'),
          t.timeQuantity('day'),
        ])
      ).errorCause
    ).toMatchInlineSnapshot(`[Error: Inference Error: mismatched-specificity]`);

    expect(
      (
        await dateAndTimeQuantityFunctor([
          t.date('day'),
          t.timeQuantity('quarter'),
        ])
      ).date
    ).toMatchInlineSnapshot(`"day"`);

    expect(
      (
        await dateAndTimeQuantityFunctor([
          t.date('second'),
          t.timeQuantity('minute'),
        ])
      ).date
    ).toMatchInlineSnapshot(`"second"`);

    expect(
      (
        await dateAndTimeQuantityFunctor([
          t.date('second'),
          t.timeQuantity('minute'),
        ])
      ).date
    ).toMatchInlineSnapshot(`"second"`);
  });

  it('addDateAndTimeQuantity', async () => {
    expect(
      await (
        await addDateAndTimeQuantity(
          Value.DateValue.fromDateAndSpecificity(
            Time.parseUTCDate('2020'),
            'year'
          ),
          'year',
          1n
        )
      ).getData()
    ).toEqual(Time.parseUTCDate('2021'));

    expect(
      await (
        await addDateAndTimeQuantity(
          await addDateAndTimeQuantity(
            Value.DateValue.fromDateAndSpecificity(
              Time.parseUTCDate('2020-01-01'),
              'day'
            ),
            'year',
            -1n
          ),
          'month',
          1n
        )
      ).getData()
    ).toEqual(Time.parseUTCDate('2019-02-01'));

    expect(
      await (
        await addDateAndTimeQuantity(
          Value.DateValue.fromDateAndSpecificity(
            Time.parseUTCDate('2020-01-01 10:30'),
            'minute'
          ),
          'hour',
          1n
        )
      ).getData()
    ).toEqual(Time.parseUTCDate('2020-01-01 11:30'));
  });
});

describe('date overloads', () => {
  it('date + number', async () => {
    expect(
      (
        await plus.functor!(
          [t.date('month'), t.number(U('day'))],
          [],
          makeContext()
        )
      ).errorCause
    ).toMatchInlineSnapshot(`[Error: Inference Error: mismatched-specificity]`);
    expect(
      (
        await plus.functor!(
          [t.date('month'), t.number(U('year'))],
          [],
          makeContext()
        )
      ).date
    ).toMatchInlineSnapshot(`"month"`);
    expect(
      (
        await plus.functor!(
          [t.date('day'), t.number(U('year'))],
          [],
          makeContext()
        )
      ).date
    ).toMatchInlineSnapshot(`"day"`);

    expect(
      await plus.fnValues?.(
        [
          Value.DateValue.fromDateAndSpecificity(
            BigInt(Number(new Date('2020-01-01'))),
            'day'
          ),
          new Value.NumberValue(ONE),
        ],

        [t.date('day'), t.number(U('month'))],
        makeContext()
      )
    ).toMatchInlineSnapshot(`
      DateValue {
        "moment": 1580515200000n,
        "specificity": "day",
      }
    `);
  });

  it('date - number', async () => {
    expect(
      (
        await minus.functor!(
          [t.date('day'), t.number(U('day'))],
          [],
          makeContext()
        )
      ).date
    ).toMatchInlineSnapshot(`"day"`);

    expect(
      await minus.fnValues?.(
        [
          Value.DateValue.fromDateAndSpecificity(
            Time.parseUTCDate('2020-01-01T10:30'),
            'minute'
          ),
          Value.NumberValue.fromValue(60),
        ],

        [t.date('minute'), t.number(U('minute'))],
        makeContext()
      )
    ).toMatchInlineSnapshot(`
      DateValue {
        "moment": 1577871000000n,
        "specificity": "minute",
      }
    `);
  });

  it('date - date => time-quantity', async () => {
    expect(
      (await minus.functor!([t.date('day'), t.date('day')], [], makeContext()))
        .unit
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "exp": DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 1n,
            "s": 1n,
          },
          "known": true,
          "multiplier": DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 1n,
            "s": 1n,
          },
          "unit": "day",
        },
      ]
    `);
    expect(
      (
        await minus.functor!(
          [t.date('minute'), t.date('minute')],
          [],
          makeContext()
        )
      ).unit
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "exp": DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 1n,
            "s": 1n,
          },
          "known": true,
          "multiplier": DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 1n,
            "s": 1n,
          },
          "unit": "minute",
        },
      ]
    `);

    const testDateMinus = async (
      date1: string,
      date1Specificity: Time.Specificity,
      date2: string,
      date2Specificity: Time.Specificity
    ) =>
      materializeOneResult(
        (
          await minus.fnValues?.(
            [
              Value.DateValue.fromDateAndSpecificity(
                Time.parseUTCDate(date1),
                date1Specificity
              ),
              Value.DateValue.fromDateAndSpecificity(
                Time.parseUTCDate(date2),
                date2Specificity
              ),
            ],
            [t.date(date1Specificity), t.date(date2Specificity)],
            makeContext()
          )
        )?.getData()
      );

    expect(await testDateMinus('2021-01', 'year', '2021-01', 'year'))
      .toMatchInlineSnapshot(`
      DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 0n,
        "s": 1n,
      }
    `);

    expect(await testDateMinus('2022-01', 'year', '2021-01', 'year'))
      .toMatchInlineSnapshot(`
      DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 1n,
        "s": 1n,
      }
    `);

    expect(await testDateMinus('2021-02', 'month', '2021-01', 'month'))
      .toMatchInlineSnapshot(`
      DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 1n,
        "s": 1n,
      }
    `);

    expect(await testDateMinus('2022-02', 'month', '2021-01', 'month'))
      .toMatchInlineSnapshot(`
      DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 13n,
        "s": 1n,
      }
    `);

    expect(await testDateMinus('2021-02-01', 'day', '2021-01-01', 'day'))
      .toMatchInlineSnapshot(`
      DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 2678400n,
        "s": 1n,
      }
    `);

    expect(await testDateMinus('2021-02-01', 'day', '2022-01-01', 'day'))
      .toMatchInlineSnapshot(`
      DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 28857600n,
        "s": -1n,
      }
    `);

    expect(
      await testDateMinus(
        '2021-02-01T10:30',
        'millisecond',
        '2021-02-01T10:31',
        'millisecond'
      )
    ).toMatchInlineSnapshot(`
      DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 60n,
        "s": -1n,
      }
    `);
  });
});
