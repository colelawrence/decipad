import { F } from '../utils';
import { build as t } from '../type';
import { parseUTCDate } from '../date';
import { stringifyResult } from './stringify';

// we'll usually use chalk.blue but we can't write colorful snapshots in text files
const highlight = (inp: string) => `<${inp}>`;

describe('stringify', () => {
  it('stringifies basic stuff', () => {
    expect(stringifyResult(F(10), t.number(), highlight)).toMatchInlineSnapshot(
      `"<10>"`
    );

    expect(
      stringifyResult([F(1), F(10)], t.range(t.number()), highlight)
    ).toMatchInlineSnapshot(`"range(<1> to <10>)"`);

    expect(
      stringifyResult(parseUTCDate('2020-01'), t.date('month'), highlight)
    ).toMatchInlineSnapshot(`"month <2020-01>"`);

    expect(
      stringifyResult([F(1n), F(2n)], t.column(t.number(), 2), highlight)
    ).toMatchInlineSnapshot(`"[ <1>, <2> ]"`);

    expect(
      stringifyResult(
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
  });
});
