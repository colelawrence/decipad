import { AST } from '..';
import { inferStatement, makeContext } from '../infer';
import { table, col, n, c, l, r } from '../utils';
import { buildType as t } from '../type';
import { objectToMap } from '../testUtils';
import { inferTable, inferTableColumnPerCell } from './inference';

const nilCtx = makeContext({
  initialGlobalScope: new Map([['SomeCol', t.column(t.number(), 2)]]),
});
nilCtx.stack.setNamespaced(
  ['SomeExistingTable', 'Col'],
  t.column(t.number(), 1234, 'SomeExistingTable'),
  'global'
);

it('puts column types in ether', async () => {
  const col1 = n('table-column', n('coldef', 'ColA'), col(1, 2));
  const col2 = n('table-column', n('coldef', 'ColA'), col(3, 4));
  const tbl = n('table', n('tabledef', 'tbl'), col1, col2);

  const ctx = makeContext();
  await inferStatement(ctx, tbl);
  expect(ctx.nodeTypes.has(col1)).toBe(true);
  expect(ctx.nodeTypes.has(col2)).toBe(true);
});

it('allows empty tables', async () => {
  expect(await inferTable(nilCtx, table('TableName', {}))).toMatchObject({
    indexName: 'TableName',
    columnNames: [],
    columnTypes: [],
  });
});

it('forbids tables inside functions', async () => {
  await nilCtx.stack.withPushCall(async () => {
    const tbl = table('TableName', {
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
      objectToMap({ OtherColumn: t.number() }),
      expression
    );

  it('can run a formula', async () => {
    expect(await testComputed(l('a string'))).toEqual(t.string());
    expect(await testComputed(col('one', 'two'))).toEqual(
      t.column(t.string(), 2)
    );
  });

  it('can run a formula with previous', async () => {
    expect(await testComputed(c('previous', l('hello')))).toEqual(t.string());
  });

  it('can use another column', async () => {
    expect(await testComputed(c('+', r('OtherColumn'), l(1)))).toEqual(
      t.number()
    );
  });

  it('propagates errors', async () => {
    expect(
      (await testComputed(c('+', r('seconds'), r('meters')))).errorCause
    ).not.toBeNull();
  });
});
