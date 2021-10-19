import { produce } from 'immer';
import { dequal } from 'dequal';

import { AST } from '..';
import { InferError, inverseExponent, build as t } from '../type';

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
} from '../utils';

import { makeContext } from './context';
import {
  inferStatement,
  inferExpression,
  inferFunction,
  inferProgram,
} from './index';
import { objectToTableType } from '../testUtils';

const nilPos = {
  line: 0,
  column: 0,
  char: 0,
};
let nilCtx = makeContext();
const degC: AST.Unit = {
  unit: 'degrees',
  exp: 1,
  multiplier: 1,
  known: true,
  start: nilPos,
  end: nilPos,
};
const seconds: AST.Unit = {
  unit: 'seconds',
  exp: 1,
  multiplier: 1,
  known: true,
  start: nilPos,
  end: nilPos,
};
const meters: AST.Unit = {
  unit: 'meters',
  exp: 1,
  multiplier: 1,
  known: true,
  start: nilPos,
  end: nilPos,
};

afterEach(() => {
  nilCtx.nodeTypes = new Map();
  if (!dequal(nilCtx, makeContext())) {
    // Restore to avoid failing further stillEmpty checks
    nilCtx = makeContext();

    throw new Error('sanity check failed: nilCtx was modified');
  }
});

it('infers literals', async () => {
  expect(await inferExpression(nilCtx, l(1.1))).toEqual(t.number());
  expect(await inferExpression(nilCtx, l(1))).toEqual(t.number());

  expect(await inferExpression(nilCtx, l('one'))).toEqual(t.string());

  expect(await inferExpression(nilCtx, l(true))).toEqual(t.boolean());
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
      t.range(t.number())
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
    expect(await inferExpression(nilCtx, r)).toEqual(t.range(t.date('month')));

    expect(
      await inferExpression(
        nilCtx,
        c('containsdate', r, date('2020-01', 'month'))
      )
    ).toEqual(t.boolean());
  });

  it('infers range functions', async () => {
    expect(
      await inferExpression(nilCtx, c('contains', range(1, 10), l(1)))
    ).toEqual(t.boolean());
    expect(
      (await inferExpression(nilCtx, c('contains', l(1), l(1)))).errorCause
    ).not.toBeNull();
  });
});

describe('sequences', () => {
  it('infers sequences of numbers', async () => {
    expect(await inferExpression(nilCtx, seq(l(1), l(1), l(1)))).toEqual(
      t.column(t.number(), 1)
    );

    expect(await inferExpression(nilCtx, seq(l(1), l(2), l(1)))).toEqual(
      t.column(t.number(), 2)
    );

    expect(await inferExpression(nilCtx, seq(l(1), l(8), l(3)))).toEqual(
      t.column(t.number(), 3)
    );

    expect(await inferExpression(nilCtx, seq(l(10), l(1), l(-1)))).toEqual(
      t.column(t.number(), 10)
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
    const ctx = makeContext({
      initialGlobalScope: [
        ['Bad', t.number()],
        ['DBad', t.date('month')],
      ],
    });

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
      t.date('month')
    );

    expect(await inferExpression(nilCtx, date('2020-01-15', 'day'))).toEqual(
      t.date('day')
    );
  });

  it('infers date fns', async () => {
    expect(
      await inferExpression(
        nilCtx,
        c('dateequals', date('2020-01', 'month'), date('2020-01', 'month'))
      )
    ).toEqual(t.boolean());

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
    ).toEqual(t.timeQuantity(['year', 'minute']));
  });
});

describe('columns', () => {
  it('infers columns', async () => {
    expect(await inferExpression(nilCtx, col(1, 2, 3))).toEqual(
      t.column(t.number(), 3)
    );

    expect(await inferExpression(nilCtx, col(c('+', l(1), l(1))))).toEqual(
      t.column(t.number(), 1)
    );

    const mixedCol = col(l(1), l('hi'));
    expect(await inferExpression(nilCtx, mixedCol)).toMatchObject({
      errorCause: InferError.columnContainsInconsistentType(
        t.number(),
        t.string()
      ),
    });

    const emptyCol = col();
    expect(await inferExpression(nilCtx, emptyCol)).toMatchObject({
      errorCause: InferError.unexpectedEmptyColumn(),
    });
  });

  it('column-ness is infectious', async () => {
    expect(await inferExpression(nilCtx, c('+', col(1, 2, 3), l(1)))).toEqual(
      t.column(t.number(), 3)
    );
    expect(await inferExpression(nilCtx, c('+', l(1), col(1, 2, 3)))).toEqual(
      t.column(t.number(), 3)
    );
  });

  it('infers columns of dates', async () => {
    expect(
      await inferExpression(
        nilCtx,
        col(date('2020-01', 'month'), date('2020-02', 'month'))
      )
    ).toEqual(t.column(t.date('month'), 2));
  });

  it('can be reduced with the total function', async () => {
    expect(await inferExpression(nilCtx, c('total', col(1, 2, 3)))).toEqual(
      t.number()
    );
  });

  it('propagates errors within', async () => {
    expect(
      (await inferExpression(nilCtx, col(1, 2, r('MissingVar')))).errorCause
        ?.message
    ).toMatch(/MissingVar/);
  });
});

