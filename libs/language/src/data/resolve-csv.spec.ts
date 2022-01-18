import { Bool, DateMillisecond, Float64, Utf8 } from '@apache-arrow/es5-cjs';
import { columnType, csvToData } from './resolve-csv';

it('gets col type', () => {
  expect(columnType([[new Date()]], 0)).toBeInstanceOf(DateMillisecond);
  expect(columnType([[123]], 0)).toBeInstanceOf(Float64);
  expect(columnType([['']], 0)).toBeInstanceOf(Utf8);
  expect(columnType([[true]], 0)).toBeInstanceOf(Bool);
  expect(
    columnType([[Symbol('other') as unknown as string]], 0)
  ).toBeInstanceOf(Utf8);
});

it('parses a CSV', async () => {
  const [columnNames, data] = await csvToData(
    `Hello,World\n1,2\nhiya,true\ndate(2020),date(2020-01-10T10:30)`
  );
  expect(columnNames).toEqual(['Hello', 'World']);
  expect(data).toMatchInlineSnapshot(`
    Array [
      Array [
        1,
        2,
      ],
      Array [
        "hiya",
        true,
      ],
      Array [
        2020-01-01T00:00:00.000Z,
        2020-01-10T10:30:00.000Z,
      ],
    ]
  `);
});
