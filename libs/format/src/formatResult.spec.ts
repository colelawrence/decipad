import { buildType as t, parseUnit, parseUTCDate } from '@decipad/language';
import { formatResult } from './formatResult';
import { F } from './testUtils';

// we'll usually use chalk.blue but we can't write colorful snapshots in text files
const highlight = (inp: string) => `<${inp}>`;

const locale = 'en-US';

describe('stringify', () => {
  it('stringifies basic stuff', () => {
    expect(
      formatResult(locale, F(10), t.number(), highlight)
    ).toMatchInlineSnapshot(`"<10>"`);

    expect(
      formatResult(locale, F(1, 10), t.number(null, 'percentage'), highlight)
    ).toMatchInlineSnapshot(`"<10>%"`);

    expect(
      formatResult(locale, F(10), t.number([parseUnit('m')]), highlight)
    ).toMatchInlineSnapshot(`"<10> m"`);

    expect(
      formatResult(locale, [F(1), F(10)], t.range(t.number()), highlight)
    ).toMatchInlineSnapshot(`"range(<1> to <10>)"`);

    expect(
      formatResult(locale, parseUTCDate('2020-01'), t.date('month'), highlight)
    ).toMatchInlineSnapshot(`"month <2020-01>"`);

    expect(
      formatResult(locale, [F(1n), F(2n)], t.column(t.number(), 2), highlight)
    ).toMatchInlineSnapshot(`"[ <1>, <2> ]"`);

    expect(
      formatResult(
        locale,
        [
          [F(1n), F(2n)],
          ['hi', 'lol'],
        ],
        t.table({
          length: 2,
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
        ['hi', F(1n)],
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
