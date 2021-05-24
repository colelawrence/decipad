import { produce } from 'immer';
import { c, l } from '../utils';
import { InferError } from './InferError';
import { inverseExponent, setExponent } from './units';
import { Type } from './index';

const testNode = c('node 1', l(1));
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

const numberInMeter = produce(Type.Number, (type) => {
  type.unit = [meter];
});
const numberInMeterBySecond = produce(Type.Number, (type) => {
  type.unit = [meter, second];
});
const numberInMeterPerSecond = produce(Type.Number, (type) => {
  type.unit = [meter, invSecond];
});

it('Can assert type equivalence and pass on this information', () => {
  const type = Type.buildScalar('string');

  expect(type.isScalar('string')).toEqual(type);
  expect(type.sameAs(type)).toEqual(type);
});

it('can be stringified', () => {
  expect(Type.Number.toString()).toEqual('<number>');
  expect(Type.build({ type: 'number', unit: [meter] }).toString()).toEqual(
    'meter'
  );
  expect(
    Type.build({ type: 'number', unit: [meter, second] }).toString()
  ).toEqual('meter.second');
  expect(
    Type.build({
      type: 'number',
      unit: [meter, inverseExponent(second)],
    }).toString()
  ).toEqual('meter.second^-1');

  expect(Type.buildRange(Type.Number).toString()).toEqual('range of <number>');

  expect(Type.buildDate('month').toString()).toEqual('month');

  const table = Type.buildTuple(
    [
      Type.build({ type: 'number', unit: [meter] }),
      Type.build({ type: 'string' }),
    ],
    ['Col1', 'Col2']
  );
  expect(table.toString()).toEqual('[ Col1 = meter, Col2 = <string> ]');

  const tuple = Type.buildTuple([Type.Number, Type.String]);
  expect(tuple.toString()).toEqual('[ <number>, <string> ]');

  const col = Type.buildColumn(Type.String, 4);
  expect(col.toString()).toEqual('<string> x 4');

  const nestedCol = Type.buildColumn(Type.buildColumn(Type.String, 4), 6);
  expect(nestedCol.toString()).toEqual('<string> x 4 x 6');
});

describe('sameAs', () => {
  it('checks if the types are completely equal', () => {
    const sameAsItself = (t: Type) => {
      expect(t.sameAs(t)).toEqual(t);
    };

    sameAsItself(Type.Number);
    sameAsItself(Type.String);
    sameAsItself(Type.build({ type: 'number', unit: [meter] }));
    sameAsItself(Type.build({ type: 'number', unit: [second, meter] }));
    sameAsItself(Type.buildColumn(Type.Number, 6));
    sameAsItself(
      Type.buildColumn(Type.buildTuple([Type.Number, Type.String]), 6)
    );
  });

  it('sameAs checks units', () => {
    expect(Type.build({ type: 'number', unit: [meter] })).toEqual(
      numberInMeter
    );
    expect(Type.build({ type: 'number', unit: [meter, second] })).toEqual(
      numberInMeterBySecond
    );

    const n = (unit: AST.Unit[] | null) =>
      Type.build({
        type: 'number',
        unit,
      });

    expect(
      Type.build({ type: 'number', unit: [meter] }).sameAs(n([meter]))
    ).toEqual(Type.build({ type: 'number', unit: [meter] }));

    // Mismatched units
    expect(
      Type.build({ type: 'number', unit: [meter] }).sameAs(n([second]))
        .errorCause
    ).toEqual(new InferError('Mismatched units: meter and second'));
    expect(
      Type.build({ type: 'number', unit: [meter, second] }).sameAs(n([second]))
        .errorCause
    ).toEqual(new InferError('Mismatched units: meter.second and second'));
    expect(
      Type.build({ type: 'number', unit: [meter] }).sameAs(n(null)).errorCause
    ).toEqual(new InferError('Mismatched units: meter and unitless'));
  });
});

describe('Type.combine', () => {
  it('returns the last type', () => {
    expect(Type.combine(Type.Number, Type.String)).toEqual(Type.String);
  });

  it('returns any error in the args', () => {
    const badType = Type.Impossible.withErrorCause('');
    expect(Type.combine(Type.Number, badType)).toEqual(badType);
    expect(Type.combine(badType, Type.Number)).toEqual(badType);
  });

  it('panicks when called with zero arguments', () => {
    expect(() => Type.combine()).toThrow();
  });
});

