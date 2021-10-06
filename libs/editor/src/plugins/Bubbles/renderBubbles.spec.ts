import { getBubbleRanges } from './renderBubbles';

const testFindBubbles = (...texts: string[]) => {
  const nodes = texts.map((text) => ({ text }));
  const ranges = getBubbleRanges(nodes, []);
  const textsWithSlashN = texts.join('\n');

  return ranges.map((range) =>
    textsWithSlashN.slice(range.anchor.offset, range.focus.offset)
  );
};

it('finds bubbles', () => {
  expect(testFindBubbles('Ayy = B', 'C = D')).toMatchInlineSnapshot(`
    Array [
      "Ayy",
      "C",
    ]
  `);

  expect(testFindBubbles('Ayy == B')).toMatchInlineSnapshot(`Array []`);

  expect(testFindBubbles('"A = B"')).toMatchInlineSnapshot(`Array []`);
});

it('matches tables correctly', () => {
  expect(testFindBubbles('Table = { Col = 1, Col2 = 2 }'))
    .toMatchInlineSnapshot(`
      Array [
        "Table",
        "Col",
        "Col2",
      ]
    `);
});

it('takes leading whitespace into account', () => {
  expect(testFindBubbles('  Ayy = B')).toMatchInlineSnapshot(`
    Array [
      "Ayy",
    ]
  `);
});
