import { makeContext } from '.';
import { table, col, n, c, l } from '../utils';
import { findTableSize } from './table';
import { build as t } from '../type';

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

it('returns zero for an empty table', async () => {
  const tbl = table({});
  expect(await findTableSize(nilCtx, tbl)).toEqual(['TableName', 0]);
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
