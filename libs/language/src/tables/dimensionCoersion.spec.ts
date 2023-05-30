import { runCode } from '..';
import { typeSnapshotSerializer } from '../testUtils';

expect.addSnapshotSerializer(typeSnapshotSerializer);

it('single items (non-col) are expanded to fit the currently known table size', async () => {
  expect(
    await testGrowTable({ startingColumns: ['A = [1, 2]'], newColumn: '1' })
  ).toMatchInlineSnapshot(`
    Object {
      "type": table<A = number, NewCol = number>,
      "value": Array [
        Array [
          DeciNumber(1),
          DeciNumber(2),
        ],
        Array [
          DeciNumber(1),
          DeciNumber(1),
        ],
      ],
    }
  `);
});

it('accepts multi-d non-indexed columns as having the tables dimension on top', async () => {
  expect(
    await testGrowTable({ startingColumns: ['A = [[1], [2]]'], newColumn: '1' })
  ).toMatchInlineSnapshot(`
    Object {
      "type": table<A = column<number>, NewCol = number>,
      "value": Array [
        Array [
          Array [
            DeciNumber(1),
          ],
          Array [
            DeciNumber(2),
          ],
        ],
        Array [
          DeciNumber(1),
          DeciNumber(1),
        ],
      ],
    }
  `);
});

it('juggles dimensions so the tables dimension is on top', async () => {
  expect(
    await testGrowTable({
      startingColumns: ['Nums = [1, 2, 3]'],
      newColumn: 'Table.Nums + OtherTable.Nums',
    })
  ).toMatchInlineSnapshot(`
    Object {
      "type": table<Nums = number, NewCol = column<number, indexed by OtherTable>>,
      "value": Array [
        Array [
          DeciNumber(1),
          DeciNumber(2),
          DeciNumber(3),
        ],
        Array [
          Array [
            DeciNumber(101),
            DeciNumber(201),
          ],
          Array [
            DeciNumber(102),
            DeciNumber(202),
          ],
          Array [
            DeciNumber(103),
            DeciNumber(203),
          ],
        ],
      ],
    }
  `);
});

it('juggles dimensions so the tables dimension is on top (2)', async () => {
  expect(
    await testGrowTable({
      startingColumns: ['Nums = [1, 2, 3]'],
      newColumn: 'OtherTable.Nums + Table.Nums',
    })
  ).toMatchInlineSnapshot(`
    Object {
      "type": table<Nums = number, NewCol = column<number, indexed by OtherTable>>,
      "value": Array [
        Array [
          DeciNumber(1),
          DeciNumber(2),
          DeciNumber(3),
        ],
        Array [
          Array [
            DeciNumber(101),
            DeciNumber(201),
          ],
          Array [
            DeciNumber(102),
            DeciNumber(202),
          ],
          Array [
            DeciNumber(103),
            DeciNumber(203),
          ],
        ],
      ],
    }
  `);
});

it('juggles dimensions so the tables dimension is on top (3)', async () => {
  expect(
    await testGrowTable({
      startingColumns: ['Nums = [0.01]'],
      newColumn: 'OtherTable.Nums + Table.Nums + [1, 2, 3]',
    })
  ).toMatchInlineSnapshot(`
    Object {
      "type": table<Nums = number, NewCol = column<column<number>, indexed by OtherTable>>,
      "value": Array [
        Array [
          DeciNumber(0.01),
        ],
        Array [
          Array [
            Array [
              DeciNumber(101.01),
              DeciNumber(102.01),
              DeciNumber(103.01),
            ],
            Array [
              DeciNumber(201.01),
              DeciNumber(202.01),
              DeciNumber(203.01),
            ],
          ],
        ],
      ],
    }
  `);
});

it('usage of previous() does not affect length rules', async () => {
  expect(
    await testGrowTable({
      startingColumns: ['A = 1'],
      newColumn: 'previous(0) + 100',
    })
  ).toMatchInlineSnapshot(`
    Object {
      "type": table<A = number, NewCol = number>,
      "value": Array [
        Array [
          DeciNumber(1),
        ],
        Array [
          DeciNumber(100),
        ],
      ],
    }
  `);

  expect(
    await testGrowTable({
      startingColumns: ['A = [1, 2]'],
      newColumn: 'previous(0) + 100',
    })
  ).toMatchInlineSnapshot(`
    Object {
      "type": table<A = number, NewCol = number>,
      "value": Array [
        Array [
          DeciNumber(1),
          DeciNumber(2),
        ],
        Array [
          DeciNumber(100),
          DeciNumber(200),
        ],
      ],
    }
  `);

  expect(
    await testGrowTable({
      startingColumns: ['A = previous(0) + 1'],
      newColumn: 'previous(0) + 100',
    })
  ).toMatchInlineSnapshot(`
    Object {
      "type": table<A = number, NewCol = number>,
      "value": Array [
        Array [
          DeciNumber(1),
        ],
        Array [
          DeciNumber(100),
        ],
      ],
    }
  `);
});

async function testGrowTable({
  startingColumns = [],
  newColumn,
}: {
  startingColumns?: string[];
  newColumn: string;
}) {
  const prefixCode = `
    OtherTable = {
      Nums = [100, 200]
    }
  `;
  const codeAllInOneExpression = `
    ${prefixCode}
    Table = {
      ${startingColumns.join(', ')}
      NewCol = ${newColumn}
    }
  `;
  const resultAllInOneTable = await runCode(codeAllInOneExpression).catch(
    String
  );

  // Evaluate adding one column
  const codeAddingOneColumn = `
    ${prefixCode}
    Table = {
      ${startingColumns.join(', ')}
    }
    Table.NewCol = ${newColumn}
    Table
  `;
  const resultAddingOneColumn = await runCode(codeAddingOneColumn).catch(
    String
  );
  expect(resultAddingOneColumn).toEqual(resultAllInOneTable);

  // Evaluate adding preceding columns one by one
  const codeColByCol = `
    ${prefixCode}
    Table = {}
    ${startingColumns.map((colAssign) => `Table.${colAssign}`).join('\n')}
    Table.NewCol = ${newColumn}
    Table
  `;
  const resultColByCol = await runCode(codeColByCol).catch(String);
  expect(resultColByCol).toEqual(resultAllInOneTable);

  return resultAllInOneTable;
}