describe('new columns and tuples', () => {
  it('can get cardinality', () => {
    expect(Type.Number.cardinality).toEqual(1);

    expect(
      Type.buildColumn(Type.buildColumn(Type.Number, 2), 2).cardinality
    ).toEqual(3);

    expect(
      Type.buildColumn(Type.buildColumn(Type.buildDate('month'), 9), 9)
        .cardinality
    ).toEqual(3);

    expect(
      Type.buildColumn(Type.buildColumn(Type.buildRange(Type.Number), 9), 9)
        .cardinality
    ).toEqual(3);

    expect(
      Type.buildTuple([Type.Number, Type.buildColumn(Type.Number, 6)])
        .cardinality
    ).toEqual(3);
  });

  it('Can reduce one dimension off the top', () => {
    expect(Type.buildColumn(Type.String, 3).reduced()).toEqual(Type.String);
    expect(
      Type.buildColumn(Type.buildColumn(Type.String, 3), 1).reduced()
    ).toEqual(Type.buildColumn(Type.String, 3));

    expect(Type.String.reduced().errorCause).not.toBeNull();
    expect(Type.buildTuple([Type.String]).reduced().errorCause).not.toBeNull();
  });

  it('can be built with Type.buildListLike', () => {
    expect(Type.buildListLike([Type.Number])).toEqual(
      Type.buildColumn(Type.Number, 1)
    );

    expect(Type.buildListLike([Type.Number, Type.String])).toEqual(
      Type.buildTuple([Type.Number, Type.String])
    );

    expect(
      Type.buildListLike([Type.buildColumn(Type.Number, 1), Type.String])
    ).toEqual(Type.buildTuple([Type.buildColumn(Type.Number, 1), Type.String]));

    expect(
      Type.buildListLike([
        Type.buildColumn(Type.Number, 1),
        Type.buildColumn(Type.Number, 1),
      ])
    ).toEqual(Type.buildColumn(Type.buildColumn(Type.Number, 1), 2));

    expect(
      Type.buildListLike([
        Type.buildColumn(Type.Number, 1),
        Type.buildColumn(Type.String, 1),
      ])
    ).toEqual(
      Type.buildTuple([
        Type.buildColumn(Type.Number, 1),
        Type.buildColumn(Type.String, 1),
      ])
    );
  });
});

describe('Impossible types', () => {
  it('returns an impossible type', () => {
    const type = Type.buildScalar('string');

    expect(type.isScalar('boolean')).toEqual(
      Type.Impossible.withErrorCause('Expected boolean')
    );

    const differentType = Type.buildScalar('number');
    expect(type.sameAs(differentType)).toEqual(
      Type.Impossible.withErrorCause('Expected string')
    );
  });

  it('propagates impossibility', () => {
    const imp = Type.Impossible.withErrorCause('imp 1');
    const imp2 = Type.Impossible.withErrorCause('imp 2');

    expect(imp.sameAs(imp2)).toEqual(imp);
    expect(Type.Number.sameAs(imp2)).toEqual(imp2);

    expect(imp.isScalar('string')).toEqual(imp);

    expect(imp.multiplyUnit([meter])).toEqual(imp);
    expect(imp.divideUnit([meter])).toEqual(imp);

    expect(imp.withErrorCause('ignored different error')).toEqual(imp);
  });
});

describe('Type.runFunctor', () => {
  it('replicates types in arguments which are already impossible, and does not call the function', () => {
    const impossible = Type.Impossible.withErrorCause('');
    const functor = jest.fn();

    expect(Type.runFunctor(testNode, functor, impossible)).toEqual(impossible);
    expect(functor).not.toHaveBeenCalled();
  });

  it('calls the functor and assigns an error cause and source node to it if there is an error', () => {
    const type = Type.String;
    const functor = (a: Type) => a.withErrorCause('');

    expect(Type.runFunctor(testNode, functor, type)).toEqual(
      type.withErrorCause('').inNode(testNode)
    );
  });

  it('returns what the functor returns, when all is normal', () => {
    expect(Type.runFunctor(testNode, () => Type.Boolean)).toEqual(Type.Boolean);
  });
});

