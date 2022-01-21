import { dequal } from 'dequal';

import { AST, inferBlock, Unit } from '..';
import { InferError, Type, build as t } from '../type';
import {
  F,
  l,
  c,
  n,
  r,
  ne,
  as,
  col,
  range,
  date,
  tableDef,
  funcDef,
  prop,
  fetchData,
  assign,
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

let nilCtx = makeContext();
const degC: Unit = {
  unit: 'celsius',
  exp: F(1),
  multiplier: F(1),
  known: true,
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

  it('does not mangle units', async () => {
    expect(
      await inferExpression(
        nilCtx,
        col(c('*', l(1), r('cm')), c('*', l(1), r('m')))
      )
    ).toMatchInlineSnapshot(`Error: Column cannot contain both cm and m`);

    expect(
      await inferExpression(
        nilCtx,
        col(c('*', l(1), r('cm')), c('*', l(1), r('ft')))
      )
    ).toMatchInlineSnapshot(`Error: Column cannot contain both cm and ft`);
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
      t.column(t.number(), 3, 'Table', 0)
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
            Col1: prop(r('MissingVar'), 'nosuchprop'),
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

  it('Evaluates iteratively when it sees a plain reference to another column', async () => {
    const block = n(
      'block',
      tableDef('Table', {
        MaybeNegative: col(1, -2, 3),
        Positive: c('min', col(r('MaybeNegative'), 0)),
      })
    );

    expect(
      (await inferProgram([block])).stack.get('Table')?.toString()
    ).toMatchInlineSnapshot(
      `"table (3) { MaybeNegative = <number>, Positive = <number> }"`
    );
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
      `ErrSpec:free-form("message" => "A column named A does not exist in Table")`
    );

    expect(
      (await inferExpression(scopeWithTable, prop('NotATable', 'Col')))
        .errorCause?.spec.errType
    ).toEqual('expected-but-got');

    expect(
      (await inferExpression(scopeWithTable, prop('MissingVar', 'Col')))
        .errorCause?.spec
    ).toMatchInlineSnapshot(
      `ErrSpec:expected-but-got("expectedButGot" => ["table or row",{"node":null,"errorCause":null,"type":"number","unit":{"type":"units","args":[{"unit":"MissingVar","exp":{"s":"1","n":"1","d":"1"},"multiplier":{"s":"1","n":"1","d":"1"},"known":false}]},"date":null,"rangeOf":null,"indexName":null,"indexedBy":null,"cellType":null,"columnSize":null,"atParentIndex":null,"tableLength":null,"columnTypes":null,"columnNames":null,"rowCellTypes":null,"rowCellNames":null,"functionness":false}])`
    );
  });
});

it('infers refs', async () => {
  const scopeWithVariable = makeContext();
  scopeWithVariable.stack.set('N', t.number());

  expect(await inferExpression(scopeWithVariable, r('N'))).toEqual(t.number());
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

  it("gets a separate stack so as to not see another function's arg", async () => {
    const funcs = block(
      funcDef('ShouldFail', [], r('OtherFunctionsArgument')),
      funcDef('Func', ['OtherFunctionsArgument'], c('ShouldFail')),
      c('Func', l('string'))
    );

    const ctx = makeContext();
    expect((await inferBlock(funcs, ctx)).toString()).toMatch(
      /OtherFunctionsArgument/
    );
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

jest.mock('../data', () => ({
  // Mock fetchData
  resolve: jest.fn(() => ({
    numCols: 0,
    length: 0,
  })),
}));

describe('Data', () => {
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('infers imported data', async () => {
    const ctx = makeContext();
    expect(
      await inferStatement(
        ctx,
        assign(
          'IndexName',
          fetchData('http://example.com/data', 'text/whatever')
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
  expect(await inferExpression(nilCtx, as(l(3), ne(1, 'celsius')))).toEqual(
    t.number([degC])
  );
});
