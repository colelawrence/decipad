import { Computer } from '@decipad/computer';
import { getVariableRanges } from './getVariableRanges';

const testFindVariables = (code: string) => {
  const ranges = getVariableRanges(new Computer(), code, [], 'blockId');

  return ranges.map((range) =>
    code.slice(range.anchor.offset, range.focus.offset)
  );
};

it('finds bubbles', () => {
  expect(testFindVariables('Ayy = B\nC = D')).toMatchInlineSnapshot(`
    Array [
      "Ayy",
      "B",
      "C",
      "D",
    ]
  `);

  expect(testFindVariables('Ayy == B')).toMatchInlineSnapshot(`
    Array [
      "Ayy",
      "B",
    ]
  `);

  expect(testFindVariables('"A = B"')).toMatchInlineSnapshot(`Array []`);
});

it('finds bubbles for previously defined variables', () => {
  expect(testFindVariables('Ayy = B')).toMatchInlineSnapshot(`
    Array [
      "Ayy",
      "B",
    ]
  `);
});

it('finds bubbles for external variables in function declarations', () => {
  expect(testFindVariables('F(A) = A + Y')).toMatchInlineSnapshot(`
    Array [
      "A",
      "A",
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
      "B",
    ]
  `);
});
