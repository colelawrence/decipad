import { n, c, l, r } from '../../utils';
import { runTests } from '../run-tests';

runTests({
  'invalid syntax': {
    source: 'A = 1 = 3',
    expectError: {
      message: 'Syntax error',
      source: '  A = 1 =',
      line: 1,
      column: 7,
    },
  },
  'invalid syntax (2)': {
    source: 'A = [1 = 3]',
    expectError: {
      message: 'Syntax error',
      line: 1,
      column: 8,
    },
  },
  'invalid syntax (3)': {
    source: 'A = (1 = 3)',
    expectError: {
      message: 'Syntax error',
      line: 1,
      column: 8,
    },
  },
  'multiple lines': {
    source: 'A = 100\nA + 1',
    sourceMap: false,
    ast: [n('assign', n('def', 'A'), l(100)), c('+', r('A'), l(1))],
  },
});
