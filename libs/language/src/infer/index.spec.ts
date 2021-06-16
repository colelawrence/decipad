import { produce } from 'immer';
import { dequal } from 'dequal';
import { Type, InferError, inverseExponent } from '../type';
import { join as pathJoin } from 'path';

import {
  l,
  c,
  n,
  r,
  col,
  range,
  seq,
  date,
  timeQuantity,
  given,
  tableDef,
  table,
  funcDef,
  prop,
  importedData,
} from '../utils';

import { readFile, dataUrl } from '../testUtils';

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

it('infers literals', async () => {
  expect(await inferExpression(nilCtx, l(1.1))).toEqual(Type.Number);
  expect(await inferExpression(nilCtx, l(1))).toEqual(Type.Number);

  expect(await inferExpression(nilCtx, l('one'))).toEqual(Type.String);

  expect(await inferExpression(nilCtx, l(true))).toEqual(Type.Boolean);
});

describe('variables', () => {
  it('disallows reassigning variables', async () => {
    const reassigning = n(
      'block',
      n('assign', n('def', 'Reassigned'), l(1)),
      n('assign', n('def', 'Reassigned'), l(1))
    );

    expect(
      (await inferProgram([reassigning])).variables.get('Reassigned')
        ?.errorCause
    ).not.toBeNull();
  });
});

describe('ranges', () => {
  it('infers ranges', async () => {
    expect(await inferExpression(nilCtx, range(1, 2))).toEqual(
      Type.buildRange(Type.Number)
    );

    expect(
      (await inferExpression(nilCtx, range(false, true))).errorCause
    ).toBeDefined();
    expect(
      (await inferExpression(nilCtx, range(range(1, 2), range(3, 4))))
        .errorCause
    ).toBeDefined();
    expect(
      (await inferExpression(nilCtx, range('string', 'string2'))).errorCause
    ).toBeDefined();
  });

  it('infers ranges of dates', async () => {
    const r = range(date('2030-01', 'month'), date('2031-11', 'month'));
    expect(await inferExpression(nilCtx, r)).toEqual(
      Type.buildRange(Type.buildDate('month'))
    );

    expect(
      await inferExpression(
        nilCtx,
        c('containsdate', r, date('2020-01', 'month'))
      )
    ).toEqual(Type.Boolean);
  });

  it('infers range functions', async () => {
    expect(
      await inferExpression(nilCtx, c('contains', range(1, 10), l(1)))
    ).toEqual(Type.Boolean);
    expect(
      (await inferExpression(nilCtx, c('contains', l(1), l(1)))).errorCause
    ).not.toBeNull();
  });
});

