import { Column } from './Column';
import { MappedColumn } from './MappedColumn';
import { materialize } from './materialize';

describe('MappedColumn', () => {
  const values = [1, 2, 3, 4, 5, 6];
  const source = Column.fromValues(values);
  const col = MappedColumn.fromColumnAndMap(source, [0, 2, 4]);
  test('values', async () => {
    expect(await materialize(col.values())).toEqual([1, 3, 5]);
    expect(await materialize(col.values(0))).toEqual([1, 3, 5]);
    expect(await materialize(col.values(1))).toEqual([3, 5]);
    expect(await materialize(col.values(2))).toEqual([5]);
    expect(await materialize(col.values(4))).toEqual([]);
    expect(await materialize(col.values(5))).toEqual([]);
    expect(await materialize(col.values(undefined, 1))).toEqual([1]);
    expect(await materialize(col.values(undefined, 2))).toEqual([1, 3]);
    expect(await materialize(col.values(undefined, 3))).toEqual([1, 3, 5]);
  });

  test('rowCount', async () => {
    expect(await col.rowCount()).toEqual(3);
  });

  test('atIndex', async () => {
    expect(await col.atIndex(0)).toEqual(1);
    expect(await col.atIndex(1)).toEqual(3);
    expect(await col.atIndex(2)).toEqual(5);
    expect(await col.atIndex(3)).toEqual(undefined);
    expect(await col.atIndex(-1)).toEqual(undefined);
  });
});