describe('divideUnit', () => {
  it('divides units', () => {
    expect(
      Type.build({ type: 'number', unit: [meter] }).divideUnit([second])
    ).toEqual(numberInMeterPerSecond);
  });

  it('exponentiates units', () => {
    expect(
      Type.build({ type: 'number', unit: [invSecond] }).divideUnit([second])
    ).toEqual(Type.build({ type: 'number', unit: [setExponent(second, -2)] }));

    expect(
      Type.build({
        type: 'number',
        unit: [setExponent(second, -2)],
      }).divideUnit([second])
    ).toEqual(Type.build({ type: 'number', unit: [setExponent(second, -3)] }));
  });

  it('exponentiation that results in 0-exponent eliminates the unit', () => {
    expect(
      Type.build({ type: 'number', unit: [meter] }).divideUnit([meter])
    ).toEqual(Type.Number);
  });

  it('divides units even further', () => {
    expect(
      Type.build({ type: 'number', unit: [meter, invSecond] }).divideUnit([
        dollar,
      ]).unit
    ).toEqual([
      setExponent(dollar, -1), // first because of sort
      meter,
      invSecond,
    ]);
  });

  it('maintains units when one of the operands is unitless', () => {
    expect(
      Type.build({ type: 'number', unit: [meter] }).divideUnit(null)
    ).toEqual(Type.build({ type: 'number', unit: [meter] }));
    expect(
      Type.build({ type: 'number', unit: null }).divideUnit([invMeter])
    ).toEqual(Type.build({ type: 'number', unit: [meter] }));
  });
});

describe('multiplyUnit', () => {
  it('multiplies units', () => {
    expect(numberInMeterPerSecond.multiplyUnit([second])).toEqual(
      Type.build({ type: 'number', unit: [meter] })
    );
  });

  it('when one of the numbers has no unit, the other unit prevails', () => {
    expect(
      Type.build({ type: 'number', unit: [meter, second] }).multiplyUnit(null)
    ).toEqual(Type.build({ type: 'number', unit: [meter, second] }));
    expect(
      Type.build({ type: 'number', unit: null }).multiplyUnit([meter, second])
    ).toEqual(Type.build({ type: 'number', unit: [meter, second] }));
  });

  it('eliminates units that are opposite on both sides', () => {
    expect(
      Type.build({ type: 'number', unit: [invMeter, invSecond] }).multiplyUnit([
        meter,
        second,
      ])
    ).toEqual(Type.build({ type: 'number', unit: null }));
  });
});

describe('ranges', () => {
  it('types can check rangeness', () => {
    const ranged = Type.Number.isRange();

    expect(ranged.errorCause).toEqual(new InferError('Expected range'));
  });

  it('rangeness is checked with sameAs', () => {
    expect(
      Type.buildRange(Type.Number).sameAs(Type.buildRange(Type.Number))
    ).toEqual(Type.buildRange(Type.Number));

    expect(
      Type.buildRange(Type.Number).sameAs(Type.buildRange(Type.String))
        .errorCause
    ).not.toBeNull();

    expect(Type.buildRange(Type.Number).sameAs(Type.Number).errorCause).toEqual(
      new InferError('Expected range')
    );

    expect(Type.Number.sameAs(Type.buildRange(Type.Number)).errorCause).toEqual(
      new InferError('Expected number')
    );
  });
});

describe('dates', () => {
  const month = Type.buildDate('month');
  const day = Type.buildDate('day');

  it('can be checked', () => {
    expect(month.isDate('month')).toEqual(month);

    expect(month.isDate('day')).toEqual(
      month.withErrorCause('Expected date with day specificity')
    );

    expect(day.isDate('month')).toEqual(
      day.withErrorCause('Expected date with month specificity')
    );

    expect(Type.Number.isDate('month')).toEqual(
      Type.Number.withErrorCause('Expected date')
    );
  });

  it('can be checked without specificity', () => {
    expect(day.isDate()).toEqual(day);
  });

  it('can be compared with other types', () => {
    expect(month.sameAs(month)).toEqual(month);

    expect(month.sameDatenessAs(month)).toEqual(month);

    // Differing dateness
    expect(Type.Number.sameDatenessAs(day)).toEqual(
      Type.Number.withErrorCause('Expected date')
    );

    expect(day.sameDatenessAs(Type.Number)).toEqual(
      day.withErrorCause('Unexpected date')
    );

    // Differing specificity
    expect(month.sameDatenessAs(day)).toEqual(
      month.withErrorCause('Expected date with day specificity')
    );

    expect(month.sameDatenessAs(day)).toEqual(month.sameAs(day));
  });
});

it('time quantities', () => {
  const q = Type.buildTimeQuantity(['quarter', 'month']);
  expect(q.timeUnits).toEqual(['quarter', 'month']);

  expect(q.isTimeQuantity()).toEqual(q);

  expect(Type.Number.isTimeQuantity().errorCause).not.toBeNull();
});
