import { buildType as t } from '..';
import { TimeQuantity, Date as IDate } from '../interpreter/Value';
import { parseUTCDate } from '../date';
import { overloadBuiltin } from './overloadBuiltin';
import {
  dateOverloads,
  dateAndTimeQuantityFunctor,
  timeQuantityBinopFunctor,
  addDateAndTimeQuantity,
} from './dateOverloads';

const plus = overloadBuiltin('+', 2, dateOverloads['+']);
const minus = overloadBuiltin('-', 2, dateOverloads['-']);

describe('common functions', () => {
  it('dateAndTimeQuantityFunctor', () => {
    expect(
      dateAndTimeQuantityFunctor(t.date('month'), t.timeQuantity(['day']))
        .errorCause
    ).toMatchInlineSnapshot(
      `InferError.mismatchedSpecificity("expectedSpecificity" => "month", "gotSpecificity" => "day")`
    );

    expect(
      dateAndTimeQuantityFunctor(t.date('day'), t.timeQuantity(['quarter']))
        .date
    ).toMatchInlineSnapshot(`"day"`);

    expect(
      dateAndTimeQuantityFunctor(t.date('time'), t.timeQuantity(['minute']))
        .date
    ).toMatchInlineSnapshot(`"time"`);
  });

  it('timeQuantityBinopFunctor', () => {
    expect(
      timeQuantityBinopFunctor(
        t.timeQuantity(['day', 'month']),
        t.timeQuantity(['quarter'])
      ).timeUnits
    ).toMatchInlineSnapshot(`
      Array [
        "day",
        "month",
        "quarter",
      ]
    `);
  });

  it('addDateAndTimeQuantity', () => {
    expect(
      addDateAndTimeQuantity(
        IDate.fromDateAndSpecificity(parseUTCDate('2020'), 'year'),
        new TimeQuantity({ year: 1 })
      ).getData()
    ).toEqual(parseUTCDate('2021'));

    expect(
      addDateAndTimeQuantity(
        IDate.fromDateAndSpecificity(parseUTCDate('2020-01-01'), 'day'),
        new TimeQuantity({ year: -1, month: 1 })
      ).getData()
    ).toEqual(parseUTCDate('2019-02-01'));

    expect(
      addDateAndTimeQuantity(
        IDate.fromDateAndSpecificity(parseUTCDate('2020-01-01 10:30'), 'time'),
        new TimeQuantity({ hour: 1 })
      ).getData()[0]
    ).toEqual(parseUTCDate('2020-01-01 11:30'));
  });
});

it('date + time-quantity', () => {
  expect(
    plus.functor(t.date('month'), t.timeQuantity(['day'])).errorCause
  ).toMatchInlineSnapshot(
    `InferError.mismatchedSpecificity("expectedSpecificity" => "month", "gotSpecificity" => "day")`
  );
  expect(
    plus.functor(t.date('month'), t.timeQuantity(['year'])).date
  ).toMatchInlineSnapshot(`"month"`);
  expect(
    plus.functor(t.date('day'), t.timeQuantity(['year', 'day'])).date
  ).toMatchInlineSnapshot(`"day"`);

  expect(
    plus.fnValues?.(
      IDate.fromDateAndSpecificity(Number(new Date('2020-01-01')), 'day'),
      new TimeQuantity({ month: 1, day: 1 })
    )
  ).toMatchInlineSnapshot(`DeciDate(day 2020-02-02)`);
});

it('time-quantity + date', () => {
  expect(
    plus.functor(t.timeQuantity(['month']), t.date('day')).date
  ).toMatchInlineSnapshot(`"day"`);

  expect(
    plus.fnValues?.(
      new TimeQuantity({ month: 1, day: 1 }),
      IDate.fromDateAndSpecificity(Number(new Date('2020-01-01')), 'day')
    )
  ).toMatchInlineSnapshot(`DeciDate(day 2020-02-02)`);
});

it('time-quantity + time-quantity', () => {
  expect(
    plus.functor(t.timeQuantity(['month']), t.timeQuantity(['day'])).timeUnits
  ).toMatchInlineSnapshot(`
    Array [
      "month",
      "day",
    ]
  `);
  expect(
    plus.functor(t.timeQuantity(['month']), t.timeQuantity(['year'])).timeUnits
  ).toMatchInlineSnapshot(`
    Array [
      "month",
      "year",
    ]
  `);
  expect(
    plus.functor(t.timeQuantity(['month']), t.timeQuantity(['month'])).timeUnits
  ).toMatchInlineSnapshot(`
    Array [
      "month",
    ]
  `);

  expect(
    plus.fnValues?.(
      new TimeQuantity({ month: 1, day: 1 }),
      new TimeQuantity({ quarter: 1, day: 1 })
    )
  ).toMatchInlineSnapshot(`TimeQuantity({ quarter: 1, month: 1, day: 2 })`);
});

it('time-quantity - time-quantity', () => {
  expect(
    minus.functor(t.timeQuantity(['month']), t.timeQuantity(['month']))
      .timeUnits
  ).toMatchInlineSnapshot(`
    Array [
      "month",
    ]
  `);

  expect(
    minus.fnValues?.(
      new TimeQuantity({ month: 1, day: 1 }),
      new TimeQuantity({ quarter: 1, day: 1 })
    )
  ).toMatchInlineSnapshot(`TimeQuantity({ quarter: -1, month: 1, day: 0 })`);
});

it('date - time-quantity', () => {
  expect(
    minus.functor(t.date('day'), t.timeQuantity(['year'])).date
  ).toMatchInlineSnapshot(`"day"`);

  expect(
    minus.fnValues?.(
      IDate.fromDateAndSpecificity(parseUTCDate('2020-01-01'), 'day'),
      new TimeQuantity({ month: 1, day: -1 })
    )
  ).toMatchInlineSnapshot(`DeciDate(day 2019-12-02)`);
});
