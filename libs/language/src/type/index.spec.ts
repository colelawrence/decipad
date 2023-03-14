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
  it('checks if the types are completely equal', () => {
    const sameAsItself = (t: Type) => {
      expect(t.sameAs(t)).toEqual(t);
    };

    sameAsItself(t.number());
    sameAsItself(t.string());
    sameAsItself(t.number([meter]));
    sameAsItself(t.number([second, meter]));
    sameAsItself(t.column(t.number(), 6));
    sameAsItself(t.column(t.row([t.number(), t.string()], ['A', 'B']), 6));
    sameAsItself(
      t.table({
        columnNames: ['A', 'B'],
        columnTypes: [t.number([meter]), t.column(t.boolean(), 10)],
      })
    );
  });

  it('checks scalar types and lack thereof', () => {
    expect(t.number().sameAs(t.string()).errorCause).not.toBeNull();

    expect(
      t.number().sameAs(t.column(t.string(), 1)).errorCause
    ).not.toBeNull();
  });

  const n = (...units: Unit[]) => t.number(units);

  it('sameAs checks units', () => {
    expect(n(meter)).toEqual(numberInMeter);
    expect(n(meter, second)).toEqual(numberInMeterBySecond);

    expect(n(meter).sameAs(n(meter))).toEqual(n(meter));

    // Mismatched units
    expect(n(meter).sameAs(n(second)).errorCause).toEqual(
      InferError.expectedUnit([second], [meter])
    );
    expect(n(meter, second).sameAs(n(second)).errorCause).toEqual(
      InferError.expectedUnit([second], [meter, second])
    );
  });

  it('checks tables are the same', () => {
    const table = t.table({
      columnNames: ['A', 'B'],
      columnTypes: [t.number([meter]), t.column(t.boolean(), 10)],
      indexName: 'Table1',
    });

    const getError = (recipe: (t: Type) => void) =>
      table.sameAs(produce(table, recipe)).errorCause;

    expect(
      getError((table) => {
        table.columnNames?.push('Heyy');
        table.columnTypes?.push(t.number());
      })
    ).not.toBeNull();

    // Column comparisons are done with sameAs
    expect(
      getError((table) => {
        table.node = l('A different source node should not change the outcome');
      })
    ).toBeNull();
  });
});

describe('Type.combine', () => {
  it('returns the last type', () => {
    expect(Type.combine(t.number(), t.string())).toEqual(t.string());
  });

  it('returns any error in the args', () => {
    const badType = t.impossible('');
    expect(Type.combine(t.number(), badType)).toEqual(badType);
    expect(Type.combine(badType, t.number())).toEqual(badType);
  });
});

describe('new columns and tables', () => {
  it('Can reduce one dimension off the top', () => {
    expect(t.column(t.string(), 3).reduced()).toEqual(t.string());
    expect(t.column(t.column(t.string(), 3), 1).reduced()).toEqual(
      t.column(t.string(), 3)
    );

    expect(t.string().reduced().errorCause).not.toBeNull();
    expect(
      t
        .table({
          columnNames: ['A'],
          columnTypes: [t.number()],
        })
        .reduced().errorCause
    ).not.toBeNull();

    expect(t.row([t.string()], ['X']).reduced().errorCause).not.toBeNull();
  });
});

describe('Impossible types', () => {
  it('returns an impossible type', () => {
    const type = t.string();

    expect(type.isScalar('boolean').errorCause).toEqual(
      InferError.expectedButGot(t.boolean(), t.string())
    );

    const differentType = t.number();
    expect(type.sameAs(differentType).errorCause).toEqual(
      InferError.expectedButGot(t.number(), t.string())
    );
  });

  it('propagates impossibility', () => {
    const imp = t.impossible('imp 1');
    const imp2 = t.impossible('imp 2');

    expect(imp.sameAs(imp2)).toEqual(imp);
    expect(t.number().sameAs(imp2)).toEqual(imp2);

    expect(imp.isScalar('string')).toEqual(imp);

    expect(imp.multiplyUnit([meter])).toEqual(imp);
    expect(imp.divideUnit([meter])).toEqual(imp);

    expect(imp.withErrorCause('ignored different error')).toEqual(imp);
  });
});

