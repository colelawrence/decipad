import { produce } from 'immer';
import { c, l } from '../utils';
import { InferError } from './InferError';
import { Type, TableType, inverseExponent } from './index';

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

it('Can assert type equivalence and pass on this information', () => {
  const type = new Type('string');

  expect(type.hasType('string')).toEqual(type);
  expect(type.sameAs(type)).toEqual(type);
});

it("Can be made to represent any ol' type", () => {
  const anyType = new Type();

  expect(anyType.hasType('string')).toEqual(Type.String);
  expect(anyType.hasType('number')).toEqual(Type.Number);
});

describe('Type.combine', () => {
  it('returns the last type', () => {
    expect(Type.combine(Type.Number, Type.String)).toEqual(Type.String);
  });

  it('returns any error in the args', () => {
    const badType = Type.Impossible.withErrorCause(new InferError(''));
    expect(Type.combine(Type.Number, badType)).toEqual(badType);
  });

  it('panics when called with zero arguments', () => {
    expect(() => Type.combine()).toThrow();
  });
});

describe('Columns', () => {
  it('supports column types', () => {
    const columnType = Type.build({
      type: 'number',
      columnSize: 42,
      unit: [dollar],
    });

    expect(columnType).toMatchObject({
      possibleTypes: ['number'],
      unit: [dollar],
      columnSize: 42,
    });

    const normalType = new Type('string');
    expect(normalType.columnSize).toEqual(null);
  });

  it.skip('can combine column types', () => {
    // TODO what to do with units?
    const columnType = Type.build({ type: 'number', columnSize: 42 });

    expect(columnType.sameAs(columnType)).toEqual(columnType);
    expect(columnType.hasType('number')).toEqual(columnType);
    expect(columnType.withUnit([meter])).toMatchObject({
      errorCause: null,
      unit: [meter],
    });
    expect(columnType.multiplyUnit([meter, second])).toMatchObject({
      errorCause: null,
      unit: [meter, second],
    });
  });

  it('can propagate the columnness', () => {
    const columnType = Type.build({ type: 'number', columnSize: 42 });
    expect(columnType.sameColumnSizeAs(Type.Number)).toEqual(columnType);

    expect(Type.Number.sameColumnSizeAs(columnType)).toEqual(columnType);
    expect(
      Type.Number.sameColumnSizeAs(
        Type.build({ type: 'number', unit: [meter] })
      )
    ).toEqual(Type.Number);
  });

  it('fails to combine with other sizes of column', () => {
    const columnType = Type.build({ type: 'number', columnSize: 42 });
    const otherSizedColumnType = Type.build({ type: 'number', columnSize: 10 });

    expect(columnType.sameColumnSizeAs(otherSizedColumnType)).toMatchObject({
      errorCause: new InferError('Incompatible column sizes: 42 and 10'),
    });
  });

  it('non-columns are coerced to columns', () => {
    const nonColumnType = Type.Number;
    const columnType = Type.build({ type: 'number', columnSize: 42 });

    expect(columnType.sameAs(nonColumnType)).toEqual(columnType);
    expect(nonColumnType.sameAs(columnType)).toEqual(columnType);
  });

  it('can check columnness', () => {
    const columnType = Type.build({ type: 'number', columnSize: 42 });
    const nonColumnType = Type.Number;

    expect(columnType.isColumn(42)).toEqual(columnType);
    expect(nonColumnType.withColumnSize(42)).toEqual(columnType);
    expect(nonColumnType.isNotColumn()).toEqual(nonColumnType);

    // Errors
    expect(columnType.isColumn(100)).toMatchObject({
      errorCause: new InferError('Incompatible column sizes: 42 and 100'),
    });
    expect(columnType.isNotColumn()).toMatchObject({
      errorCause: new InferError('Unexpected column'),
    });
  });
});

