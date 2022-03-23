import { getVariableRanges } from './getVariableRanges';

const testFindVariables = (
  code: string,
  previouslyDefined: Set<string> = new Set()
) => {
  const ranges = getVariableRanges(code, [], previouslyDefined);

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

it('finds bubbles for previously defined variables', () => {
  expect(testFindVariables('Ayy = B', new Set('B'))).toMatchInlineSnapshot(`
    Array [
      "Ayy",
      "B",
    ]
  `);
});

it('does not find bubbles for variables used that were not previously defined', () => {
  expect(testFindVariables('Ayy = B', new Set())).toMatchInlineSnapshot(`
    Array [
      "Ayy",
    ]
  `);
});

it('finds bubbles for external variables in function declarations', () => {
  expect(testFindVariables('F(A) = A + Y', new Set('Y')))
    .toMatchInlineSnapshot(`
    Array [
      "Y",
    ]
  `);
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
