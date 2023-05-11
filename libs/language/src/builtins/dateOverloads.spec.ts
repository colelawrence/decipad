import { ONE } from '@decipad/number';
import { buildType as t } from '../type';
import { DateValue as IDate, NumberValue } from '../value';
import { Time, parseUTCDate } from '../date';
import { overloadBuiltin } from './overloadBuiltin';
import {
  dateOverloads,
  dateAndTimeQuantityFunctor,
  addDateAndTimeQuantity,
} from './dateOverloads';
import { U } from '../utils';
import { materializeOneResult } from '../utils/materializeOneResult';

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
          IDate.fromDateAndSpecificity(parseUTCDate('2020'), 'year'),
          'year',
          1n
        )
      ).getData()
    ).toEqual(parseUTCDate('2021'));

    expect(
      await (
        await addDateAndTimeQuantity(
          await addDateAndTimeQuantity(
            IDate.fromDateAndSpecificity(parseUTCDate('2020-01-01'), 'day'),
            'year',
            -1n
          ),
          'month',
          1n
        )
      ).getData()
    ).toEqual(parseUTCDate('2019-02-01'));

    expect(
      await (
        await addDateAndTimeQuantity(
          IDate.fromDateAndSpecificity(
            parseUTCDate('2020-01-01 10:30'),
            'minute'
          ),
          'hour',
          1n
        )
      ).getData()
    ).toEqual(parseUTCDate('2020-01-01 11:30'));
  });
});

describe('date overloads', () => {
  it('date + number', async () => {
    expect(
      (await plus.functor!([t.date('month'), t.number(U('day'))])).errorCause
    ).toMatchInlineSnapshot(`[Error: Inference Error: mismatched-specificity]`);
    expect(
      (await plus.functor!([t.date('month'), t.number(U('year'))])).date
    ).toMatchInlineSnapshot(`"month"`);
    expect(
      (await plus.functor!([t.date('day'), t.number(U('year'))])).date
    ).toMatchInlineSnapshot(`"day"`);

    expect(
      await plus.fnValues?.(
        [
          IDate.fromDateAndSpecificity(
            BigInt(Number(new Date('2020-01-01'))),
            'day'
          ),
          new NumberValue(ONE),
        ],
        [t.date('day'), t.number(U('month'))]
      )
    ).toMatchInlineSnapshot(`DateValue(day 2020-02-01)`);
  });

  it('date - number', async () => {
    expect(
      (await minus.functor!([t.date('day'), t.number(U('day'))])).date
    ).toMatchInlineSnapshot(`"day"`);

    expect(
      await minus.fnValues?.(
        [
          IDate.fromDateAndSpecificity(
            parseUTCDate('2020-01-01T10:30'),
            'minute'
          ),

          NumberValue.fromValue(60),
        ],

        [t.date('minute'), t.number(U('minute'))]
      )
    ).toMatchInlineSnapshot(`DateValue(minute 2020-01-01 09:30)`);
  });

  it('date - date => time-quantity', async () => {
    expect((await minus.functor!([t.date('day'), t.date('day')])).unit)
      .toMatchInlineSnapshot(`
    Array [
      Object {
        "exp": DeciNumber(1),
        "known": true,
        "multiplier": DeciNumber(1),
        "unit": "day",
      },
    ]
  `);
    expect((await minus.functor!([t.date('minute'), t.date('minute')])).unit)
      .toMatchInlineSnapshot(`
      Array [
        Object {
          "exp": DeciNumber(1),
          "known": true,
          "multiplier": DeciNumber(1),
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
              IDate.fromDateAndSpecificity(
                parseUTCDate(date1),
                date1Specificity
              ),
              IDate.fromDateAndSpecificity(
                parseUTCDate(date2),
                date2Specificity
              ),
            ],
            [t.date(date1Specificity), t.date(date2Specificity)]
          )
        )?.getData()
      );

    expect(
      await testDateMinus('2021-01', 'year', '2021-01', 'year')
    ).toMatchInlineSnapshot(`DeciNumber(0)`);

    expect(
      await testDateMinus('2022-01', 'year', '2021-01', 'year')
    ).toMatchInlineSnapshot(`DeciNumber(12)`);

    expect(
      await testDateMinus('2021-02', 'month', '2021-01', 'month')
    ).toMatchInlineSnapshot(`DeciNumber(1)`);

    expect(
      await testDateMinus('2022-02', 'month', '2021-01', 'month')
    ).toMatchInlineSnapshot(`DeciNumber(13)`);

    expect(
      await testDateMinus('2021-02-01', 'day', '2021-01-01', 'day')
    ).toMatchInlineSnapshot(`DeciNumber(2678400)`);

    expect(
      await testDateMinus('2021-02-01', 'day', '2022-01-01', 'day')
    ).toMatchInlineSnapshot(`DeciNumber(-28857600)`);

    expect(
      await testDateMinus(
        '2021-02-01T10:30',
        'millisecond',
        '2021-02-01T10:31',
        'millisecond'
      )
    ).toMatchInlineSnapshot(`DeciNumber(-60)`);
  });
});
