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

it('does not show dependencies of function arguments, but does show deps inside the table', () => {
  expect(
    dependencies(
      parseStatementOrThrow('Table = { Inner = 1, Col2 = Inner + Y }')
    )
  ).toMatchInlineSnapshot(`
    Array [
      "+",
      "Table::Inner",
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

it('treats table refs', () => {
  const ns = new Map([['Table', new Set(['Inner'])]]);
  expect(
    dependencies(parseStatementOrThrow('Table.NewCol = Inner + Y'), ns)
  ).toContain('Table::Inner');
});

it('deals with table property access in hacky ways', () => {
  const ns = new Map([['Table', new Set(['Inner'])]]);
  expect(
    dependencies(parseStatementOrThrow('someExpression(x).Inner'), ns)
  ).toContain('Table::Inner');
  expect(
    dependencies(parseStatementOrThrow('someExpression(x).Inner'), ns)
  ).toContain('someExpression');
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
