import { runTests } from './run-tests';

runTests({
  'invalid syntax': {
    source: 'A = 1 = 3',
    expectError: 'Syntax error at line 1 col 8',
  },
  'invalid syntax (2)': {
    source: 'A = [1 = 3]',
    expectError: 'Syntax error at line 1 col 9',
  },
  'invalid syntax (3)': {
    source: 'A = (1 = 3)',
    expectError: 'Syntax error at line 1 col 9',
  },
});
