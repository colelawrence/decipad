import { runCode } from '..';
import { typeSnapshotSerializer } from '../testUtils';

expect.addSnapshotSerializer(typeSnapshotSerializer);

it('non-indexed columns must have sizes consistent with the table', async () => {
  expect(
    await testGrowTable({ startingColumns: ['A = 1'], newColumn: '[1, 2]' })
  ).toMatchInlineSnapshot(`"Error: Inconsistent table column sizes"`);

  expect(
    await testGrowTable({ startingColumns: ['A = [1]'], newColumn: '[1, 2]' })
  ).toMatchInlineSnapshot(`"Error: Inconsistent table column sizes"`);

  expect(
    await testGrowTable({
      startingColumns: ['A = [1, 2]'],
      newColumn: '[1, 2]',
    })
  ).toMatchInlineSnapshot(`
    Object {
      "type": table<A = number, NewCol = number>,
      "value": Array [
        Array [
          Fraction(1),
          Fraction(2),
        ],
        Array [
          Fraction(1),
          Fraction(2),
        ],
      ],
    }
  `);
});

it('single items (non-col) are expanded to fit the currently known table size', async () => {
  expect(
    await testGrowTable({ startingColumns: ['A = [1, 2]'], newColumn: '1' })
  ).toMatchInlineSnapshot(`
    Object {
      "type": table<A = number, NewCol = number>,
      "value": Array [
        Array [
          Fraction(1),
          Fraction(2),
        ],
        Array [
          Fraction(1),
          Fraction(1),
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
            Fraction(1),
          ],
          Array [
            Fraction(2),
          ],
        ],
        Array [
          Fraction(1),
          Fraction(1),
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
          Fraction(1),
          Fraction(2),
          Fraction(3),
        ],
        Array [
          Array [
            Fraction(101),
            Fraction(201),
          ],
          Array [
            Fraction(102),
            Fraction(202),
          ],
          Array [
            Fraction(103),
            Fraction(203),
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
          Fraction(1),
          Fraction(2),
          Fraction(3),
        ],
        Array [
          Array [
            Fraction(101),
            Fraction(201),
          ],
          Array [
            Fraction(102),
            Fraction(202),
          ],
          Array [
            Fraction(103),
            Fraction(203),
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
          Fraction(0.01),
        ],
        Array [
          Array [
            Array [
              Fraction(101.01),
              Fraction(102.01),
              Fraction(103.01),
            ],
            Array [
              Fraction(201.01),
              Fraction(202.01),
              Fraction(203.01),
            ],
          ],
        ],
      ],
    }
  `);
});

it('juggles dimensions so the tables dimension is on top (4)', async () => {
  expect(
    await testGrowTable({
      startingColumns: ['X = [1, 2, 3]'],
      newColumn: 'OtherTable.Nums',
    })
  ).toMatchInlineSnapshot(`"Error: Inconsistent table column sizes"`);
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
          Fraction(1),
        ],
        Array [
          Fraction(100),
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
          Fraction(1),
          Fraction(2),
        ],
        Array [
          Fraction(100),
          Fraction(200),
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
          Fraction(1),
        ],
        Array [
          Fraction(100),
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
  const resultAllInOneTable = await runCode(codeAllInOneExpression, {}).catch(
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
  const resultAddingOneColumn = await runCode(codeAddingOneColumn, {}).catch(
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
  const resultColByCol = await runCode(codeColByCol, {}).catch(String);
  expect(resultColByCol).toEqual(resultAllInOneTable);

  return resultAllInOneTable;
}
