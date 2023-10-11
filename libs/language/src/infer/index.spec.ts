import { dequal, getDefined, produce } from '@decipad/utils';
import { ONE } from '@decipad/number';
import omit from 'lodash.omit';
import {
  AST,
  inferBlock,
  parseBlockOrThrow,
  parseExpressionOrThrow,
  Unit,
} from '..';
import { objectToMap, objectToTableType } from '../testUtils';
import { buildType as t, InferError, Type } from '../type';
import {
  as,
  assign,
  block,
  c,
  col,
  date,
  l,
  n,
  ne,
  prop,
  r,
  range,
  tableColAssign,
  tableDef,
} from '../utils';

import { makeContext } from './context';
import { inferExpression, inferProgram, inferStatement } from './index';

let nilCtx = makeContext();
const degC: Unit = {
  unit: 'celsius',
  exp: ONE,
  multiplier: ONE,
  known: true,
};

const makeColumn = ({
  tableName,
  cellType,
  atParentIndex,
}: {
  tableName: string;
  cellType: Type;
  atParentIndex?: number;
}): Type => {
  return t.column(
    produce(cellType, (ct) => {
      ct.indexedBy = tableName;
    }),
    tableName,
    atParentIndex
  );
};

const makeTable = ({
  tableName,
  columnTypes,
  columnNames,
}: {
  tableName: string;
  columnTypes: Type[];
  columnNames: string[];
}): Type => {
  return t.table({
    indexName: tableName,
    delegatesIndexTo: tableName,
    columnNames,
    columnTypes: columnTypes.map(
      produce((type) => {
        type.indexedBy = tableName;
      })
    ),
  });
};

afterEach(() => {
  const newContext = makeContext();
  if (!dequal(nilCtx, newContext)) {
    newContext.previous = nilCtx.previous;
  }
  nilCtx = makeContext();
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
      await (await inferProgram([reassigning])).stack.get('Reassigned')
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
      await inferExpression(nilCtx, c('contains', r, date('2020-01', 'month')))
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
        c('==', date('2020-01', 'month'), date('2020-01', 'month'))
      )
    ).toEqual(t.boolean());

    expect(
      (
        await inferExpression(
          nilCtx,
          c('==', date('2020-01-01', 'day'), date('2020-01', 'month'))
        )
      ).errorCause
    ).not.toBeNull();
  });
});

describe('columns', () => {
  it('infers columns', async () => {
    expect(await inferExpression(nilCtx, col(1, 2, 3))).toEqual(
      t.column(t.number())
    );

    expect(await inferExpression(nilCtx, col(c('+', l(1), l(1))))).toEqual(
      t.column(t.number())
    );

    const mixedCol = col(l(1), l('hi'));
    expect(await inferExpression(nilCtx, mixedCol)).toMatchObject({
      errorCause: InferError.expectedButGot(t.number(), t.string()),
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
        col(c('*', l(1), r('centimeter')), c('*', l(1), r('ft')))
      )
    ).toMatchObject({
      errorCause: { spec: { errType: 'column-contains-inconsistent-type' } },
    });
  });

  it('column-ness is infectious', async () => {
    expect(await inferExpression(nilCtx, c('+', col(1, 2, 3), l(1)))).toEqual(
      t.column(t.number())
    );
    expect(await inferExpression(nilCtx, c('+', l(1), col(1, 2, 3)))).toEqual(
      t.column(t.number())
    );
  });

  it('infers columns of dates', async () => {
    expect(
      await inferExpression(
        nilCtx,
        col(date('2020-01', 'month'), date('2020-02', 'month'))
      )
    ).toEqual(t.column(t.date('month')));
  });

  it('can be reduced with the total function', async () => {
    expect(await inferExpression(nilCtx, c('total', col(1, 2, 3)))).toEqual(
      t.number()
    );
  });
});

