import { dequal } from 'dequal';

import { AST, inferBlock } from '..';
import { InferError, Type, inverseExponent, build as t } from '../type';
import {
  l,
  c,
  n,
  r,
  as,
  col,
  range,
  date,
  timeQuantity,
  tableDef,
  funcDef,
  prop,
  importedData,
  assign,
  units,
  block,
} from '../utils';
import { objectToMap, objectToTableType } from '../testUtils';
import { TableColumn, TableSpread } from '../parser/ast-types';

import {
  inferStatement,
  inferExpression,
  inferFunction,
  inferProgram,
} from './index';
import { makeContext } from './context';

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

expect.addSnapshotSerializer({
  test: (item) => item instanceof Type,
  serialize: (item: Type) => item.toString(),
});

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
      (await inferProgram([reassigning])).stack.get('Reassigned')?.errorCause
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
      indexName: 'Table',
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

  it('Errors on empty tables', async () => {
    expect(
      await inferStatement(makeContext(), tableDef('Table', {}))
    ).toMatchInlineSnapshot(`Error: Unexpected empty table`);
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

    expect((await inferProgram([block])).stack.get('Col')).toEqual(
      t.column(t.number(), 3, 'Table')
    );
  });

  it('"previous" references', async () => {
    const expectedType = t.table({
      indexName: 'Table',
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

  it('unifies column sizes', async () => {
    const table = tableDef('Table', {
      Col1: l(1),
      Col2: col(1, 2),
    });

    expect(await inferStatement(makeContext(), table)).toEqual(
      t.table({
        indexName: 'Table',
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
        indexName: 'Table',
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
        indexName: 'Table',
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

  it('tracks the index through columns', async () => {
    expect(
      (
        await inferStatement(
          makeContext(),
          tableDef('Table', {
            Col1: col(1, 2, 3),
            Col2: l(2),
            Col3: c('>', n('ref', 'Col1'), n('ref', 'Col2')),
          })
        )
      ).toString()
    ).toMatchInlineSnapshot(
      `"table (3) { Col1 = <number>, Col2 = <number>, Col3 = <boolean> }"`
    );
  });

  describe('table spreads', () => {
    const base = tableDef('Base', { Idx: col('1', '2') });
    const extend = (...cols: (TableColumn | TableSpread)[]) =>
      assign('Extended', n('table', n('table-spread', r('Base')), ...cols));

    it('extending with no new columns is just a copy', async () => {
      expect(await inferBlock(block(base, extend()))).toMatchInlineSnapshot(
        `table (2) { Idx = <string> }`
      );
    });

    it('can add a column', async () => {
      expect(
        await inferBlock(
          block(base, extend(n('table-column', n('coldef', 'New'), col(1, 2))))
        )
      ).toMatchInlineSnapshot(`table (2) { Idx = <string>, New = <number> }`);
    });

    it('needs the source table to be a table', async () => {
      expect(
        await inferBlock(block(assign('Base', l(1)), extend()))
      ).toMatchInlineSnapshot(
        `Error: This operation requires a table and a number was entered`
      );
    });

    it('supports (previous)', async () => {
      expect(
        await inferBlock(
          block(
            base,
            extend(
              n(
                'table-column',
                n('coldef', 'WithPrev'),
                c('previous', l(false))
              )
            )
          )
        )
      ).toMatchInlineSnapshot(
        `table (2) { Idx = <string>, WithPrev = <boolean> }`
      );
    });
  });
});

describe('Property access', () => {
  const scopeWithTable = makeContext({
    initialGlobalScope: [
      ['Table', objectToTableType('Table', 3, { Col: t.number() })],
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
        ?.spec
    ).toMatchInlineSnapshot(
      `ErrSpec:free-form("message" => "The property A does not exist in Table")`
    );

    expect(
      (await inferExpression(scopeWithTable, prop('NotATable', 'Col')))
        .errorCause?.spec.errType
    ).toEqual('expectedButGot');

    expect(
      (await inferExpression(scopeWithTable, prop('MissingVar', 'Col')))
        .errorCause?.spec
    ).toMatchInlineSnapshot(`ErrSpec:missingVariable(["MissingVar"])`);
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
  it('skips over errors', async () => {
    const errorNode = c('+', r('A'), l('hi'));
    const program: AST.Block[] = [
      n(
        'block',
        assign('A', l(1)),
        assign('Error', errorNode),
        assign('B', l(2))
      ),
    ];

    const ctx = await inferProgram(program);

    expect(ctx.stack.top).toEqual(
      objectToMap({
        A: t.number(),
        Error: expect.objectContaining({
          errorCause: expect.anything(),
          node: errorNode,
        }),
        B: t.number(),
      })
    );
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
    const withNullUnit = await inferExpression(
      nilCtx,
      c('*', l(1, seconds), l(1))
    );

    expect(type).toMatchObject(t.number([meters]));
    expect(withNullUnit).toEqual(t.number([seconds]));
  });

  it('fills in incompatible unit errors', async () => {
    const badUnits = c('+', l(1, degC), l(1, seconds));
    const ctxForError = makeContext();

    const badUnitsError = InferError.expectedUnit(units(degC), units(seconds));
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

jest.mock('../data', () => ({
  // Mock dataTable
  resolve: jest.fn(() => ({
    numCols: 0,
    length: 0,
  })),
}));

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('Data', () => {
  it('infers imported data', async () => {
    const ctx = makeContext();
    expect(
      await inferStatement(
        ctx,
        assign(
          'IndexName',
          importedData('http://example.com/data', 'text/whatever')
        )
      )
    ).toEqual(
      t.table({
        indexName: 'IndexName',
        length: 0,
        columnNames: [],
        columnTypes: [],
      })
    );
  });
});

it('expands directives such as `as`', async () => {
  expect(await inferExpression(nilCtx, as(l(3), n('units', degC)))).toEqual(
    t.number([degC])
  );
});
