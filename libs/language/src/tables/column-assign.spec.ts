import { inferStatement, makeContext } from '../infer';
import { buildType as t } from '../type';
import { c, col, l, r, tableColAssign } from '../utils';
import { typeSnapshotSerializer } from '../testUtils';
import { evaluateColumnAssign, inferColumnAssign } from './column-assign';
import { Realm } from '../interpreter';
import { AST, parseExpressionOrThrow, Table } from '..';
import { jsCol } from '../lazy/testUtils';

expect.addSnapshotSerializer(typeSnapshotSerializer);

let ctx = makeContext();
beforeEach(() => {
  ctx = makeContext();
  ctx.stack.setNamespaced(['Table', 'Col1'], t.number(), 'function');
  ctx.stack.set('ColumnOfUnknownLength', t.column(t.number()));
  ctx.stack.createNamespace('Empty');
});

describe('Column assignment inference', () => {
  it('can create a new column with column data', () => {
    const table = inferColumnAssign(
      ctx,
      tableColAssign('Table', 'Col2', col(123))
    );
    expect(table).toMatchInlineSnapshot(`column<number, indexed by Table>`);
  });
  it('can create a new column with scalar number', () => {
    const expandedNum = inferColumnAssign(
      ctx,
      tableColAssign('Table', 'Col2', l(1))
    );
    expect(expandedNum).toMatchInlineSnapshot(
      `column<number, indexed by Table>`
    );
  });
  it('can create a new column with a formula', () => {
    const expandedFormula = inferColumnAssign(
      ctx,
      tableColAssign('Table', 'Col2', c('+', r('Col1'), l(1)))
    );
    expect(expandedFormula).toMatchInlineSnapshot(
      `column<number, indexed by Table>`
    );
  });
  it('can create a new column with a formula using previous', () => {
    const usingPrevious = inferColumnAssign(
      ctx,
      tableColAssign('Table', 'Col2', c('+', c('previous', l(1)), l(1)))
    );
    expect(usingPrevious).toMatchInlineSnapshot(
      `column<number, indexed by Table>`
    );
  });

  it('only works in global scope', () => {
    ctx.stack.withPushCallSync(() => {
      const error = inferColumnAssign(
        ctx,
        tableColAssign('Table', 'Col2', col(1, 2))
      );

      expect(error.errorCause?.spec).toMatchInlineSnapshot(
        `ErrSpec:forbidden-inside-function("forbiddenThing" => "table")`
      );
    });
  });

  it('propagates multiple errors', () => {
    const duplicatedColumn = inferColumnAssign(
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
    const assigningToNonTable = inferStatement(
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
    inferStatement(ctx, columnFormula);
    inferStatement(ctx, columnFormulaWithPrevious);
  });

  const testColumnAssign = (column: AST.Expression) => {
    const colAssign = tableColAssign('Table', 'Col2', column);
    inferColumnAssign(realm.inferContext, colAssign);
    return evaluateColumnAssign(realm, colAssign);
  };
  const getColNames = () =>
    (realm.stack.globalVariables.get('Table') as Table).columnNames;

  it('whole-column assignment', async () => {
    const assigned = await testColumnAssign(col(3, 4));
    expect(assigned.getData()?.toString()).toMatchInlineSnapshot(`"3,4"`);
    expect(getColNames()).toEqual(['Col1', 'Col2']);
  });

  it('can assign a scalar to a column', async () => {
    const assigned = await testColumnAssign(l(1));
    expect(assigned.getData()?.toString()).toMatchInlineSnapshot(`"1,1"`);
    expect(getColNames()).toEqual(['Col1', 'Col2']);
  });

  it('formula assignment', async () => {
    const assigned = await testColumnAssign(columnFormula);
    expect(assigned.getData()?.toString()).toMatchInlineSnapshot(`"3,4"`);
    expect(getColNames()).toEqual(['Col1', 'Col2']);
  });

  it('formula with previous', async () => {
    const assigned = await testColumnAssign(columnFormulaWithPrevious);
    expect(assigned.getData()?.toString()).toMatchInlineSnapshot(`"3,4"`);
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
