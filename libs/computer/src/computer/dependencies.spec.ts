import { parseBlockOrThrow, parseStatementOrThrow } from '@decipad/language';
import { dependencies, findAllTables } from './dependencies';

it('Finds variables depended upon by a statement', () => {
  expect(dependencies(parseStatementOrThrow('A = B / C')))
    .toMatchInlineSnapshot(`
    Array [
      "/",
      "B",
      "C",
    ]
  `);
  expect(dependencies(parseStatementOrThrow('Table1.Col1 = 1')))
    .toMatchInlineSnapshot(`
      Array [
        "Table1",
      ]
    `);
});

it('does not show deps local to that statement or belonging to that table', () => {
  expect(
    dependencies(
      parseStatementOrThrow('Table = { Inner = 1, Col2 = Inner + Y }')
    )
  ).toMatchInlineSnapshot(`
    Array [
      "+",
      "Y",
    ]
  `);
  expect(dependencies(parseStatementOrThrow('Fn(Inner) = Inner + Y')))
    .toMatchInlineSnapshot(`
      Array [
        "+",
        "Y",
      ]
    `);
});

it('excludes local refs that are scoped to the table', () => {
  const ns = new Map([['OtherTable', new Set(['Inner'])]]);
  expect(
    dependencies(
      parseStatementOrThrow('Table = { ...OtherTable, Col2 = Inner + Y }'),
      ns
    )
  ).toMatchInlineSnapshot(`
    Array [
      "OtherTable",
      "+",
      "Y",
    ]
  `);
  expect(
    dependencies(parseStatementOrThrow('OtherTable.NewCol = Inner + Y'), ns)
  ).toMatchInlineSnapshot(`
      Array [
        "OtherTable",
        "+",
        "Y",
      ]
    `);
});

it('excludes func args', () => {
  expect(dependencies(parseStatementOrThrow('Fn(X) = X + 1')))
    .toMatchInlineSnapshot(`
      Array [
        "+",
      ]
    `);
});

it('builds up a picture of available names', () => {
  const program = parseBlockOrThrow(`
    MyFn(MyFnArg) = 1

    MyTable1 = {
      MyTable1Col = 1
    }
    MyTable1.MyTable2Col = MyTable2.MyTable2Col

    MyTable2 = {
      MyTable2Col = 1
    }
    MyTable2.MyTable1Col = MyTable1.MyTable1Col

    MyTable1.NewCol = 1
  `).args;

  const namespaces = findAllTables(program);

  expect(namespaces).toMatchInlineSnapshot(`
    Map {
      "MyTable1" => Set {
        "MyTable1Col",
        "MyTable2Col",
        "NewCol",
      },
      "MyTable2" => Set {
        "MyTable2Col",
        "MyTable1Col",
      },
    }
  `);
});
