import type { ErrSpec } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { buildType as t } from '@decipad/language';
import { formatError } from './formatError';

const locale = 'en-US';

it('formats a column error when <anything> is inside', async () => {
  const errSpec = (await t.number().expected(t.column(t.anything()))).errorCause
    ?.spec as ErrSpec;
  expect(formatError(locale, errSpec)).toMatchInlineSnapshot(
    `"This operation requires a column and a number was entered."`
  );
});
