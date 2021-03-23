import { produce } from 'immer';
import { Type, TableType, InferError, inverseExponent } from '../type';

import { l, c, n, r, col, tableDef, funcDef } from '../utils';

import { makeContext } from './context';
import {
  inferStatement,
  inferExpression,
  inferFunction,
  inferProgram,
  inferTargetStatement,
} from './index';

const nilCtx = makeContext();

afterEach(() => {
  // Ensure nilCtx is never modified
  const stillEmpty =
    nilCtx.stack.stack.every((m) => m.size === 0) &&
    nilCtx.functions.size === 0 &&
    nilCtx.functionDefinitions.size === 0;

  if (!stillEmpty) {
    throw new Error('sanity check failed: nilCtx was modified');
  }
});

it('infers literals', () => {
  expect(inferExpression(nilCtx, l(1.1))).toEqual(Type.Number);
  expect(inferExpression(nilCtx, l(1))).toEqual(Type.Number);

  expect(inferExpression(nilCtx, l('one'))).toEqual(Type.String);

  expect(inferExpression(nilCtx, l(true))).toEqual(Type.Boolean);
});

describe('columns', () => {
  it('infers columns', () => {
    expect(inferExpression(nilCtx, col(1, 2, 3))).toEqual(
      Type.Number.isColumn(3)
    );

    expect(inferExpression(nilCtx, col(c('+', l(1), l(1))))).toEqual(
      Type.Number.isColumn(1)
    );

    const mixedCol = col(l(1), l('hi'));
    expect(inferExpression(nilCtx, mixedCol)).toEqual(
      Type.Impossible.isColumn(2)
        .inNode(mixedCol)
        .withErrorCause(new InferError('Mismatched types: number and string'))
    );
  });

  it('column-ness is infectious', () => {
    expect(inferExpression(nilCtx, c('+', col(1, 2, 3), l(1)))).toEqual(
      Type.Number.isColumn(3)
    );
    expect(inferExpression(nilCtx, c('+', l(1), col(1, 2, 3)))).toEqual(
      Type.Number.isColumn(3)
    );
  });
});

