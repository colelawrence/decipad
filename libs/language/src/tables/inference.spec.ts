import { AST } from '..';
import { inferStatement, makeContext } from '../infer';
import { table, col, n, c, l, r } from '../utils';
import { build as t } from '../type';
import { objectToMap } from '../testUtils';
import {
  findTableSize,
  inferTable,
  inferTableColumnPerCell,
} from './inference';

const nilCtx = makeContext({
  inAssignment: 'TableName',
  initialGlobalScope: new Map([
    ['SomeCol', t.column(t.number(), 2)],
    [
      'SomeExistingTable',
      t.table({
        indexName: 'SomeExistingTable',
        length: 1234,
        columnNames: ['Col'],
        columnTypes: [t.column(t.number(), 1234, 'SomeExistingTable')],
      }),
    ],
  ]),
});

it('finds the correct table size, provided by a clear columnar value', async () => {
  expect(
    await findTableSize(
      nilCtx,
      table({
        Col: col(1, 2, 3),
      })
    )
  ).toEqual(['TableName', 3]);
});

it('finds the size of a table by inferring', async () => {
  const tbl = table({
    Calculated: n('ref', 'SomeCol'),
  });
  expect(await findTableSize(nilCtx, tbl)).toEqual(['TableName', 2]);
});

it('finds the size of a table that only has a single number in it', async () => {
  const tbl = table({ Num: l(1) });
  expect(await findTableSize(nilCtx, tbl)).toEqual(['TableName', 1]);
});

it('puts column types in ether', async () => {
  const col1 = n('table-column', n('coldef', 'ColA'), col(1, 2));
  const col2 = n('table-column', n('coldef', 'ColA'), col(3, 4));
  const tbl = n('assign', n('def', 'tbl'), n('table', col1, col2));

  const ctx = makeContext();
  await inferStatement(ctx, tbl);
  expect(ctx.nodeTypes.has(col1)).toBe(true);
  expect(ctx.nodeTypes.has(col2)).toBe(true);
});

it('returns unknown for an empty table', async () => {
  const tbl = table({});
  expect(await findTableSize(nilCtx, tbl)).toEqual(['TableName', 'unknown']);
});

it('finds the size of a table that only uses previous', async () => {
  const tbl = table({
    Prev: c('+', c('previous', l(0)), l(1)),
  });
  expect(await findTableSize(nilCtx, tbl)).toEqual(['TableName', 1]);
});

it('gets the table size from a spread', async () => {
  const tbl = n(
    'table',
    n('table-column', n('coldef', 'Num'), l(1)),
    n('table-spread', n('ref', 'SomeExistingTable'))
  );
  expect(await findTableSize(nilCtx, tbl)).toEqual(['SomeExistingTable', 1234]);
});

it('allows empty tables', async () => {
  expect(await inferTable(nilCtx, table({}))).toMatchObject({
    indexName: 'TableName',
    tableLength: 'unknown',
    columnNames: [],
    columnTypes: [],
  });
});

it('forbids tables inside functions', async () => {
  await nilCtx.stack.withPushCall(async () => {
    const tbl = table({
      Calculated: n('ref', 'SomeCol'),
    });
    expect(
      (await inferTable(nilCtx, tbl)).errorCause?.spec
    ).toMatchInlineSnapshot(
      `ErrSpec:forbidden-inside-function("forbiddenThing" => "table")`
    );
  });
});

describe('table with formulae', () => {
  const testComputed = (expression: AST.Expression) =>
    inferTableColumnPerCell(
      makeContext(),
      objectToMap({ OtherColumn: t.column(t.number(), 3) }),
      expression,
      3
    );

  it('can run a formula', async () => {
    expect(await testComputed(l('a string'))).toEqual(t.column(t.string(), 3));
    expect(await testComputed(col('one', 'two'))).toEqual(
      t.column(t.column(t.string(), 2), 3)
    );
  });

  it('can run a formula with previous', async () => {
    expect(await testComputed(c('previous', l('hello')))).toEqual(
      t.column(t.string(), 3)
    );
  });

  it('can use another column', async () => {
    expect(await testComputed(c('+', r('OtherColumn'), l(1)))).toEqual(
      t.column(t.number(), 3)
    );
  });

  it('propagates errors', async () => {
    expect(
      (await testComputed(c('+', r('seconds'), r('meters')))).errorCause
    ).not.toBeNull();
  });
});
