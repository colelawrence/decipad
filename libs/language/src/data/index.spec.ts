import { resolve, resolveCsv } from '.';
import { zip } from '../utils';
import { TabularData } from './TabularData';

async function* streamAscii(result: string) {
  const bufferSize = 5;
  for (let char = 0; char < result.length; char += bufferSize) {
    const bufferStr = result.slice(char, char + bufferSize).split('');
    yield new Uint8Array(bufferStr.map((c) => c.charCodeAt(0)));
  }
}

it('throws for unknown content types', async () => {
  await expect(
    resolve({
      url: '',
      fetch: async () => ({
        result: streamAscii('bad content type'),
        contentType: 'application/bad',
      }),
    })
  ).rejects.toMatchInlineSnapshot(
    `[Error: don't know how to handle content type application/bad]`
  );
});

describe('resolveCsv', () => {
  const simplifyTable = (table: TabularData) => {
    const columns = table.columnNames.map((name) => table.column(name));

    return Object.fromEntries(zip(table.columnNames, columns));
  };

  it('can resolve CSVs', async () => {
    expect(
      simplifyTable(await resolveCsv(streamAscii('col1,col2\n123,hello'), 2))
    ).toMatchInlineSnapshot(`
      Object {
        "col1": Array [
          123,
        ],
        "col2": Array [
          "hello",
        ],
      }
    `);
  });

  it('can limit the amount of rows', async () => {
    expect(
      (
        await resolveCsv(
          streamAscii('col1,col2\n123,hello\n456,hello2\n999,ohnooes'),
          2
        )
      ).length
    ).toEqual(2);
  });
});
