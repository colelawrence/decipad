import { F } from '@decipad/fraction';
import { formatCurrency } from './formatCurrency';
import { usd, usdShort } from './testUtils';

it('formats currencies', () => {
  expect(formatCurrency('en-US', usd, F(100))).toMatchInlineSnapshot(`"100 $"`);
  expect(formatCurrency('en-US', usdShort, F(100))).toMatchInlineSnapshot(
    `"100 $"`
  );
});