describe('sequences', () => {
  it('infers sequences of numbers', async () => {
    expect(await inferExpression(nilCtx, seq(l(1), l(1), l(1)))).toEqual(
      Type.buildColumn(Type.Number, 1)
    );

    expect(await inferExpression(nilCtx, seq(l(1), l(2), l(1)))).toEqual(
      Type.buildColumn(Type.Number, 2)
    );

    expect(await inferExpression(nilCtx, seq(l(1), l(8), l(3)))).toEqual(
      Type.buildColumn(Type.Number, 3)
    );

    expect(await inferExpression(nilCtx, seq(l(10), l(1), l(-1)))).toEqual(
      Type.buildColumn(Type.Number, 10)
    );
  });

  it('infers sequences of dates', async () => {
    const getSize = async (
      start: AST.Date,
      end: AST.Date,
      by: 'year' | 'quarter' | 'month' | 'day' | 'hour' | 'minute'
    ) => {
      const t = await inferExpression(nilCtx, seq(start, end, n('ref', by)));

      return t.errorCause ?? t.columnSize;
    };

    // Years
    expect(
      await getSize(date('2020-01', 'year'), date('2020-01', 'year'), 'year')
    ).toEqual(1);

    // Quarters
    expect(
      await getSize(
        date('2020-01', 'month'),
        date('2020-02', 'month'),
        'quarter'
      )
    ).toEqual(1);

    expect(
      await getSize(
        date('2020-01', 'month'),
        date('2020-03', 'month'),
        'quarter'
      )
    ).toEqual(1);

    expect(
      await getSize(
        date('2020-01', 'month'),
        date('2020-04', 'month'),
        'quarter'
      )
    ).toEqual(2);

    expect(
      await getSize(
        date('2020-01', 'month'),
        date('2020-05', 'month'),
        'quarter'
      )
    ).toEqual(2);

    expect(
      await getSize(
        date('2020-01', 'month'),
        date('2021-01', 'month'),
        'quarter'
      )
    ).toEqual(5);

    // Months
    expect(
      await getSize(date('2020-01', 'month'), date('2020-01', 'month'), 'month')
    ).toEqual(1);

    expect(
      await getSize(date('2020-01', 'month'), date('2020-03', 'month'), 'month')
    ).toEqual(3);

    // Days
    expect(
      await getSize(date('2021-01-01', 'day'), date('2022-01-01', 'day'), 'day')
    ).toEqual(366);

    expect(
      await getSize(date('2020-01-01', 'day'), date('2021-01-01', 'day'), 'day')
    ).toEqual(367);

    expect(
      await getSize(date('2021-02-01', 'day'), date('2021-03-01', 'day'), 'day')
    ).toEqual(29);

    // Time
    expect(
      await getSize(
        date('2021-02-01', 'hour'),
        date('2021-02-02', 'hour'),
        'hour'
      )
    ).toEqual(25);

    // Across DST
    expect(
      await getSize(
        date('2021-03-01', 'hour'),
        date('2021-03-02', 'hour'),
        'hour'
      )
    ).toEqual(25);

    expect(
      await getSize(
        date('2021-02-01', 'hour'),
        date('2021-02-02', 'hour'),
        'minute'
      )
    ).toEqual(60 * 24 + 1);
  });

  it('catches multiple errors', async () => {
    const msg = async (start: number, end: number, by: number) =>
      (await inferExpression(nilCtx, seq(l(start), l(end), l(by)))).errorCause
        ?.message;

    expect(await msg(10, 1, 1)).toEqual('Divergent sequence');
    expect(await msg(1, 10, -1)).toEqual('Divergent sequence');
    expect(await msg(1, 10, 0)).toEqual('Sequence interval must not be zero');
  });

  it('refuses variable references anywhere in the sequence', async () => {
    const ctx = makeContext([
      ['Bad', Type.Number],
      ['DBad', Type.buildDate('month')],
    ]);

    expect(
      (await inferExpression(ctx, seq(n('ref', 'Bad'), l(10), l(2)))).errorCause
    ).not.toBeNull();

    expect(
      (await inferExpression(ctx, seq(l(10), n('ref', 'Bad'), l(2)))).errorCause
    ).not.toBeNull();

    expect(
      (await inferExpression(ctx, seq(l(10), l(2), n('ref', 'Bad')))).errorCause
    ).not.toBeNull();

    // Dates

    const d = date('2020-01', 'month');
    expect(
      (await inferExpression(ctx, seq(n('ref', 'DBad'), d, n('ref', 'month'))))
        .errorCause
    ).not.toBeNull();

    expect(
      (await inferExpression(ctx, seq(d, n('ref', 'DBad'), n('ref', 'month'))))
        .errorCause
    ).not.toBeNull();

    expect(
      (await inferExpression(ctx, seq(d, d, n('ref', 'DBad')))).errorCause
    ).not.toBeNull();
  });
});

describe('dates', () => {
  it('infers dates', async () => {
    expect(await inferExpression(nilCtx, date('2020-01', 'month'))).toEqual(
      Type.buildDate('month')
    );

    expect(await inferExpression(nilCtx, date('2020-01-15', 'day'))).toEqual(
      Type.buildDate('day')
    );
  });

  it('infers date fns', async () => {
    expect(
      await inferExpression(
        nilCtx,
        c('dateequals', date('2020-01', 'month'), date('2020-01', 'month'))
      )
    ).toEqual(Type.Boolean);

    expect(
      (
        await inferExpression(
          nilCtx,
          c('dateequals', date('2020-01-01', 'day'), date('2020-01', 'month'))
        )
      ).errorCause
    ).not.toBeNull();
  });
});

