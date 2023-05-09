import { Column } from './Column';
import { materialize } from './materialize';
import { slice } from './transforms';

describe('slice', () => {
  const source = Column.fromValues([1, 2, 3, 4, 5]);
  const col = slice(source, 1, 3);
  test('values', async () => {
    expect(await materialize(col.values())).toEqual([2, 3]);
    expect(await materialize(col.values(0))).toEqual([2, 3]);
    expect(await materialize(col.values(1))).toEqual([3]);
    expect(await materialize(col.values(2))).toEqual([]);
    expect(await materialize(col.values(4))).toEqual([]);
    expect(await materialize(col.values(undefined, 1))).toEqual([2]);
    expect(await materialize(col.values(undefined, 2))).toEqual([2, 3]);
    expect(await materialize(col.values(undefined, 3))).toEqual([2, 3]);
  });

  test('rowCount', async () => {
    expect(await col.rowCount()).toEqual(2);
  });

  test('atIndex', async () => {
    expect(await col.atIndex(0)).toEqual(2);
    expect(await col.atIndex(1)).toEqual(3);
    expect(await col.atIndex(2)).toEqual(undefined);
    expect(await col.atIndex(-1)).toEqual(undefined);
  });
});
