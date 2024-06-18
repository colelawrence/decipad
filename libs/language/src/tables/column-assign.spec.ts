import type { AST } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import type { Value } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { materializeOneResult, buildType as t } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { c, col, l, r, tableColAssign } from '@decipad/language-utils';
import { inferStatement } from '../infer';
import { evaluateColumnAssign, inferColumnAssign } from './column-assign';
import type { ScopedInferContext, TRealm } from '..';
import { ScopedRealm, makeInferContext, parseExpressionOrThrow } from '..';
import { jsCol } from '../testUtils';

let ctx: ScopedInferContext;
let realm: TRealm;
beforeEach(() => {
  ctx = makeInferContext();
  realm = new ScopedRealm(undefined, ctx);
  ctx.stack.setNamespaced(['Table', 'Col1'], t.number());
  ctx.stack.set('ColumnOfUnknownLength', t.column(t.number()));
  ctx.stack.createNamespace('Empty');
});

describe('Column assignment inference', () => {
  it('can create a new column with column data', async () => {
    const table = await inferColumnAssign(
      realm,
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
          "functionArgNames": undefined,
          "functionBody": undefined,
          "functionName": undefined,
          "functionScopeDepth": undefined,
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
          "tree": undefined,
          "type": "number",
          "unit": null,
          Symbol(immer-draftable): true,
        },
        "columnNames": null,
        "columnTypes": null,
        "date": null,
        "delegatesIndexTo": undefined,
        "errorCause": null,
        "functionArgNames": undefined,
        "functionBody": undefined,
        "functionName": undefined,
        "functionScopeDepth": undefined,
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
        "tree": undefined,
        "type": null,
        "unit": null,
        Symbol(immer-draftable): true,
      }
    `);
  });
  it('can create a new column with scalar number', async () => {
    const expandedNum = await inferColumnAssign(
      realm,
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
          "functionArgNames": undefined,
          "functionBody": undefined,
          "functionName": undefined,
          "functionScopeDepth": undefined,
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
          "tree": undefined,
          "type": "number",
          "unit": null,
          Symbol(immer-draftable): true,
        },
        "columnNames": null,
        "columnTypes": null,
        "date": null,
        "delegatesIndexTo": undefined,
        "errorCause": null,
        "functionArgNames": undefined,
        "functionBody": undefined,
        "functionName": undefined,
        "functionScopeDepth": undefined,
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
        "tree": undefined,
        "type": null,
        "unit": null,
        Symbol(immer-draftable): true,
      }
    `);
  });
  it('can create a new column with a formula', async () => {
    const expandedFormula = await inferColumnAssign(
      realm,
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
          "functionArgNames": undefined,
          "functionBody": undefined,
          "functionName": undefined,
          "functionScopeDepth": undefined,
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
          "tree": undefined,
          "type": "number",
          "unit": null,
          Symbol(immer-draftable): true,
        },
        "columnNames": null,
        "columnTypes": null,
        "date": null,
        "delegatesIndexTo": undefined,
        "errorCause": null,
        "functionArgNames": undefined,
        "functionBody": undefined,
        "functionName": undefined,
        "functionScopeDepth": undefined,
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
        "tree": undefined,
        "type": null,
        "unit": null,
        Symbol(immer-draftable): true,
      }
    `);
  });
  it('can create a new column with a formula using previous', async () => {
    const usingPrevious = await inferColumnAssign(
      realm,
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
          "functionArgNames": undefined,
          "functionBody": undefined,
          "functionName": undefined,
          "functionScopeDepth": undefined,
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
          "tree": undefined,
          "type": "number",
          "unit": null,
          Symbol(immer-draftable): true,
        },
        "columnNames": null,
        "columnTypes": null,
        "date": null,
        "delegatesIndexTo": undefined,
        "errorCause": null,
        "functionArgNames": undefined,
        "functionBody": undefined,
        "functionName": undefined,
        "functionScopeDepth": undefined,
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
        "tree": undefined,
        "type": null,
        "unit": null,
        Symbol(immer-draftable): true,
      }
    `);
  });

  it('propagates multiple errors', async () => {
    expect(ctx.stack.globalVariables.get('Table')).toMatchObject({
      columnNames: ['Col1'],
      columnTypes: [{ type: 'number' }],
    });

    ctx.stack.set('Num', t.number());
    const assigningToNonTable = await inferStatement(
      realm,
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
  let realm = new ScopedRealm(undefined, ctx);
  const columnFormula = c('+', r('Col1'), l(2));
  const columnFormulaWithPrevious = c('+', c('previous', l(2)), l(1));

  beforeEach(async () => {
    realm = new ScopedRealm(undefined, ctx);
    realm.stack.createNamespace('Table');
    realm.stack.setNamespaced(['Table', 'Col1'], jsCol([1, 2]));
    await inferStatement(realm, columnFormula);
    await inferStatement(realm, columnFormulaWithPrevious);
  });

  const testColumnAssign = async (column: AST.Expression) => {
    const colAssign = tableColAssign('Table', 'Col2', column);
    await inferColumnAssign(realm, colAssign);
    return evaluateColumnAssign(realm, colAssign);
  };
  const getColNames = () =>
    (realm.stack.globalVariables.get('Table') as Value.Table).columnNames;

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
