import { getSmartRef, getStructuredCalc } from './test_utils';
import utils from './structured_utils';

it('returns the length of a structured input', () => {
  const structuredInput = getStructuredCalc('AName', '1 + ');
  const anotherStructuredInput = getStructuredCalc(
    'AName',
    'Avery long structured input'
  );
  structuredInput.children[1].children.push(
    getSmartRef(structuredInput.id, 'Variable')
  );

  expect(utils.getTextLength(structuredInput)).toMatchInlineSnapshot(`12`);

  expect(utils.getTextLength(anotherStructuredInput)).toMatchInlineSnapshot(
    `27`
  );
});

it('returns the correct absolute cursor placement', () => {
  const s1 = getStructuredCalc('Namee', '1 + 234');
  const s2 = getStructuredCalc('Namee', '1234');

  expect(utils.getSelectionLength(s1, 0, 3)).toMatchInlineSnapshot(`3`);
  expect(utils.getSelectionLength(s2, 0, 2)).toMatchInlineSnapshot(`2`);
});

it('returns cursor placement with smartrefs', () => {
  const s1 = getStructuredCalc('Namee', '1 + 234');
  const s2 = getStructuredCalc('Namee', '1234');

  s1.children[1].children.push(getSmartRef(s2.id, 'VarName1'));
  s2.children[1].children.unshift(getSmartRef(s2.id, 'Var2'));

  expect(utils.getSelectionLength(s1, 1, 0)).toMatchInlineSnapshot(`15`);
  expect(utils.getSelectionLength(s2, 1, 2)).toMatchInlineSnapshot(`6`);
});

it('Gives the correct selection for a given offset', () => {
  const s1 = getStructuredCalc('Namee', '1 + 234');
  const s2 = getStructuredCalc('Namee', '1234');

  s1.children[1].children.push(getSmartRef(s2.id, 'VarName1'));
  s2.children[1].children.unshift(getSmartRef(s2.id, 'Var2'));

  expect(utils.getTargetSelection(s1, 5)).toMatchInlineSnapshot(`
    Array [
      0,
      5,
    ]
  `);
  expect(utils.getTargetSelection(s1, 9)).toMatchInlineSnapshot(`
    Array [
      1,
      0,
    ]
  `);
});