describe('time quantities', () => {
  it('can be inferred', async () => {
    expect(
      await inferExpression(
        nilCtx,
        timeQuantity({
          year: 2020,
          minute: 3,
        })
      )
    ).toEqual(Type.buildTimeQuantity(['year', 'minute']));
  });
});

describe('columns', () => {
  it('infers columns', async () => {
    expect(await inferExpression(nilCtx, col(1, 2, 3))).toEqual(
      Type.build({ type: 'number', columnSize: 3 })
    );

    expect(await inferExpression(nilCtx, col(c('+', l(1), l(1))))).toEqual(
      Type.build({ type: 'number', columnSize: 1 })
    );

    const mixedCol = col(l(1), l('hi'));
    expect(await inferExpression(nilCtx, mixedCol)).toEqual(
      Type.buildTuple([Type.Number, Type.String])
    );
  });

  it('column-ness is infectious', async () => {
    expect(await inferExpression(nilCtx, c('+', col(1, 2, 3), l(1)))).toEqual(
      Type.build({
        type: 'number',
        columnSize: 3,
      })
    );
    expect(await inferExpression(nilCtx, c('+', l(1), col(1, 2, 3)))).toEqual(
      Type.build({
        type: 'number',
        columnSize: 3,
      })
    );
  });

  it('infers columns of dates', async () => {
    expect(
      await inferExpression(
        nilCtx,
        col(date('2020-01', 'month'), date('2020-02', 'month'))
      )
    ).toEqual(
      Type.build({
        date: 'month',
        columnSize: 2,
      })
    );
  });

  it('can be reduced with the total function', async () => {
    expect(await inferExpression(nilCtx, c('total', col(1, 2, 3)))).toEqual(
      Type.Number
    );
  });
});

describe('tables', () => {
  it('infers table defs', async () => {
    const tableContext = makeContext();

    const expectedType = Type.buildTuple(
      [
        Type.build({ type: 'number', columnSize: 3 }),
        Type.build({ type: 'number', columnSize: 3 }),
      ],
      ['Col1', 'Col2']
    );

    expect(
      await inferStatement(
        tableContext,
        tableDef('Table', {
          Col1: col(1, 2, 3),
          Col2: c('+', n('ref', 'Col1'), l(2)),
        })
      )
    ).toEqual(expectedType);

    expect(tableContext.stack.get('Table')).toEqual(expectedType);
  });

  it('References to table columns', async () => {
    const block = n(
      'block',
      tableDef('Table', { Col1: col(1, 2, 3) }),
      n(
        'assign',
        n('def', 'Col'),
        n('property-access', n('ref', 'Table'), 'Col1')
      )
    );

    expect((await inferProgram([block])).variables.get('Col')).toEqual(
      Type.buildColumn(Type.Number, 3)
    );
  });

  it('"previous" references', async () => {
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

    expect(await inferStatement(makeContext(), table)).toEqual(expectedType);
  });

  it('unifies table sizes', async () => {
    const table = tableDef('Table', {
      Col1: l(1),
      Col2: col(1, 2),
    });

    expect(await inferStatement(makeContext(), table)).toEqual(
      Type.buildTuple(
        [Type.buildColumn(Type.Number, 2), Type.buildColumn(Type.Number, 2)],
        ['Col1', 'Col2']
      )
    );
  });

  it('complains about incompatible table sizes', async () => {
    const table = tableDef('Table', {
      Col1: col(1),
      Col2: col(1, 2),
    });

    expect(
      (await inferStatement(makeContext(), table)).errorCause
    ).not.toBeNull();
  });

  it('Can be record oriented', async () => {
    const recordOriented = col(
      table({ A: l(1), B: l('hi') }),
      table({ A: l(2), B: l('hello') }),
      table({ A: l(3), B: l('hiii') })
    );
    expect(await inferStatement(nilCtx, recordOriented)).toEqual(
      Type.buildColumn(
        Type.buildTuple([Type.Number, Type.String], ['A', 'B']),
        3
      )
    );
  });

  it('Supports single items tuples', async () => {
    const table = tableDef('Table', {
      Col1: l('hi'),
      Col2: l(2),
    });

    expect(await inferStatement(makeContext(), table)).toEqual(
      Type.buildTuple([Type.String, Type.Number], ['Col1', 'Col2'])
    );
  });

  it('Supports previous in single item tuples', async () => {
    const table = tableDef('Table', {
      Col1: c('previous', l('hi')),
      Col2: l(2),
    });

    expect(await inferStatement(makeContext(), table)).toEqual(
      Type.buildTuple([Type.String, Type.Number], ['Col1', 'Col2'])
    );
  });
});

