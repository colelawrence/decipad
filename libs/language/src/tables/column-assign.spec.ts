import { inferExpression, inferStatement, makeContext } from '../infer';
import { build as t } from '../type';
import { c, col, l, r, tableColAssign } from '../utils';
import { typeSnapshotSerializer } from '../testUtils';
import { evaluateColumnAssign, inferColumnAssign } from './column-assign';
import { Realm } from '../interpreter';
import { AST, Table } from '..';
import { jsCol } from '../lazy/testUtils';

expect.addSnapshotSerializer(typeSnapshotSerializer);

let ctx = makeContext();
beforeEach(() => {
  ctx = makeContext();
  ctx.stack.setMulti({
    Table: t.table({
      indexName: 'Table',
      columnNames: ['Col1'],
      columnTypes: [t.number()],
    }),
    ColumnOfUnknownLength: t.column(t.number(), 'unknown'),
    Empty: t.table({
      indexName: 'Empty',
      columnNames: [],
      columnTypes: [],
    }),
  });
});

describe('Column assignment inference', () => {
  it('can create a new column with column data', async () => {
    const newColumn = await inferColumnAssign(
      ctx,
      tableColAssign('Table', 'Col2', col(1, 2))
    );
    expect(newColumn).toMatchObject(t.column(t.number(), 2, 'Table'));
  });
  it('can create a new column with scalar number', async () => {
    const expandedNum = await inferColumnAssign(
      ctx,
      tableColAssign('Table', 'Col2', l(1))
    );
    expect(expandedNum).toMatchObject(t.column(t.number(), 'unknown', 'Table'));
  });
  it('can create a new column with a formula', async () => {
    const expandedFormula = await inferColumnAssign(
      ctx,
      tableColAssign('Table', 'Col2', c('+', r('Col1'), l(1)))
    );
    expect(expandedFormula).toMatchObject(
      t.column(t.number(), 'unknown', 'Table')
    );
  });
  it('can create a new column with a formula using previous', async () => {
    const usingPrevious = await inferColumnAssign(
      ctx,
      tableColAssign('Table', 'Col2', c('+', c('previous', l(1)), l(1)))
    );
    expect(usingPrevious).toMatchObject(
      t.column(t.number(), 'unknown', 'Table')
    );
  });

  it('only works in global scope', async () => {
    ctx.stack.withPushCall(async () => {
      const error = await inferColumnAssign(
        ctx,
        tableColAssign('Table', 'Col2', col(1, 2))
      );

      expect(error.errorCause?.spec).toMatchInlineSnapshot(
        `ErrSpec:forbidden-inside-function("forbiddenThing" => "table")`
      );
    });
  });

  it('propagates multiple errors', async () => {
    const missingTable = await inferColumnAssign(
      ctx,
      tableColAssign('UnknownTable', 'Col2', col(1, 2))
    );
    expect(missingTable.errorCause?.spec.errType).toEqual('missing-variable');
    expect(ctx.stack.globalVariables.get('UnknownTable')).not.toBeDefined();

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

    ctx.stack.globalVariables.set('Num', t.number());
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
    realm.stack.globalVariables.set(
      'Table',
      Table.fromMapping({
        Col1: jsCol([1, 2]),
      })
    );
    await inferStatement(ctx, columnFormula);
    await inferStatement(ctx, columnFormulaWithPrevious);
  });

  const testColumnAssign = async (column: AST.Expression) => {
    await inferExpression(realm.inferContext, column);
    return evaluateColumnAssign(realm, tableColAssign('Table', 'Col2', column));
  };
  const getColNames = () =>
    (realm.stack.globalVariables.get('Table') as Table).columnNames;

  it('whole-column assignment', async () => {
    const assigned = await testColumnAssign(col(3, 4));
    expect(assigned.getData().toString()).toMatchInlineSnapshot(`"3,4"`);
    expect(getColNames()).toEqual(['Col1', 'Col2']);
  });

  it('can assign a scalar to a column', async () => {
    const assigned = await testColumnAssign(l(1));
    expect(assigned.getData().toString()).toMatchInlineSnapshot(`"1,1"`);
    expect(getColNames()).toEqual(['Col1', 'Col2']);
  });

  it('formula assignment', async () => {
    const assigned = await testColumnAssign(columnFormula);
    expect(assigned.getData().toString()).toMatchInlineSnapshot(`"3,4"`);
    expect(getColNames()).toEqual(['Col1', 'Col2']);
  });

  it('formula with previous', async () => {
    const assigned = await testColumnAssign(columnFormulaWithPrevious);
    expect(assigned.getData().toString()).toMatchInlineSnapshot(`"3,4"`);
    expect(getColNames()).toEqual(['Col1', 'Col2']);
  });
});
