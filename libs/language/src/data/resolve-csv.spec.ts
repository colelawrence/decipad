import { Float64, Utf8, Bool, DateMillisecond } from 'apache-arrow';
import { resolve } from '.';
import { dataURL } from './data-url';

it('resolves csv', async () => {
  const source =
    'Numba,Straing,Bulian,Doite\n1,heya,true,2020-01-01\n2,there,false,2020-01-31';
  const url = dataURL(Buffer.from(source), 'text/csv');
  const table = await resolve({ url, contentType: 'text/csv' });
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

it('resolves csv (2)', async () => {
  const source = `Header, Numbers, Dates, Other Dates, Booleans
Kill Bill 1, 0.0456, 2022-10-01, 2022-10-01, true
Something, 128349.1, 2022-10-01, 2022-10-01, false
Testest, 128349.1, 2022-10-01, 2022-10-01, false
TesTest, 128349.1, 2022-10-01, 2022-10-01, true`;

  const url = dataURL(Buffer.from(source), 'text/csv');
  const table = await resolve({ url, contentType: 'text/csv' });
  expect(table.schema.fields).toHaveLength(5);

  expect(table.schema.fields[0].name).toBe('Header');
  expect(table.schema.fields[0].type).toMatchObject(new Utf8());

  expect(table.schema.fields[1].name).toBe(' Numbers');
  expect(table.schema.fields[1].type).toMatchObject(new Float64());

  expect(table.schema.fields[2].name).toBe(' Dates');
  expect(table.schema.fields[2].type).toMatchObject(new DateMillisecond());

  expect(table.schema.fields[3].name).toBe(' Other Dates');
  expect(table.schema.fields[3].type).toMatchObject(new DateMillisecond());

  expect(table.schema.fields[4].name).toBe(' Booleans');
  expect(table.schema.fields[4].type).toMatchObject(new Bool());
});
