import { parseNumberWithUnit } from './parseNumberWithUnit';

it('can parse a number', () => {
  expect(parseNumberWithUnit('1')).toEqual([1, '', '']);
});

it('can parse a number with unit', () => {
  expect(parseNumberWithUnit('1 banana*m^2 + 5')).toEqual([
    1,
    ' banana*m^2 + 5',
    '',
  ]);
});

it('can parse a number with currency', () => {
  expect(parseNumberWithUnit('$1')).toEqual([1, '', '$']);
});

it('can parse a number with currency and unit', () => {
  expect(parseNumberWithUnit('$1 per hotdog')).toEqual([1, ' per hotdog', '$']);
});

it('cannot parse other expressions', () => {
  expect(parseNumberWithUnit('a = 1')).toEqual(null);
  expect(parseNumberWithUnit('[1, 2, 3]')).toEqual([1, ', 2, 3]', '[']);
});
