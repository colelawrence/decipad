import type { ErrSpec } from '@decipad/remote-computer';
import { buildType as t } from '@decipad/remote-computer';
import { formatError } from './formatError';

const locale = 'en-US';

it('formats a column error when <anything> is inside', async () => {
  const errSpec = (await t.number().expected(t.column(t.anything()))).errorCause
    ?.spec as ErrSpec;
  expect(formatError(locale, errSpec)).toMatchInlineSnapshot(
    `"This operation requires a column and a number was entered."`
  );
});
