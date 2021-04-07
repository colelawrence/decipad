import { parse } from './index';
import { n, c, l, date, range, col, tableDef, funcDef } from '../utils';

const testParse = (source: string, ...expected: AST.Statement[]) => {
  const p = (source: string) => {
    const parsed = parse([{ id: 'ignored', source }])[0];

    if (parsed.solutions.length > 1) {
      throw new Error('multiple solutions');
    }

    return parsed.solutions[0];
  };

  expect(p(source)).toMatchObject(n('block', ...expected));

  const withExtraneousSpace = ' ' + source + ' ';
  expect(p(withExtraneousSpace)).toMatchObject(n('block', ...expected));
};

it('parses things in multiple lines', () => {
  testParse(
    'X = 2020-01-01\nY = 10\nTable = { Column = [1, 2, 3 ]}\nRange = [ 10 .. 20 ]\n function = a b => a + b',
    n('assign', n('def', 'X'), date('2020-01-01', 'day')),
    n('assign', n('def', 'Y'), l(10)),
    tableDef('Table', {
      Column: col(1, 2, 3),
    }),
    n('assign', n('def', 'Range'), range(10, 20)),
    funcDef('function', ['a', 'b'], c('+', n('ref', 'a'), n('ref', 'b')))
  );
});

it('can parse functions with multiline conditions', () => {
  testParse(
    [
      'cost tobusiness = salary working bonus =>',
      'if working',
      'then salary + (salary * 0.2) + (if bonus then salary * 0.2 else 0)',
      'else 0',
    ].join('\n'),
    funcDef(
      'cost tobusiness',
      ['salary', 'working', 'bonus'],
      c(
        'if',
        n('ref', 'working'),
        c(
          '+',
          n('ref', 'salary'),
          c(
            '+',
            c('*', n('ref', 'salary'), l(0.2)),
            c('if', n('ref', 'bonus'), c('*', n('ref', 'salary'), l(0.2)), l(0))
          )
        ),
        l(0)
      )
    )
  );
});
