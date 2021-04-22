import { produce } from 'immer';
import { dequal } from 'dequal';
import { Type, InferError, inverseExponent } from '../type';

import {
  l,
  c,
  n,
  r,
  col,
  range,
  date,
  given,
  tableDef,
  funcDef,
} from '../utils';

import { makeContext } from './context';
import {
  inferStatement,
  inferExpression,
  inferFunction,
  inferProgram,
  inferTargetStatement,
} from './index';

const nilPos = {
  line: 0,
  column: 0,
  char: 0,
};
let nilCtx = makeContext();
const degC: AST.Unit = {
  unit: 'celsius',
  exp: 1,
  multiplier: 1,
  known: true,
  start: nilPos,
  end: nilPos,
};
const seconds: AST.Unit = {
  unit: 'second',
  exp: 1,
  multiplier: 1,
  known: true,
  start: nilPos,
  end: nilPos,
};
const meters: AST.Unit = {
  unit: 'meter',
  exp: 1,
  multiplier: 1,
  known: true,
  start: nilPos,
  end: nilPos,
};

afterEach(() => {
  if (!dequal(nilCtx, makeContext())) {
    // Restore to avoid failing further stillEmpty checks
    nilCtx = makeContext();

    throw new Error('sanity check failed: nilCtx was modified');
  }
});

it('infers literals', () => {
  expect(inferExpression(nilCtx, l(1.1))).toEqual(Type.Number);
  expect(inferExpression(nilCtx, l(1))).toEqual(Type.Number);

  expect(inferExpression(nilCtx, l('one'))).toEqual(Type.String);

  expect(inferExpression(nilCtx, l(true))).toEqual(Type.Boolean);
});

describe('ranges', () => {
  it('infers ranges', () => {
    expect(inferExpression(nilCtx, range(1, 2))).toEqual(
      Type.build({ type: 'number', rangeness: true })
    );

    expect(
      inferExpression(nilCtx, range(false, true)).errorCause
    ).toBeDefined();
    expect(
      inferExpression(nilCtx, range(range(1, 2), range(3, 4))).errorCause
    ).toBeDefined();
    expect(
      inferExpression(nilCtx, range('string', 'string2')).errorCause
    ).toBeDefined();
  });

  it('infers range functions', () => {
    expect(inferExpression(nilCtx, c('contains', range(1, 10), l(1)))).toEqual(
      Type.Boolean
    );
    expect(
      inferExpression(nilCtx, c('contains', l(1), l(1))).errorCause
    ).not.toBeNull();
  });
});

describe('dates', () => {
  it('infers dates', () => {
    expect(inferExpression(nilCtx, date('2020-01', 'month'))).toEqual(
      Type.buildDate('month')
    );

    expect(inferExpression(nilCtx, date('2020-01-15', 'day'))).toEqual(
      Type.buildDate('day')
    );
  });

  it('infers date fns', () => {
    expect(
      inferExpression(
        nilCtx,
        c('dateequals', date('2020-01', 'month'), date('2020-01', 'month'))
      )
    ).toEqual(Type.Boolean);

    expect(
      inferExpression(
        nilCtx,
        c('dateequals', date('2020-01-01', 'day'), date('2020-01', 'month'))
      ).errorCause
    ).not.toBeNull();
  });
});

describe('columns', () => {
  it('infers columns', () => {
    expect(inferExpression(nilCtx, col(1, 2, 3))).toEqual(
      Type.build({ type: 'number', columnSize: 3 })
    );

    expect(inferExpression(nilCtx, col(c('+', l(1), l(1))))).toEqual(
      Type.build({ type: 'number', columnSize: 1 })
    );

    const mixedCol = col(l(1), l('hi'));
    expect(inferExpression(nilCtx, mixedCol)).toEqual(
      Type.buildTuple([Type.Number, Type.String])
    );
  });

  it('column-ness is infectious', () => {
    expect(inferExpression(nilCtx, c('+', col(1, 2, 3), l(1)))).toEqual(
      Type.build({
        type: 'number',
        columnSize: 3,
      })
    );
    expect(inferExpression(nilCtx, c('+', l(1), col(1, 2, 3)))).toEqual(
      Type.build({
        type: 'number',
        columnSize: 3,
      })
    );
  });

  it('infers columns of dates', () => {
    expect(
      inferExpression(
        nilCtx,
        col(date('2020-01', 'month'), date('2020-02', 'month'))
      )
    ).toEqual(
      Type.build({
        type: 'number',
        date: 'month',
        columnSize: 2,
      })
    );
  });

  it('can be reduced with the total function', () => {
    expect(inferExpression(nilCtx, c('total', col(1, 2, 3)))).toEqual(
      Type.Number
    );
  });
});