describe('tables', () => {
  it('infers table defs', async () => {
    const tableContext = makeContext();

    const expectedType = t.table({
      length: 3,
      columnTypes: [t.number(), t.number()],
      columnNames: ['Col1', 'Col2'],
    });

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
      t.column(t.number(), 3)
    );
  });

  it('"previous" references', async () => {
    const expectedType = t.table({
      length: 3,
      columnTypes: [t.number(), t.number(), t.string()],
      columnNames: ['Col1', 'Col2', 'Col3'],
    });

    const table = tableDef('Table', {
      Col1: col(1, 1, 1),
      Col2: c('+', n('ref', 'Col1'), c('previous', l(0))),
      Col3: c('previous', l('hi')),
    });

    expect(await inferStatement(makeContext(), table)).toEqual(expectedType);
  });

  it('"previous" references in given: expressions', async () => {
    const ctx = makeContext();

    ctx.stack.set('A', t.column(t.number(), 3));

    expect(
      await inferStatement(ctx, given('A', c('previous', l(1))))
    ).toMatchObject({ cellType: { type: 'number' } });
  });

  it('unifies column sizes', async () => {
    const table = tableDef('Table', {
      Col1: l(1),
      Col2: col(1, 2),
    });

    expect(await inferStatement(makeContext(), table)).toEqual(
      t.table({
        length: 2,
        columnTypes: [t.number(), t.number()],
        columnNames: ['Col1', 'Col2'],
      })
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

  it('Supports single items tables', async () => {
    const table = tableDef('Table', {
      Col1: l('hi'),
      Col2: l(2),
    });

    expect(await inferStatement(makeContext(), table)).toEqual(
      t.table({
        length: 1,
        columnTypes: [t.string(), t.number()],
        columnNames: ['Col1', 'Col2'],
      })
    );
  });

  it('Supports previous in single item tables', async () => {
    const table = tableDef('Table', {
      Col1: c('previous', l('hi')),
      Col2: l(2),
    });

    expect(await inferStatement(makeContext(), table)).toEqual(
      t.table({
        length: 1,
        columnTypes: [t.string(), t.number()],
        columnNames: ['Col1', 'Col2'],
      })
    );
  });

  it('Propagates errors in its items', async () => {
    expect(
      (
        await inferStatement(
          makeContext(),
          tableDef('Table', {
            Col1: r('MissingVar'),
          })
        )
      ).errorCause?.message
    ).toMatch(/MissingVar/);

    expect(
      (
        await inferStatement(
          makeContext(),
          tableDef('Table', {
            Col1: col(1, 2, r('MissingVar')),
          })
        )
      ).errorCause?.message
    ).toMatch(/MissingVar/);
  });
});

describe('Property access', () => {
  const scopeWithTable = makeContext({
    initialGlobalScope: [
      ['Table', objectToTableType(3, { Col: t.number() })],
      ['Row', t.row([t.string()], ['Name'])],
      ['NotATable', t.number()],
    ],
  });

  it('Accesses columns in tables', async () => {
    expect(
      (await inferExpression(scopeWithTable, prop('Table', 'Col'))).toString()
    ).toMatchInlineSnapshot(`"<number> x 3"`);

    expect(
      (await inferExpression(scopeWithTable, prop('Row', 'Name'))).toString()
    ).toMatchInlineSnapshot(`"<string>"`);
  });

  it('Property access errors', async () => {
    expect(
      (await inferExpression(scopeWithTable, prop('Table', 'A'))).errorCause
    ).toMatchInlineSnapshot(`
      InferError {
        "spec": ErrSpec:free-form("message" => "The property A does not exist in Table"),
      }
    `);

    expect(
      (await inferExpression(scopeWithTable, prop('NotATable', 'Col')))
        .errorCause
    ).toMatchInlineSnapshot(`
      InferError {
        "spec": ErrSpec:free-form("message" => "NotATable is not a table"),
      }
    `);

    expect(
      (await inferExpression(scopeWithTable, prop('MissingVar', 'Col')))
        .errorCause
    ).toMatchInlineSnapshot(`
      InferError {
        "spec": ErrSpec:missingVariable(["MissingVar"]),
      }
    `);
  });
});

it('infers refs', async () => {
  const scopeWithVariable = makeContext();
  scopeWithVariable.stack.set('N', t.number());

  expect(await inferExpression(scopeWithVariable, r('N'))).toEqual(t.number());

  expect(await inferExpression(scopeWithVariable, r('MissingVar'))).toEqual(
    t
      .impossible(InferError.missingVariable('MissingVar'))
      .inNode(r('MissingVar'))
  );
});

describe('Given', () => {
  it('Works on scalars', async () => {
    const scopeWithColumn = makeContext({
      initialGlobalScope: [['Nums', t.column(t.number(), 3)]],
    });

    expect(await inferExpression(scopeWithColumn, given('Nums', l(1)))).toEqual(
      t.column(t.number(), 3)
    );

    expect(
      await inferExpression(scopeWithColumn, given('Nums', l('hi')))
    ).toEqual(t.column(t.string(), 3));

    expect(
      await inferExpression(
        scopeWithColumn,
        given('Nums', c('+', r('Nums'), l(1)))
      )
    ).toEqual(t.column(t.number(), 3));
  });

  it('Works with column bodies', async () => {
    const scopeWithColumn = makeContext({
      initialGlobalScope: [['Nums', t.column(t.number(), 3)]],
    });

    expect(
      await inferExpression(
        scopeWithColumn,
        given('Nums', col(l('s1'), l('s2')))
      )
    ).toEqual(t.column(t.column(t.string(), 2), 3));
  });

  it('Works with tables', async () => {
    const scopeWithTable = makeContext({
      initialGlobalScope: [
        [
          'Table',
          t.table({
            length: 4,
            columnTypes: [t.number(), t.string()],
            columnNames: ['Nums', 'Strs'],
          }),
        ],
      ],
    });

    // Generates a column from a table
    expect(
      await inferExpression(
        scopeWithTable,
        given('Table', c('+', prop('Table', 'Nums'), l(1)))
      )
    ).toEqual(t.column(t.number(), 4));

    // Generates a table from a table
    expect(
      await inferExpression(
        scopeWithTable,
        given('Table', table({ Col: prop('Table', 'Nums') }))
      )
    ).toEqual(
      t.table({
        length: 4,
        columnTypes: [t.number()],
        columnNames: ['Col'],
      })
    );

    // Doesn't willingly nest tables (TODO this is implemented because tables of 1 row are special-cased)
    expect(
      (
        await inferExpression(
          scopeWithTable,
          given('Table', table({ Col: col(1, 2, 3) }))
        )
      ).errorCause?.message
    ).toMatch(/nest/i);
  });

  it('Needs a column or table', async () => {
    const scopeWithNum = makeContext({
      initialGlobalScope: [['Num', t.number()]],
    });

    expect(
      (await inferExpression(scopeWithNum, given('Num', l(1)))).errorCause
    ).not.toBeNull();
  });

  it('propagates errors in the given variable', async () => {
    const scopeWithColumn = makeContext({
      initialGlobalScope: [['Errored', t.impossible('oh no')]],
    });

    expect(
      (await inferExpression(scopeWithColumn, given('Errored', l(1))))
        .errorCause
    ).not.toBeNull();
  });

  it('propagates errors inside the expression', async () => {
    const scopeWithColumn = makeContext({
      initialGlobalScope: [['Nums', t.column(t.number(), 3)]],
    });

    expect(
      (await inferExpression(scopeWithColumn, given('Nums', r('MissingVar'))))
        .errorCause?.message
    ).toMatch(/MissingVar/);
  });
});

it('infers binops', async () => {
  expect(await inferExpression(nilCtx, c('+', l(1), l(1)))).toEqual(t.number());

  // These assertions will be different WRT integer/float casts eventually
  expect(await inferExpression(nilCtx, c('+', l(0.1), l(0.2)))).toEqual(
    t.number()
  );
  expect(await inferExpression(nilCtx, c('+', l(1.1), l(1)))).toEqual(
    t.number()
  );
  expect(await inferExpression(nilCtx, c('+', l(1), l(1.1)))).toEqual(
    t.number()
  );

  expect(await inferExpression(nilCtx, c('>', l(1), l(0.5)))).toEqual(
    t.boolean()
  );
  expect(await inferExpression(nilCtx, c('==', l(1), l(0.5)))).toEqual(
    t.boolean()
  );

  const errorCtx = makeContext();
  const badExpr = c('==', l(1), l(true));

  expect((await inferExpression(errorCtx, badExpr)).errorCause).toEqual(
    InferError.expectedButGot(t.number(), t.boolean())
  );
});

it('infers conditions', async () => {
  expect(await inferExpression(nilCtx, c('if', l(true), l(1), l(1)))).toEqual(
    t.number()
  );

  expect(
    await inferExpression(nilCtx, c('if', l(true), l('str'), l('other str')))
  ).toEqual(t.string());

  const errorCtx = makeContext();
  const badConditional = c('if', l(true), l('wrong!'), l(1));

  expect((await inferExpression(errorCtx, badConditional)).errorCause).toEqual(
    InferError.expectedButGot(t.string(), t.number())
  );
});

describe('inferFunction', () => {
  it('Accepts arguments types and returns a return type', async () => {
    const functionWithSpecificTypes = funcDef('Fn', ['A'], r('A'));

    expect(
      await inferFunction(nilCtx, functionWithSpecificTypes, [t.boolean()])
    ).toEqual(t.boolean());
  });

  it('disallows wrong argument count', async () => {
    const unaryFn = funcDef('Fn', ['A'], r('A'));

    let errorCtx = makeContext();
    expect((await inferFunction(errorCtx, unaryFn, [])).errorCause).toEqual(
      InferError.expectedArgCount('Fn', 1, 0)
    );

    errorCtx = makeContext();
    const badArgumentCountError2 = InferError.expectedArgCount('Fn', 1, 2);
    expect(
      (await inferFunction(errorCtx, unaryFn, [t.boolean(), t.string()]))
        .errorCause
    ).toEqual(badArgumentCountError2);
  });
});

describe('inferProgram', () => {
  it('infers the whole program', async () => {
    const program: AST.Block[] = [
      n('block', n('assign', n('def', 'A'), l(3)), c('+', r('A'), l(1.1))),
    ];

    expect(await inferProgram(program)).toEqual({
      variables: new Map([['A', t.number()]]),
      blockReturns: [t.number()],
    });

    const wrongProgram = produce(program, (wrongProgram: AST.Block[]) => {
      const argList = wrongProgram[0].args[1].args[1] as AST.ArgList;

      argList.args[1] = l('bad string, bad string!');
    });

    expect(await inferProgram(wrongProgram)).toMatchObject({
      variables: new Map([['A', t.number()]]),
      blockReturns: [
        {
          errorCause: InferError.badOverloadedBuiltinCall('+', [
            'number',
            'string',
          ]),
        },
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
      variables: new Map([['Result', t.number()]]),
      blockReturns: [t.number()],
    });
  });
});

describe('Units', () => {
  it("infers literals' units", async () => {
    expect(await inferExpression(nilCtx, l(1))).toEqual(t.number());
    expect(await inferExpression(nilCtx, l(1, degC))).toEqual(t.number([degC]));
  });

  it('infers expressions units', async () => {
    const type = await inferExpression(nilCtx, c('+', l(1, degC), l(1, degC)));
    expect(type).toMatchObject(t.number([degC]));
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

    expect(type).toMatchObject(t.number([degC, inverseExponent(seconds)]));
    expect(withNullUnit).toMatchObject(t.number([degC]));
  });

  it('decomposes units', async () => {
    const type = await inferExpression(
      nilCtx,
      c('*', l(1, meters, inverseExponent(seconds)), l(1, seconds))
    );
    // const withNullUnit = inferExpression(nilCtx, c('*', l(1, seconds), l(1)))

    expect(type).toMatchObject(t.number([meters]));
    // TODO expect(withNullUnit).toEqual(t.number())
  });

  it('fills in incompatible unit errors', async () => {
    const badUnits = c('+', l(1, degC), l(1, seconds));
    const ctxForError = makeContext();

    const badUnitsError = InferError.expectedUnit([degC], [seconds]);
    expect(await inferExpression(ctxForError, badUnits)).toEqual(
      t.impossible(badUnitsError).inNode(badUnits)
    );
  });

  it('fills in missing units', async () => {
    expect(await inferExpression(nilCtx, c('+', l(1), l(1, degC)))).toEqual(
      t.number([degC])
    );
    expect(await inferExpression(nilCtx, c('+', l(1, degC), l(1)))).toEqual(
      t.number([degC])
    );
  });

  it('removes units from some functions', async () => {
    expect(
      await inferExpression(nilCtx, c('^', l(1, meters), l(1, degC)))
    ).toEqual(t.number([meters]));
  });
});