describe('error source tracking', () => {
  it('remembers where the error came from', async () => {
    const badExp = c('+', l(1), l('hi'));
    const badStatement = assign('BadVar', badExp);
    const badStatement2 = c('+', r('BadVar'), l(1));
    const program = block(badStatement, badStatement2);

    const ctx = makeContext();
    await inferBlock(program, ctx);

    // Both errors came from the same place
    expect(omit(badStatement.inferredType?.node, 'inferredType')).toEqual(
      omit(badExp, 'inferredType')
    );
    expect(omit(badStatement2.inferredType?.node, 'inferredType')).toEqual(
      omit(badExp, 'inferredType')
    );
  });
});

describe('tables', () => {
  it('infers table defs', async () => {
    const tableContext = makeContext();

    const expectedType = makeTable({
      tableName: 'Table',
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
      n('assign', n('def', 'Col'), prop('Table', 'Col1'))
    );

    const expectedColumn = makeColumn({
      tableName: 'Table',
      cellType: t.number(),
      atParentIndex: 0,
    });

    expect((await inferProgram([block])).stack.get('Col')).toMatchObject(
      expectedColumn
    );
  });

  it('"previous" references', async () => {
    const table = tableDef('Table', {
      Col1: col(1, 1, 1),
      Col2: c('+', n('ref', 'Col1'), c('previous', l(0))),
      Col3: c('previous', l('hi')),
    });

    expect(await inferStatement(makeContext(), table)).toMatchInlineSnapshot(`
      Type {
        "anythingness": false,
        "atParentIndex": null,
        "cellType": null,
        "columnNames": Array [
          "Col1",
          "Col2",
          "Col3",
        ],
        "columnTypes": Array [
          Type {
            "anythingness": false,
            "atParentIndex": null,
            "cellType": null,
            "columnNames": null,
            "columnTypes": null,
            "date": null,
            "delegatesIndexTo": undefined,
            "errorCause": null,
            "functionArgCount": undefined,
            "functionName": undefined,
            "functionness": false,
            "indexName": null,
            "indexedBy": "Table",
            "node": null,
            "nothingness": false,
            "numberError": null,
            "numberFormat": null,
            "pending": false,
            "rangeOf": null,
            "rowCellNames": null,
            "rowCellTypes": null,
            "rowCount": undefined,
            "rowIndexName": null,
            "symbol": null,
            "type": "number",
            "unit": null,
            Symbol(immer-draftable): true,
          },
          Type {
            "anythingness": false,
            "atParentIndex": null,
            "cellType": null,
            "columnNames": null,
            "columnTypes": null,
            "date": null,
            "delegatesIndexTo": undefined,
            "errorCause": null,
            "functionArgCount": undefined,
            "functionName": undefined,
            "functionness": false,
            "indexName": null,
            "indexedBy": "Table",
            "node": null,
            "nothingness": false,
            "numberError": null,
            "numberFormat": null,
            "pending": false,
            "rangeOf": null,
            "rowCellNames": null,
            "rowCellTypes": null,
            "rowCount": undefined,
            "rowIndexName": null,
            "symbol": null,
            "type": "number",
            "unit": null,
            Symbol(immer-draftable): true,
          },
          Type {
            "anythingness": false,
            "atParentIndex": null,
            "cellType": null,
            "columnNames": null,
            "columnTypes": null,
            "date": null,
            "delegatesIndexTo": undefined,
            "errorCause": null,
            "functionArgCount": undefined,
            "functionName": undefined,
            "functionness": false,
            "indexName": null,
            "indexedBy": "Table",
            "node": null,
            "nothingness": false,
            "numberError": null,
            "numberFormat": null,
            "pending": false,
            "rangeOf": null,
            "rowCellNames": null,
            "rowCellTypes": null,
            "rowCount": undefined,
            "rowIndexName": null,
            "symbol": null,
            "type": "string",
            "unit": null,
            Symbol(immer-draftable): true,
          },
        ],
        "date": null,
        "delegatesIndexTo": "Table",
        "errorCause": null,
        "functionArgCount": undefined,
        "functionName": undefined,
        "functionness": false,
        "indexName": "Table",
        "indexedBy": null,
        "node": null,
        "nothingness": false,
        "numberError": null,
        "numberFormat": null,
        "pending": false,
        "rangeOf": null,
        "rowCellNames": null,
        "rowCellTypes": null,
        "rowCount": undefined,
        "rowIndexName": null,
        "symbol": null,
        "type": null,
        "unit": null,
        Symbol(immer-draftable): true,
      }
    `);
  });

  it('unifies column sizes', async () => {
    const table = tableDef('Table', {
      Col1: l(1),
      Col2: col(1, 2),
    });

    expect(await inferStatement(makeContext(), table)).toMatchInlineSnapshot(`
      Type {
        "anythingness": false,
        "atParentIndex": null,
        "cellType": null,
        "columnNames": Array [
          "Col1",
          "Col2",
        ],
        "columnTypes": Array [
          Type {
            "anythingness": false,
            "atParentIndex": null,
            "cellType": null,
            "columnNames": null,
            "columnTypes": null,
            "date": null,
            "delegatesIndexTo": undefined,
            "errorCause": null,
            "functionArgCount": undefined,
            "functionName": undefined,
            "functionness": false,
            "indexName": null,
            "indexedBy": "Table",
            "node": null,
            "nothingness": false,
            "numberError": null,
            "numberFormat": null,
            "pending": false,
            "rangeOf": null,
            "rowCellNames": null,
            "rowCellTypes": null,
            "rowCount": undefined,
            "rowIndexName": null,
            "symbol": null,
            "type": "number",
            "unit": null,
            Symbol(immer-draftable): true,
          },
          Type {
            "anythingness": false,
            "atParentIndex": null,
            "cellType": null,
            "columnNames": null,
            "columnTypes": null,
            "date": null,
            "delegatesIndexTo": undefined,
            "errorCause": null,
            "functionArgCount": undefined,
            "functionName": undefined,
            "functionness": false,
            "indexName": null,
            "indexedBy": "Table",
            "node": null,
            "nothingness": false,
            "numberError": null,
            "numberFormat": null,
            "pending": false,
            "rangeOf": null,
            "rowCellNames": null,
            "rowCellTypes": null,
            "rowCount": undefined,
            "rowIndexName": null,
            "symbol": null,
            "type": "number",
            "unit": null,
            Symbol(immer-draftable): true,
          },
        ],
        "date": null,
        "delegatesIndexTo": "Table",
        "errorCause": null,
        "functionArgCount": undefined,
        "functionName": undefined,
        "functionness": false,
        "indexName": "Table",
        "indexedBy": null,
        "node": null,
        "nothingness": false,
        "numberError": null,
        "numberFormat": null,
        "pending": false,
        "rangeOf": null,
        "rowCellNames": null,
        "rowCellTypes": null,
        "rowCount": undefined,
        "rowIndexName": null,
        "symbol": null,
        "type": null,
        "unit": null,
        Symbol(immer-draftable): true,
      }
    `);
  });

  it('Supports single items tables', async () => {
    const table = tableDef('Table', {
      Col1: l('hi'),
      Col2: l(2),
    });

    expect(await inferStatement(makeContext(), table)).toMatchInlineSnapshot(`
      Type {
        "anythingness": false,
        "atParentIndex": null,
        "cellType": null,
        "columnNames": Array [
          "Col1",
          "Col2",
        ],
        "columnTypes": Array [
          Type {
            "anythingness": false,
            "atParentIndex": null,
            "cellType": null,
            "columnNames": null,
            "columnTypes": null,
            "date": null,
            "delegatesIndexTo": undefined,
            "errorCause": null,
            "functionArgCount": undefined,
            "functionName": undefined,
            "functionness": false,
            "indexName": null,
            "indexedBy": "Table",
            "node": null,
            "nothingness": false,
            "numberError": null,
            "numberFormat": null,
            "pending": false,
            "rangeOf": null,
            "rowCellNames": null,
            "rowCellTypes": null,
            "rowCount": undefined,
            "rowIndexName": null,
            "symbol": null,
            "type": "string",
            "unit": null,
            Symbol(immer-draftable): true,
          },
          Type {
            "anythingness": false,
            "atParentIndex": null,
            "cellType": null,
            "columnNames": null,
            "columnTypes": null,
            "date": null,
            "delegatesIndexTo": undefined,
            "errorCause": null,
            "functionArgCount": undefined,
            "functionName": undefined,
            "functionness": false,
            "indexName": null,
            "indexedBy": "Table",
            "node": null,
            "nothingness": false,
            "numberError": null,
            "numberFormat": null,
            "pending": false,
            "rangeOf": null,
            "rowCellNames": null,
            "rowCellTypes": null,
            "rowCount": undefined,
            "rowIndexName": null,
            "symbol": null,
            "type": "number",
            "unit": null,
            Symbol(immer-draftable): true,
          },
        ],
        "date": null,
        "delegatesIndexTo": "Table",
        "errorCause": null,
        "functionArgCount": undefined,
        "functionName": undefined,
        "functionness": false,
        "indexName": "Table",
        "indexedBy": null,
        "node": null,
        "nothingness": false,
        "numberError": null,
        "numberFormat": null,
        "pending": false,
        "rangeOf": null,
        "rowCellNames": null,
        "rowCellTypes": null,
        "rowCount": undefined,
        "rowIndexName": null,
        "symbol": null,
        "type": null,
        "unit": null,
        Symbol(immer-draftable): true,
      }
    `);
  });

  it('Supports previous in single item tables', async () => {
    const table = tableDef('Table', {
      Col1: c('previous', l('hi')),
      Col2: l(2),
    });

    expect(await inferStatement(makeContext(), table)).toMatchInlineSnapshot(`
      Type {
        "anythingness": false,
        "atParentIndex": null,
        "cellType": null,
        "columnNames": Array [
          "Col1",
          "Col2",
        ],
        "columnTypes": Array [
          Type {
            "anythingness": false,
            "atParentIndex": null,
            "cellType": null,
            "columnNames": null,
            "columnTypes": null,
            "date": null,
            "delegatesIndexTo": undefined,
            "errorCause": null,
            "functionArgCount": undefined,
            "functionName": undefined,
            "functionness": false,
            "indexName": null,
            "indexedBy": "Table",
            "node": null,
            "nothingness": false,
            "numberError": null,
            "numberFormat": null,
            "pending": false,
            "rangeOf": null,
            "rowCellNames": null,
            "rowCellTypes": null,
            "rowCount": undefined,
            "rowIndexName": null,
            "symbol": null,
            "type": "string",
            "unit": null,
            Symbol(immer-draftable): true,
          },
          Type {
            "anythingness": false,
            "atParentIndex": null,
            "cellType": null,
            "columnNames": null,
            "columnTypes": null,
            "date": null,
            "delegatesIndexTo": undefined,
            "errorCause": null,
            "functionArgCount": undefined,
            "functionName": undefined,
            "functionness": false,
            "indexName": null,
            "indexedBy": "Table",
            "node": null,
            "nothingness": false,
            "numberError": null,
            "numberFormat": null,
            "pending": false,
            "rangeOf": null,
            "rowCellNames": null,
            "rowCellTypes": null,
            "rowCount": undefined,
            "rowIndexName": null,
            "symbol": null,
            "type": "number",
            "unit": null,
            Symbol(immer-draftable): true,
          },
        ],
        "date": null,
        "delegatesIndexTo": "Table",
        "errorCause": null,
        "functionArgCount": undefined,
        "functionName": undefined,
        "functionness": false,
        "indexName": "Table",
        "indexedBy": null,
        "node": null,
        "nothingness": false,
        "numberError": null,
        "numberFormat": null,
        "pending": false,
        "rangeOf": null,
        "rowCellNames": null,
        "rowCellTypes": null,
        "rowCount": undefined,
        "rowIndexName": null,
        "symbol": null,
        "type": null,
        "unit": null,
        Symbol(immer-draftable): true,
      }
    `);
  });

  it('Errors cause the column to not be present', async () => {
    expect(
      getDefined(
        (
          await inferStatement(
            makeContext(),
            tableDef('Table', {
              Col1: prop(r('MissingVar'), 'nosuchprop'),
            })
          )
        ).columnTypes
      )[0]
    ).toBe(undefined);

    expect(
      getDefined(
        (
          await inferBlock(
            block(
              tableDef('Table', {}),
              tableColAssign(
                'Table',
                'NoColumnHere',
                parseExpressionOrThrow('1 meter + 1 second')
              ),
              r('Table')
            )
          )
        ).columnTypes
      )[0]
    ).toBe(undefined);
  });

  it('tracks the index through columns', async () => {
    expect(
      await inferStatement(
        makeContext(),
        tableDef('Table', {
          Col1: col(1, 2, 3),
          Col2: l(2),
          Col3: c('>', n('ref', 'Col1'), n('ref', 'Col2')),
        })
      )
    ).toMatchObject({
      columnNames: ['Col1', 'Col2', 'Col3'],
      columnTypes: [
        { type: 'number' },
        { type: 'number' },
        { type: 'boolean' },
      ],
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

    expect((await inferProgram([block])).stack.get('Table')).toMatchObject({
      columnNames: ['MaybeNegative', 'Positive'],
      columnTypes: [{ type: 'number' }, { type: 'number' }],
    });
  });
});

describe('Property access', () => {
  const scopeWithTable = makeContext({
    initialGlobalScope: [
      ['Table', objectToTableType('Table', { Col: t.number() })],
      ['Row', t.row([t.string()], ['Name'])],
      ['NotATable', t.number()],
    ],
  });

  it('Accesses columns in tables', async () => {
    expect(
      await inferExpression(scopeWithTable, prop('Table', 'Col'))
    ).toMatchObject({
      cellType: { type: 'number' },
    });

    expect(
      await inferExpression(scopeWithTable, prop('Row', 'Name'))
    ).toMatchObject({
      type: 'string',
    });
  });

  it('Property access errors', async () => {
    expect(
      (await inferExpression(scopeWithTable, prop('Table', 'A'))).errorCause
        ?.spec
    ).toMatchInlineSnapshot(`
      Object {
        "columnName": "A",
        "errType": "unknown-table-column",
        "tableName": "Table",
      }
    `);

    expect(
      (await inferExpression(scopeWithTable, prop('NotATable', 'Col')))
        .errorCause?.spec.errType
    ).toEqual('expected-but-got');

    expect(
      (await inferExpression(scopeWithTable, prop('MissingVar', 'Col')))
        .errorCause?.spec
    ).toMatchInlineSnapshot(`
      Object {
        "errType": "expected-but-got",
        "expectedButGot": Array [
          "table or row",
          Type {
            "anythingness": false,
            "atParentIndex": null,
            "cellType": null,
            "columnNames": null,
            "columnTypes": null,
            "date": null,
            "delegatesIndexTo": undefined,
            "errorCause": null,
            "functionArgCount": undefined,
            "functionName": undefined,
            "functionness": false,
            "indexName": null,
            "indexedBy": null,
            "node": null,
            "nothingness": false,
            "numberError": null,
            "numberFormat": null,
            "pending": false,
            "rangeOf": null,
            "rowCellNames": null,
            "rowCellTypes": null,
            "rowCount": undefined,
            "rowIndexName": null,
            "symbol": null,
            "type": "number",
            "unit": Array [
              Object {
                "exp": DeciNumber {
                  "d": 1n,
                  "infinite": false,
                  "n": 1n,
                  "s": 1n,
                },
                "known": false,
                "multiplier": DeciNumber {
                  "d": 1n,
                  "infinite": false,
                  "n": 1n,
                  "s": 1n,
                },
                "unit": "MissingVar",
              },
            ],
            Symbol(immer-draftable): true,
          },
        ],
      }
    `);
  });
});

describe('refs', () => {
  it('infers refs', async () => {
    const scopeWithVariable = makeContext();
    scopeWithVariable.stack.set('N', t.number());

    expect(await inferExpression(scopeWithVariable, r('N'))).toEqual(
      t.number()
    );
  });

  it('References to automatically generated varnames which are missing, are errors', async () => {
    const scopeWithVariable = makeContext({
      autoGeneratedVarNames: new Set(['AutoGenerated']),
    });

    expect(await inferExpression(scopeWithVariable, r('AutoGenerated')))
      .toMatchInlineSnapshot(`
      Type {
        "anythingness": false,
        "atParentIndex": null,
        "cellType": null,
        "columnNames": null,
        "columnTypes": null,
        "date": null,
        "delegatesIndexTo": undefined,
        "errorCause": [Error: Inference Error: unknown-reference],
        "functionArgCount": undefined,
        "functionName": undefined,
        "functionness": false,
        "indexName": null,
        "indexedBy": null,
        "node": Object {
          "args": Array [
            "AutoGenerated",
          ],
          "type": "ref",
        },
        "nothingness": false,
        "numberError": null,
        "numberFormat": null,
        "pending": false,
        "rangeOf": null,
        "rowCellNames": null,
        "rowCellTypes": null,
        "rowCount": undefined,
        "rowIndexName": null,
        "symbol": null,
        "type": null,
        "unit": null,
        Symbol(immer-draftable): true,
      }
    `);
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

describe('inferProgram', () => {
  it('skips over errors', async () => {
    const errorNode = c('+', r('A'), l('hi'));
    const program: AST.Block[] = [
      n(
        'block',
        assign('A', l(1)),
        assign('Error', errorNode),
        assign('C', l(2))
      ),
    ];

    const ctx = await inferProgram(program);

    expect(ctx.stack.globalVariables).toEqual(
      objectToMap({
        A: t.number(),
        Error: expect.objectContaining({
          errorCause: expect.anything(),
          node: omit(errorNode, 'inferredType'),
        }),
        C: t.number(),
      })
    );
  });
});

it('expands directives such as `as`', async () => {
  expect(
    await inferExpression(nilCtx, as(l(3), ne(1, 'celsius')))
  ).toMatchObject(t.number([degC]));
});

describe('name usage tracking', () => {
  const track = async (source: string) => {
    const ctx = makeContext();
    ctx.usedNames = [];

    const program = parseBlockOrThrow(source);
    await inferBlock(program, ctx);

    return ctx.usedNames.map(([ns, name]) => (ns ? `${ns}.${name}` : name));
  };

  it('tracks usage of names', async () => {
    expect(
      await track(`
        Unused = 1
        A = 123
        A + 1
      `)
    ).toMatchInlineSnapshot(`
      Array [
        "A",
      ]
    `);
  });

  it('does not track usage if errors occurred', async () => {
    expect(
      await track(`
        A = 1
        A + "hi"
      `)
    ).toMatchInlineSnapshot(`Array []`);
  });

  it('tracks columns used indirectly', async () => {
    expect(
      await track(`
        Table = {}
        Table.Col1 = 1
        lookup(Table, 1).Col1
      `)
    ).toMatchInlineSnapshot(`
      Array [
        "Table",
        "Table.Col1",
      ]
    `);
  });

  it('understands tables', async () => {
    expect(
      await track(`
        Table = {}
        Table.Col1 = 1
        Table.Col2 = Table.Col1 + 1
      `)
    ).toMatchInlineSnapshot(`
      Array [
        "Table",
        "Table.Col1",
      ]
    `);
  });

  it('does not mix up function args and local scopes with global scope', async () => {
    expect(
      await track(`
        X = 1
        F(X) = X + 1
        F(1)
      `)
    ).toMatchInlineSnapshot(`
      Array [
        "F",
      ]
    `);

    expect(
      await track(`
        X = 1
        Table = {
          X = 2
          Xx = X + 1
        }
      `)
    ).toMatchInlineSnapshot(`Array []`);
  });

  it('does not find self-references', async () => {
    expect(
      await track(`
        A = A + 1
      `)
    ).toMatchInlineSnapshot(`Array []`);

    expect(
      await track(`
        F(X) = F(X + 1)
      `)
    ).toMatchInlineSnapshot(`Array []`);

    expect(
      await track(`
        Table = {
          X = X + 1
        }
      `)
    ).toMatchInlineSnapshot(`Array []`);

    expect(
      await track(`
        Table = {
          X = 1
          Y = Table.X + 1
        }
      `)
    ).toMatchInlineSnapshot(`
      Array [
        "Table",
        "Table.X",
      ]
    `);

    expect(
      await track(`
        Table = {}
        Table.X = Table.X
      `)
    ).toMatchInlineSnapshot(`Array []`);
  });
});
