// eslint-disable-next-line no-restricted-imports
import { buildType as t, parseUnit, Time } from '@decipad/language-types';
import { N } from '@decipad/number';
import { formatResult } from './formatResult';

// we'll usually use chalk.blue but we can't write colorful snapshots in text files
const highlight = (inp: string) => `<${inp}>`;

const locale = 'en-US';

describe('stringify', () => {
  it('stringifies basic stuff', () => {
    expect(
      formatResult(locale, N(10), t.number(), highlight)
    ).toMatchInlineSnapshot(`"<10>"`);

    expect(
      formatResult(locale, N(1, 10), t.number(null, 'percentage'), highlight)
    ).toMatchInlineSnapshot(`"<10>%"`);

    expect(
      formatResult(locale, N(10), t.number([parseUnit('meters')]), highlight)
    ).toMatchInlineSnapshot(`"<10> meters"`);

    expect(
      formatResult(locale, [N(1), N(10)], t.range(t.number()), highlight)
    ).toMatchInlineSnapshot(`"range(<1> to <10>)"`);

    expect(
      formatResult(
        locale,
        Time.parseUTCDate('2020-01'),
        t.date('month'),
        highlight
      )
    ).toMatchInlineSnapshot(`"<2020-01>"`);

    expect(
      formatResult(locale, [N(1n), N(2n)], t.column(t.number()), highlight)
    ).toMatchInlineSnapshot(`"[ <1>, <2> ]"`);

    expect(
      formatResult(
        locale,
        [
          [N(1n), N(2n)],
          ['hi', 'lol'],
        ],
        t.table({
          columnTypes: [t.number(), t.string()],
          columnNames: ['Numbers', 'Strings'],
        }),
        highlight
      )
    ).toMatchInlineSnapshot(`
      "{
        Numbers = [ <1>, <2> ],
        Strings = [ <'hi'>, <'lol'> ]
      }"
    `);

    expect(
      formatResult(
        locale,
        ['hi', N(1n)],
        t.row([t.string(), t.number()], ['Str', 'Num'])
      )
    ).toMatchInlineSnapshot(`
      "{
        Str = 'hi',
        Num = 1
      }"
    `);
  });
});