describe('imported data', () => {
  it('infers imported data from csv', async () => {
    const contentType = 'text/csv';
    const url = dataUrl(
      readFile(pathJoin(__dirname, '..', 'data', 'test1.csv')),
      contentType
    );
    const data = importedData(url, contentType);
    expect(await inferExpression(nilCtx, data)).toEqual(
      Type.buildTuple(
        [
          Type.buildListFromUnifiedType(Type.String, 10),
          Type.buildListFromUnifiedType(Type.Number, 10),
          Type.buildListFromUnifiedType(Type.buildDate('time'), 10),
        ],
        ['Col1', 'Col2', 'Col3']
      )
    );
  });
});

it('infers refs', async () => {
  const scopeWithVariable = makeContext();
  scopeWithVariable.stack.set('N', Type.Number);

  expect(await inferExpression(scopeWithVariable, r('N'))).toEqual(Type.Number);

  const errorCause = new InferError('Undefined variable MissingVar');
  expect(await inferExpression(scopeWithVariable, r('MissingVar'))).toEqual(
    Type.Impossible.withErrorCause(errorCause).inNode(r('MissingVar'))
  );
});

describe('Given', () => {
  it('Works on scalars', async () => {
    const scopeWithColumn = makeContext([
      ['Nums', Type.buildColumn(Type.Number, 3)],
    ]);

    expect(await inferExpression(scopeWithColumn, given('Nums', l(1)))).toEqual(
      Type.buildColumn(Type.Number, 3)
    );

    expect(
      await inferExpression(scopeWithColumn, given('Nums', l('hi')))
    ).toEqual(Type.buildColumn(Type.String, 3));

    expect(
      await inferExpression(
        scopeWithColumn,
        given('Nums', c('+', r('Nums'), l(1)))
      )
    ).toEqual(Type.buildColumn(Type.Number, 3));
  });

  it('Works with non-scalar bodies', async () => {
    const scopeWithColumn = makeContext([
      ['Nums', Type.buildColumn(Type.Number, 3)],
    ]);

    expect(
      await inferExpression(
        scopeWithColumn,
        given('Nums', col(l('s1'), l('s2')))
      )
    ).toEqual(Type.buildColumn(Type.buildColumn(Type.String, 2), 3));

    expect(
      await inferExpression(scopeWithColumn, given('Nums', col(l('s1'), l(1))))
    ).toEqual(Type.buildColumn(Type.buildTuple([Type.String, Type.Number]), 3));
  });

  it('Works with tables', async () => {
    const scopeWithTable = makeContext([
      [
        'Table',
        Type.buildTuple(
          [Type.buildColumn(Type.Number, 4), Type.buildColumn(Type.String, 4)],
          ['Nums', 'Strs']
        ),
      ],
    ]);

    expect(
      await inferExpression(
        scopeWithTable,
        given('Table', c('+', prop('Table', 'Nums'), l(1)))
      )
    ).toEqual(Type.buildColumn(Type.Number, 4));

    expect(
      await inferExpression(
        scopeWithTable,
        given('Table', table({ Col: prop('Table', 'Nums') }))
      )
    ).toEqual(Type.buildTuple([Type.buildColumn(Type.Number, 4)], ['Col']));
  });

  it('Works with record-oriented tables', async () => {
    const scopeWithTable = makeContext([
      [
        'RTable',
        Type.buildColumn(
          Type.buildTuple([Type.Number, Type.String], ['Nums', 'Strs']),
          3
        ),
      ],
    ]);

    expect(
      await inferExpression(
        scopeWithTable,
        given('RTable', c('+', prop('RTable', 'Nums'), l(1)))
      )
    ).toEqual(Type.buildColumn(Type.Number, 3));
  });

  it('Needs a column, table, or record-oriented table', async () => {
    const scopeWithTupleAndNum = makeContext([
      ['Tuple', Type.buildTuple([Type.Number, Type.String], ['A', 'B'])],
      ['Num', Type.Number],
    ]);

    expect(
      (await inferExpression(scopeWithTupleAndNum, given('Tuple', l(1))))
        .errorCause
    ).not.toBeNull();

    expect(
      (await inferExpression(scopeWithTupleAndNum, given('Num', l(1))))
        .errorCause
    ).not.toBeNull();
  });
});

