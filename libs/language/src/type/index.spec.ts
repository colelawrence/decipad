import produce from 'immer';

import { N } from '@decipad/number';
import { l, u, U } from '../utils';
import { InferError } from './InferError';
import { inverseExponent, setExponent } from './units';
import { Type, buildType as t } from './index';
import type { Unit } from './unit-type';

const meter = u('meters');
const second = u('seconds');

const invMeter: Unit = inverseExponent(meter);
const invSecond: Unit = inverseExponent(second);

const numberInMeter = t.number([meter]);
const numberInMeterBySecond = t.number([meter, second]);
const numberInMeterPerSecond = t.number([meter, invSecond]);

describe('sameAs', () => {
  it('checks if the types are completely equal', async () => {
    const sameAsItself = async (t: Type) => {
      expect(await t.sameAs(t)).toEqual(t);
    };

    await sameAsItself(t.number());
    await sameAsItself(t.string());
    await sameAsItself(t.number([meter]));
    await sameAsItself(t.number([second, meter]));
    await sameAsItself(t.column(t.number()));
    await sameAsItself(t.column(t.row([t.number(), t.string()], ['A', 'B'])));
    await sameAsItself(
      t.table({
        columnNames: ['A', 'B'],
        columnTypes: [t.number([meter]), t.column(t.boolean())],
      })
    );
  });

  it('checks scalar types and lack thereof', async () => {
    expect((await t.number().sameAs(t.string())).errorCause).not.toBeNull();

    expect(
      (await t.number().sameAs(t.column(t.string()))).errorCause
    ).not.toBeNull();
  });

  const n = (...units: Unit[]) => t.number(units);

  it('sameAs checks units', async () => {
    expect(n(meter)).toEqual(numberInMeter);
    expect(n(meter, second)).toEqual(numberInMeterBySecond);

    expect(await n(meter).sameAs(n(meter))).toEqual(n(meter));

    // Mismatched units
    expect((await n(meter).sameAs(n(second))).errorCause).toEqual(
      InferError.expectedUnit([second], [meter])
    );
    expect((await n(meter, second).sameAs(n(second))).errorCause).toEqual(
      InferError.expectedUnit([second], [meter, second])
    );
  });

  it('checks tables are the same', async () => {
    const table = t.table({
      columnNames: ['A', 'B'],
      columnTypes: [t.number([meter]), t.column(t.boolean())],
      indexName: 'Table1',
    });

    const getError = async (recipe: (t: Type) => void) =>
      (await table.sameAs(produce(table, recipe))).errorCause;

    expect(
      await getError((table) => {
        table.columnNames?.push('Heyy');
        table.columnTypes?.push(t.number());
      })
    ).not.toBeNull();

    // Column comparisons are done with sameAs
    expect(
      await getError((table) => {
        table.node = l('A different source node should not change the outcome');
      })
    ).toBeNull();
  });
});

describe('Type.combine', () => {
  it('returns the last type', async () => {
    expect(await Type.combine(t.number(), t.string())).toEqual(t.string());
  });

  it('returns any error in the args', async () => {
    const badType = t.impossible('');
    expect(await Type.combine(t.number(), badType)).toEqual(badType);
    expect(await Type.combine(badType, t.number())).toEqual(badType);
  });
});

describe('new columns and tables', () => {
  it('Can reduce one dimension off the top', async () => {
    expect(await t.column(t.string()).reduced()).toEqual(t.string());
    expect(await t.column(t.column(t.string())).reduced()).toEqual(
      t.column(t.string())
    );

    expect((await t.string().reduced()).errorCause).not.toBeNull();
    expect(
      (
        await t
          .table({
            columnNames: ['A'],
            columnTypes: [t.number()],
          })
          .reduced()
      ).errorCause
    ).not.toBeNull();

    expect(
      (await t.row([t.string()], ['X']).reduced()).errorCause
    ).not.toBeNull();
  });
});

describe('Impossible types', () => {
  it('returns an impossible type', async () => {
    const type = t.string();

    expect((await type.isScalar('boolean')).errorCause).toEqual(
      InferError.expectedButGot(t.boolean(), t.string())
    );

    const differentType = t.number();
    expect((await type.sameAs(differentType)).errorCause).toEqual(
      InferError.expectedButGot(t.number(), t.string())
    );
  });

  it('propagates impossibility', async () => {
    const imp = t.impossible('imp 1');
    const imp2 = t.impossible('imp 2');

    expect(await imp.sameAs(imp2)).toEqual(imp);
    expect(await t.number().sameAs(imp2)).toEqual(imp2);

    expect(await imp.isScalar('string')).toEqual(imp);

    expect(await imp.multiplyUnit([meter])).toEqual(imp);
    expect(await imp.divideUnit([meter])).toEqual(imp);

    expect(imp.withErrorCause('ignored different error')).toEqual(imp);
  });
});

