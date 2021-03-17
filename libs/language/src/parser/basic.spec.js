import { runTests } from './run-tests';

runTests({
  'invalid syntax': {
    source: 'A = 1 = 3',
    expectError: 'Syntax error at line 1 col 8',
  },
});
