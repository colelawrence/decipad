/* eslint-disable prefer-template */
import { containsExprRef } from './containsExprRefs';
import { nanoid } from 'nanoid';

const getExprRef = (blockId: string): string => {
  return `exprRef_${blockId.replace(/[^a-zA-Z0-9]/g, '_')}`;
};

it('should return false when no expr refs are present', () => {
  expect(containsExprRef('1 + 2')).toBeFalsy();
  expect(containsExprRef('10 oranges + 400 bananas')).toBeFalsy();
  expect(containsExprRef('a + b')).toBeFalsy();

  expect(containsExprRef('exprRef_')).toBeFalsy();
  expect(containsExprRef('bruh')).toBeFalsy();
});

it('should return true when expr refs are found', () => {
  // Making sure no premutation of nanoid gets us.
  for (let i = 0; i < 200; i++) {
    expect(containsExprRef(getExprRef(nanoid()))).toBeTruthy();
  }

  expect(
    '10 oranges + 20 bananas  - exprRef_TdcO78we4PryXgZydAjcH'
  ).toBeTruthy();

  expect(
    containsExprRef('10 oranges + 20 bananas  - ' + getExprRef(nanoid()))
  ).toBeTruthy();
});

const STRING_LENGTH_21 = 'abcdefg----__123--aBz';

it('returns true even if nanoid has dashes (which we replace)', () => {
  expect(containsExprRef(getExprRef(STRING_LENGTH_21))).toBeTruthy();
});