describe('Impossible types', () => {
  it('returns an impossible type and remembers causality', () => {
    const type = new Type('string');

    expect(type.hasType('boolean')).toEqual(
      Type.Impossible.withErrorCause(
        new InferError('Mismatched types: string and boolean')
      )
    );

    const differentType = new Type('number');
    expect(type.sameAs(differentType)).toEqual(
      Type.Impossible.withErrorCause(
        new InferError('Mismatched types: string and number')
      )
    );
  });

  it('propagates impossibility', () => {
    const imp = Type.Impossible.withErrorCause(new InferError('imp 1'));
    const imp2 = Type.Impossible.withErrorCause(new InferError('imp 2'));

    expect(imp.sameAs(imp2)).toEqual(imp);
    expect(Type.Number.sameAs(imp2)).toEqual(imp2);

    expect(imp.hasType('string')).toEqual(imp);

    expect(imp.withUnit([meter])).toEqual(imp);
    expect(imp.multiplyUnit([meter])).toEqual(imp);
    expect(imp.divideUnit([meter])).toEqual(imp);

    expect(
      imp.withErrorCause(new InferError('ignored different error'))
    ).toEqual(imp);
  });
});

describe('Type.runFunctor', () => {
  it('replicates types in arguments which are already impossible, and does not call the function', () => {
    const impossible = Type.Impossible.withErrorCause(new InferError(''));
    const functor = jest.fn();

    expect(Type.runFunctor(testNode, functor, impossible)).toEqual(impossible);
    expect(functor).not.toHaveBeenCalled();
  });

  it('calls the functor and assigns an error cause and source node to it if there is an error', () => {
    const type = Type.String;
    const functor = (a: Type) => a.withErrorCause(new InferError(''));

    expect(Type.runFunctor(testNode, functor, type)).toEqual(
      type.withErrorCause(new InferError('')).inNode(testNode)
    );
  });

  it('returns what the functor returns, when all is normal', () => {
    expect(Type.runFunctor(testNode, () => Type.Boolean)).toEqual(Type.Boolean);
  });
});

const setExponent = (u: AST.Unit, exp: number) =>
  produce(u, (u) => {
    u.exp = exp;
  });

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

it('has a withUnit method', () => {
  expect(Type.build({ type: 'number', unit: [meter] })).toEqual(numberInMeter);
  expect(Type.build({ type: 'number', unit: [meter, second] })).toEqual(
    numberInMeterBySecond
  );

  expect(
    Type.build({ type: 'number', unit: [meter] }).withUnit([meter])
  ).toEqual(Type.build({ type: 'number', unit: [meter] }));

  // Mismatched units
  expect(
    Type.build({ type: 'number', unit: [meter] }).withUnit([second]).errorCause
  ).toEqual(new InferError('Mismatched units: meter and second'));
  expect(
    Type.build({ type: 'number', unit: [meter, second] }).withUnit([second])
      .errorCause
  ).toEqual(new InferError('Mismatched units: meter.second and second'));
  expect(
    Type.build({ type: 'number', unit: [meter] }).withUnit(null).errorCause
  ).toEqual(new InferError('Mismatched units: meter and '));
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

it('has a TableType', () => {
  const table = new TableType(
    new Map([
      ['Col1', Type.build({ type: 'number', columnSize: 3, unit: [meter] })],
      ['Col2', Type.build({ type: 'string', columnSize: 3 })],
    ])
  );

  expect(table.toString()).toEqual('table { Col1 = meter, Col2 = <string> }');
});

describe('ranges', () => {
  it('types can check and assign rangeness', () => {
    const ranged = Type.Number.isRange();
    const deranged = Type.build({
      type: 'number',
      rangeness: true,
    }).isNotRange();

    expect(ranged.errorCause).toEqual(new InferError('Expected range'));
    expect(deranged.errorCause).toEqual(new InferError('Unexpected range'));
  });

  it('rangeness is unified with sameAs', () => {
    expect(
      Type.build({ type: 'number', rangeness: true }).sameAs(Type.Number)
        .errorCause
    ).toEqual(new InferError('Expected range'));

    expect(
      Type.Number.sameAs(Type.build({ type: 'number', rangeness: true }))
        .errorCause
    ).toEqual(new InferError('Unexpected range'));
  });
});
