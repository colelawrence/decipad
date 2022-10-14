import { tokenize } from '@decipad/computer';
import {
  ELEMENT_PARAGRAPH,
  MARK_MAGICNUMBER,
  ParagraphElement,
  RichText,
} from '@decipad/editor-types';
import { getNodeString } from '@udecode/plate';
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

it('finds negative numbers', () => {
  expect(testFindFormulas('-1 also hi = -1')).toMatchInlineSnapshot(`
    Array [
      "-1",
      "hi = -1",
    ]
  `);
});

it('only finds stuff surrounded with whitespace', () => {
  expect(testFindFormulas('/1 [1]')).toMatchInlineSnapshot(`Array []`);
});

it('doesnt touch magic numbers', () => {
  expect(
    testRunDecoration({ [MARK_MAGICNUMBER]: true, text: '1' })
  ).toMatchInlineSnapshot(`Array []`);
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

const testRunDecoration = (child: RichText) => {
  const entry: NodeEntry<ParagraphElement> = [
    {
      type: ELEMENT_PARAGRAPH,
      id: 'p',
      children: [child],
    },
    [9],
  ];

  const decorations = decoratePotentialFormula(
    {} as never,
    {} as never
  )(entry) as (PotentialFormulaDecoration & Range)[];

  return decorations.map((range) =>
    getNodeString(child).slice(range.location.anchor, range.location.focus)
  );
};

function testFindFormulas(testStr: string) {
  const dec = (text: string) => testRunDecoration({ text });
  const baseline = dec(testStr);
  expect(baseline).toEqual(dec(`${testStr} garbage at end`));
  expect(baseline).toEqual(dec(`garbage at start ${testStr} garbage at end`));
  expect(baseline).toEqual(dec(`garbage at start ${testStr}`));

  return baseline;
}
