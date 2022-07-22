import { F, c, l, num } from '../utils';
import { runTests } from './run-tests';

runTests({
  'percentage value': {
    source: ' 190% ',
    ast: [
      {
        type: 'literal',
        args: ['number', F(19, 10), 'percentage'],
        start: 1,
        end: 4,
      },
    ],
  },
  'negative percentage value': {
    source: ' -190% ',
    ast: [
      {
        type: 'literal',
        args: ['number', F(19, 10).neg(), 'percentage'],
        start: {
          char: 1,
          column: 2,
          line: 1,
        },
        end: {
          char: 5,
          column: 6,
          line: 1,
        },
      },
    ],
  },
  "Isn't ambiguous with the modulo operator and subtraction": {
    source: ' 10% - 1 ',
    sourceMap: false,
    ast: [c('-', num(0.1, 'percentage'), l(1))],
  },
});
