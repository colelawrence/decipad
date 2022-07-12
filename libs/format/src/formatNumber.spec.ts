import { F } from '@decipad/fraction';
import { formatNumber } from './formatNumber';
import { U, usd, usdPerDay } from './testUtils';

it('formats numbers', () => {
  expect(formatNumber('en-US', U([]), F(1.2345), 2)).toMatchInlineSnapshot(
    `"1.23(...)"`
  );
  expect(
    formatNumber('en-US', U([]), F(100_000_000).add(F(1).div(2)), 2)
  ).toMatchInlineSnapshot(`"100,000,000.5"`);
});

it('formats numbers with infinite decimals', () => {
  expect(formatNumber('en-US', U([]), F(1).div(3), 2)).toMatchInlineSnapshot(
    `"0.33(...)"`
  );

  expect(formatNumber('en-US', U([]), F(1).div(3), 10)).toMatchInlineSnapshot(
    `"0.3333333333(...)"`
  );
});

it('formats numbers with units', () => {
  expect(
    formatNumber('en-US', U('meters/seconds'), F(10))
  ).toMatchInlineSnapshot(`"10 meters/seconds"`);
});

it('uses formatCurrency when the unit is a single currency', () => {
  expect(formatNumber('en-US', usd, F(100))).toMatchInlineSnapshot(`"100 $"`);
});

it('regression: does not use formatCurrency when there are more units than just the currency', () => {
  expect(formatNumber('en-US', usdPerDay, F(100))).toMatchInlineSnapshot(
    `"100 $ per day"`
  );
});
