import { produce } from 'immer';
import { AST } from '..';
import { InferError } from './InferError';
import { inverseExponent, setExponent } from './units';
import { Type, build as t } from './index';

const nilPos = {
  line: 2,
  column: 0,
  char: 0,
};

const meter: AST.Unit = {
  unit: 'meter',
  exp: 1,
  multiplier: 1,
  known: true,
  start: nilPos,
  end: nilPos,
};
const second: AST.Unit = {
  unit: 'second',
  exp: 1,
  multiplier: 1,
  known: true,
  start: nilPos,
  end: nilPos,
};
const dollar: AST.Unit = {
  unit: 'USD',
  exp: 1,
  multiplier: 1,
  known: false,
  start: nilPos,
  end: nilPos,
};

const invMeter: AST.Unit = inverseExponent(meter);
const invSecond: AST.Unit = inverseExponent(second);

const numberInMeter = produce(t.number(), (type) => {
  type.unit = [meter];
});
const numberInMeterBySecond = produce(t.number(), (type) => {
  type.unit = [meter, second];
});
const numberInMeterPerSecond = produce(t.number(), (type) => {
  type.unit = [meter, invSecond];
});

it('Can assert type equivalence', () => {
  const type = t.string();

  expect(type.isScalar('string')).toEqual(type);
  expect(type.sameAs(type)).toEqual(type);
});

it('can be stringified', () => {
  expect(t.number().toString()).toEqual('<number>');
  expect(t.number([meter]).toString()).toEqual('meter');
  expect(t.number([meter, second]).toString()).toEqual('meter.second');
  expect(t.number([meter, inverseExponent(second)]).toString()).toEqual(
    'meter.second^-1'
  );

  expect(t.range(t.number()).toString()).toEqual('range of <number>');

  expect(t.date('month').toString()).toEqual('month');

  const table = t.table({
    length: 123,
    columnTypes: [t.number([meter]), t.string()],
    columnNames: ['Col1', 'Col2'],
  });
  expect(table.toString()).toEqual('table { Col1 = meter, Col2 = <string> }');

  const row = t.row([t.number([meter]), t.string()], ['Col1', 'Col2']);
  expect(row.toString()).toEqual('row [ Col1 = meter, Col2 = <string> ]');

  const col = t.column(t.string(), 4);
  expect(col.toString()).toEqual('<string> x 4');

  const nestedCol = t.column(t.column(t.string(), 4), 6);
  expect(nestedCol.toString()).toEqual('<string> x 4 x 6');

  const importedData = t.importedData('data:someurl');
  expect(importedData.toString()).toEqual('<data url="data:someurl">');
});

it('can be stringified in basic form', () => {
  expect(t.functionPlaceholder().toBasicString()).toEqual('function');
  expect(t.number().toBasicString()).toEqual('number');
  expect(t.number([meter]).toBasicString()).toEqual('meter');
  expect(t.number([meter, second]).toBasicString()).toEqual('meter.second');
  expect(t.number([meter, inverseExponent(second)]).toBasicString()).toEqual(
    'meter.second^-1'
  );

  expect(t.range(t.number()).toBasicString()).toEqual('range');

  expect(t.timeQuantity([]).toBasicString()).toEqual('time quantity');

  expect(t.date('month').toBasicString()).toEqual('date(month)');

  const table = t.table({
    length: 123,
    columnTypes: [t.number([meter]), t.string()],
    columnNames: ['Col1', 'Col2'],
  });
  expect(table.toBasicString()).toEqual('table');

  const row = t.row([t.number([meter]), t.string()], ['Col1', 'Col2']);
  expect(row.toBasicString()).toEqual('row');

  const col = t.column(t.string(), 4);
  expect(col.toBasicString()).toEqual('column');

  const importedData = t.importedData('data:someurl');
  expect(importedData.toBasicString()).toEqual('imported data');

  expect(() => t.number().withErrorCause('').toBasicString()).toThrow();
});

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
        length: 123,
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

  const n = (...units: AST.Unit[]) => t.number(units.length > 0 ? units : null);

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

  it('sameAs fills in the gap in two units', () => {
    expect(n(meter).sameAs(n())).toEqual(n(meter));
    expect(n().sameAs(n(meter))).toEqual(n(meter));
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

  it('panicks when called with zero arguments', () => {
    expect(() => Type.combine()).toThrow();
  });
});

describe('new columns and tuples', () => {
  it('can get cardinality', () => {
    expect(t.number().cardinality).toEqual(1);

    expect(t.column(t.column(t.number(), 2), 2).cardinality).toEqual(3);

    expect(t.column(t.column(t.date('month'), 9), 9).cardinality).toEqual(3);

    expect(t.column(t.column(t.range(t.number()), 9), 9).cardinality).toEqual(
      3
    );

    expect(
      t.row([t.number(), t.column(t.number(), 6)], ['A', 'B']).cardinality
    ).toEqual(3);

    expect(
      t.table({
        length: 123,
        columnNames: ['A', 'B'],
        columnTypes: [t.number(), t.column(t.number(), 6)],
      }).cardinality
    ).toEqual(3);
  });

  it('Can reduce one dimension off the top', () => {
    expect(t.column(t.string(), 3).reduced()).toEqual(t.string());
    expect(t.column(t.column(t.string(), 3), 1).reduced()).toEqual(
      t.column(t.string(), 3)
    );

    expect(t.string().reduced().errorCause).not.toBeNull();
    expect(
      t
        .table({
          length: 1,
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
      t.number([setExponent(second, -2)])
    );

    expect(t.number([setExponent(second, -2)]).divideUnit([second])).toEqual(
      t.number([setExponent(second, -3)])
    );
  });

  it('exponentiation that results in 0-exponent eliminates the unit', () => {
    expect(t.number([meter]).divideUnit([meter])).toEqual(t.number());
  });

  it('divides units even further', () => {
    expect(t.number([meter, invSecond]).divideUnit([dollar]).unit).toEqual([
      setExponent(dollar, -1), // first because of sort
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

    expect(month.sameDatenessAs(month)).toEqual(month);

    // Differing dateness
    expect(t.number().sameDatenessAs(day)).toEqual(t.number().expected(day));

    expect(day.sameDatenessAs(t.number())).toEqual(day.expected(t.number()));

    // Differing specificity
    expect(month.sameDatenessAs(day)).toEqual(month.expected(day));

    expect(month.sameDatenessAs(day)).toEqual(month.sameAs(day));
  });
});

it('time quantities', () => {
  const q = t.timeQuantity(['quarter', 'month']);
  expect(q.timeUnits).toEqual(['quarter', 'month']);

  expect(q.isTimeQuantity()).toEqual(q);

  expect(t.number().isTimeQuantity().errorCause).not.toBeNull();
});