describe('tables', () => {
  it('infers table defs', () => {
    const tableContext = makeContext();

    const expectedType = Type.buildTuple(
      [
        Type.build({ type: 'number', columnSize: 3 }),
        Type.build({ type: 'number', columnSize: 3 }),
      ],
      ['Col1', 'Col2']
    );

    expect(
      inferStatement(
        tableContext,
        tableDef('Table', {
          Col1: col(1, 2, 3),
          Col2: c('+', n('ref', 'Col1'), l(2)),
        })
      )
    ).toEqual(expectedType);

    expect(tableContext.stack.get('Table')).toEqual(expectedType);
  });

  it('References to table columns', () => {
    const block = n(
      'block',
      tableDef('Table', { Col1: col(1, 2, 3) }),
      n(
        'assign',
        n('def', 'Col'),
        n('property-access', n('ref', 'Table'), 'Col1')
      )
    );

    expect(inferProgram([block]).variables.get('Col')).toEqual(
      Type.buildColumn(Type.Number, 3)
    );
  });

  it('"previous" references', () => {
    const expectedType = Type.buildTuple(
      [
        Type.build({ type: 'number', columnSize: 3 }),
        Type.build({ type: 'number', columnSize: 3 }),
        Type.build({ type: 'string', columnSize: 3 }),
      ],
      ['Col1', 'Col2', 'Col3']
    );

    const table = tableDef('Table', {
      Col1: col(1, 1, 1),
      Col2: c('+', n('ref', 'Col1'), c('previous', l(0))),
      Col3: c('previous', l('hi')),
    });

    expect(inferStatement(makeContext(), table)).toEqual(expectedType);
  });
});

it('infers refs', () => {
  const scopeWithVariable = makeContext();
  scopeWithVariable.stack.set('N', Type.Number);

  expect(inferExpression(scopeWithVariable, r('N'))).toEqual(Type.Number);

  const errorCause = new InferError('Undefined variable MissingVar');
  expect(inferExpression(scopeWithVariable, r('MissingVar'))).toEqual(
    Type.Impossible.withErrorCause(errorCause).inNode(r('MissingVar'))
  );
});

describe('Given', () => {
  it('Works on scalars', () => {
    const scopeWithColumn = makeContext([
      ['Nums', Type.buildColumn(Type.Number, 3)],
    ]);

    expect(inferExpression(scopeWithColumn, given('Nums', l(1)))).toEqual(
      Type.buildColumn(Type.Number, 3)
    );

    expect(inferExpression(scopeWithColumn, given('Nums', l('hi')))).toEqual(
      Type.buildColumn(Type.String, 3)
    );

    expect(
      inferExpression(scopeWithColumn, given('Nums', c('+', r('Nums'), l(1))))
    ).toEqual(Type.buildColumn(Type.Number, 3));
  });
  it('Works with non-scalar bodies', () => {
    const scopeWithColumn = makeContext([
      ['Nums', Type.buildColumn(Type.Number, 3)],
    ]);

    expect(
      inferExpression(scopeWithColumn, given('Nums', col(l('s1'), l('s2'))))
    ).toEqual(Type.buildColumn(Type.buildColumn(Type.String, 2), 3));

    expect(
      inferExpression(scopeWithColumn, given('Nums', col(l('s1'), l(1))))
    ).toEqual(Type.buildColumn(Type.buildTuple([Type.String, Type.Number]), 3));
  });
  it('Needs a column', () => {
    const scopeWithTuple = makeContext([
      [
        'Tuple',
        Type.buildTuple([
          Type.buildColumn(Type.Number, 3),
          Type.buildColumn(Type.String, 3),
        ]),
      ],
    ]);

    expect(
      inferExpression(scopeWithTuple, given('Tuple', l(1))).errorCause
    ).not.toBeNull();
  });
});

it('infers binops', () => {
  expect(inferExpression(nilCtx, c('+', l(1), l(1)))).toEqual(Type.Number);

  // These assertions will be different WRT integer/float casts eventually
  expect(inferExpression(nilCtx, c('+', l(0.1), l(0.2)))).toEqual(Type.Number);
  expect(inferExpression(nilCtx, c('+', l(1.1), l(1)))).toEqual(Type.Number);
  expect(inferExpression(nilCtx, c('+', l(1), l(1.1)))).toEqual(Type.Number);

  expect(inferExpression(nilCtx, c('>', l(1), l(0.5)))).toEqual(Type.Boolean);
  expect(inferExpression(nilCtx, c('==', l(1), l(0.5)))).toEqual(Type.Boolean);

  const errorCtx = makeContext();
  const badExpr = c('==', l(1), l(true));

  expect(inferExpression(errorCtx, badExpr)).toEqual(
    Type.Impossible.withErrorCause('Expected boolean').inNode(badExpr)
  );
});

it('infers conditions', () => {
  expect(inferExpression(nilCtx, c('if', l(true), l(1), l(1)))).toEqual(
    Type.Number
  );

  expect(
    inferExpression(nilCtx, c('if', l(true), l('str'), l('other str')))
  ).toEqual(Type.String);

  const errorCtx = makeContext();
  const badConditional = c('if', l(true), l('wrong!'), l(1));

  expect(inferExpression(errorCtx, badConditional)).toEqual(
    Type.Impossible.withErrorCause('Expected number').inNode(badConditional)
  );
});

