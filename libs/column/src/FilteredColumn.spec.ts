import { Column } from './Column';
import { FilteredColumn } from './FilteredColumn';
import { materialize } from './materialize';

const isEven = (n: number) => n % 2 === 0;

describe('FilteredColumn', () => {
  const values = [1, 2, 3, 4, 5, 6];
  const source = Column.fromValues(values);
  const col = new FilteredColumn(source, values.map(isEven));
  test('values', async () => {
    expect(await materialize(col.values())).toEqual([2, 4, 6]);
    expect(await materialize(col.values(0))).toEqual([2, 4, 6]);
    expect(await materialize(col.values(1))).toEqual([4, 6]);
    expect(await materialize(col.values(2))).toEqual([6]);
    expect(await materialize(col.values(4))).toEqual([]);
    expect(await materialize(col.values(5))).toEqual([]);
    expect(await materialize(col.values(undefined, 1))).toEqual([2]);
    expect(await materialize(col.values(undefined, 2))).toEqual([2, 4]);
    expect(await materialize(col.values(undefined, 3))).toEqual([2, 4, 6]);
  });

  test('rowCount', async () => {
    expect(await col.rowCount()).toEqual(3);
  });

  test('atIndex', async () => {
    expect(await col.atIndex(0)).toEqual(2);
    expect(await col.atIndex(1)).toEqual(4);
    expect(await col.atIndex(2)).toEqual(6);
    expect(await col.atIndex(3)).toEqual(undefined);
    expect(await col.atIndex(-1)).toEqual(undefined);
  });
});
