import { getVariableRanges } from './getVariableRanges';

const testFindVariables = (code: string) => {
  const ranges = getVariableRanges(code, []);

  return ranges.map((range) =>
    code.slice(range.anchor.offset, range.focus.offset)
  );
};

it('finds bubbles', () => {
  expect(testFindVariables('Ayy = B\nC = D')).toMatchInlineSnapshot(`
    Array [
      "Ayy",
      "C",
    ]
  `);

  expect(testFindVariables('Ayy == B')).toMatchInlineSnapshot(`Array []`);

  expect(testFindVariables('"A = B"')).toMatchInlineSnapshot(`Array []`);
});

it('matches tables correctly', () => {
  expect(testFindVariables('Table = { Col = 1, Col2 = 2 }'))
    .toMatchInlineSnapshot(`
      Array [
        "Table",
        "Col",
        "Col2",
      ]
    `);
});

it('takes leading whitespace into account', () => {
  expect(testFindVariables('  Ayy = B')).toMatchInlineSnapshot(`
    Array [
      "Ayy",
    ]
  `);
});