describe('inferFunction', () => {
  it('Accepts arguments types and returns a return type', () => {
    const functionWithSpecificTypes = funcDef('Fn', ['A'], r('A'));

    expect(
      inferFunction(nilCtx, functionWithSpecificTypes, [Type.Boolean])
    ).toEqual(Type.Boolean);
  });

  it('disallows wrong argument count', () => {
    const unaryFn = funcDef('Fn', ['A'], r('A'));

    let errorCtx = makeContext();
    const badArgumentCountError = new InferError(
      'Wrong number of arguments applied to Fn (expected 1)'
    );
    expect(inferFunction(errorCtx, unaryFn, [])).toEqual(
      Type.Impossible.withErrorCause(badArgumentCountError)
    );

    errorCtx = makeContext();
    const badArgumentCountError2 = new InferError(
      'Wrong number of arguments applied to Fn (expected 1)'
    );
    expect(
      inferFunction(errorCtx, unaryFn, [Type.Boolean, Type.String])
    ).toEqual(Type.Impossible.withErrorCause(badArgumentCountError2));
  });
});

describe('inferProgram', () => {
  it('infers the whole program', () => {
    const program: AST.Block[] = [
      n('block', n('assign', n('def', 'A'), l(3)), c('+', r('A'), l(1.1))),
    ];

    const badString = l('bad string, bad string!');
    const wrongProgram = produce(program, (wrongProgram: AST.Block[]) => {
      const argList = wrongProgram[0].args[1].args[1] as AST.ArgList;

      argList.args[1] = badString;
    });
    const badCall = wrongProgram[0].args[1];

    expect(inferProgram(program)).toMatchObject({
      variables: new Map([['A', Type.Number]]),
      blockReturns: [Type.Number],
    });

    const error = new InferError('Expected string');
    expect(inferProgram(wrongProgram)).toMatchObject({
      variables: new Map([['A', Type.Number]]),
      blockReturns: [Type.Impossible.withErrorCause(error).inNode(badCall)],
    });
  });

  it('supports calling functions', () => {
    const program: AST.Block[] = [
      n(
        'block',
        funcDef('Plus', ['A', 'B'], c('+', r('A'), r('B'))),
        n('assign', n('def', 'Result'), c('Plus', l(2), l(2)))
      ),
    ];

    expect(inferProgram(program)).toMatchObject({
      variables: new Map([['Result', Type.Number]]),
      blockReturns: [Type.Number],
    });
  });
});

describe('inferTargetStatement', () => {
  it('can infer the result of a statement', () => {
    const program = [
      n('block', n('assign', n('def', 'A'), l(10))),
      n('block', c('+', r('A'), r('A'))),
    ];

    expect(inferTargetStatement(program, [0, 0])).toEqual(Type.Number);
    expect(inferTargetStatement(program, [1, 0])).toEqual(Type.Number);

    // Bad path
    expect(() => inferTargetStatement(program, [2, 0])).toThrow();
  });

  it('returns propagated errors', () => {
    const badCall = c('+', l('string'), l(1));
    const badProgram = [n('block', badCall)];

    expect(inferTargetStatement(badProgram, [0, 0])).toEqual(
      Type.Impossible.withErrorCause(new InferError('Expected number')).inNode(
        badCall
      )
    );
  });
});

describe('Units', () => {
  const getWithUnit = (unit: AST.Unit[] | null) =>
    Type.build({ type: 'number', unit });
  it("infers literals' units", () => {
    expect(inferExpression(nilCtx, l(1))).toEqual(getWithUnit(null));
    expect(inferExpression(nilCtx, l(1, degC))).toEqual(getWithUnit([degC]));
  });

  it('infers expressions units', () => {
    const type = inferExpression(nilCtx, c('+', l(1, degC), l(1, degC)));
    expect(type).toMatchObject(getWithUnit([degC]));
  });

  it('composes units', () => {
    const type = inferExpression(nilCtx, c('/', l(1, degC), l(1, seconds)));
    const withNullUnit = inferExpression(nilCtx, c('/', l(1, degC), l(1)));

    expect(type).toMatchObject(getWithUnit([degC, inverseExponent(seconds)]));
    expect(withNullUnit).toMatchObject(getWithUnit([degC]));
  });

  it('decomposes units', () => {
    const type = inferExpression(
      nilCtx,
      c('*', l(1, meters, inverseExponent(seconds)), l(1, seconds))
    );
    // const withNullUnit = inferExpression(nilCtx, c('*', l(1, seconds), l(1)))

    expect(type).toMatchObject(getWithUnit([meters]));
    // TODO expect(withNullUnit).toEqual(Type.Number)
  });

  it('fills in incompatible unit errors', () => {
    const badUnits = c('+', l(1, degC), l(1, seconds));
    const ctxForError = makeContext();

    const badUnitsError = new InferError(
      'Mismatched units: celsius and second'
    );
    expect(inferExpression(ctxForError, badUnits)).toEqual(
      Type.Impossible.withErrorCause(badUnitsError).inNode(badUnits)
    );
  });
});
