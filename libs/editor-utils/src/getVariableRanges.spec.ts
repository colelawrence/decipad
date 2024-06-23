import { it, expect } from 'vitest';
import { getVariableRanges } from './getVariableRanges';

const testFindVariables = (code: string) => {
  const ranges = getVariableRanges(code, [], 'blockId');

  return ranges.map((range) =>
    code.slice(range.anchor.offset, range.focus.offset)
  );
};

it('finds bubbles', () => {
  expect(testFindVariables('Ayy = B\nC = D')).toMatchInlineSnapshot(`
    [
      "Ayy",
      "B",
      "C",
      "D",
    ]
  `);

  expect(testFindVariables('Ayy == B')).toMatchInlineSnapshot(`
    [
      "Ayy",
      "B",
    ]
  `);

  expect(testFindVariables('"A = B"')).toMatchInlineSnapshot(`[]`);
});

it('finds bubbles for previously defined variables', () => {
  expect(testFindVariables('Ayy = B')).toMatchInlineSnapshot(`
    [
      "Ayy",
      "B",
    ]
  `);
});

it('finds bubbles for external variables in function declarations', () => {
  expect(testFindVariables('F(A) = A + Y')).toMatchInlineSnapshot(`
    [
      "A",
      "A",
      "Y",
    ]
  `);
});

it('matches tables correctly', () => {
  expect(testFindVariables('Table = { Col = 1, Col2 = Col }'))
    .toMatchInlineSnapshot(`
      [
        "Table",
        "Col",
      ]
    `);
});

it('takes leading whitespace into account', () => {
  expect(testFindVariables('  Ayy = B')).toMatchInlineSnapshot(`
    [
      "Ayy",
      "B",
    ]
  `);
});
