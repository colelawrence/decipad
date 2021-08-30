import { cast } from './cast';

it('casts numbers as numbers', () => {
  expect(cast('123')).toMatchInlineSnapshot(`123`);
  expect(cast('01')).toMatchInlineSnapshot(`1`);
  expect(cast('1e69')).toMatchInlineSnapshot(`1e+69`);
});

it('casts booleans', () => {
  expect(cast('true')).toMatchInlineSnapshot(`true`);
  expect(cast('false')).toMatchInlineSnapshot(`false`);
});

it('casts dates', () => {
  expect(cast('date(2020)')).toMatchInlineSnapshot(`2020-01-01T00:00:00.000Z`);
  // month/day/year :O
  expect(cast('08/10/2020')).toMatchInlineSnapshot(`2020-08-10T00:00:00.000Z`);
});

it('returns strings at the end', () => {
  expect(cast('')).toMatchInlineSnapshot(`""`);

  expect(cast('hello')).toMatchInlineSnapshot(`"hello"`);
});