it('infers binops', async () => {
  expect(await inferExpression(nilCtx, c('+', l(1), l(1)))).toEqual(
    Type.Number
  );

  // These assertions will be different WRT integer/float casts eventually
  expect(await inferExpression(nilCtx, c('+', l(0.1), l(0.2)))).toEqual(
    Type.Number
  );
  expect(await inferExpression(nilCtx, c('+', l(1.1), l(1)))).toEqual(
    Type.Number
  );
  expect(await inferExpression(nilCtx, c('+', l(1), l(1.1)))).toEqual(
    Type.Number
  );

  expect(await inferExpression(nilCtx, c('>', l(1), l(0.5)))).toEqual(
    Type.Boolean
  );
  expect(await inferExpression(nilCtx, c('==', l(1), l(0.5)))).toEqual(
    Type.Boolean
  );

  const errorCtx = makeContext();
  const badExpr = c('==', l(1), l(true));

  expect(await inferExpression(errorCtx, badExpr)).toEqual(
    Type.Impossible.withErrorCause('Expected number').inNode(badExpr)
  );
});

it('infers conditions', async () => {
  expect(await inferExpression(nilCtx, c('if', l(true), l(1), l(1)))).toEqual(
    Type.Number
  );

  expect(
    await inferExpression(nilCtx, c('if', l(true), l('str'), l('other str')))
  ).toEqual(Type.String);

  const errorCtx = makeContext();
  const badConditional = c('if', l(true), l('wrong!'), l(1));

  expect(await inferExpression(errorCtx, badConditional)).toEqual(
    Type.Impossible.withErrorCause('Expected string').inNode(badConditional)
  );
});

describe('inferFunction', () => {
  it('Accepts arguments types and returns a return type', async () => {
    const functionWithSpecificTypes = funcDef('Fn', ['A'], r('A'));

    expect(
      await inferFunction(nilCtx, functionWithSpecificTypes, [Type.Boolean])
    ).toEqual(Type.Boolean);
  });

  it('disallows wrong argument count', async () => {
    const unaryFn = funcDef('Fn', ['A'], r('A'));

    let errorCtx = makeContext();
    const badArgumentCountError = new InferError(
      'Wrong number of arguments applied to Fn (expected 1)'
    );
    expect(await inferFunction(errorCtx, unaryFn, [])).toEqual(
      Type.Impossible.withErrorCause(badArgumentCountError)
    );

    errorCtx = makeContext();
    const badArgumentCountError2 = new InferError(
      'Wrong number of arguments applied to Fn (expected 1)'
    );
    expect(
      await inferFunction(errorCtx, unaryFn, [Type.Boolean, Type.String])
    ).toEqual(Type.Impossible.withErrorCause(badArgumentCountError2));
  });
});

