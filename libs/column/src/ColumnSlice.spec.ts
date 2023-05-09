import { Column } from './Column';
import { ColumnSlice } from './ColumnSlice';
import { materialize } from './materialize';

describe('ColumnSlice', () => {
  const source = Column.fromValues([1, 2, 3, 4, 5]);
  const col = ColumnSlice.fromColumnAndRange(source, 1, 4);
  test('values', async () => {
    expect(await materialize(col.values())).toEqual([2, 3, 4]);
    expect(await materialize(col.values(0))).toEqual([2, 3, 4]);
    expect(await materialize(col.values(1))).toEqual([3, 4]);
    expect(await materialize(col.values(2))).toEqual([4]);
    expect(await materialize(col.values(4))).toEqual([]);
    expect(await materialize(col.values(5))).toEqual([]);
    expect(await materialize(col.values(undefined, 2))).toEqual([2, 3]);
    expect(await materialize(col.values(undefined, 3))).toEqual([2, 3, 4]);
    expect(await materialize(col.values(undefined, 1))).toEqual([2]);
  });

  test('rowCount', async () => {
    expect(await col.rowCount()).toEqual(3);
  });

  test('atIndex', async () => {
    expect(await col.atIndex(0)).toEqual(2);
    expect(await col.atIndex(1)).toEqual(3);
    expect(await col.atIndex(2)).toEqual(4);
    expect(await col.atIndex(3)).toEqual(undefined);
    expect(await col.atIndex(-1)).toEqual(undefined);
  });
});