describe('divideUnit', () => {
  it('divides units', async () => {
    expect(await t.number([meter]).divideUnit([second])).toEqual(
      numberInMeterPerSecond
    );
  });

  it('exponentiates units', async () => {
    expect(await t.number([invSecond]).divideUnit([second])).toEqual(
      t.number([setExponent(second, N(-2))])
    );

    expect(
      await t.number([setExponent(second, N(-2))]).divideUnit([second])
    ).toEqual(t.number([setExponent(second, N(-3))]));
  });

  it('exponentiation that results in 0-exponent eliminates the unit', async () => {
    expect(await t.number([meter]).divideUnit([meter])).toEqual(t.number());
  });

  it('divides units even further', async () => {
    expect(
      (await t.number([meter, invSecond]).divideUnit([u('USD')])).unit
    ).toEqual([
      setExponent(u('USD'), N(-1)), // first because of sort
      meter,
      invSecond,
    ]);
  });

  it('maintains units when one of the operands is unitless', async () => {
    expect(await t.number([meter]).divideUnit(null)).toEqual(t.number([meter]));
    expect(await t.number().divideUnit([invMeter])).toEqual(t.number([meter]));
  });
});

describe('multiplyUnit', () => {
  it('multiplies units', async () => {
    expect(await numberInMeterPerSecond.multiplyUnit([second])).toEqual(
      t.number([meter])
    );
  });

  it('when one of the numbers has no unit, the other unit prevails', async () => {
    expect(await t.number([meter, second]).multiplyUnit(null)).toEqual(
      t.number([meter, second])
    );
    expect(await t.number().multiplyUnit([meter, second])).toEqual(
      t.number([meter, second])
    );
  });

  it('eliminates units that are opposite on both sides', async () => {
    expect(
      await t.number([invMeter, invSecond]).multiplyUnit([meter, second])
    ).toEqual(t.number());
  });
});

describe('ranges', () => {
  it('types can check rangeness', async () => {
    const ranged = await t.number().isRange();
    expect(ranged).toEqual(await t.number().expected('range'));
  });

  it('rangeness is checked with sameAs', async () => {
    const nrange = t.range(t.number());
    const srange = t.range(t.string());

    expect(await nrange.sameAs(nrange)).toEqual(nrange);

    expect((await nrange.sameAs(srange)).errorCause).toEqual(
      InferError.expectedButGot(t.string(), t.number())
    );

    expect((await nrange.sameAs(t.number())).errorCause).toEqual(
      InferError.expectedButGot(t.number(), nrange)
    );

    expect((await t.number().sameAs(nrange)).errorCause).toEqual(
      InferError.expectedButGot(nrange, t.number())
    );
  });
});

describe('dates', () => {
  const month = t.date('month');
  const day = t.date('day');

  it('can be checked', async () => {
    expect(await month.isDate('month')).toEqual(month);

    expect(await month.isDate('day')).toEqual(
      await month.expected(t.date('day'))
    );

    expect(await day.isDate('month')).toEqual(
      await day.expected(t.date('month'))
    );

    expect(await t.number().isDate('month')).toEqual(
      await t.number().expected(t.date('month'))
    );
  });

  it('can be checked without specificity', async () => {
    expect(await day.isDate()).toEqual(day);
  });

  it('can be compared with other types', async () => {
    expect(await month.sameAs(month)).toEqual(month);

    // Differing dateness
    expect(await t.number().sameAs(day)).toEqual(
      await t.number().expected(day)
    );

    expect(await day.sameAs(t.number())).toEqual(
      await day.expected(t.number())
    );

    // Differing specificity
    expect(await month.sameAs(day)).toEqual(await month.expected(day));

    expect(await month.sameAs(day)).toEqual(await month.sameAs(day));
  });
});

it('time quantities', async () => {
  const q = t.timeQuantity('quarter');
  expect(q.unit).toEqual(U(['quarter'].map((unit) => u(unit))));

  expect(await q.isTimeQuantity()).toEqual(q);

  expect((await t.number().isTimeQuantity()).errorCause).not.toBeNull();
});
