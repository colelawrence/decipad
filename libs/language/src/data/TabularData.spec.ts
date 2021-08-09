import { TabularData } from './TabularData';

it('can add rows and get data', () => {
  const table = new TabularData();
  table.addRow([1, 2, 3]);
  table.addRow([4, 5, 6]);
  expect(() =>
    table.addRow([1, 2, 3, 4, 5])
  ).toThrowErrorMatchingInlineSnapshot(`"expected column count to be 3"`);
  expect(table.length).toEqual(2);

  table.setColumnNames(['A', 'B', 'C']);

  expect(table.get('A', 0)).toEqual(1);
  expect(table.get('B', 1)).toEqual(5);
});

it('can set column names', () => {
  const table = new TabularData();
  table.addRow([1, 2, 3]);

  expect(() =>
    table.setColumnNames(['too', 'few'])
  ).toThrowErrorMatchingInlineSnapshot(
    `"set column names: expected column count to be 3"`
  );

  table.setColumnNames(['One', 'Two', 'Three']);

  expect(table.columnNames).toEqual(['One', 'Two', 'Three']);
});

it('validates column names being set', () => {
  const table = new TabularData();

  expect(() => table.setColumnNames([])).toThrow();
});

it('can get columns by name', () => {
  const table = new TabularData();
  table.addRow([1, 2, 3]);
  table.setColumnNames(['Col', 'Col2', 'Col3']);

  expect(table.column('Col2')).toEqual([2]);
  expect(() => table.column('Oh No')).toThrowErrorMatchingInlineSnapshot(
    `"Unknown column named Oh No"`
  );
});

it('can get the length of an empty table', () => {
  const table = new TabularData();
  expect(table.length).toEqual(0);
});