describe('tables', () => {
  it('infers table defs', () => {
    const tableContext = makeContext();

    const expectedType = new TableType(
      new Map([
        ['Col1', Type.Number.isColumn(3)],
        ['Col2', Type.Number.isColumn(3)],
      ])
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

    expect(tableContext.tables.get('Table')).toEqual(expectedType);
  });

  it('"previous" references', () => {
    const expectedType = new TableType(
      new Map([
        ['Col1', Type.Number.isColumn(3)],
        ['Col2', Type.Number.isColumn(3)],
        ['Col3', Type.String.isColumn(3)],
      ])
    );

    const table = tableDef('Table', {
      Col1: col(1, 1, 1),
      Col2: c('+', n('ref', 'Col1'), c('previous', l(0))),
      Col3: c('previous', l('hi')),
    });

    expect(inferStatement(nilCtx, table)).toEqual(expectedType);
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
  const badExprError = new InferError('Mismatched types: number and boolean');

  expect(inferExpression(errorCtx, badExpr)).toEqual(
    Type.Impossible.withErrorCause(badExprError).inNode(badExpr)
  );
});

it('infers conditions', () => {
  expect(
    inferExpression(nilCtx, n('conditional', l(true), l(1), l(1)))
  ).toEqual(Type.Number);

  expect(
    inferExpression(nilCtx, n('conditional', l(true), l('str'), l('other str')))
  ).toEqual(Type.String);

  const errorCtx = makeContext();
  const badConditional = n('conditional', l(true), l('wrong!'), l(1));
  const badConditionalError = new InferError(
    'Mismatched types: string and number'
  );
  expect(inferExpression(errorCtx, badConditional)).toEqual(
    Type.Impossible.withErrorCause(badConditionalError).inNode(badConditional)
  );
});

describe('inferFunction', () => {
  it('infers unused functions within the program', () => {
    const goodFn = funcDef('Good', ['A'], c('+', l(1), l(2)));

    expect(inferFunction(nilCtx, goodFn).returns).toEqual(Type.Number);

    const badCall = c('+', l('x'), l(1));
    const badFn = funcDef('Bad', ['A'], badCall);
    const errorCtx = makeContext();
    const badFnError = new InferError('Mismatched types: string and number');
    expect(inferFunction(errorCtx, badFn).returns).toEqual(
      Type.Impossible.withErrorCause(badFnError).inNode(badCall)
    );
  });

  it('narrows down the type of each argument', () => {
    const fn = funcDef('Good', ['A'], c('+', l(1), r('A')));

    expect(inferFunction(nilCtx, fn)).toEqual({ returns: Type.Number });
  });

  it('infers functions which use things in the parent scope', () => {
    const functionUsingOuterScope = funcDef('Fn', [], c('+', l(1), r('A')));

    const parentScope = makeContext([['A', Type.Number]]);

    expect(inferFunction(parentScope, functionUsingOuterScope)).toEqual({
      returns: Type.Number,
    });
  });

  it('allows to pass in specific arguments types, instead of assuming any type', () => {
    const functionWithSpecificTypes = funcDef('Fn', ['A'], r('A'));

    expect(inferFunction(nilCtx, functionWithSpecificTypes).returns).toEqual(
      new Type()
    );
    expect(
      inferFunction(nilCtx, functionWithSpecificTypes, c('A'), [
        new Type('boolean'),
      ]).returns
    ).toEqual(new Type('boolean'));
  });

  it('disallows wrong argument count', () => {
    const unaryFn = funcDef('Fn', ['A'], r('A'));

    let errorCtx = makeContext();
    const badArgumentCountError = new InferError(
      'Wrong number of arguments applied to Fn (expected 1)'
    );
    expect(inferFunction(errorCtx, unaryFn, c('Fn'), [])).toEqual({
      returns: Type.Impossible.withErrorCause(badArgumentCountError).inNode(
        c('Fn')
      ),
    });

    errorCtx = makeContext();
    const badArgumentCountError2 = new InferError(
      'Wrong number of arguments applied to Fn (expected 1)'
    );
    expect(
      inferFunction(errorCtx, unaryFn, c('Fn'), [Type.Boolean, Type.String])
    ).toEqual({
      returns: Type.Impossible.withErrorCause(badArgumentCountError2).inNode(
        c('Fn')
      ),
    });
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
      functions: new Map(),
      blockReturns: [Type.Number],
    });

    const error = new InferError('Mismatched types: number and string');
    expect(inferProgram(wrongProgram)).toMatchObject({
      variables: new Map([['A', Type.Number]]),
      functions: new Map(),
      blockReturns: [Type.Impossible.withErrorCause(error).inNode(badCall)],
    });
  });

  it('supports calling functions', () => {
    const program: AST.Block[] = [
      n(
        'block',
        funcDef('Cmp', ['A', 'B'], c('+', r('A'), r('B'))),
        n(
          'assign',
          n('def', 'Result'),
          n(
            'function-call',
            n('funcref', 'Cmp'),
            n('argument-list', l(2), l(2))
          )
        )
      ),
    ];

    expect(inferProgram(program)).toMatchObject({
      variables: new Map([['Result', Type.Number]]),
      functions: new Map([
        [
          'Cmp',
          {
            returns: new Type('number', 'string'),
          },
        ],
      ]),
      blockReturns: [Type.Number],
    });
  });

  it('supports calling the same function twice with different arguments', () => {
    const program: AST.Block[] = [
      n(
        'block',
        funcDef('Add', ['A', 'B'], c('+', r('A'), r('B'))),
        n('assign', n('def', 'A Number'), c('Add', l(2), l(2))),
        n('assign', n('def', 'A String'), c('Add', l('hi'), l('hi')))
      ),
    ];

    expect(inferProgram(program)).toMatchObject({
      variables: new Map([
        ['A Number', Type.Number],
        ['A String', Type.String],
      ]),
      functions: new Map([
        [
          'Add',
          {
            returns: new Type('number', 'string'),
          },
        ],
      ]),
      blockReturns: [Type.String],
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
      Type.Impossible.withErrorCause(
        new InferError('Mismatched types: string and number')
      ).inNode(badCall)
    );
  });
});

describe('Units', () => {
  const nilPos = {
    line: 0,
    column: 0,
    char: 0,
  };
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

  it('infers literals units', () => {
    expect(inferExpression(nilCtx, l(1))).toEqual(Type.Number.withUnit(null));
    expect(inferExpression(nilCtx, l(1, degC))).toEqual(
      Type.Number.withUnit([degC])
    );
  });

  it('infers expressions units', () => {
    const type = inferExpression(nilCtx, c('+', l(1, degC), l(1, degC)));
    expect(type).toMatchObject(Type.Number.withUnit([degC]));
  });

  it('composes units', () => {
    const type = inferExpression(nilCtx, c('/', l(1, degC), l(1, seconds)));
    const withNullUnit = inferExpression(nilCtx, c('/', l(1, degC), l(1)));

    expect(type).toMatchObject(
      Type.Number.withUnit([degC, inverseExponent(seconds)])
    );
    expect(withNullUnit).toMatchObject(Type.Number.withUnit([degC]));
  });

  it('decomposes units', () => {
    const type = inferExpression(
      nilCtx,
      c('*', l(1, meters, inverseExponent(seconds)), l(1, seconds))
    );
    // const withNullUnit = inferExpression(nilCtx, c('*', l(1, seconds), l(1)))

    expect(type).toMatchObject(Type.Number.withUnit([meters]));
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
