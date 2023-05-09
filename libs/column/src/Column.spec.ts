import { Column } from './Column';
import { materialize } from './materialize';

describe('Column', () => {
  test('values', async () => {
    const col = Column.fromValues([1, 2, 3, 4]);
    expect(await materialize(col.values())).toEqual([1, 2, 3, 4]);
    expect(await materialize(col.values(1))).toEqual([2, 3, 4]);
    expect(await materialize(col.values(1, 2))).toEqual([2]);
    expect(await materialize(col.values(undefined, 2))).toEqual([1, 2]);
  });

  test('rowCount', async () => {
    const col = Column.fromValues([1, 2, 3, 4]);
    expect(await col.rowCount()).toEqual(4);
  });

  test('atIndex', async () => {
    const col = Column.fromValues([1, 2, 3, 4]);
    expect(await col.atIndex(0)).toEqual(1);
    expect(await col.atIndex(1)).toEqual(2);
    expect(await col.atIndex(3)).toEqual(4);
    expect(await col.atIndex(4)).toEqual(undefined);
    expect(await col.atIndex(-1)).toEqual(undefined);
  });
});
