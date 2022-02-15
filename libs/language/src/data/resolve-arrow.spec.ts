import {
  Float64,
  Utf8,
  Bool,
  DateMillisecond,
  tableFromArrays,
  tableToIPC,
} from 'apache-arrow';
import { resolve } from '.';
import { dataURL } from './data-url';

it('resolves csv', async () => {
  const source = tableFromArrays({
    Numba: [1, 2],
    Straing: ['heya', 'there'],
    Bulian: [true, false],
    Doite: [
      new Date('2020-01-01T00:00:00.000Z'),
      new Date('2020-01-31T00:00:00.000Z'),
    ],
  });
  const url = dataURL(
    Buffer.from(tableToIPC(source)),
    'application/x-apache-arrow-stream'
  );
  const table = await resolve({
    url: url.toString(),
    contentType: 'application/x-apache-arrow-stream',
  });
  expect(table.schema.fields).toHaveLength(4);

  // validate inferred schema
  expect(table.schema.fields[0].name).toBe('Numba');
  expect(table.schema.fields[0].type).toMatchObject(new Float64());

  expect(table.schema.fields[1].name).toBe('Straing');
  expect(table.schema.fields[1].type).toMatchObject(new Utf8());

  expect(table.schema.fields[2].name).toBe('Bulian');
  expect(table.schema.fields[2].type).toMatchObject(new Bool());

  expect(table.schema.fields[3].name).toBe('Doite');
  expect(table.schema.fields[3].type).toMatchObject(new DateMillisecond());

  // validate data
  expect(table.toArray()).toMatchInlineSnapshot(`
    Array [
      Object {
        "Bulian": true,
        "Doite": 2020-01-01T00:00:00.000Z,
        "Numba": 1,
        "Straing": "heya",
      },
      Object {
        "Bulian": false,
        "Doite": 2020-01-31T00:00:00.000Z,
        "Numba": 2,
        "Straing": "there",
      },
    ]
  `);
});
