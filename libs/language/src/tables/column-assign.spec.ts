import { inferStatement, makeContext } from '../infer';
import { build as t } from '../type';
import { c, col, l, r, tableColAssign } from '../utils';
import { typeSnapshotSerializer } from '../testUtils';
import { evaluateColumnAssign, inferColumnAssign } from './column-assign';
import { Realm } from '../interpreter';
import { Table } from '..';
import { jsCol } from '../lazy/testUtils';

expect.addSnapshotSerializer(typeSnapshotSerializer);

let ctx = makeContext();
beforeEach(() => {
  ctx = makeContext();
  ctx.stack.setMulti({
    Table: t.table({
      indexName: 'Table',
      length: 2,
      columnNames: ['Col1'],
      columnTypes: [t.number()],
    }),
    ColumnOfUnknownLength: t.column(t.number(), 'unknown'),
    Empty: t.table({
      indexName: 'Empty',
      length: 'unknown',
      columnNames: [],
      columnTypes: [],
    }),
  });
});

describe('Column assignment inference', () => {
  it('can create a new column with column data', async () => {
    const table = await inferColumnAssign(
      ctx,
      tableColAssign('Table', 'Col2', col(1, 2))
    );
    expect(table).toMatchObject({
      columnNames: ['Col1', 'Col2'],
      columnTypes: [{ type: 'number' }, { type: 'number' }],
      tableLength: 2,
    });
  });
  it('can create a new column with scalar number', async () => {
    const expandedNum = await inferColumnAssign(
      ctx,
      tableColAssign('Table', 'Col2', l(1))
    );
    expect(expandedNum).toMatchObject(
      t.table({
        indexName: 'Table',
        length: 2,
        columnTypes: [t.number(), t.number()],
        columnNames: ['Col1', 'Col2'],
      })
    );
  });
  it('can create a new column with a formula', async () => {
    const expandedFormula = await inferColumnAssign(
      ctx,
      tableColAssign('Table', 'Col2', c('+', r('Col1'), l(1)))
    );
    expect(expandedFormula).toMatchObject(
      t.table({
        indexName: 'Table',
        length: 2,
        columnTypes: [t.number(), t.number()],
        columnNames: ['Col1', 'Col2'],
      })
    );
  });
  it('can create a new column with a formula using previous', async () => {
    const usingPrevious = await inferColumnAssign(
      ctx,
      tableColAssign('Table', 'Col2', c('+', c('previous', l(1)), l(1)))
    );
    expect(usingPrevious).toMatchObject(
      t.table({
        indexName: 'Table',
        length: 2,
        columnTypes: [t.number(), t.number()],
        columnNames: ['Col1', 'Col2'],
      })
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
      tableLength: 2,
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

  it('defines the table size when the table is empty', async () => {
    const assignment = tableColAssign('Empty', 'FirstCol', col(1, 2));

    expect(await inferColumnAssign(ctx, assignment)).toMatchInlineSnapshot(
      `table<FirstCol = number>`
    );
    expect(ctx.stack.get('Empty')).toMatchInlineSnapshot(
      `table<FirstCol = number>`
    );
    expect(ctx.stack.get('Empty')?.tableLength).toMatchInlineSnapshot(`2`);

    // Places in (AST => type) registry
    expect(ctx.nodeTypes.get(assignment.args[2])).toBeDefined();
  });

  it('makes sure that when the table is empty, its new column can inform the table length', async () => {
    const assignment = tableColAssign(
      'Empty',
      'UnknownLengthCol',
      r('ColumnOfUnknownLength')
    );

    expect(
      (await inferColumnAssign(ctx, assignment)).errorCause
    ).not.toBeNull();
  });
});

describe('Column assignment evaluation', () => {
  let realm = new Realm(ctx);
  const columnFormula = c('+', r('Col1'), l(2));
  const columnFormulaWithPrevious = c('+', c('previous', l(2)), l(1));
  const getColNames = () =>
    (realm.stack.globalVariables.get('Table') as Table).columnNames;
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

  it('whole-column assignment', async () => {
    const assigned = await evaluateColumnAssign(
      realm,
      tableColAssign('Table', 'Col2', col(3, 4))
    );
    expect(assigned.getData().toString()).toMatchInlineSnapshot(`"1,2,3,4"`);
    expect(getColNames()).toEqual(['Col1', 'Col2']);
  });

  it('can assign a scalar to a column', async () => {
    const assigned = await evaluateColumnAssign(
      realm,
      tableColAssign('Table', 'Col2', l(1))
    );
    expect(assigned.getData().toString()).toMatchInlineSnapshot(`"1,2,1,1"`);
    expect(getColNames()).toEqual(['Col1', 'Col2']);
  });

  it('formula assignment', async () => {
    const assigned = await evaluateColumnAssign(
      realm,
      tableColAssign('Table', 'Col2', columnFormula)
    );
    expect(assigned.getData().toString()).toMatchInlineSnapshot(`"1,2,3,4"`);
    expect(getColNames()).toEqual(['Col1', 'Col2']);
  });

  it('formula with previous', async () => {
    const assigned = await evaluateColumnAssign(
      realm,
      tableColAssign('Table', 'Col2', columnFormulaWithPrevious)
    );
    expect(assigned.getData().toString()).toMatchInlineSnapshot(`"1,2,3,4"`);
    expect(getColNames()).toEqual(['Col1', 'Col2']);
  });
});
