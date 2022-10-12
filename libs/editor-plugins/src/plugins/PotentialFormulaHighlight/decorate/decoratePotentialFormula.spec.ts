import { tokenize } from '@decipad/computer';
import { ELEMENT_PARAGRAPH, ParagraphElement } from '@decipad/editor-types';
import { NodeEntry, Range } from 'slate';
import { decoratePotentialFormula } from './decoratePotentialFormula';
import { isPotentialFormula } from './findPotentialFormulas';
import { PotentialFormulaDecoration } from './interface';

it('finds simple expressions in strings', () => {
  expect(testFindFormulas('1 + 1')).toMatchInlineSnapshot(`
    Array [
      "1 + 1",
    ]
  `);

  expect(testFindFormulas('1 + 123 tons of meatloaf')).toMatchInlineSnapshot(`
    Array [
      "1 + 123",
    ]
  `);

  expect(testFindFormulas('68 + 1 and 123%')).toMatchInlineSnapshot(`
    Array [
      "68 + 1",
      "123%",
    ]
  `);
});

it('supports some units', () => {
  expect(testFindFormulas('10 days')).toMatchInlineSnapshot(`
    Array [
      "10 days",
    ]
  `);
  expect(testFindFormulas('$100')).toMatchInlineSnapshot(`
    Array [
      "$100",
    ]
  `);
});

it('resists token errors', () => {
  // This test only makes sense if ' is an error token
  expect(tokenize("a quote'").find((t) => t.type === 'error')).toBeDefined();
  expect(testFindFormulas(`A quote ' and a 4`)).toMatchInlineSnapshot(`
    Array [
      "4",
    ]
  `);
});

it('finds assignments', () => {
  expect(testFindFormulas('things = 123 + 1')).toMatchInlineSnapshot(`
    Array [
      "things = 123 + 1",
    ]
  `);
});

it('finds whether it can parse some part of the text', () => {
  expect(isPotentialFormula('+')).toEqual(false);
  expect(isPotentialFormula('1 + ')).toEqual('incomplete');
  expect(isPotentialFormula('1 * 7 / 9 *')).toEqual('incomplete');
  expect(isPotentialFormula('1 + 123')).toEqual(true);
  expect(isPotentialFormula('1 + 123 meters')).toEqual(false);
});

function testFindFormulas(testStr: string) {
  const formulasFor = (str: string) => {
    const entry: NodeEntry<ParagraphElement> = [
      {
        type: ELEMENT_PARAGRAPH,
        id: 'p',
        children: [{ text: str }],
      },
      [9],
    ];

    const decorations = decoratePotentialFormula(
      {} as never,
      {} as never
    )(entry) as (PotentialFormulaDecoration & Range)[];

    return decorations.map((range) =>
      str.slice(range.location.anchor, range.location.focus)
    );
  };

  const baseline = formulasFor(testStr);
  expect(baseline).toEqual(formulasFor(`${testStr} garbage at end`));
  expect(baseline).toEqual(
    formulasFor(`garbage at start ${testStr} garbage at end`)
  );
  expect(baseline).toEqual(formulasFor(`garbage at start ${testStr}`));

  return baseline;
}
