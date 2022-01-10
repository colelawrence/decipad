/* eslint-disable jest/expect-expect */
import { getDefined } from '@decipad/utils';
import { AST } from '..';
import { n, c, l, date, range, col, tableDef, funcDef } from '../utils';
import { parse, parseBlock } from './index';

const testParse = (source: string, ...expected: AST.Statement[]) => {
  const p = (source: string) => {
    const parsed = parse([{ id: 'ignored', source }])[0];

    return parsed.solutions[0];
  };

  expect(p(source)).toMatchObject(n('block', ...expected));

  const withExtraneousSpace = ` ${source} `;
  expect(p(withExtraneousSpace)).toMatchObject(n('block', ...expected));
};

it('parses things in multiple lines', () => {
  testParse(
    `X = date(2020-01-01)
Y = 10
Table = { Column = [1, 2, 3 ]}
Range = [ 10 .. 20 ]
func(a b) = a + b`,
    n('assign', n('def', 'X'), date('2020-01-01', 'day')),
    n('assign', n('def', 'Y'), l(10)),
    tableDef('Table', {
      Column: col(1, 2, 3),
    }),
    n('assign', n('def', 'Range'), range(10, 20)),
    funcDef('func', ['a', 'b'], c('+', n('ref', 'a'), n('ref', 'b')))
  );
});

it('perceives the correct precedence between operators', () => {
  testParse(
    '1 + 2 / 1 - 2 ** 5 / 42',
    c('-', c('+', l(1), c('/', l(2), l(1))), c('/', c('**', l(2), l(5)), l(42)))
  );
});

it('can parse functions with multiline conditions', () => {
  testParse(
    [
      'costtobusiness(salary working bonus) = if working',
      'then salary + (salary * 0.2) + (if bonus then salary * 0.2 else 0)',
      'else 0',
    ].join('\n'),
    funcDef(
      'costtobusiness',
      ['salary', 'working', 'bonus'],
      c(
        'if',
        n('ref', 'working'),
        c(
          '+',
          c('+', n('ref', 'salary'), c('*', n('ref', 'salary'), l(0.2))),
          c('if', n('ref', 'bonus'), c('*', n('ref', 'salary'), l(0.2)), l(0))
        ),
        l(0)
      )
    )
  );
});

const getError = (source: string) =>
  getDefined(parseBlock({ id: '', source }).errors[0]);

it('can yield syntax errors', () => {
  expect(getError('syntax --/-- error')).toBeDefined();
});

it('can explain mismatched bracket errors', () => {
  expect(getError('(').bracketError).toMatchObject({
    type: 'never-closed',
    open: { value: '(' },
  });
  expect(getError('(]').bracketError).toMatchObject({
    type: 'mismatched-brackets',
    open: { value: '(' },
    close: { value: ']' },
  });
});