describe('inferProgram', () => {
  it('infers the whole program', async () => {
    const program: AST.Block[] = [
      n('block', n('assign', n('def', 'A'), l(3)), c('+', r('A'), l(1.1))),
    ];

    expect(await inferProgram(program)).toEqual({
      variables: new Map([['A', Type.Number]]),
      blockReturns: [Type.Number],
    });

    const wrongProgram = produce(program, (wrongProgram: AST.Block[]) => {
      const argList = wrongProgram[0].args[1].args[1] as AST.ArgList;

      argList.args[1] = l('bad string, bad string!');
    });
    const badCall = wrongProgram[0].args[1];

    expect(await inferProgram(wrongProgram)).toEqual({
      variables: new Map([['A', Type.Number]]),
      blockReturns: [
        Type.Impossible.withErrorCause('Expected number').inNode(badCall),
      ],
    });
  });

  it('supports calling functions', async () => {
    const program: AST.Block[] = [
      n(
        'block',
        funcDef('Plus', ['A', 'B'], c('+', r('A'), r('B'))),
        n('assign', n('def', 'Result'), c('Plus', l(2), l(2)))
      ),
    ];

    expect(await inferProgram(program)).toEqual({
      variables: new Map([['Result', Type.Number]]),
      blockReturns: [Type.Number],
    });
  });
});

describe('inferTargetStatement', () => {
  it('can infer the result of a statement', async () => {
    const program = [
      n('block', n('assign', n('def', 'A'), l(10))),
      n('block', c('+', r('A'), r('A'))),
    ];

    expect(await inferTargetStatement(program, [0, 0])).toEqual(Type.Number);
    expect(await inferTargetStatement(program, [1, 0])).toEqual(Type.Number);

    // Bad path
    expect(() => inferTargetStatement(program, [2, 0])).rejects.toThrow();
  });

  it('returns propagated errors', async () => {
    const badCall = c('+', l('string'), l(1));
    const badProgram = [n('block', badCall)];

    expect(await inferTargetStatement(badProgram, [0, 0])).toEqual(
      Type.Impossible.withErrorCause(new InferError('Expected number')).inNode(
        badCall
      )
    );
  });
});

describe('Units', () => {
  const getWithUnit = (unit: AST.Unit[] | null) =>
    Type.build({ type: 'number', unit });
  it("infers literals' units", async () => {
    expect(await inferExpression(nilCtx, l(1))).toEqual(getWithUnit(null));
    expect(await inferExpression(nilCtx, l(1, degC))).toEqual(
      getWithUnit([degC])
    );
  });

  it('infers expressions units', async () => {
    const type = await inferExpression(nilCtx, c('+', l(1, degC), l(1, degC)));
    expect(type).toMatchObject(getWithUnit([degC]));
  });

  it('composes units', async () => {
    const type = await inferExpression(
      nilCtx,
      c('/', l(1, degC), l(1, seconds))
    );
    const withNullUnit = await inferExpression(
      nilCtx,
      c('/', l(1, degC), l(1))
    );

    expect(type).toMatchObject(getWithUnit([degC, inverseExponent(seconds)]));
    expect(withNullUnit).toMatchObject(getWithUnit([degC]));
  });

  it('decomposes units', async () => {
    const type = await inferExpression(
      nilCtx,
      c('*', l(1, meters, inverseExponent(seconds)), l(1, seconds))
    );
    // const withNullUnit = inferExpression(nilCtx, c('*', l(1, seconds), l(1)))

    expect(type).toMatchObject(getWithUnit([meters]));
    // TODO expect(withNullUnit).toEqual(Type.Number)
  });

  it('fills in incompatible unit errors', async () => {
    const badUnits = c('+', l(1, degC), l(1, seconds));
    const ctxForError = makeContext();

    const badUnitsError = new InferError(
      'Mismatched units: celsius and second'
    );
    expect(await inferExpression(ctxForError, badUnits)).toEqual(
      Type.Impossible.withErrorCause(badUnitsError).inNode(badUnits)
    );
  });
});
