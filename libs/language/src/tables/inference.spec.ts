// eslint-disable-next-line no-restricted-imports
import type { AST } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { buildType as t } from '@decipad/language-types';
import { inferStatement } from '../infer';
import { table, col, n, c, l, r } from '../utils';
import { objectToMap } from '../testUtils';
import { inferTable, inferTableColumnPerCell } from './inference';
import { ScopedRealm, makeInferContext } from '../scopedRealm';

const nilCtx = makeInferContext({
  initialGlobalScope: new Map([['SomeCol', t.column(t.number())]]),
});
const nilRealm = new ScopedRealm(undefined, nilCtx);
nilCtx.stack.setNamespaced(
  ['SomeExistingTable', 'Col'],
  t.column(t.number(), 'SomeExistingTable'),
  'global'
);

it('puts column types in ether', async () => {
  const col1 = n('table-column', n('coldef', 'ColA'), col(1, 2));
  const col2 = n('table-column', n('coldef', 'ColA'), col(3, 4));
  const tbl = n('table', n('tabledef', 'tbl'), col1, col2);

  const ctx = makeInferContext();
  const realm = new ScopedRealm(undefined, ctx);
  await inferStatement(realm, tbl);
  expect(col1.inferredType).toBeDefined();
  expect(col2.inferredType).toBeDefined();
});

it('allows empty tables', async () => {
  expect(await inferTable(nilRealm, table('TableName', {}))).toMatchObject({
    indexName: 'TableName',
    columnNames: [],
    columnTypes: [],
  });
});

describe('table with formulae', () => {
  const testComputed = async (expression: AST.Expression) =>
    inferTableColumnPerCell(
      new ScopedRealm(undefined, makeInferContext()),
      objectToMap({ OtherColumn: t.number() }),
      expression
    );

  it('can run a formula', async () => {
    expect(await testComputed(l('a string'))).toEqual(t.string());
    expect(await testComputed(col('one', 'two'))).toEqual(t.column(t.string()));
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
