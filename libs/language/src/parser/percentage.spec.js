import { F, c, l } from '../utils';
import { runTests } from './run-tests';

runTests({
  'percentage value': {
    source: ' 190% ',
    ast: [
      {
        type: 'literal',
        args: ['number', F(19, 10)],
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
        args: ['number', F(19, 10).neg()],
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
    ast: [c('-', l(0.1), l(1))],
  },
});
