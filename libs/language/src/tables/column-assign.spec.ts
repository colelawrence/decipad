import { inferStatement, makeContext } from '../infer';
import { buildType as t } from '../type';
import { c, col, l, r, tableColAssign } from '../utils';
import { evaluateColumnAssign, inferColumnAssign } from './column-assign';
import { Realm } from '../interpreter';
import { AST, parseExpressionOrThrow, Table } from '..';
import { jsCol } from '../lazy/testUtils';
import { materializeOneResult } from '../utils/materializeOneResult';

let ctx = makeContext();
beforeEach(() => {
  ctx = makeContext();
  ctx.stack.setNamespaced(['Table', 'Col1'], t.number(), 'function');
  ctx.stack.set('ColumnOfUnknownLength', t.column(t.number()));
  ctx.stack.createNamespace('Empty');
});

describe('Column assignment inference', () => {
  it('can create a new column with column data', async () => {
    const table = await inferColumnAssign(
      ctx,
      tableColAssign('Table', 'Col2', col(123))
    );
    expect(table).toMatchInlineSnapshot(`
      Type {
        "anythingness": false,
        "atParentIndex": 1,
        "cellType": Type {
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
        "type": null,
        "unit": null,
        Symbol(immer-draftable): true,
      }
    `);
  });
  it('can create a new column with scalar number', async () => {
    const expandedNum = await inferColumnAssign(
      ctx,
      tableColAssign('Table', 'Col2', l(1))
    );
    expect(expandedNum).toMatchInlineSnapshot(`
      Type {
        "anythingness": false,
        "atParentIndex": 1,
        "cellType": Type {
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
        "type": null,
        "unit": null,
        Symbol(immer-draftable): true,
      }
    `);
  });
  it('can create a new column with a formula', async () => {
    const expandedFormula = await inferColumnAssign(
      ctx,
      tableColAssign('Table', 'Col2', c('+', r('Col1'), l(1)))
    );
    expect(expandedFormula).toMatchInlineSnapshot(`
      Type {
        "anythingness": false,
        "atParentIndex": 1,
        "cellType": Type {
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
        "type": null,
        "unit": null,
        Symbol(immer-draftable): true,
      }
    `);
  });
  it('can create a new column with a formula using previous', async () => {
    const usingPrevious = await inferColumnAssign(
      ctx,
      tableColAssign('Table', 'Col2', c('+', c('previous', l(1)), l(1)))
    );
    expect(usingPrevious).toMatchInlineSnapshot(`
      Type {
        "anythingness": false,
        "atParentIndex": 1,
        "cellType": Type {
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
        "type": null,
        "unit": null,
        Symbol(immer-draftable): true,
      }
    `);
  });

  it('only works in global scope', async () => {
    await ctx.stack.withPushCall(async () => {
      const error = await inferColumnAssign(
        ctx,
        tableColAssign('Table', 'Col2', col(1, 2))
      );

      expect(error.errorCause?.spec).toMatchInlineSnapshot(`
        Object {
          "errType": "forbidden-inside-function",
          "forbiddenThing": "table",
        }
      `);
    });
  });

  it('propagates multiple errors', async () => {
    const duplicatedColumn = await inferColumnAssign(
      ctx,
      tableColAssign('Table', 'Col1', col('1', '2'))
    );
    expect(duplicatedColumn.errorCause?.spec.errType).toEqual(
      'duplicated-table-column'
    );
    expect(ctx.stack.globalVariables.get('Table')).toMatchObject({
      columnNames: ['Col1'],
      columnTypes: [{ type: 'number' }],
    });

    ctx.stack.set('Num', t.number());
    const assigningToNonTable = await inferStatement(
      ctx,
      tableColAssign('Num', 'Col', col(1, 2))
    );
    expect(assigningToNonTable.errorCause?.spec.errType).toMatchInlineSnapshot(
      `"expected-but-got"`
    );
    expect(ctx.stack.globalVariables.get('Num')).toMatchObject({
      type: 'number',
    });
  });
});

describe('Column assignment evaluation', () => {
  let realm = new Realm(ctx);
  const columnFormula = c('+', r('Col1'), l(2));
  const columnFormulaWithPrevious = c('+', c('previous', l(2)), l(1));

  beforeEach(async () => {
    realm = new Realm(ctx);
    realm.stack.createNamespace('Table');
    realm.stack.setNamespaced(['Table', 'Col1'], jsCol([1, 2]), 'function');
    await inferStatement(ctx, columnFormula);
    await inferStatement(ctx, columnFormulaWithPrevious);
  });

  const testColumnAssign = async (column: AST.Expression) => {
    const colAssign = tableColAssign('Table', 'Col2', column);
    await inferColumnAssign(realm.inferContext, colAssign);
    return evaluateColumnAssign(realm, colAssign);
  };
  const getColNames = () =>
    (realm.stack.globalVariables.get('Table') as Table).columnNames;

  it('whole-column assignment', async () => {
    const assigned = await testColumnAssign(col(3, 4));
    expect(
      (await materializeOneResult(assigned.getData()))?.toString()
    ).toMatchInlineSnapshot(`"3,4"`);
    expect(getColNames()).toEqual(['Col1', 'Col2']);
  });

  it('can assign a scalar to a column', async () => {
    const assigned = await testColumnAssign(l(1));
    expect(
      (await materializeOneResult(assigned.getData()))?.toString()
    ).toMatchInlineSnapshot(`"1,1"`);
    expect(getColNames()).toEqual(['Col1', 'Col2']);
  });

  it('formula assignment', async () => {
    const assigned = await testColumnAssign(columnFormula);
    expect(
      (await materializeOneResult(assigned.getData()))?.toString()
    ).toMatchInlineSnapshot(`"3,4"`);
    expect(getColNames()).toEqual(['Col1', 'Col2']);
  });

  it('formula with previous', async () => {
    const assigned = await testColumnAssign(columnFormulaWithPrevious);
    expect(
      (await materializeOneResult(assigned.getData()))?.toString()
    ).toMatchInlineSnapshot(`"3,4"`);
    expect(getColNames()).toEqual(['Col1', 'Col2']);
  });

  it('can add errors', async () => {
    const assigned = await testColumnAssign(
      parseExpressionOrThrow('1meter + 1s')
    );
    expect(assigned).toMatchInlineSnapshot(`
      Object {
        "getData": [Function],
      }
    `);
    expect(getColNames()).toEqual(['Col1']);
  });
});