describe('divideUnit', () => {
  it('divides units', () => {
    expect(t.number([meter]).divideUnit([second])).toEqual(
      numberInMeterPerSecond
    );
  });

  it('exponentiates units', () => {
    expect(t.number([invSecond]).divideUnit([second])).toEqual(
      t.number([setExponent(second, N(-2))])
    );

    expect(t.number([setExponent(second, N(-2))]).divideUnit([second])).toEqual(
      t.number([setExponent(second, N(-3))])
    );
  });

  it('exponentiation that results in 0-exponent eliminates the unit', () => {
    expect(t.number([meter]).divideUnit([meter])).toEqual(t.number());
  });

  it('divides units even further', () => {
    expect(t.number([meter, invSecond]).divideUnit([u('USD')]).unit).toEqual([
      setExponent(u('USD'), N(-1)), // first because of sort
      meter,
      invSecond,
    ]);
  });

  it('maintains units when one of the operands is unitless', () => {
    expect(t.number([meter]).divideUnit(null)).toEqual(t.number([meter]));
    expect(t.number().divideUnit([invMeter])).toEqual(t.number([meter]));
  });
});

describe('multiplyUnit', () => {
  it('multiplies units', () => {
    expect(numberInMeterPerSecond.multiplyUnit([second])).toEqual(
      t.number([meter])
    );
  });

  it('when one of the numbers has no unit, the other unit prevails', () => {
    expect(t.number([meter, second]).multiplyUnit(null)).toEqual(
      t.number([meter, second])
    );
    expect(t.number().multiplyUnit([meter, second])).toEqual(
      t.number([meter, second])
    );
  });

  it('eliminates units that are opposite on both sides', () => {
    expect(
      t.number([invMeter, invSecond]).multiplyUnit([meter, second])
    ).toEqual(t.number());
  });
});

describe('ranges', () => {
  it('types can check rangeness', () => {
    const ranged = t.number().isRange();

    expect(ranged).toEqual(t.number().expected('range'));
  });

  it('rangeness is checked with sameAs', () => {
    const nrange = t.range(t.number());
    const srange = t.range(t.string());

    expect(nrange.sameAs(nrange)).toEqual(nrange);

    expect(nrange.sameAs(srange).errorCause).toEqual(
      InferError.expectedButGot(t.string(), t.number())
    );

    expect(nrange.sameAs(t.number()).errorCause).toEqual(
      InferError.expectedButGot(t.number(), nrange)
    );

    expect(t.number().sameAs(nrange).errorCause).toEqual(
      InferError.expectedButGot(nrange, t.number())
    );
  });
});

describe('dates', () => {
  const month = t.date('month');
  const day = t.date('day');

  it('can be checked', () => {
    expect(month.isDate('month')).toEqual(month);

    expect(month.isDate('day')).toEqual(month.expected(t.date('day')));

    expect(day.isDate('month')).toEqual(day.expected(t.date('month')));

    expect(t.number().isDate('month')).toEqual(
      t.number().expected(t.date('month'))
    );
  });

  it('can be checked without specificity', () => {
    expect(day.isDate()).toEqual(day);
  });

  it('can be compared with other types', () => {
    expect(month.sameAs(month)).toEqual(month);

    // Differing dateness
    expect(t.number().sameAs(day)).toEqual(t.number().expected(day));

    expect(day.sameAs(t.number())).toEqual(day.expected(t.number()));

    // Differing specificity
    expect(month.sameAs(day)).toEqual(month.expected(day));

    expect(month.sameAs(day)).toEqual(month.sameAs(day));
  });
});

it('time quantities', () => {
  const q = t.timeQuantity('quarter');
  expect(q.unit).toEqual(U(['quarter'].map((unit) => u(unit))));

  expect(q.isTimeQuantity()).toEqual(q);

  expect(t.number().isTimeQuantity().errorCause).not.toBeNull();
});
